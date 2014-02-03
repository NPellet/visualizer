define(['jquery', 'src/header/components/default', 'src/util/versioning', 'forms/button', 'src/util/util', 'lib/couchdb/jquery.couch'], function($, Default, Versioning, Button, Util) {

    var couchDBManager = function() {
    };
    $.extend(couchDBManager.prototype, Default, {
        initImpl: function() {
            var that = this;
            this.ok = false;
            if(this.options.url) $.couch.urlPrefix = this.options.url;
            if(this.options.username && this.options.password) {
                this.credentials = true;
                this.username = this.options.username;
                this.password = this.options.password;
            }
            this.database = this.options.database || "visualizer";
            
            $.couch.info({
                success: function(e) {
                    if(that.username && that.password) {
                        $.couch.login({
                            name: that.username,
                            password: that.password,
                            success: function(data) {
                                if(data.ok)
                                    that.ok = true;
                            }
                        });
                    } else {
                        console.warn("CouchDB header : accessing database without credentials, make sure it is not protected.");
                        that.ok = true;
                    }
                },
                error: function(e, f, g) {
                    console.error("CouchDB header : " + e + ".");
                }
            });
        },
        _onClick: function() {
            if (this.ok) {
                this.createMenu();
                this.setStyleOpen(this._open);
                if (this._open) {
                    this.open();
                } else {
                    this.close();
                }
            }
            else
                console.error("CouchDB header : unreachable database.");

        },
        createMenu: function() {
            if (this.$_elToOpen)
                return;
            
            var that = this;
            var dom = this.$_elToOpen = $("<div>");
            
            function getFormContent(type) {
                return $("#ci-pouchdbheader-"+type).val();
            }

            dom.append('<h1>Data</h1>');
            dom.append('<p><input type="text" id="ci-pouchdbheader-data"/></p>');
            dom.append(new Button('Load', function() {
                that.loadData(getFormContent("data"));
            }, {color: 'green'}).render());
            dom.append(new Button('Save', function() {
                that.saveData(getFormContent("data"));
            }, {color: 'red'}).render());

            dom.append('<h1>View</h1>');
            dom.append('<p><input type="text" id="ci-pouchdbheader-view"/></p>');
            dom.append(new Button('Load', function() {
                that.loadView(getFormContent("view"));
            }, {color: 'green'}).render());
            dom.append(new Button('Save', function() {
                that.saveView(getFormContent("view"));
            }, {color: 'red'}).render());
        },
        loadData: function(id) {
            id = (this.credentials ? this.username+":" : "")+"data:"+id;
            $.couch.db(this.database).openDoc(id,{
                success: function(data) {
                    data = new DataObject(data.value,true);
                    Versioning.setDataJSON( data );
                }
            });
        },
        saveData: function(id) {
            var data = Versioning.getData();
            var doc = {
                _id : (this.credentials ? this.username+":" : "")+"data:"+id,
                value : data
            };
            $.couch.db(this.database).saveDoc(doc);
        },
        loadView: function(id) {
            id = (this.credentials ? this.username+":" : "")+"view:"+id;
            $.couch.db(this.database).openDoc(id,{
                success: function(data) {
                    data = new ViewObject(data.value,true);
                    Versioning.setViewJSON( data );
                }
            });
        },
        saveView: function(id) {
            var view = Versioning.getView();
            var doc = {
                _id : (this.credentials ? this.username+":" : "")+"view:"+id,
                value : view
            };
            $.couch.db(this.database).saveDoc(doc);
        }
    });

    return couchDBManager;

});