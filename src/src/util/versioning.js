// Versioning file

define(['src/util/versionhandler'], function(VersionHandler) {
	
	var version = [2, 2, 3].join('.');
	var dataHandler = new VersionHandler(),
		viewHandler = new VersionHandler(),
		view, data;


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
        
        function switchView(value, pushstate) {console.log("VIEW SWITCHED")
            var def;
            if(value.data) {
                def = setData(value.data.url, value.data.branch);
            } else {
                def = $.Deferred().resolve();
            }
            if(value.view) {
                def.done(function(){
                    setView(value.view.url, value.view.branch);
                });
            }
            if(pushstate) {
                require(["components/uri.js/src/URI"],function(URI){
                    var uri = new URI(window.location.href);
                    if(value.data)
                        uri.setQuery("dataURL",value.data.url);
                    if(value.view)
                        uri.setQuery("viewURL", value.view.url);
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
