// Versioning file

define(['util/versionhandler'], function(VersionHandler) {
	
	var dataHandler = new VersionHandler(),
		viewHandler = new VersionHandler(),
		view, data;

	dataHandler.setType('data');
	viewHandler.setType('view');

	dataHandler.reviver = function(k, l) {
		return DataObject.check(l);
	};

	viewHandler.reviver = function(k, l) {
		return ViewObject.check(l);
	};
				
	return {

		setView: function(url, branch, defUrl) {
			viewHandler.load(url, branch, defUrl);
		},

		setData: function(url, branch, defUrl) {
			dataHandler.load(url, branch, defUrl);
		},

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
			dataHandler.onLoaded = function(d) {
				data = d;
				c(d);
			};
			dataHandler.onReload = function(d) {
				data = d;
				c(d, true);
			};
		}
	}
});