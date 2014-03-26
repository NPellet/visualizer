// Versioning file

define(['src/util/versionhandler'], function(VersionHandler) {
	
	var version = [2, 2, 3].join('.');
	var dataHandler = new VersionHandler(),
		viewHandler = new VersionHandler(),
		view, data,
                lastLoaded = {
                    view: {},
                    data: {}
                };


	viewHandler.version = version;
	dataHandler.setType('data');
	viewHandler.setType('view');

	dataHandler.reviver = function(k, l) {
		return DataObject.check(l);
	};

	viewHandler.reviver = function(k, l) {
		return ViewObject.check(l);
	};
        
        window.onpopstate = function(event) {
            if(event.state && event.state.type === "viewchange"){
                switchView(event.state.value, false);
            }
        };
        
        function switchView(value, pushstate) {
//            console.log("switch")
            var def;
            if(value.data && (lastLoaded.data.url !== value.data.url || (lastLoaded.data.urls !== value.data.urls && lastLoaded.data.branch !== value.data.branch))) {
//                console.log("load new data",lastLoaded.data, value.data)
                def = setData(value.data.urls, value.data.branch, value.data.url);
                lastLoaded.data = value.data;
            } else {
                def = $.Deferred().resolve();
            }
            if(value.view && (lastLoaded.view.url !== value.view.url || (lastLoaded.view.urls !== value.view.urls && lastLoaded.view.branch !== value.view.branch))) {
//                console.log("load new view", lastLoaded.view, value.view)
                def.done(function(){
                    setView(value.view.urls, value.view.branch, value.view.url);
                    lastLoaded.view = value.view;
                });
            }
            if(pushstate) {
                require(["components/uri.js/src/URI"],function(URI){
                    var uri = new URI(window.location.href);
                    if(value.data) {
                        uri.removeQuery(["dataURL","dataBranch","results"]);
                        if(value.data.urls) {
                            uri.setQuery("results",value.data.urls);
                            if(value.data.branch)
                                uri.setQuery("dataBranch",value.data.branch)
                        }
                        else if(value.data.url) {
                            uri.setQuery("dataURL", value.data.url)
                        }
                    }
                    if(value.view) {
                        uri.removeQuery(["viewURL","viewBranch","views"]);
                        if(value.view.urls) {
                            uri.setQuery("views",value.view.urls);
                            if(value.view.branch)
                                uri.setQuery("viewBranch",value.view.branch)
                        }
                        else if(value.view.url) {
                            uri.setQuery("viewURL", value.view.url)
                        }
                    }
                    window.history.pushState({type:"viewchange",value:value}, "", uri.href());
                });
            }
        }
        
        function setView(url, branch, defUrl) {
                return viewHandler.load(url, branch, defUrl);
        }
        function setData(url, branch, defUrl) {
                return dataHandler.load(url, branch, defUrl);
        }
                
	return {

		get version() {
			return String(version);
		},

		setView: setView,

		setData: setData,

		getView: function() {
			return view;
		},

		getData: function() {
			return data;
		},


		getViewHandler: function() {
			return viewHandler;
		},

		getDataHandler: function() {
			return dataHandler;
		},

		setViewLoadCallback: function(c) {
			this.viewCallback = c;

			viewHandler.onLoaded = function(v) {
				view = v;
				c(v);
			};
			viewHandler.onReload = function(v) {
				view = v;
				c(v, true);
			};
		},


		setDataLoadCallback: function(c) {
			this.dataCallback = c;
			dataHandler.onLoaded = function(d) {
				data = d;
				c(d);
			};
			dataHandler.onReload = function(d) {
				data = d;
				c(d, true);
			};
		},

		setViewJSON: function( json ) {

			view = json;
			this.viewCallback( view, true );
                        viewHandler.versionChange().notify(view);
			
		},
                
		setDataJSON: function( json ) {

			data = json;
			this.dataCallback( data, true );
			
		},

		blankView: function( ) {
			this.setViewJSON( { } );
		},
                
                switchView: switchView
	};
});
