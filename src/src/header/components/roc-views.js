'use strict';

define([
    'jquery',
    'lodash',
    'superagent',
    'src/header/components/default',
    'src/util/util',
    'src/util/ui',
    'src/util/debug',
    'src/util/roc-view',
    'src/util/versioning',
    'src/util/couchdbAttachments',
    'src/util/uploadUi',
    'src/util/api',
    'fancytree',
    'components/ui-contextmenu/jquery.ui-contextmenu.min',
    'jquery-ui/accordion'
], function ($,
             _,
             superagent,
             Default,
             Util,
             UI,
             Debug,
             RocView,
             Versioning,
             CouchdbAttachments,
             uploadUi,
             API) {

    var UPLOAD_LIMIT = 50 * 1024 * 1024;
    var fakeLink = {
        color: 'blue',
        cursor: 'pointer',
        textDecoration: 'underline'
    };

    class RocViewManager extends Default {
        get flavor() {
            if (this._flavor) {
                return this._flavor;
            } else {
                return this._flavor = window.sessionStorage.getItem('ci-visualizer-roc-views-flavor') || 'default';
            }
        }

        set flavor(value) {
            this._flavor = value;
            window.sessionStorage.setItem('ci-visualizer-roc-views-flavor', value);
        }

        initImpl() {
            var options = this.options || {};
            if (!options.url || !options.database) {
                throw new Error('roc-views: url and database options are mandatory');
            }

            this.rocUrl = options.url.replace(/\\$/, '');
            this.rocDatabase = options.database;
            this.rocDbUrl = `${this.rocUrl}/db/${this.rocDatabase}`;

            this.rocReady = false;
            this.rocAuthenticated = false;
            this.rocUsername = null;

            this._flavor = null;
            this.activeNode = null;
            this.loadedNode = null;

            this.verifyRoc();

            // setup CTRL + S for view saving
            var compiled = _.template('<table>\n    <tr>\n        <td style="vertical-align: top;"><b>Document id</b></td>\n        <td><%= view.id %></td>\n    </tr>\n    <tr>\n        <td style="vertical-align: top;"><b>Flavor</b></td>\n        <td><%= flavor %></td>\n    </tr>\n    <tr>\n        <td style="vertical-align: top;"><b>Name</b></td>\n        <td><% print(flavors[flavors.length-1]) %></td>\n    </tr>\n    <tr>\n        <td style="vertical-align: top;"><b>Location</b></td>\n        <td><li><% print(flavors.join(\'</li><li>\')) %></li></td>\n    </tr>\n</table>');
            $(document).keydown(
                event => {
                    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.which === 83) {
                        event.preventDefault();
                        if (this.loadedNode) {
                            const dialog = UI.dialog(compiled({
                                view: this.loadedNode.data.view,
                                flavor: this.flavor,
                                flavors: this.loadedNode.data.view.flavors[this.flavor]
                            }), {
                                width: '400px',
                                buttons: {
                                    'Save': () => {
                                        dialog.dialog('close');
                                        this.saveLoadedView();
                                    }
                                }
                            });
                        } else {
                            UI.showNotification('No view loaded in view manager', 'error');
                        }
                    }
                }
            );
        }

        _onClick() {
            if (this.rocReady) {
                this.setStyleOpen(this._open);
                if (this._open) {
                    this.createDom();
                    this.open();
                } else {
                    this.close();
                }
            } else {
                UI.showNotification('View database does not respond', 'error');
                Debug.error('roc-views: unreachable database. Retrying now');
                this.verifyRoc();
            }
        }

        getRequest(url, query) {
            var request = superagent.get(this.rocUrl + url).withCredentials();
            if (query) {
                request.query(query);
            }
            return request;
        }

        getRequestDB(url, query) {
            return this.getRequest('/db/' + this.rocDatabase + url, query);
        }

        putRequestDB(url, data) {
            var request = superagent.put(this.rocDbUrl + url).withCredentials();
            request.send(data);
            return request;
        }

        postRequestDB(url, data) {
            var request = superagent.post(this.rocDbUrl + url).withCredentials();
            request.send(data);
            return request;
        }

        deleteRequestDB(url) {
            return superagent.del(this.rocDbUrl + url).withCredentials();
        }

        verifyRoc() {
            return this.getRequest('/auth/session')
                .then(res => {
                    if (res.statusCode !== 200) {
                        return Debug.error('roc-views: unable to contact ' + this.rocUrl);
                    }
                    if (!res.body.ok) {
                        return Debug.error('roc-views: unexpected response', res.body);
                    }
                    this.rocReady = true;
                    if (res.body.authenticated) {
                        this.rocAuthenticated = true;
                        this.rocUsername = res.body.username;
                        this.getMenuContent();
                    }
                });
        }

        createDom() {
            if (!this.$_elToOpen) {
                this.$_elToOpen = $('<div>');
            }
            if (this.rocAuthenticated) {
                this.openMenu('tree');
            } else {
                this.openMenu('login');
            }
        }

        openMenu(which) {
            if (which === this.currentMenu) {
                return;
            } else if (which === 'tree') {
                this.$_elToOpen.html(this.getMenuContent());
                this.currentMenu = 'tree';
            } else if (which === 'login') {
                this.$_elToOpen.html(this.getLoginContent());
                this.currentMenu = 'login';
            } else {
                Debug.error('roc-views: unexpected value for which: ' + which);
            }
        }

        getLoginContent() {
            var login = $('<div>');
            var link = $('<a>', {
                text: 'here',
                href: '#',
                click: () => this.login()
            });
            login
                .append('Click ')
                .append(link)
                .append(' to login');
            return login;
        }

        login() {
            var url = encodeURIComponent(document.location.href);
            document.location.href = this.rocUrl + '/auth/login?continue=' + url;
        }

        logout() {
            this.getRequest('/auth/logout')
                .then(() => {
                    this.rocAuthenticated = false;
                    this.rocUsername = null;
                    this.openMenu('login');
                });
        }

        getMenuContent() {
            if (this.$menuContent) {
                return this.$menuContent;
            }

            var root = this.$menuContent = $('<div id="root">').css('position', 'relative');

            var hide = this.$hide = $('<div>').css({
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }).hide();

            var dom = $('<div>').css('zIndex', 1);

            var header = $('<div>');

            var leftHeader = $('<p>', {
                css: {
                    display: 'inline-block',
                    width: '50%'
                }
            });

            leftHeader.append($('<a>', {
                click: this.refresh.bind(this),
                css: fakeLink,
                text: 'refresh'
            }));

            var rightHeader = $('<p>', {
                css: {
                    display: 'inline-block',
                    textAlign: 'right',
                    width: '50%'
                }
            });

            rightHeader
                .append(this.rocUsername + ' | ')
                .append($('<a>', {
                    click: this.logout.bind(this),
                    css: fakeLink,
                    text: 'logout'
                }));

            header
                .append(leftHeader)
                .append(rightHeader);

            var main = $('<div>', {
                css: {
                    marginTop: '20px'
                }
            });

            var leftMain = $('<div>', {
                css: {
                    verticalAlign: 'top',
                    display: 'inline-block',
                    width: '360px'
                }
            });

            var searchBox = $('<div></div>', {
                text: 'Search: '
            });

            var lastSearchValue = '';
            var searchField = $('<input type="text" size="20">')
                .keyup(() => {
                    var value = searchField.val();
                    if (value !== lastSearchValue) {
                        this.doSearch(value);
                        lastSearchValue = value;
                    }
                });

            searchBox.append(searchField);

            var flavorSelect = $('<div>');

            var tree = $('<div>', {
                css: {
                    overflowY: 'auto',
                    maxHeight: '500px'
                }
            });
            this.$tree = tree;

            leftMain
                .append(searchBox)
                .append(flavorSelect)
                .append(tree);

            var rightMain = $('<div>', {
                css: {
                    display: 'inline-block',
                    height: '100%',
                    marginLeft: '10px',
                    width: '320px'
                }
            });

            var title = this.$title = $('<div>', {
                css: {
                    width: '100%',
                    textAlign: 'center',
                    paddingBottom: '5px'
                }
            });

            var rightAccordion = $('<div>', {
                css: {
                    height: '80%',
                    width: '100%'
                }
            });

            rightAccordion.append('<h3>View information</h3>');
            this.$infoBox = $('<div>').appendTo(rightAccordion);

            rightAccordion.append('<h3>Revisions</h3>');
            this.$revBox = $('<div>').appendTo(rightAccordion);

            this.$revBox.html('coming soon...');

            rightAccordion.append('<h3>Attachments</h3>');
            this.$attachmentsBox = $('<div>').appendTo(rightAccordion);

            var uploadButton = $('<button>Upload attachments</button>')
                .button().click(() => this.uploadFiles());
            this.$attachmentsBox.html(uploadButton);

            rightAccordion.append('<h3>Permissions</h3>');
            this.$permissionsBox = $('<div>').appendTo(rightAccordion);

            var publicCheckbox = this.$publicCheckbox = $('<input type="checkbox" />').click(e => {
                e.preventDefault();
                this.togglePublic();
            });
            var checkboxContainer = $('<div>')
                .append(publicCheckbox)
                .append('Public');

            var ownersList = this.$ownersList = $('<div>').css({
                marginTop: '5px',
                marginBottom: '5px'
            });
            var addOwnerButton = $('<button>Add owner</button>').click(() => this.addOwner());
            var ownersContainer = $('<div>')
                .append(ownersList)
                .append(addOwnerButton);

            this.$permissionsBox
                .append(checkboxContainer)
                .append(ownersContainer);

            rightAccordion.accordion({
                heightStyle: 'content'
            });

            var rightButtons = $('<div>', {
                css: {
                    paddingTop: '20px',
                    height: '20%'
                }
            });

            var closeButton = this.$closeButton = $('<button>Close</button>').button({disabled: true}).click(() => this.closeLoadedView());
            var saveButton = this.$saveButton = $('<button>Save</button>').button({disabled: true}).click(() => this.saveLoadedView());
            var saveAsButton = this.$saveAsButton = $('<button>Save as</button>').button({disabled: true}).click(() => this.saveAs());
            var saveAsText = this.$saveAsText = $('<input type="text" size="15" />').css('display', 'none');

            rightButtons
                .append(closeButton)
                .append(saveButton)
                .append(saveAsButton)
                .append(saveAsText);

            rightMain
                .append(title)
                .append(rightAccordion)
                .append(rightButtons);

            main
                .append(leftMain)
                .append(rightMain);

            dom
                .append(header)
                .append(main);

            root
                .append(hide)
                .append(dom);

            this.refresh();

            return root;
        }

        getViews() {
            return this.getRequestDB('/_all/entries', {right: 'write'}).then(returnBody);
        }

        refresh() {
            // Remove everything from last tree
            this.populateInfo();
            if (this.tree) {
                this.$tree.fancytree('destroy');
                this.tree = null;
            }
            this.activeNode = null;
            this.setLoadedNode(null);

            // Create new tree
            return this.getViews().then(views => {
                var tree = this.getTree(views);
                this.$tree.fancytree({
                    source: tree,
                    toggleEffect: false,
                    debugLevel: 0,
                    extensions: ['dnd', 'filter'],
                    dnd: {
                        autoExpandMS: 300,
                        preventVoidMoves: true,
                        preventRecursiveMoves: true,
                        dragStart: node => {
                            if (this.inSearch) return false; // Cannot move while search is active
                            return !node.folder; // Can only move documents
                        },
                        dragEnter: (target, info) => {
                            var theNode = info.otherNode;
                            if (target.folder && target === theNode.parent) {
                                return false; // Already in current folder
                            }
                            return !!target.folder; // Can only drop in a folder
                        },
                        dragDrop: (target, info) => {
                            var theNode = info.otherNode;
                            this.showHide(true);
                            theNode.data.view.moveTo(target)
                                .then(result => {
                                    this.showHide(false);
                                    if (result) theNode.moveTo(target);
                                    else UI.showNotification('View could not be moved', 'error');
                                });
                        }
                    },
                    filter: {
                        mode: 'hide',
                        fuzzy: true
                    },
                    // events
                    activate: (event, data) => this.onActivate(event, data),
                    dblclick: (event, data) => this.onDblclick(event, data)
                });

                this.$tree.on('mouseenter mouseleave', 'span.fancytree-title', event => {
                    const node = $.ui.fancytree.getNode(event);
                    if (event.type === 'mouseenter' && !node.folder) {
                        this.populateInfo(node);
                    } else {
                        this.populateInfo(this.loadedNode);
                    }
                });

                this.tree = this.$tree.fancytree('getTree');

                this.renderFlavor();

                this.$tree.contextmenu({
                    delegate: 'span.fancytree-title',
                    preventContextMenuForPopup: true,
                    show: false,
                    menu: [],
                    beforeOpen: (event, ui) => {
                        if (this.inSearch) return false;
                        var node = $.ui.fancytree.getNode(ui.target);

                        if (node.folder) {
                            var path = node.data.path;
                            var menu = [
                                {title: 'Create folder', cmd: 'createFolder', uiIcon: 'ui-icon-folder-collapsed'}
                            ];
                            if (path.length === 1) { // root of flavor
                                menu.push({title: 'New flavor...', cmd: 'newFlavor', uiIcon: 'ui-icon-document-b'});
                                menu.push({title: '----'});
                                const flavors = this.flavors;
                                for (var i = 0; i < flavors.length; i++) {
                                    menu.push({
                                        title: flavors[i],
                                        cmd: 'switchFlavor',
                                        uiIcon: (flavors[i] === this.flavor) ? 'ui-icon-check' : undefined
                                    });
                                }
                            }
                            this.$tree.contextmenu('replaceMenu', menu);
                        } else {
                            var flavors = this.flavors;
                            var menuFlavors = [];
                            var viewFlavors = node.data.view.flavors;
                            for (var i = 0; i < flavors.length; i++) {
                                var has = !!viewFlavors[flavors[i]];
                                menuFlavors.push({
                                    title: flavors[i],
                                    cmd: 'toggleFlavor',
                                    uiIcon: has ? 'ui-icon-check' : undefined
                                });
                            }
                            this.$tree.contextmenu('replaceMenu', [
                                {title: 'Rename', cmd: 'renameView', uiIcon: 'ui-icon-pencil'},
                                {title: 'Delete', cmd: 'deleteView', uiIcon: 'ui-icon-trash'},
                                {title: 'Flavors', children: menuFlavors}
                            ]);
                        }

                        node.setActive();
                    },
                    select: (event, ui) => {
                        const node = $.ui.fancytree.getNode(ui.target);
                        let flavor;
                        switch (ui.cmd) {
                            case 'createFolder':
                                this.createFolder(node);
                                break;
                            case 'deleteView':
                                this.deleteView(node);
                                break;
                            case 'renameView':
                                this.renameView(node);
                                break;
                            case 'toggleFlavor':
                                flavor = ui.item.text();
                                this.toggleFlavor(node, flavor);
                                break;
                            case 'switchFlavor':
                                flavor = ui.item.text();
                                this.switchToFlavor(flavor);
                                break;
                            case 'newFlavor':
                                this.newFlavor();
                                break;
                            default:
                                Debug.error(`unknown action: ${ui.cmd}`);
                                break;
                        }
                    },
                    createMenu(event) {
                        $(event.target).css('z-index', 10000);
                    }
                });

                var viewUrl = Versioning.lastLoaded.view.url;
                var reg = /\/([^\/]+)\/view\.json$/;
                var m = reg.exec(viewUrl);
                if (m) {
                    var loadedDocId = m[1];
                    this.tree.visit(node => {
                        if (node.data.view && node.data.view.id === loadedDocId &&
                            node.data.flavor === this.flavor) {
                            node.getParent().setExpanded(true);
                            node.setActive(true);
                            this.setLoadedNode(node);
                            this.populateInfo(node);
                            return false;
                        }
                    });
                }
            });
        }

        newFlavor() {
            var div = $('<div>Name of the new flavor: </div>');
            var input = $('<input type="text" />').appendTo(div);
            var dialog = UI.dialog(div, {
                buttons: {
                    Create: () => {
                        var name = validateFlavor(input.val());
                        if (!name) {
                            return UI.showNotification('Invalid name', 'error');
                        }
                        if (this.flavors.indexOf(name) === -1) {
                            this.tree.rootNode.addNode({
                                folder: true,
                                title: name,
                                path: [name]
                            });
                            this.flavors.push(name);
                            this.flavors.sort();
                        }
                        this.switchToFlavor(name);
                        dialog.dialog('destroy');
                    }
                }
            });
        }

        createFolder(node) {
            var div = $('<div>Name of the directory: </div>');
            var input = $('<input type="text" />').appendTo(div);
            var dialog = UI.dialog(div, {
                buttons: {
                    Save: () => {
                        var name = validateName(input.val());
                        if (!name) {
                            return UI.showNotification('Invalid name', 'error');
                        }

                        // Check if folder already exists
                        var children = node.getChildren();
                        if (children) {
                            for (var i = 0; i < children.length; i++) {
                                if (children[i].title === name && children[i].folder) {
                                    return UI.showNotification(`Folder ${name} already exists`, 'error');
                                }
                            }
                        }

                        node.setExpanded(true);
                        var newNode = node.addNode({
                            folder: true,
                            title: name,
                            path: node.data.path.concat(name)
                        });
                        node.sortChildren(sortFancytree);
                        newNode.setActive();
                        dialog.dialog('destroy');
                        this.renderFlavor();
                    }
                }
            });
        }

        deleteView(node) {
            UI.confirm(`This will delete the view named "${node.title}" and all related data.<br>Are you sure?`, 'Yes, delete it!', 'Maybe not...').then(ok => {
                if (ok) {
                    this.showHide(true);
                    node.data.view.remove().then(ok => {
                        this.showHide(false);
                        if (ok) {
                            UI.showNotification('View deleted', 'success');
                            node.remove();
                            if (node === this.loadedNode) {
                                Versioning.switchView({view: {}, data: {}}, true, {
                                    doNotLoad: true
                                });
                                this.setLoadedNode(null);
                            }
                        } else {
                            UI.showNotification('Error while deleting view', 'error');
                        }
                    });
                }
            });
        }

        renameView(node) {
            var div = $(`<div>Renaming view "${node.title}"<br>New name: </div>`);
            var input = $('<input type="text" />').appendTo(div);
            var dialog = UI.dialog(div, {
                buttons: {
                    Rename: () => {
                        var name = input.val().trim();
                        if (name.length === 0) {
                            return UI.showNotification('Name cannot be empty', 'error');
                        }

                        this.showHide(true);
                        return node.data.view.rename(this.flavor, name)
                            .then(ok => {
                                this.showHide(false);
                                if (ok) {
                                    UI.showNotification('View was renamed', 'success');
                                    node.setTitle(name);
                                    this.renderLoadedNode();
                                } else {
                                    UI.showNotification('Error while renaming view', 'error');
                                }
                                dialog.dialog('destroy');
                            });
                    }
                }
            });
        }

        toggleFlavor(node, flavor) {
            const view = node.data.view;
            this.showHide(true);
            return view.toggleFlavor(flavor, this.flavor)
                .then(result => {
                    this.showHide(false);
                    if (!result) {
                        UI.showNotification('Error while toggling flavor', 'error');
                    } else if (result.state === 'err-one') {
                        UI.showNotification('Cannot remove the last flavor', 'error');
                    } else if (result.state === 'removed') {
                        let found;
                        this.tree.rootNode.visit(theNode => {
                            if (theNode.data.view === view &&
                                theNode.data.flavor === flavor) {
                                found = theNode;
                                return false;
                            }
                        });
                        if (found) {
                            found.remove();
                        } else {
                            throw new Error('Node not found');
                        }
                        UI.showNotification(`Flavor ${flavor} removed`, 'success');
                    } else if (result.state === 'added') {
                        let flavorNodes = this.tree.rootNode.getChildren();
                        for (const child of flavorNodes) {
                            if (child.title === flavor) {
                                this.addNodeAndSelect(child, {
                                    title: result.name,
                                    folder: false,
                                    view,
                                    flavor
                                });
                                break;
                            }
                        }
                        this.switchToFlavor(flavor);
                        UI.showNotification(`Flavor ${flavor} added`, 'success');
                    } else {
                        throw new Error('unexpected result: ' + result);
                    }
                    this.renderLoadedNode();
                });
        }

        doSearch(value) {
            if (value === '') {
                this.inSearch = false;
                this.tree.clearFilter();
                this.renderFlavor();
            } else {
                this.inSearch = true;
                this.tree.filterNodes(value, {autoExpand: true, leavesOnly: true});
            }
        }

        switchToFlavor(flavorName) {
            if (this.flavor !== flavorName) {
                this.flavor = flavorName;
                this.renderFlavor();
                if (this.loadedNode && !this.loadedNode.data.view.hasFlavor(flavorName)) {
                    this.setLoadedNode(null);
                }
            }
        }

        renderFlavor() {
            var found = false;
            this.tree.filterBranches(node => {
                if (node.title === this.flavor) {
                    found = true;
                    node.setExpanded(true);
                    return true;
                } else {
                    node.setExpanded(false);
                    return false;
                }
            });
            if (!found) {
                // Nothing in current flavor. Let's create it
                this.tree.rootNode.addNode({
                    folder: true,
                    title: this.flavor,
                    path: [this.flavor]
                });
                this.flavors.push(this.flavor);
                this.flavors.sort();
                this.renderFlavor();
            }
        }

        onActivate(event, data) {
            this.activeNode = data.node;
            if (data.node.folder) {
                this.$saveAsButton.button('enable');
                this.$saveAsText.show();
            } else {
                this.$saveAsButton.button('disable');
                this.$saveAsText.hide();
            }
        }

        populateInfo(node) {
            if (!node) {
                this.$title.html('&nbsp;');
                this.$infoBox.empty();
                return;
            }
            const view = node.data.view;
            this.$title.text(view.title);
            this.$infoBox.html(
                `Name: <b>${_.escape(node.title)}</b><br>
                Folder: ${view.getPath(this.flavor)}<br><br>
                Size: ${Util.formatSize(view.size)}<br>
                Id: ${view.id}<br>
                Revision: ${view.revid}<br><br>
                Created on: ${view.creationDate.toLocaleString()}<br>
                Last modified: ${view.modificationDate.toLocaleString()}<br>
                Owner: ${view.owner}`
            );
            this.$publicCheckbox.prop('checked', view.public);
            this.$ownersList.html('Owners: ' + view.owners.join(', '));
        }

        saveAs() {
            var name = validateName(this.$saveAsText.val());
            if (!name) {
                return UI.showNotification('Invalid name', 'error');
            }

            const folder = this.activeNode;
            if (!folder.folder) return;

            const view = getCurrentView();
            const flavor = this.flavor;
            const doc = {
                $kind: 'view',
                $content: {
                    version: view.version,
                    title: view.title,
                    flavors: {
                        [flavor]: folder.data.path.slice(1).concat(name)
                    }
                },
                _attachments: {
                    'view.json': view.attachment
                }
            };
            const newView = new RocView(doc, this);
            this.showHide(true);
            newView.save()
                .then(() => {
                    this.showHide(false);
                    UI.showNotification('View saved', 'success');
                    this.addNodeAndSelect(folder, {
                        title: name,
                        folder: false,
                        view: newView,
                        flavor
                    });
                    Versioning.switchView(newView.getViewSwitcher(), true, {
                        doNotLoad: true
                    });

                }, error => {
                    this.showHide(false);
                    UI.showNotification('View could not be saved', 'error');
                });
        }

        closeLoadedView() {
            if (!this.loadedNode) return;
            Versioning.switchView({view: {}, data: {}}, true);
            this.setLoadedNode(null);
        }

        saveLoadedView() {
            if (!this.loadedNode) return;
            this.showHide(true);
            this.loadedNode.data.view.saveView(getCurrentView())
                .then(ok => {
                    this.showHide(false);
                    if (ok) {
                        UI.showNotification('View saved', 'success');
                        this.renderLoadedNode();
                    } else {
                        UI.showNotification('View could not be saved', 'error');
                    }
                });
        }

        onDblclick(event, data) {
            var node = data.node;
            if (node.folder) {
                return;
            }
            // Load view
            this.setLoadedNode(node);
            var view = node.data.view;
            Versioning.switchView(view.getViewSwitcher(), true, {
                withCredentials: true
            });
        }

        getTree(views) {
            var tree = new Map();
            var flavors = new Set();

            for (var i = 0; i < views.length; i++) {
                var view = new RocView(views[i], this);
                for (var flavor in view.content.flavors) {
                    flavors.add(flavor);
                    addFlavor(tree, view, flavor, view.content.flavors[flavor]);
                }
            }

            this.flavors = Array.from(flavors).sort();

            var fancytree = [];
            for (var element of tree) {
                this.buildElement(fancytree, element[0], element[1], [element[0]], true, element[0]);
            }
            fancytree.sort(sortFancytree); // todo sort the root differently ?

            return fancytree;
        }

        buildFolder(fancytree, tree, path, firstLevel, flavor) {
            for (var element of tree) {
                this.buildElement(fancytree, element[0], element[1], path.concat(element[0]), firstLevel, flavor);
            }
            fancytree.sort(sortFancytree);
        }

        buildElement(fancytree, name, value, path, firstLevel, flavor) {
            if (value instanceof Map) {
                var element = {
                    title: name,
                    folder: true,
                    children: [],
                    path: path
                };
                if (firstLevel && name === this.flavor) {
                    element.expanded = true;
                }
                this.buildFolder(element.children, value, path, false, flavor);
                fancytree.push(element);
            } else {
                fancytree.push({
                    title: name,
                    folder: false,
                    view: value,
                    flavor: flavor
                });
            }
        }

        addNodeAndSelect(parent, nodeInfo) {
            const node = parent.addNode(nodeInfo);
            parent.sortChildren(sortFancytree);
            parent.setExpanded(true);
            node.setActive(true);
            this.renderFlavor();
            this.setLoadedNode(node);
            return node;
        }

        setLoadedNode(node) {
            this.loadedNode = node;
            if (node) {
                this.$saveButton.button('enable');
                this.$closeButton.button('enable');
            } else {
                this.$saveButton.button('disable');
                this.$closeButton.button('disable');
            }
            this.renderLoadedNode();
        }

        renderLoadedNode() {
            this.populateInfo(this.loadedNode);
        }

        showHide(show) {
            clearTimeout(this._showTimeout);
            if (show) {
                this.$hide.show();
                this._showTimeout = setTimeout(() => {
                    //this.$hide.animate({backgroundColor: 'rgba(255,255,255,0.5)'});
                    this.$hide.html(Util.getLoadingAnimation());
                }, 1000);
            } else {
                //this.$hide.css('backgroundColor', 'rgba(0,0,0,0)');
                this.$hide.empty();
                this.$hide.hide();
            }
        }

        uploadFiles() {
            if (!this.loadedNode) return;
            var docUrl = `${this.rocDbUrl}/${this.loadedNode.data.view.id}`;
            var couchA = new CouchdbAttachments(docUrl);
            return couchA.fetchList().then(attachments => {
                return uploadUi.uploadDialog(attachments, 'couch').then(toUpload => {
                    if (!toUpload || toUpload.length === 0) return;
                    this.showHide(true);
                    var parts;
                    parts = _.partition(toUpload, function (v) {
                        return v.toDelete;
                    });
                    var toDelete = parts[0];
                    parts = _.partition(parts[1], function (v) {
                        return v.size < UPLOAD_LIMIT;
                    });

                    var largeUploads = parts[1];
                    var smallUploads = parts[0];

                    // Sort to minimize number of requests
                    smallUploads.sort(function (a, b) {
                        if (a.size < b.size) return 1;
                        else if (a.size === b.size) return 0;
                        else return -1;
                    });

                    // Create inline uploads batch
                    var inlineUploads = [];
                    var current = [];
                    var uploadSum = 0;
                    var i;
                    for (i = 0; i < smallUploads.length; i++) {
                        uploadSum += smallUploads[i].size;
                        if (uploadSum < UPLOAD_LIMIT) {
                            current.push(smallUploads[i]);
                        } else {
                            inlineUploads.push(current);
                            current = [smallUploads[i]];
                            uploadSum = smallUploads[i].size;
                        }
                    }

                    if (current.length) {
                        inlineUploads.push(current);
                    }

                    var prom = Promise.resolve();

                    prom = prom.then(function () {
                        return couchA.remove(_.pluck(toDelete, 'name'));
                    });
                    for (i = 0; i < largeUploads.length; i++) {
                        (function (i) {
                            prom = prom.then(function () {
                                return couchA.upload(largeUploads[i]);
                            });
                        })(i);
                    }

                    for (i = 0; i < inlineUploads.length; i++) {
                        (function (i) {
                            prom = prom.then(function () {
                                return couchA.inlineUploads(inlineUploads[i]);
                            });
                        })(i);
                    }

                    prom = prom.then(() => {
                        this.showHide(false);
                        UI.showNotification('Files uploaded successfully', 'success');
                    }, () => {
                        this.showHide(false);
                        UI.showNotification('Files upload failed (at least partially)', 'error');
                    });

                    return prom.then(() => this.reloadCurrent());
                });
            });
        }

        reloadCurrent() {
            if (!this.loadedNode) return;
            return this.loadedNode.data.view.reload().then(() => this.renderLoadedNode());
        }

        togglePublic() {
            if (!this.loadedNode) return;
            this.showHide(true);
            return this.loadedNode.data.view.togglePublic().then(ok => {
                this.showHide(false);
                this.renderLoadedNode();
                if (!ok) {
                    UI.showNotification('Could not change permissions', 'error');
                }
            });
        }

        addOwner() {
            if (!this.loadedNode) return;
            var div = $('<div>User email address: </div>');
            var input = $('<input type="text" />').appendTo(div);
            var dialog = UI.dialog(div, {
                buttons: {
                    Add: () => {
                        var value = input.val();
                        if (!Util.isEmail(value)) {
                            return UI.showNotification('Invalid email', 'error');
                        }
                        this.showHide(true);
                        this.loadedNode.data.view.addGroup(value).then(ok => {
                            if (!ok) {
                                UI.showNotification('Could not add owner', 'error');
                            }
                            this.renderLoadedNode();
                            this.showHide(false);
                        });
                        dialog.dialog('destroy');
                    }
                }
            });
        }
    }

    return RocViewManager;

    function returnBody(response) {
        return response.body;
    }

    function sortFancytree(a, b) {
        if (a.folder === b.folder) {
            return a.title.localeCompare(b.title);
        }
        return a.folder ? -1 : 1;
    }

    function addFlavor(tree, view, flavorName, flavor) {
        var map = tree.get(flavorName);
        if (!map) {
            map = new Map();
            tree.set(flavorName, map);
        }
        for (var i = 0; i < flavor.length - 1; i++) {
            if (!map.has(flavor[i])) {
                map.set(flavor[i], new Map());
            }
            map = map.get(flavor[i]);
        }
        map.set(flavor[i], view);
    }

    function validateName(name) {
        name = name.trim();
        if (name.length > 0) return name;
        return false;
    }

    function validateFlavor(name) {
        name = name.trim();
        if (/^[a-zA-Z0-9$_-]+$/.test(name)) return name;
        return false;
    }

    function getCurrentView() {
        const view = Versioning.getView();
        const json = Versioning.getViewJSON();
        const title = (view.configuration ? view.configuration.title : '') || '';
        return {
            version: view.version,
            title,
            attachment: {
                content_type: 'application/json',
                data: btoa(unescape(encodeURIComponent(json)))
            }
        };
    }
});
