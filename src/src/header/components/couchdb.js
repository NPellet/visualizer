define(['jquery', 'src/header/components/default', 'src/util/versioning', 'forms/button', 'src/util/util', 'lib/couchdb/jquery.couch', 'fancytree'], function($, Default, Versioning, Button, Util) {

    var couchDBManager = function() {
    };
    
    $.extend(couchDBManager.prototype, Default, {
        initImpl: function() {
            this.ok = false;
            this.loggedIn = false;
            this.id = Util.getNextUniqueId();
            if(this.options.url) $.couch.urlPrefix = this.options.url;
            this.database = this.options.database || "visualizer";
            
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
            var options = {
                success: function(data) {
                    data = new window[type+"Object"](data.value,true);
                    Versioning["set"+type+"JSON"]( data );
                }
            };
            if(rev)
                options.rev = rev;
            $.couch.db(this.database).openDoc(node.data.id,options);
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

            var id, folderNode;
            if(last.node.folder) {
                id = last.name +":"+ name;
                folderNode = last.node;
            } else {
                id = last.name.replace(/[^:]*$/,name);
                folderNode = last.node.parent;
            }
            
            var doc = {
                value : content,
                _id : id
            };
            
            var update = false;
            if(id===last.name) {
                update = true;
                doc._rev = last.node.data.lastRev;
            }
            
            $.couch.db(this.database).saveDoc(doc,{
                success: function(data) {
                    if(update) {
                        last.node.data.lastRev = data.rev;
                        if(last.node.children) last.node.lazyLoad(true); 
                    } else {
                        folderNode.addNode({
                            id: data.id,
                            lazy: true,
                            title: name,
                            key: folderNode.key+":"+name,
                            lastRev: data.rev
                        });
                        if(!folderNode.expanded)
                            folderNode.toggleExpanded();
                    }
                    
                },
                error: this.showError
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
                    if(children[i].title === name)
                        return this.showError(12);
                }
            }
            
            folderNode.addNode({
                folder: true,
                title: name,
                key: folderNode.key+":"+name
            });
            if(!folderNode.expanded)
                folderNode.toggleExpanded();
            
        },
        login: function(username, password) {
            var that = this;
            $.couch.login({
                name: username,
                password: password,
                success: function(data) {
                    that.loggedIn = true;
                    that.username = data.name;
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
            if(this.loginForm)
                return this.loginForm;
            
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
            if(this.menuContent) {
                this.loadTree();
                return this.menuContent;
            }
            
            var that = this;
            var dom = this.menuContent = $("<div>");
            
            var logout = $("<p>").append("Logged in as "+this.username+" ").css("text-align","right").append($('<a href="#">Logout</a>').on("click",function(){
                that.logout();
            }));
            dom.append(logout);
            
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

            dataCol.append('<p id="'+this.cssId("datadiv")+'">&nbsp;</p>');
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
            
            viewCol.append('<p id="'+this.cssId("viewdiv")+'">&nbsp;</p>');
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
            
            this.loadTree();
            
            return dom;
        },
        lazyLoad: function(event, result) {
            var id = result.node.data.id;
            var def = $.Deferred();
            result.result = def.promise();
            $.couch.db(this.database).openDoc(id,{
                revs_info: true,
                success: function(data) {
                    var info = data._revs_info,
                        l = info.length,
                        revs = new Array(l);
                    for(var i = 0; i < l; i++) {
                        var rev = info[i];
                        var el = {title:"rev "+(l-i), id:data._id, rev:true, key:rev.rev};
                        revs[i]=el;
                    }
                    def.resolve(revs);
                }
            });
        },
        clickNode: function(type, event, data) {
            if(data.targetType!=="title" && data.targetType!=="icon")
                return;
            
            var node = data.node, formContent, divContent = "", last;
            var typeL = type.toLowerCase();

            if(node.folder) {
                divContent += node.key;
                last = {name: this.username+":"+typeL+":"+divContent.substring(5), node: node};
            } else {
                var rev;
                divContent += node.key.replace(/:?[^:]*$/,"");
                if(node.data.rev) {
                    rev = node.key;
                    node = node.parent;
                }
                formContent = node.title;
                last = {name: node.data.id, node: node};
                this.load(type, node, rev);
            }
            
            this["last"+type+"Node"] = last;
            $("#"+this.cssId(typeL)).val(formContent);
            $("#"+this.cssId(typeL+"div")).html("&nbsp;"+divContent);
            
        },
        loadTree: function() {
            var proxyLazyLoad = $.proxy(this, "lazyLoad"),
                proxyClickData = $.proxy(this, "clickNode", "Data"),
                proxyClickView = $.proxy(this, "clickNode", "View"),
                that = this;
            $.couch.db(this.database).allDocs({
                startkey: this.username+':',
                endkey: this.username+':~',
                success: function(data) {
                    var trees = createTrees(data.rows);
                    var datatree = $("#"+that.cssId("datatree"));
                    datatree.fancytree({
                        source: trees.data,
                        lazyload: proxyLazyLoad,
                        click: proxyClickData,
                        debugLevel:0
                    }).children("ul").css("box-sizing", "border-box");
                    datatree.data("ui-fancytree").getNodeByKey("root").toggleExpanded();
                    
                    var viewtree = $("#"+that.cssId("viewtree"));
                    viewtree.fancytree({
                        source: trees.view,
                        lazyload: proxyLazyLoad,
                        click: proxyClickView,
                        debugLevel:0
                    }).children("ul").css("box-sizing", "border-box");
                    viewtree.data("ui-fancytree").getNodeByKey("root").toggleExpanded();
                }
            });
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
    
    function createTrees(data) {
        var trees = {data: {_folder:true}, view: {_folder:true}};
        
        for(var i = 0, ii = data.length; i < ii; i++) {
            var info = data[i];
            var split = info.id.split(":");
            split.shift();
            if(split.shift()==="data")
                addBranch(trees.data, split, info);
            else
                addBranch(trees.view, split, info);
        }
        
        trees.data = createFancyTree(trees.data, "");
        trees.view = createFancyTree(trees.view, "");
        
        return trees;
    }
    
    function addBranch(tree, indices, info) {
        if(indices.length === 0) {
            addLeaf(tree, info);
        } else {
            tree._folder=true;
            var index = indices.shift();
            if(!tree[index])
                tree[index] = {};
            addBranch(tree[index], indices, info);
        }
    }
    
    function addLeaf(tree, info) {
        tree.name = info.id;
        tree.rev = info.value.rev;
    }
    
    function createFancyTree(object, currentPath) {
        var tree, root;
        if(currentPath.length) {
            tree = root = [];
        } else {
            root = [{
                key:"root",
                title: "root",
                folder: true,
                children: []
            }];
            tree = root[0].children;
            currentPath = "root:";
        }
        
        for(var name in object) {
            if(name==="_folder"||name==="name"||name==="rev")
                continue;
            var obj = object[name];
            var thisPath = currentPath+name;
            var el = {title:name, key:thisPath};
            if(obj._folder) {
                if(obj.name) {
                    tree.push({id: obj.name, lazy: true, title: name, key: thisPath, lastRev: obj.rev});
                }
                el.folder = true;
                el.children = createFancyTree(obj, thisPath+":");
            } else {
                el.lazy = true;
                el.id = obj.name;
                el.lastRev = obj.rev;
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