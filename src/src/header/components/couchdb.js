define(['jquery', 'src/header/components/default', 'src/util/versioning', 'forms/button', 'lib/couchdb/jquery.couch', 'fancytree'], function($, Default, Versioning, Button) {

    var couchDBManager = function() {
    };
    $.extend(couchDBManager.prototype, Default, {
        initImpl: function() {
            var that = this;
            this.ok = false;
            this.loggedIn = false;
            if(this.options.url) $.couch.urlPrefix = this.options.url;
            this.database = this.options.database || "visualizer";
            
            $.couch.info({
                success: function(e) {
                    that.ok = true;
                },
                error: function(e, f, g) {
                    console.error("CouchDB header : database connection error. Code:" + e+".",g);
                }
            });
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
            else
                console.error("CouchDB header : unreachable database.");

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
        loadData: function(id, rev) {
            var options = {
                success: function(data) {
                    data = new DataObject(data.value,true);
                    Versioning.setDataJSON( data );
                }
            };
            if(rev)
                options.rev = rev;
            $.couch.db(this.database).openDoc(id,options);
        },
        saveData: function(id, rev) {
            var data = Versioning.getData();
            var doc = {
                _id : this.username+":data:"+id,
                value : data
            };
            if(rev)
                doc._rev = rev;
            $.couch.db(this.database).saveDoc(doc,{
                success: function() {
                    if(rev) {
                        var tree = $("#ci-couchdbheader-datatree").data("ui-fancytree");
                        tree.getNodeByKey(id).lazyLoad(true);
                    }
                    
                },
                error: showError
            });
        },
        loadView: function(id, rev) {
            var options = {
                success: function(data) {
                    data = new ViewObject(data.value,true);
                    Versioning.setViewJSON( data );
                }
            };
            if(rev)
                options.rev = rev;
            $.couch.db(this.database).openDoc(id,options);
        },
        saveView: function(id, rev) {
            var view = Versioning.getView();
            var doc = {
                _id : this.username+":view:"+id,
                value : view
            };
            if(rev)
                doc._rev = rev;
            $.couch.db(this.database).saveDoc(doc,{
                success: function() {
                    if(rev) {
                        var tree = $("#ci-couchdbheader-viewtree").data("ui-fancytree");
                        tree.getNodeByKey(id).lazyLoad(true);
                    }
                    
                },
                error: showError
            });
        },
        getTreeSource: function() {
            $.couch.db(this.database).query();
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
                error: showError
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
                that.login(getFormContent("login-username"),getFormContent("login-password"));
                return false;
            }
            
            var loginForm = this.loginForm = $("<div>");
            loginForm.append("<h1>Login</h1>");
            loginForm.append('<label for="ci-couchdbheader-login-username">Username </label><input type="text" id="ci-couchdbheader-login-username" /><br>');
            loginForm.append('<label for="ci-couchdbheader-login-password">Password </label><input type="password" id="ci-couchdbheader-login-password" />');
            loginForm.append(new Button('Login', doLogin, {color: 'green'}).render());
            loginForm.bind("keypress",function(e){
                if(e.charCode===13)
                    return doLogin();
            });
            
            loginForm.append('<p id="ci-couchdbheader-error" style="color: red;">');
            
            return loginForm;
        },
        getMenuContent: function() {
            if(this.menuContent) {
                this.loadTree();
                return this.menuContent;
            }
            
            var that = this;
            var dom = this.menuContent = $("<div>");
            var tableRow = $("<tr>").appendTo($("<table>").appendTo(dom));
            var treeCSS = {
                "overflow-y":"auto",
                "height": "200px",
                "width": "250px"
            };
            
            var dataCol = $('<td valign="top">').appendTo(tableRow);
            dataCol.append('<h1>Data</h1>');
            
            var dataTree = $("<div>").attr("id", "ci-couchdbheader-datatree").css(treeCSS);
            dataCol.append(dataTree);

            dataCol.append($("<p>").append('<input type="text" id="ci-couchdbheader-data"/>')
                   .append(new Button('Save', function() {
                       that.saveData(getFormContent("data"), that.lastDataRev);
                   }, {color: 'red'}).render())
            );

            var viewCol = $('<td valign="top">').appendTo(tableRow);
            viewCol.append('<h1>View</h1>');
            
            var viewTree = $("<div>").attr("id", "ci-couchdbheader-viewtree").css(treeCSS);
            viewCol.append(viewTree);
            
            viewCol.append($("<p>").append('<input type="text" id="ci-couchdbheader-view"/>')
                   .append(new Button('Save', function() {
                       that.saveView(getFormContent("view"), that.lastViewRev);
                   }, {color: 'red'}).render())
            );
            
            var logout = $("<p>").append("Logged in as "+this.username).append(new Button('Logout', function() {
                that.logout();
            }, {color: 'red'}).render()).css("text-align","center").css("margin-top","30px");
            dom.append(logout);
            
            dom.append('<p id="ci-couchdbheader-error" style="color: red;">');
            
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
                        var el = {title:rev.rev, id:data._id, rev:rev.rev, key:data._id.replace(/^[^:]*:[^:]*:/,"")+rev.rev};
                        revs[i]=el;
                    }
                    def.resolve(revs);
                }
            });
        },
        clickNode: function(type, event, data) {
            if(data.targetType!=="title")
                return;
            var couchData = data.node.data;
            var name = data.node.key ? (couchData.rev ? data.node.key.replace(couchData.rev,"") : data.node.key) : couchData.id.replace(/^[^:]*:[^:]*:/,"");
            setFormContent(type.toLowerCase(),name);
            if(data.node.folder!==true) {
                this["load"+type](couchData.id, couchData.rev);
                this["last"+type+"Rev"] = couchData.rev;
            }
        },
        loadTree: function() {
            var proxyLazyLoad = $.proxy(this, "lazyLoad"),
                proxyClickData = $.proxy(this, "clickNode", "Data"),
                proxyClickView = $.proxy(this, "clickNode", "View");
            $.couch.db(this.database).allDocs({
                startkey: this.username+':',
                endkey: this.username+':~',
                success: function(data) {
                    var trees = createTrees(data.rows);
                    $("#ci-couchdbheader-datatree").fancytree({
                        source: trees.data,
                        lazyload: proxyLazyLoad,
                        click: proxyClickData,
                        debugLevel:0
                    }).children("ul").css("box-sizing", "border-box");
                    $("#ci-couchdbheader-viewtree").fancytree({
                        source: trees.view,
                        lazyload: proxyLazyLoad,
                        click: proxyClickView,
                        debugLevel:0
                    }).children("ul").css("box-sizing", "border-box");
                }
            });
        }
    });
    
    function showError(e){
        var content;
        switch(e) {
            case 401:
                content = "Wrong username or password";
                break;
            case 409:
                content = "Conflict. Please select a revision first.";
                break;
            case 503:
                content = "Service Unavailable";
                break;
            default:
                content = "Unknown error";
        }
        $("#ci-couchdbheader-error").text(content).show().delay(3000).fadeOut();
    }
    
    function createTrees(data) {
        var trees = {data: {_folder:true}, view: {_folder:true}};
        
        for(var i = 0, ii = data.length; i < ii; i++) {
            var id = data[i].id;
            var split = id.split(":");
            split.shift();
            if(split.shift()==="data")
                addBranch(trees.data, split, id);
            else
                addBranch(trees.view, split, id);
        }
        
        trees.data = createFancyTree(trees.data, "");
        trees.view = createFancyTree(trees.view, "");
        
        return trees;
    }
    
    function addBranch(tree, indices, id) {
        if(indices.length === 0) {
            addLeaf(tree, id);
        } else {
            tree._folder=true;
            var index = indices.shift();
            if(!tree[index])
                tree[index] = {};
            addBranch(tree[index], indices, id);
        }
    }
    
    function addLeaf(tree, id) {
        tree.name = id;
    }
    
    function createFancyTree(object, currentPath) {
        var tree = [];
        
        for(var name in object) {
            if(name==="_folder"||name==="name")
                continue;
            var obj = object[name];
            var thisPath = currentPath+name;
            var el = {title:name, key:thisPath};
            if(obj._folder) {
                if(obj.name) {
                    tree.push({id: obj.name, lazy: true, title: name, key: thisPath});
                }
                el.folder = true;
                el.children = createFancyTree(obj, thisPath+":");
            } else {
                el.lazy = true;
                el.id = obj.name;
            }
            tree.push(el);
        }
        
        return tree;
    }
    
    function getFormContent(type) {
        return $("#ci-couchdbheader-"+type).val();
    }
    
    function setFormContent(type, value) {
        $("#ci-couchdbheader-"+type).val(value);
    }

    return couchDBManager;

});