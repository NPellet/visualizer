'use strict';

define([
    'jquery',
    'lodash',
    'src/util/ui',
    'src/header/components/default',
    'src/util/versioning',
    'forms/button',
    'src/util/util',
    'forms/form',
    'lib/couchdb/jquery.couch',
    'fancytree',
    'components/ui-contextmenu/jquery.ui-contextmenu.min',
    'jquery-ui/autocomplete'
], function ($, _, ui, Default, Versioning, Button, Util, Form) {

    function CouchDBManager() {
    }

    var regAlphaNum = /^[a-zA-Z0-9]+$/;

    Util.inherits(CouchDBManager, Default, {
        initImpl: function () {

            this.ok = this.loggedIn = this.ready = false;
            if (!this.options.beforeUrl) this.ready = true;
            else {
                this.beforeUrl();
            }
            this.id = Util.getNextUniqueId();
            this.options.loginMethods = this.options.loginMethods || ['couchdb'];
            if (this.options.url) {
                $.couch.urlPrefix = this.options.url.replace(/\/$/, '');
            }
            this.url = $.couch.urlPrefix;
            var db = this.options.database || 'visualizer';
            this.database = $.couch.db(db);
            $.ui.fancytree.debugLevel = 0;
            this.checkDatabase();
        },

        beforeUrl: function () {
            var that = this;
            var url = this.options.beforeUrl;
            $.ajax({
                type: 'GET',
                url: url,
                success: function () {
                    Debug.info('CouchDB: beforeUrl success');
                    that.ready = true;
                },
                error: function (err) {
                    Debug.info('CouchDB: beforeUrl error', err);
                    that.ready = true;
                }
            });
        },

        showError: function (e, type) {
            var content;
            var color = 'red';
            if (type === 2)
                color = 'green';
            if (typeof e === 'number') {
                switch (e) {
                    case 10:
                        content = 'Colons are not allowed in the name.';
                        break;
                    case 11:
                        content = 'Please select a folder';
                        break;
                    case 12:
                        content = 'A folder with this name already exists.';
                        break;
                    case 20:
                        content = 'Document already has this flavor';
                        break;
                    case 21:
                        content = 'Path already used by another document';
                        break;
                    case 401:
                        content = 'Wrong username or password.';
                        break;
                    case 409:
                        content = 'Conflict. An entry with the same name already exists.';
                        break;
                    case 503:
                        content = 'Service Unavailable.';
                        break;
                    default:
                        content = 'Unknown error.';
                }
            } else {
                content = e;
            }
            this.errorP.text(content).css('color', color).show().delay(3000).fadeOut();
        },
        getFormContent: function (type) {
            return $('#' + this.cssId(type)).val().trim();
        },
        setFormContent: function (type, value) {
            $('#' + this.cssId(type)).val(value);
        },
        checkDatabase: function () {
            var that = this;
            $.couch.info({
                success: function (e) {
                    that.ok = true;
                },
                error: function (e, f, g) {
                    console.error('CouchDB header : database connection error. Code:' + e + '.', g);
                }
            });
        },
        cssId: function (name) {
            return 'ci-couchdb-header-' + this.id + '-' + name;
        },
        changeFlavor: function (flavorName) {
            if (!regAlphaNum.test(flavorName))
                return this.showError('Flavor name must be alphanumeric.');
            this.flavor = flavorName;
            this.setFormContent('flavor-input', flavorName);
            this.loadFlavor();
        },
        _onClick: function () {
            if (this.ok && this.ready) {
                this.setStyleOpen(this._open);
                if (this._open) {
                    this.createMenu();
                    this.errorP.hide();
                    this.open();
                } else {
                    this.close();
                }
            } else if (!this.ok) {
                this.checkDatabase();
                console.error('CouchDB header : unreachable database.');
            } else {
                ui.showNotification('Couchdb button not ready');
            }
        },
        createMenu: function () {
            if (this.$_elToOpen) {
                if (this.loggedIn) {
                    this.openMenu('tree');
                } else {
                    this.openMenu('login');
                }
                return;
            }

            var that = this;
            this.$_elToOpen = $('<div>').css('width', 560);
            this.errorP = $('<p id="' + this.cssId('error') + '">');

            $.couch.session({
                success: function (data) {
                    if (data.userCtx.name === null) {
                        that.openMenu('login');
                    } else {
                        that.loggedIn = true;
                        that.username = data.userCtx.name;
                        that.openMenu('tree');
                    }
                }
            });

        },
        openMenu: function (which) {
            if (which === this.lastMenu) {
                return;
            } else if (which === 'tree') {
                this.$_elToOpen.html(this.getMenuContent());
                this.lastMenu = 'tree';
            } else if (which === 'login') {
                this.$_elToOpen.html(this.getLoginForm());
                this.lastMenu = 'login';
            }
        },
        load: function (node, rev) {
            var result = {};
            if (node.data.hasData) {
                result.data = {
                    url: this.database.uri + node.data.doc._id + '/data.json' + (rev ? '?rev=' + rev : '')
                };
            }
            if (node.data.hasView) {
                result.view = {
                    url: this.database.uri + node.data.doc._id + '/view.json' + (rev ? '?rev=' + rev : '')
                };
            }
            Versioning.switchView(result, true);

            this.lastKeyLoaded = node.key;
        },

        saveMeta: function (val) {
            var that = this;
            var node = that.currentDocument;
            var doc = node.data.doc;
            if (val && val.keywords && val.keywords.value) {
                doc.keywords = val.keywords.value;
            }
            doc._attachments['meta.json'] = {
                'content_type': 'application/json',
                'data': btoa(unescape(encodeURIComponent(JSON.stringify(val))))
            };
            that.database.saveDoc(doc, {
                success: function (data) {
                    doc._rev = data.rev;
                    node.data.hasMeta = true;
                    if (node.children)
                        node.lazyLoad(true);

                    that.showError('meta saved.', 2);
                },
                error: function () {
                    that.showError.apply(that, arguments);
                }
            });
        },
        save: function (type, name) {

            if (name.length < 1)
                return;
            if (name.indexOf(':') !== -1)
                return this.showError(10);

            var content = Versioning['get' + type + 'JSON']();

            var last = this.lastNode;
            if (typeof last === 'undefined')
                return this.showError(11);

            var children = last.node.getChildren();
            var child;
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    if (children[i].title === name) {
                        child = children[i];
                        break;
                    }
                }
            }

            var doc;
            var that = this;

            if (child && !child.folder) {
                // This doc has revs which means it has been saved to couchdb already
                // Therefore we only need to update the attachment
                doc = child.data.doc;
                $.ajax({
                    url: this.database.uri + doc._id + '/' + type.toLowerCase() + '.json?rev=' + doc._rev,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: content,
                    dataType: 'json',
                    error: this.showError,
                    success: function (data) {
                        doc._rev = data.rev;
                        child.data['has' + type] = true;
                        if (child.children)
                            child.lazyLoad(true);
                        that.showError(type + ' saved.', 2);
                    }
                });
            } else {
                // The doc is new so we need to save the whole document
                // With a new uuid
                var flavors = {}, flav = [];
                if (last.key) {
                    flav = last.node.key.split(':');
                    flav.shift();
                }
                flav.push(name);
                flavors[this.flavor] = flav;
                doc = {
                    _id: $.couch.newUUID(),
                    flavors: flavors,
                    name: this.username,
                    _attachments: {}
                };
                doc._attachments[type.toLowerCase() + '.json'] = {
                    'content_type': 'application/json',
                    'data': btoa(unescape(encodeURIComponent(content)))
                };
                this.database.saveDoc(doc, {
                    success: function (data) {
                        doc._rev = data.rev;
                        var newNode = {
                            doc: doc,
                            lazy: true,
                            title: name,
                            key: last.node.key + ':' + name
                        };
                        newNode['has' + type] = true;
                        last.node.addNode(newNode);
                        if (!last.node.expanded)
                            last.node.toggleExpanded();
                        that.showError(type + ' saved.', 2);
                    }
                });
            }
        },
        mkdir: function (name) {
            if (name.length < 1)
                return;
            if (name.indexOf(':') !== -1)
                return this.showError(10);

            var last = this.lastNode;
            if (typeof last === 'undefined')
                return this.showError(11);

            var folderNode;
            if (last.node.folder)
                folderNode = last.node;
            else
                folderNode = last.node.parent;

            // Check if folder already exists
            var children = folderNode.getChildren();
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    if (children[i].title === name && children[i].folder)
                        return this.showError(12);
                }
            }

            var newNode = folderNode.addNode({
                folder: true,
                title: name,
                key: folderNode.key + ':' + name
            });
            if (!folderNode.expanded)
                folderNode.toggleExpanded();
            $(newNode.li).find('.fancytree-title').trigger('click');

        },
        login: function (username, password) {
            var that = this;
            $.couch.login({
                name: username,
                password: password,
                success: function (data) {
                    that.loggedIn = true;
                    that.username = username;
                    that.openMenu('tree');
                },
                error: function () {
                    that.showError.apply(that, arguments);
                }
            });
        },
        logout: function () {
            var that = this;
            $.couch.logout({
                success: function () {
                    that.loggedIn = false;
                    that.username = null;
                    that.openMenu('login');
                }
            });
        },
        renderLoginMethods: function () {
            var that = this;

            function doLogin() {
                that.login(that.getFormContent('login-username'), that.getFormContent('login-password'));
                return false;
            }

            for (var i = 0; i < this.options.loginMethods.length; i++) {
                switch (this.options.loginMethods[i]) {
                    case 'google':
                        this.loginForm.append('<a href=" ' + that.url + '/auth/google' + '">Google login</a><br/>');
                        break;
                    case 'github':
                        this.loginForm.append('<a href=" ' + that.url + '/auth/github' + '">Github login</a><br/>');
                        break;
                    case 'facebook':
                        this.loginForm.append('<a href=" ' + that.url + '/auth/facebook' + '">Facebook login</a><br/>');
                        break;
                    case 'couchdb':
                        this.loginForm.append('<div> Couchdb Login </div>');
                        this.loginForm.append('<label for="' + this.cssId('login-username') + '">Username </label><input type="text" id="' + this.cssId('login-username') + '" /><br>');
                        this.loginForm.append('<label for="' + this.cssId('login-password') + '">Password </label><input type="password" id="' + this.cssId('login-password') + '" /><br><br>');
                        this.loginForm.append(new Button('Login', doLogin, {color: 'green'}).render());
                        this.loginForm.bind('keypress', function (e) {
                            if (e.charCode === 13)
                                return doLogin();
                        });
                        break;
                    default:

                        break;
                }
            }
        },

        getLoginForm: function () {
            var loginForm = this.loginForm = $('<div>');
            loginForm.append('<h1>Login</h1>');
            this.renderLoginMethods();
            loginForm.append(this.errorP);
            return loginForm;
        },
        getMenuContent: function () {

            var that = this;
            var dom = this.menuContent = $('<div>');

            var logout = $('<div>')
                .append($('<p>')
                    .css('display', 'inline-block')
                    .css('width', '50%')
                    .append('Click on an element to select it. Double-click to load.'))
                .append($('<p>')
                    .append('Logged in as ' + this.username + ' ')
                    .css('width', '50%')
                    .css('text-align', 'right')
                    .css('display', 'inline-block')
                    .append($('<a>Logout</a>')
                        .on('click', function () {
                            that.logout();
                        })
                        .css({
                            color: 'blue',
                            'text-decoration': 'underline',
                            'cursor': 'pointer'
                        })));
            dom.append(logout);

            var flavorField = $('<input type="text" value="' + this.flavor + '" id="' + this.cssId('flavor-input') + '">');

            function changeFlavor() {
                var flavor = that.getFormContent('flavor-input');
                if (that.flavor !== flavor) that.changeFlavor(flavor);
            }

            this.database.view('flavor/list', {
                success: function (data) {
                    if (!data.rows.length)
                        that.flavorList = ['default'];
                    else
                        that.flavorList = data.rows[0].value;
                    flavorField.autocomplete({
                        appendTo: '#ci-visualizer',
                        minLength: 0,
                        source: that.flavorList
                    }).on('autocompleteselect', function (e, d) {
                        var flavor = d.item.value;
                        if (that.flavor !== flavor) that.changeFlavor(flavor);
                        flavorField.blur();
                    }).on('keypress', function (e) {
                        if (e.keyCode === 13) {
                            changeFlavor();
                            flavorField.blur();
                        }
                    });
                },
                error: function (status) {
                    console.log(status);
                },
                key: this.username
            });

            dom.append($('<p><span>Flavor : </span>').append(flavorField).append(
                new Button('Switch', changeFlavor, {color: 'red'}).setTooltip('Switch flavor!').render()
            ));

            var treeCSS = {
                'overflow-y': 'auto',
                'height': '200px',
                'width': '300px'
            };
            var treeContainer = $('<div>').attr('id', this.cssId('tree')).css(treeCSS).appendTo(dom);
            this.makePublicButton = new Button('Make Public', function () {
                ui.confirm('You are about to make your view public. This action is irreversible. It will enable anybody to access the saved view and data. Do you want to proceed?', 'Proceed', 'Cancel').then(function (proceed) {
                    if (!proceed || !that.currentDocument) return;
                    var node = that.currentDocument;
                    var doc = node.data.doc;
                    doc.isPublic = true;
                    that.database.saveDoc(doc, {
                        success: function (data) {
                            doc._rev = data.rev;
                            node.data.isPublic = true;
                            that.updateButtons();
                            if (node.children)
                                node.lazyLoad(true);

                            that.showError('The view was made public', 2);
                        },
                        error: function () {
                            that.showError.apply(that, arguments);
                        }
                    });
                });
            }, {color: 'red'});
            dom.append($('<div style="width:560px; height:35px;">').append('<input type="text" id="' + this.cssId('docName') + '"/>')
                    .append(new Button('Edit Meta', function () {
                        that.metaData();
                    }, {color: 'blue'}).render())
                    .append(new Button('Save data', function () {
                        that.save('Data', that.getFormContent('docName'));
                    }, {color: 'red'}).render())
                    .append(new Button('Save view', function () {
                        that.save('View', that.getFormContent('docName'));
                    }, {color: 'red'}).render())
                    .append(new Button('Mkdir', function () {
                        that.mkdir(that.getFormContent('docName'));
                    }, {color: 'blue'}).render())
                    .append(this.errorP)
            );


            dom.append('<hr>').append(this.makePublicButton.render().hide());

            this.loadFlavor();

            return dom;
        },
        updateButtons: function () {
            var node = this.currentDocument;
            var dom = this.makePublicButton.getDom();
            if ((node && node.data && !node.data.isPublic && dom)) {
                dom.show();
            } else if (dom) {
                dom.hide();
            }
        },
        getMetaForm: function (node) {
            var that = this;
            var doc = node.data.doc;
            return new Promise(function (resolve) {
                $.ajax({
                    url: that.database.uri + doc._id + '/meta.json', // always the last revision
                    type: 'GET',
                    dataType: 'json',
                    error: function () {
                        console.error('Could not get meta data...');
                        resolve({});
                    },
                    success: function (data) {
                        resolve(that.processMetaForm(data));
                    }
                });
            });
        },

        processMetaForm: function (obj) {
            //var result = {
            //    sections: {
            //        metadata: [{
            //            sections: {
            //                keywords: [
            //                    {
            //                        "sections": {},
            //                        "groups": {
            //                            "group": [
            //                                {
            //                                    "contentType": ['html'],
            //                                    "keyword": [
            //                                        "showHelp"
            //                                    ],
            //                                    "contentText": [
            //                                        "abc"
            //                                    ],
            //                                    "contentHtml": [
            //                                        "xyz"
            //                                    ]
            //                                }
            //                            ]
            //                        }
            //                    },
            //                    {
            //                        "sections": {},
            //                        "groups": {
            //                            "group": [
            //                                {
            //                                    "contentType": ['text'],
            //                                    "keyword": [
            //                                        "showHelp"
            //                                    ],
            //                                    "contentText": [
            //                                        "abc"
            //                                    ],
            //                                    "contentHtml": [
            //                                        "xyz"
            //                                    ]
            //                                }
            //                            ]
            //                        }
            //                    }
            //                ]
            //            }
            //        }]
            //    }
            //};
            var result = {
                sections: {
                    metadata: [
                        {
                            sections: {
                                keywords: []
                            }
                        }
                    ]
                }
            };
            for (var key in obj) {
                var n = {};
                n.contentType = [obj[key].type];
                n.keyword = [key];
                if (obj[key].type === 'text') {
                    n.contentText = [obj[key].value];
                    n.contentHtml = [''];
                } else if (obj[key].type === 'html') {
                    n.contentHtml = [obj[key].value];
                    n.contentText = [''];
                }
                result.sections.metadata[0].sections.keywords.push({
                    sections: {},
                    groups: {
                        group: [n]
                    }
                });
            }
            return result;
        },

        metaData: function () {
            var that = this;
            if (!this.currentDocument) {
                that.showError('No document selected');
                return;
            }

            var div = ui.dialog({
                width: '80%',
                autoPosition: true,
                title: 'Edit Metadata'
            });

            var structure = {

                sections: {

                    metadata: {

                        options: {
                            title: 'Metadata',
                            icon: 'info_rhombus'
                        },
                        sections: {
                            keywords: {
                                options: {
                                    multiple: true,
                                    title: 'Key/Value Metadata'
                                },
                                groups: {
                                    group: {
                                        options: {
                                            type: 'list',
                                            multiple: true
                                        },
                                        fields: {
                                            contentType: {
                                                type: 'combo',
                                                options: [{key: 'text', title: 'Text'}, {key: 'html', title: 'html'}],
                                                title: 'Content type',
                                                displaySource: {text: 't', html: 'h'},
                                                default: 'text'
                                            },
                                            keyword: {
                                                type: 'text',
                                                title: 'Key'
                                            },
                                            contentText: {
                                                type: 'jscode',
                                                mode: 'text',
                                                title: 'Value',
                                                displayTarget: ['t']
                                            },
                                            contentHtml: {
                                                type: 'wysiwyg',
                                                title: 'Value',
                                                default: ' ',
                                                displayTarget: ['h']
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            var form = new Form({});

            form.init({
                onValueChanged: function (value) {
                }
            });

            form.setStructure(structure);
            form.onStructureLoaded().done(function () {
                var fill = {};
                var prom;
                if (!that.currentDocument.data.hasMeta) {
                    prom = Promise.resolve({});
                } else {
                    prom = that.getMetaForm(that.currentDocument);
                }

                prom.then(function (fill) {
                    form.fill(fill);
                });
            });

            form.addButton('Cancel', {color: 'blue'}, function () {
                div.dialog('close');
            });

            form.addButton('Save', {color: 'green'}, function () {
                var value = form.getValue();
                that.saveMeta(that.getMetaFromForm(value));
                div.dialog('close');
            });

            form.onLoaded().done(function () {
                div.html(form.makeDom(1, 0));
                form.inDom();
            });

        },

        getMetaFromForm: function (value) {
            value = DataObject.check(value, true);
            var result = {};
            var x = value.getChildSync(['sections', 'metadata', 0, 'sections', 'keywords']);
            if (x) {
                for (var i = 0; i < x.length; i++) {
                    var val = x.getChildSync([i, 'groups', 'group', 0]);
                    if (val.contentType[0] === 'text') {
                        result[val.keyword[0]] = {
                            type: 'text',
                            value: val.contentText[0]
                        };
                    } else if (val.contentType[0] === 'html') {
                        result[val.keyword[0]] = {
                            type: 'html',
                            value: val.contentHtml[0]
                        };
                    }
                }
            }
            return result;
        },
        lazyLoad: function (event, result) {
            var id = result.node.data.doc._id;
            var def = $.Deferred();
            result.result = def.promise();
            this.database.openDoc(id, {
                revs_info: true,
                success: function (data) {
                    var info = data._revs_info,
                        l = info.length,
                        revs = [];
                    for (var i = 0; i < l; i++) {
                        var rev = info[i];
                        if (rev.status === 'available') {
                            var el = {title: 'rev ' + (l - i), id: data._id, rev: rev.rev, key: result.node.key};
                            revs.push(el);
                        }
                    }
                    def.resolve(revs);
                }
            });
        },
        clickNode: function (event, data) {
            var folder;
            var node = folder = data.node, last;

            var index = node.key.indexOf(':'), keyWithoutFlavor;
            if (index >= 0)
                keyWithoutFlavor = node.key.substring(index + 1);
            else
                keyWithoutFlavor = '';

            if (node.folder) {
                this.currentDocument = null;
            } else {
                var rev;
                if (node.data.rev) {
                    rev = node.data.rev;
                    node = node.parent;
                }
                folder = node.parent;
                this.currentDocument = node;
                $('#' + this.cssId('docName')).val(node.title);
                this.updateButtons();
                if (event.type === 'fancytreedblclick')
                    this.load(node, rev);
            }

            last = {
                key: keyWithoutFlavor,
                node: folder
            };
            this.lastNode = last;
            if (event.type === 'fancytreedblclick' && !node.folder)
                return false;

        },
        loadFlavor: function () {
            var proxyLazyLoad = $.proxy(this, 'lazyLoad'),
                proxyClick = $.proxy(this, 'clickNode'),
                that = this;

            var menuOptions = {
                delegate: 'span.fancytree-title',
                menu: [
                    {title: 'Delete', cmd: 'delete', uiIcon: 'ui-icon-trash'},
                    {title: 'New flavor', cmd: 'newflavor', uiIcon: 'ui-icon-newwin'},
                    {title: 'Rename', cmd: 'rename', uiIcon: 'ui-icon-folder-collapsed'},
                    {title: 'Flavors', cmd: 'flavors', children: []}
                ],
                beforeOpen: function (event, ui) {
                    var node = $.ui.fancytree.getNode(ui.target);
                    if (node.folder)
                        return false;
                    var tree = $('#' + that.cssId('tree'));
                    var flavors = Object.keys(node.data.doc.flavors);
                    if (flavors.length === 1) {
                        tree.contextmenu('setEntry', 'delete', 'Delete');
                        tree.contextmenu('showEntry', 'flavors', false);
                    } else {
                        var children = new Array(flavors.length);
                        for (var i = 0; i < flavors.length; i++) {
                            children[i] = {
                                title: flavors[i],
                                cmd: 'flavor'
                            };
                            if (flavors[i] === that.flavor) {
                                children[i].disabled = true;
                            }
                        }
                        tree.contextmenu('setEntry', 'delete', 'Delete flavor');
                        tree.contextmenu('setEntry', 'flavors', {
                            title: 'Flavors',
                            children: children
                        });
                        tree.contextmenu('showEntry', 'flavors', true);
                    }
                    node.setActive();
                },
                select: function (event, ui) {
                    var node = $.ui.fancytree.getNode(ui.target);
                    that.contextClick(node, ui.cmd, ui);
                },
                createMenu: function (event) {
                    $(event.target).css('z-index', 10000);
                }
            };

            var dnd = {
                preventVoidMoves: true,
                preventRecursiveMoves: true,
                autoExpandMS: 300,
                dragStart: function (node) { // Can only move documents
                    return !node.folder && !node.data.rev;
                },
                dragEnter: function (target) { // Can only drop in a folder
                    return !!target.folder;
                },
                dragDrop: function (target, info) {
                    var theNode = info.otherNode;
                    if (target === theNode.parent) // Same folder, nothing to do
                        return false;
                    var newKey = target.key.substring(that.flavor.length + 1);
                    newKey += newKey.length ? ':' + theNode.title : theNode.title;
                    var newFlavor = newKey.split(':');
                    that.database.view('flavor/docs', {
                        success: function (data) {
                            if (comparePaths(newFlavor, data.rows))
                                return that.showError(21);

                            theNode.data.doc.flavors[that.flavor] = newFlavor;
                            that.database.saveDoc(theNode.data.doc, {
                                success: function () {
                                    theNode.moveTo(target, info.hitMode);
                                },
                                error: function () {
                                    that.showError.apply(that, arguments);
                                }
                            });
                        },
                        error: function (status) {
                            console.log(status);
                        },
                        key: [that.flavor, that.username],
                        include_docs: false
                    });


                }
            };
            this.database.list('flavor/sort', 'docs', {
                    key: [this.flavor, this.username],
                    include_docs: true
                },
                {
                    success: function (data) {
                        var tree = createFullTree(data, that.flavor);
                        var theTree = $('#' + that.cssId('tree'));
                        theTree.fancytree({
                            toggleEffect: false,
                            extensions: ['dnd'],
                            dnd: dnd,
                            source: [],
                            lazyLoad: proxyLazyLoad,
                            dblclick: proxyClick,
                            debugLevel: 0,
                            activate: proxyClick
                        }).children('ul').css('box-sizing', 'border-box');
                        var thefTree = theTree.data('ui-fancytree').getTree();
                        thefTree.reload(tree);
                        thefTree.getNodeByKey(that.flavor).toggleExpanded();
                        theTree.contextmenu(menuOptions);
                        if (that.lastKeyLoaded)
                            thefTree.activateKey(that.lastKeyLoaded);
                        if (that.currentDocument) {
                            // When switching flavors, if this document is also
                            // in the new flavor we select it automatically
                            var id = that.currentDocument.data.doc._id;
                            var d = _.find(data, function (d) {
                                return d.id === id;
                            });
                            if (d) {
                                var key = _.flatten([that.flavor, d.value.flavors]).join(':');
                                thefTree.activateKey(key);
                            }
                        }
                    },
                    error: function (status) {
                        console.log(status);
                    }
                });
        },
        contextClick: function (node, action, ctx) {
            var that = this;

            if (!node.folder) {
                if (action === 'delete') {
                    if (node.data.rev)
                        node = node.parent;

                    delete node.data.doc.flavors[this.flavor]; // Delete current flavor
                    if ($.isEmptyObject(node.data.doc.flavors)) {  // No more flavors, delete document
                        node.data.doc._deleted = true;
                        this.database.saveDoc(node.data.doc, {
                            success: function () {
                                that.showError('Document deleted.', 2);
                                node.remove();
                            },
                            error: function () {
                                that.showError.apply(that, arguments);
                            }
                        });
                    } else { // Update current doc
                        this.database.saveDoc(node.data.doc, {
                            success: function () {
                                that.showError('Flavor deleted.', 2);
                                node.remove();
                            },
                            error: function () {
                                that.showError.apply(that, arguments);
                            }
                        });
                    }
                } else if (action === 'rename') {
                    ui.dialog('New name : <input type="text" id="' + this.cssId('newname') + '" value="' + node.title + '" />', {
                        buttons: {
                            'Save': function () {
                                var dialog = $(this);
                                var doc = node.data.doc;
                                var name = that.getFormContent('newname');
                                var path = doc.flavors[that.flavor];
                                var oldName = path[path.length - 1];
                                path[path.length - 1] = name;
                                that.database.view('flavor/docs', {
                                    success: function (data) {
                                        if (comparePaths(path, data.rows)) {
                                            path[path.length - 1] = oldName;
                                            return that.showError(21);
                                        }
                                        that.database.saveDoc(doc, {
                                            success: function () {
                                                node.key = node.key.replace(/[^:]+$/, name);
                                                node.setTitle(name);
                                                dialog.dialog('destroy');
                                            },
                                            error: function (status) {
                                                console.log(status);
                                            }
                                        });
                                    },
                                    error: function (status) {
                                        console.log(status);
                                    },
                                    key: [that.flavor, that.username],
                                    include_docs: false
                                });
                            },
                            'Cancel': function () {
                                $(this).dialog('destroy');
                            }
                        }
                    });
                } else if (action === 'newflavor') {
                    var div = $('<div>').html('Flavor :');
                    ui.dialog(div, {
                        buttons: {
                            'Save': function () {
                                var dialog = $(this);
                                var doc = node.data.doc;
                                var flavor = that.getFormContent('newflavorname');
                                if (doc.flavors[flavor])
                                    that.showError(20);
                                else {
                                    var path = doc.flavors[that.flavor];
                                    that.database.view('flavor/docs', {
                                        success: function (data) {
                                            if (comparePaths(path, data.rows))
                                                return that.showError(21);
                                            doc.flavors[flavor] = path;
                                            that.database.saveDoc(doc, {
                                                success: function () {
                                                    that.showError('Flavor ' + flavor + ' successfully added.', 2);
                                                    dialog.dialog('destroy');
                                                },
                                                error: function (status) {
                                                    console.log(status);
                                                }
                                            });
                                        },
                                        error: function (status) {
                                            console.log(status);
                                        },
                                        key: [flavor, that.username],
                                        include_docs: false
                                    });
                                }
                            },
                            'Cancel': function () {
                                $(this).dialog('destroy');
                            }
                        },
                        title: 'New flavor'
                    });
                    div.append($('<input type="text" id="' + this.cssId('newflavorname') + '" />').autocomplete({
                        appendTo: '#ci-visualizer',
                        minLength: 0,
                        source: that.flavorList
                    }));
                } else if (action === 'flavor') {
                    that.changeFlavor(ctx.item.text());
                } else if (action === 'flavors') {
                    // do nothing
                } else {
                    console.warn('Context menu action "' + action + '" not implemented !');
                }
            }
        }
    });

    Object.defineProperty(CouchDBManager.prototype, 'flavor', {
        get: function () {
            if (this._flavor) {
                return this._flavor;
            } else {
                return this._flavor = window.sessionStorage.getItem('ci-visualizer-pouchdb2-flavor') || 'default';
            }
        },
        set: function (value) {
            this._flavor = value;
            window.sessionStorage.setItem('ci-visualizer-pouchdb2-flavor', value);
        }
    });

    function createFullTree(data, flavor) {
        var tree = {};
        for (var i = 0; i < data.length; i++) {
            var theData = data[i];
            var structure = getStructure(theData);
            $.extend(true, tree, structure);
        }
        return createFancyTree(tree, '', flavor);
    }

    function getStructure(data) {
        var flavors = data.value.flavors;
        var structure = {}, current = structure;
        for (var i = 0; i < flavors.length - 1; i++) {
            current = current[flavors[i]] = {__folder: true};
        }
        current[flavors[flavors.length - 1]] = {
            __name: flavors.join(':'),
            __doc: data.doc,
            __data: data.value.data,
            __view: data.value.view,
            __meta: data.value.meta,
            __public: data.value.isPublic
        };
        return structure;
    }

    function createFancyTree(object, currentPath, flavor) {
        var tree, root;
        if (currentPath.length) {
            tree = root = [];
        } else {
            root = [{
                key: flavor,
                title: flavor,
                folder: true,
                children: []
            }];
            tree = root[0].children;
            currentPath = flavor + ':';
        }

        for (var name in object) {
            if (name.indexOf('__') === 0)
                continue;
            var obj = object[name];
            var thisPath = currentPath + name;
            var el = {title: name, key: thisPath};
            if (obj.__folder) {
                if (obj.__name) {
                    tree.push({
                        doc: obj.__doc,
                        hasData: obj.__data,
                        hasView: obj.__view,
                        hasMeta: obj.__meta,
                        isPublic: obj.__public,
                        lazy: true,
                        title: name,
                        key: thisPath
                    });
                }
                el.folder = true;
                el.children = createFancyTree(obj, thisPath + ':', flavor);
            } else {
                el.lazy = true;
                el.doc = obj.__doc;
                el.hasData = obj.__data;
                el.hasView = obj.__view;
                el.hasMeta = obj.__meta;
                el.isPublic = obj.__public;
            }
            tree.push(el);
        }
        return root;
    }

    function comparePaths(path1, paths) {
        var joinedPath1 = path1.join(':');
        var i = 0, l = paths.length;
        for (; i < l; i++) {
            var path2 = paths[i].value.flavors.join(':');
            if (joinedPath1 === path2)
                return true;
        }
        return false;
    }

    return CouchDBManager;

});
