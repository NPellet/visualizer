define(['jquery', 'src/header/components/default', 'src/util/versioning', 'forms/button', 'src/util/util', 'lib/webtoolkit/base64','lib/couchdb/jquery.couch', 'fancytree', 'components/fancytree/src/jquery.fancytree.dnd','components/jquery-ui-contextmenu/jquery.ui-contextmenu.min'], function($, Default, Versioning, Button, Util, Base64) {

    var couchDBManager = function() {};
    
    $.extend(couchDBManager.prototype, Default, {
        initImpl: function() {
            this.ok = this.loggedIn = false;
            this.id = Util.getNextUniqueId();
            if(this.options.url) $.couch.urlPrefix = this.options.url.replace(/\/$/,"");
            this.url = $.couch.urlPrefix;
            var db = this.options.database || "visualizer";
            this.database = $.couch.db(db);
            this.flavor = "default";
            
            this.showError = $.proxy(showError, this);
            this.getFormContent = $.proxy(getFormContent, this);
            
            this.checkDatabase();
        },
        checkDatabase: function() {
            var that = this;
            $.couch.info({
                success: function(e) {
                    that.ok = true;
                },
                error: function(e, f, g) {
                    console.error("CouchDB header : database connection error. Code:" + e+".",g);
                }
            });
        },
        cssId : function(name) {
            return "ci-couchdb-header-"+this.id+"-"+name;
        },
        _onClick: function() {
            if (this.ok) {
                this.setStyleOpen(this._open);
                if (this._open) {
                    this.createMenu();
                    this.open();
                } else {
                    this.close();
                }
            }
            else {
                this.checkDatabase();
                console.error("CouchDB header : unreachable database.");
            }
        },
        createMenu: function() {
            if (this.$_elToOpen) {
                if(this.loggedIn)
                    this.$_elToOpen.html(this.getMenuContent());
                else
                    this.$_elToOpen.html(this.getLoginForm());
                return;
            }
            
            var that = this;
            this.$_elToOpen = $("<div>");
            this.errorP = $('<p id="'+this.cssId("error")+'" style="color: red;">');
            
            $.couch.session({
                success: function(data) {
                    if(data.userCtx.name===null) {
                        that.$_elToOpen.html(that.getLoginForm());
                    } else {
                        that.loggedIn = true;
                        that.username = data.userCtx.name;
                        that.$_elToOpen.html(that.getMenuContent());
                    }
                }
            });
            
        },
        load: function(type, node, rev) {
            $.getJSON(this.database.uri+node.data.doc._id+"/"+type.toLowerCase()+".json"+(rev ? "?rev="+rev : ""),function(data){
                data = new window[type+"Object"](data,true);
                Versioning["set"+type+"JSON"]( data );
                this["last"+type+"Loaded"] = node.data.doc;
            });
        },
        save: function(type, name) {
            
            if(name.length < 1)
                return;
            if(name.indexOf(":")!==-1)
                return this.showError(10);
            
            var content = Versioning["get"+type]();
            
            var last = this["last"+type+"Node"];
            if(typeof last === "undefined")
                return this.showError(11);

            var child = last.node.findFirst(name);
            
            var encodedAttachment = {
                "content_type":"application/json",
                "data": Base64.encode(JSON.stringify(content))
            };
            
            var doc, newDoc;
            
            if(child && child.title===name && !child.folder && (last.node.getChildren().indexOf(child) >= 0)) {
                doc = child.data.doc;
                if(!doc._attachments) doc._attachments = {};
            }
            else {
                newDoc = true;
                var flavors = {},flav = [];
                if(last.key)
                    flav = last.key.split(":");
                flav.push(name);
                flavors[this.flavor] = flav;
                doc = {
                    _id: $.couch.newUUID()+"test",
                    flavors: flavors,
                    _attachments: {}
                };

            }
            doc._attachments[type.toLowerCase()+".json"] = encodedAttachment;console.log(doc)
            this.database.saveDoc(doc, {
                success: function(data) {
                    if(newDoc) {
                        doc._rev = data.rev
                        last.node.addNode({
                            doc: doc,
                            lazy: true,
                            title: name,
                            key: last.node.key+":"+name
                        });
                        if(!last.node.expanded)
                            last.node.toggleExpanded();
                    } else {
                        if(child.children) child.lazyLoad(true); 
                    }
                }
            });
        },
        mkdir: function(type, name) {
            
            if(name.length < 1)
                return;
            if(name.indexOf(":")!==-1)
                return this.showError(10);
            
            var last = this["last"+type+"Node"];
            if(typeof last === "undefined")
                return this.showError(11);
            
            var folderNode;
            if(last.node.folder)
                folderNode = last.node;
            else
                folderNode = last.node.parent;
            
            // Check if folder already exists
            var children = folderNode.getChildren();
            if(children) {
                for(var i = 0; i < children.length; i++) {
                    if(children[i].title === name && children[i].folder)
                        return this.showError(12);
                }
            }
            
            var newNode = folderNode.addNode({
                folder: true,
                title: name,
                key: folderNode.key+":"+name
            });
            if(!folderNode.expanded)
                folderNode.toggleExpanded();
            $(newNode.li).find(".fancytree-title").trigger("click");
            
        },
        login: function(username, password) {
            var that = this;
            $.couch.login({
                name: username,
                password: password,
                success: function(data) {
                    that.loggedIn = true;
                    that.username = username;
                    that.$_elToOpen.html(that.getMenuContent());
                },
                error: this.showError
            });
        },
        logout: function() {
            var that = this;
            $.couch.logout({
                success: function() {
                    that.loggedIn = false;
                    that.username = null;
                    that.$_elToOpen.html(that.getLoginForm());
                }
            });
        },
        getLoginForm: function() {
            
            var that = this;
            
            function doLogin() {
                that.login(that.getFormContent("login-username"),that.getFormContent("login-password"));
                return false;
            }
            
            var loginForm = this.loginForm = $("<div>");
            loginForm.append("<h1>Login</h1>");
            loginForm.append('<label for="'+this.cssId("login-username")+'">Username </label><input type="text" id="'+this.cssId("login-username")+'" /><br>');
            loginForm.append('<label for="'+this.cssId("login-password")+'">Password </label><input type="password" id="'+this.cssId("login-password")+'" />');
            loginForm.append(new Button('Login', doLogin, {color: 'green'}).render());
            loginForm.bind("keypress",function(e){
                if(e.charCode===13)
                    return doLogin();
            });
            
            loginForm.append(this.errorP);
            
            return loginForm;
        },
        getMenuContent: function() {
            
            var that = this;
            var dom = this.menuContent = $("<div>");
            
            var logout = $("<div>").append($("<p>").css("display","inline-block").css("width","50%").append("Click on an element to select it. Double-click to load.")).append($("<p>").append("Logged in as "+this.username+" ").css("width","50%").css("text-align","right").css("display","inline-block").append($('<a>Logout</a>').on("click",function(){
                that.logout();
            }).css({
                color:"blue",
                "text-decoration":"underline",
                "cursor": "pointer"
            })));
            dom.append(logout);
            
            dom.append($("<p><span>Flavor : </span>").append($('<input type="text" value="'+this.flavor+'" id="'+this.cssId("flavor-input")+'">')).append(
                new Button('Switch', function() {
                   that.flavor = that.getFormContent("flavor-input");
                   that.loadFlavor();
               }, {color: 'red'}).render()
           ));
            
            var tableRow = $("<tr>").appendTo($("<table>").appendTo(dom));
            var treeCSS = {
                "overflow-y":"auto",
                "height": "200px",
                "width": "300px"
            };
            
            var dataCol = $('<td valign="top">').appendTo(tableRow);
            dataCol.append('<h1>Data</h1>');
            
            var dataTree = $("<div>").attr("id", this.cssId("datatree")).css(treeCSS);
            dataCol.append(dataTree);

            dataCol.append($("<p>").append('<input type="text" id="'+this.cssId("data")+'"/>')
                   .append(new Button('Save', function() {
                       that.save("Data", that.getFormContent("data"));
                   }, {color: 'red'}).render())
                   .append(new Button('Mkdir', function() {
                       that.mkdir("Data", that.getFormContent("data"));
                   }, {color: 'blue'}).render())
            );
            this.lastDataFolder = {name:this.username+":data",node:null};

            var viewCol = $('<td valign="top">').appendTo(tableRow);
            viewCol.append('<h1>View</h1>');
            
            var viewTree = $("<div>").attr("id", this.cssId("viewtree")).css(treeCSS);
            viewCol.append(viewTree);
            
            viewCol.append($("<p>").append('<input type="text" id="'+this.cssId("view")+'"/>')
                   .append(new Button('Save', function() {
                       that.save("View", that.getFormContent("view"));
                   }, {color: 'red'}).render())
                   .append(new Button('Mkdir', function() {
                       that.mkdir("View", that.getFormContent("view"));
                   }, {color: 'blue'}).render())
            );
            this.lastViewFolder = {name:this.username+":view",node:null};
            
            dom.append(this.errorP);
            
            this.loadFlavor();
            
            return dom;
        },
        lazyLoad: function(event, result) {
            var id = result.node.data.doc._id;
            var def = $.Deferred();
            result.result = def.promise();
            this.database.openDoc(id,{
                revs_info: true,
                success: function(data) {
                    var info = data._revs_info,
                        l = info.length,
                        revs = [];
                    for(var i = 0; i < l; i++) {
                        var rev = info[i];
                        if(rev.status==="available") {
                            var el = {title:"rev "+(l-i), id:data._id, rev:true, key:rev.rev};
                            revs.push(el);
                        }
                    }
                    def.resolve(revs);
                }
            });
        },
        clickNode: function(type, event, data) {
            if(data.targetType!=="title" && data.targetType!=="icon")
                return;

            var node = folder = data.node, last;
            var typeL = type.toLowerCase();
            
            var index = node.key.indexOf(":"), keyWithoutFlavor;
            if(index>=0)
                keyWithoutFlavor = node.key.substring(index+1);
            else
                keyWithoutFlavor = "";
            
            if(node.folder) {
                var folderName = keyWithoutFlavor;
                last = {name: this.username+":"+typeL+(folderName.length>0 ? ":"+folderName : ""), node: node};
            } else {
                var rev;
                if(node.data.rev) {
                    rev = node.key;
                    node = node.parent;
                }
                folder = node.parent;
                $("#"+this.cssId(typeL)).val(node.title);
                last = {name: node.data.doc._id, node: node};
                if(event.type==="fancytreedblclick")
                    this.load(type, node, rev);
            }
            
            last = {
                key: keyWithoutFlavor,
                node: folder
            }
            
            this["last"+type+"Node"] = last;
            if(event.type==="fancytreedblclick" && !node.folder)
                return false;
        },
        loadFlavor: function() {
            var proxyLazyLoad = $.proxy(this, "lazyLoad"),
                proxyClickData = $.proxy(this, "clickNode", "Data"),
                proxyClickView = $.proxy(this, "clickNode", "View"),
                that = this;
        
            var menuOptions = {
                delegate: "span.fancytree-title",
                menu: [
                    {title: "Delete", cmd: "delete", uiIcon: "ui-icon-trash"},
                    {title: "New flavor", cmd: "newflavor", uiIcon: "ui-icon-folder-collapsed"},
                    {title: "Rename", cmd: "rename", uiIcon: "ui-icon-folder-collapsed"}
                ],
                beforeOpen: function(event, ui) {
                    var node = $.ui.fancytree.getNode(ui.target);
                    if(node.folder) return false;
                    node.setActive();
                },
                select: function(event, ui) {
                    var node = $.ui.fancytree.getNode(ui.target);
                    that.contextClick(node, ui.cmd);
                },
                createMenu: function(event) {
                    $(event.target).css("z-index",1000);
                }
            };
            
            var dnd = {                         
                preventVoidMoves: true,
                preventRecursiveMoves: true,
                autoExpandMS: 300,
                dragStart: function(node){
                    if(node.folder) // Can only move documents
                        return false;
                    return true;
                },
                dragEnter: function(target){
                    if(!target.folder) // Can only drop in a folder
                        return false;
                    return true;
                },
                dragDrop: function(target, info){
                    var theNode = info.otherNode;
                    if(target === theNode.parent) // Same folder, nothing to do
                        return false;
                    var newKey = target.key.substring(that.flavor.length+1);
                    newKey += newKey.length ? ":"+theNode.title : theNode.title;
                    var newFlavor = newKey.split(":");
                    theNode.data.doc.flavors[that.flavor] = newFlavor;
                    that.database.saveDoc(theNode.data.doc, {
                                success: function() {
                                theNode.moveTo(target, info.hitMode);
                            },
                            error: that.showError
                    });
                }
            }   
            
            this.database.view("test/flavors", {
                success: function(data) {console.log(data);
                    var trees = createTrees(data.rows, that.flavor);
                    var datatree = $("#"+that.cssId("datatree"));
                    datatree.fancytree({
                        extensions: ["dnd"],
                        dnd: dnd,
                        source: [],
                        lazyload: proxyLazyLoad,
                        click: proxyClickData,
                        dblclick: proxyClickData,
                        debugLevel:0
                    }).children("ul").css("box-sizing", "border-box");
                    var dataftree = datatree.data("ui-fancytree").getTree();
                    dataftree.reload(trees.data);
                    dataftree.getNodeByKey(that.flavor).toggleExpanded();
                    datatree.contextmenu(menuOptions);
                    
                    var viewtree = $("#"+that.cssId("viewtree"));
                    viewtree.fancytree({
                        extensions: ["dnd"],
                        dnd: dnd,
                        source: [],
                        lazyload: proxyLazyLoad,
                        click: proxyClickView,
                        dblclick: proxyClickView,
                        debugLevel:0
                    }).children("ul").css("box-sizing", "border-box");
                    var viewftree = viewtree.data("ui-fancytree").getTree();
                    viewftree.reload(trees.view);
                    viewftree.getNodeByKey(that.flavor).toggleExpanded();
                    viewtree.contextmenu(menuOptions);
                },
                error: function(status) {
                    console.log(status);
                },
                key: this.flavor,
                include_docs: true
            });
        },
        contextClick: function(node, action) {
            var that = this;
            
            var newflavordialog;
            
            if(!node.folder) {
                if(action === "delete") {
                    if(node.data.rev)
                        node = node.parent;
                        
                    delete node.data.doc.flavors[this.flavor]; // Delete current flavor
                    if($.isEmptyObject(node.data.doc.flavors)) {  // No more flavors, delete document
                        var doc = {
                            _id: node.data.doc._id,
                            _rev: node.data.doc._rev
                        };
                        this.database.removeDoc(doc, {
                            success: function() {
                                node.remove();
                            },
                            error: this.showError
                        });
                    }
                    else { // Update current doc
                        this.database.saveDoc(node.data.doc, {
                                success: function() {
                                node.remove();
                            },
                            error: this.showError
                        });
                    }
                }
                else if(action === "rename") {
                    console.warn("renaming unimplemented")
                }
                else if(action === "newflavor") {
                    if(!newflavordialog) {
                        newflavordialog = $('<div>').html('Flavor : <input type="text" id="'+this.cssId("newflavorname")+'"<br>Path : <input type="text" id="'+this.cssId("newflavorpath")+'" />').dialog({
                            buttons: {
                                "Save": function() {
                                    var dialog = $(this);
                                    var doc = node.data.doc;
                                    var flavor = $("#"+that.cssId("newflavorname")).val();
                                    if(doc.flavors[flavor])
                                        that.showError(20);
                                    else {
                                        var path = $("#"+that.cssId("newflavorpath")).val();
                                        that.database.view("test/flavors", {
                                            success: function(data) {
                                                for(var i = 0; i < data.rows.length; i++) {
                                                    var thePath = data.rows[i].value.flavors.join(":")
                                                    if(path===thePath)
                                                        return that.showError(21);
                                                }
                                                doc.flavors[flavor] = path.split(":");
                                                that.database.saveDoc(doc, {
                                                    success: function(data) {
                                                        that.flavor = flavor;
                                                        dialog.dialog("close");
                                                        that.loadFlavor();
                                                    },
                                                    error: function(status) {
                                                        console.log(status);
                                                    }
                                                });
                                            },
                                            error: function(status) {
                                                console.log(status);
                                            },
                                            key: flavor,
                                            include_docs: false
                                        });
                                    }
                                },
                                "Cancel": function() {
                                    $(this).dialog("close");
                                }
                            },
                            title: "New flavor",
                            width: 375,
                            autoOpen: false
                        });
                    }
                    newflavordialog.dialog("open");
                }
            }
        }
    });
    
    function showError(e){
        var content;
        switch(e) {
            case 10:
                content = "Colons are not allowed in the name.";
                break;
            case 11:
                content = "Please select a folder";
                break;
            case 12:
                content = "A folder with this name already exists.";
                break;
            case 20:
                content = "Document already has this flavor";
                break;
            case 21:
                content = "Path already used by another document";
                break;
            case 401:
                content = "Wrong username or password.";
                break;
            case 409:
                content = "Conflict. An entry with the same name already exists.";
                break;
            case 503:
                content = "Service Unavailable.";
                break;
            default:
                content = "Unknown error.";
        }
        $(("#"+this.cssId("error"))).text(content).show().delay(3000).fadeOut();
    }
    
    function createTrees(data, flavor) {
        var trees = {data: {}, view: {}};
        for(var i = 0; i < data.length; i++) {
            var theData = data[i];
            var structure = getStructure(theData);
            if(theData.value.data)
                $.extend(true, trees.data, structure);
            if(theData.value.view)
                $.extend(true, trees.view, structure);
        }
        
        var trees2 = {};
        trees2.data = createFancyTree(trees.data, "", flavor);
        trees2.view = createFancyTree(trees.view, "", flavor);
        console.log(trees2);
        return trees2;
    }
    
    function getStructure(data) {
        var flavors = data.value.flavors;
        var structure = {}, current = structure;
        for(var i = 0; i < flavors.length-1; i++) {
            current = current[flavors[i]] = {__folder:true};
        }
        current[flavors[flavors.length-1]] = {
            __name:flavors.join(":"),
            __doc:data.doc
        }
        return structure;
    }
    
    function createFancyTree(object, currentPath, flavor) {
        var tree, root;
        if(currentPath.length) {
            tree = root = [];
        } else {
            root = [{
                key:flavor,
                title: flavor,
                folder: true,
                children: []
            }];
            tree = root[0].children;
            currentPath = flavor+":";
        }
        
        for(var name in object) {
            if(name.indexOf("__")===0)
                continue;
            var obj = object[name];
            var thisPath = currentPath+name;
            var el = {title:name, key:thisPath};
            if(obj.__folder) {
                if(obj.__name) {
                    tree.push({doc: obj.__doc, lazy: true, title: name, key: thisPath});
                }
                el.folder = true;
                el.children = createFancyTree(obj, thisPath+":", flavor);
            } else {
                el.lazy = true;
                el.doc = obj.__doc;
            }
            tree.push(el);
        }
        return root;
    }
    
    function getFormContent(type) {
        return $("#"+this.cssId(type)).val().trim();
    }
    
    return couchDBManager;

});