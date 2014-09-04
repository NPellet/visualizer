// Versioning file

define(['src/util/versionhandler', 'src/main/variables'], function(VersionHandler, Variables) {
	"use strict";
	var version = [2, 4, 2].join('.');
	var dataHandler = new VersionHandler(),
			viewHandler = new VersionHandler(),
			view = new DataObject(),
			data = Variables.getData(),
			lastLoaded = {
				view: {},
				data: {}
			}, urlType = "Search";


	viewHandler.version = version;
	dataHandler.setType('data');
	viewHandler.setType('view');

	dataHandler.reviver = function(l) {
		return DataObject.check(l, 1, false);
	};

	viewHandler.reviver = function(l) {
		return DataObject.check(l, 1, false);
	};

	window.onpopstate = function(event) {
		if (event.state && event.state.type === "viewchange") {
			switchView(event.state.value, false);
		}
	};

	function switchView(value, pushstate) {
		var def;
		if (value.data && (lastLoaded.data.url !== value.data.url || (lastLoaded.data.urls !== value.data.urls && lastLoaded.data.branch !== value.data.branch))) {
			def = setData(value.data.urls, value.data.branch, value.data.url);
			lastLoaded.data = value.data;
		} else {
			def = $.Deferred().resolve();
		}
		if (value.view && (lastLoaded.view.url !== value.view.url || (lastLoaded.view.urls !== value.view.urls && lastLoaded.view.branch !== value.view.branch))) {
			def.done(function() {
				setView(value.view.urls, value.view.branch, value.view.url);
				lastLoaded.view = value.view;
			});
		}
		if (pushstate) {
			require(["uri/URI.fragmentQuery"], function(URI) {
				var uri = new URI(window.location.href);
				if (value.data) {
					uri["remove" + urlType](["dataURL", "dataBranch", "results"]);
					if (value.data.urls) {
						uri["add" + urlType]("results", value.data.urls);
						if (value.data.branch)
							uri["add" + urlType]("dataBranch", value.data.branch);
					}
					else if (value.data.url) {
						uri["add" + urlType]("dataURL", value.data.url);
					}
				}
				if (value.view) {
					uri["remove" + urlType](["viewURL", "viewBranch", "views"]);
					if (value.view.urls) {
						uri["add" + urlType]("views", value.view.urls);
						if (value.view.branch)
							uri["add" + urlType]("viewBranch", value.view.branch);
					}
					else if (value.view.url) {
						uri["add" + urlType]("viewURL", value.view.url);
					}
				}
				window.history.pushState({type: "viewchange", value: value}, "", uri.href());
			});
		}
	}

	function setView(url, branch, defUrl) {
		return viewHandler.load(url, branch, defUrl);
	}
	function setData(url, branch, defUrl) {
		return dataHandler.load(url, branch, defUrl);
	}
	
	function updateView(newView) {
		var i;
		for(i in view) {
			delete view[i];
		}
		for(i in newView) {
			view[i] = DataObject.recursiveTransform(newView[i]);
		}
	}
	
	function updateData(newData) {
		var i, child;
		for(i in data) {
			delete data[i];
		}
		for(i in newData) {
            child = DataObject.check(newData[i], true);
			data[i] = child;
            child.linkToParent(data, i);
		}
        data.triggerChange();
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
		getViewJSON: function(tab) {
			return JSON.stringify(view, null, tab);
		},
		getData: function() {
			return data;
		},
		getDataJSON: function(tab) {
			return JSON.stringify(data, null, tab);
		},
		getViewHandler: function() {
			return viewHandler;
		},
		getDataHandler: function() {
			return dataHandler;
		},
		setViewLoadCallback: function(c) {
			this.viewCallback = c;
			var that = this;

			viewHandler.onLoaded = function(v) {
				updateView(v);
				c.call(that, view);
			};
			viewHandler.onReload = function(v) {
				updateView(v);
				c.call(that, view, true);
			};
		},
		setDataLoadCallback: function(c) {
			this.dataCallback = c;
			var that = this;
			dataHandler.onLoaded = function(d) {
				updateData(d);
				c.call(that, data);
			};
			dataHandler.onReload = function(d) {
				updateData(d);
				c.call(that, data, true);
			};
		},
		setViewJSON: function(json) {
			updateView(json);
			this.viewCallback(view, true);
			viewHandler.versionChange().notify(view);
		},
		setDataJSON: function(json) {
			updateData(json);
			this.dataCallback(data, true);
		},
		blankView: function() {
			this.setViewJSON({});
		},
		switchView: switchView,
		setURLType: function(type) {
			urlType = type;
		},
		isViewLocked: function() {
			return this.getView().configuration.lockView || false;
		}
	};
});
