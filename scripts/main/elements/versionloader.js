define(['jquery', 'main/elements/default', 'util/versioning'], function($, Default, Versioning) {

	var defaults = {
		label: false,
		elements: false,
		viewURL: false,
		dataURL: false,
		viewBranch: false,
		dataBranch: false,

		toggle: false
	}

	var el = function() {};

	$.extend(el.prototype, Default, {
	
		initImpl: function() {},

		_onClick: function() {
			this.setStyleOpen(this._open);
			this.loadView();
			this.loadData();

			if(this._open)
				this.doElements();
			else
				this.close();

		},

		loadView: function() {
			if(!this.options.viewURL)
				return;
			this.loadViewWith(this.options.viewURL, this.options.viewBranch);
		},

		loadViewWith: function(url, branch) {

			Versioning.setView(url, branch);
		},

		loadData: function() {
			if(!this.options.dataURL)
				return;
			this.loadDataWith(this.options.dataURL, this.options.dataBranch)
		},

		loadDataWith: function(url, branch) {
			Versioning.setData(url, branch);
		},

		doElements: function() {
			this.$_elToOpen = this._doElements(this.options.elements);
			this.open();
		},

		_doElements: function(elements) {

			var ul = $("<ul />") || this.$_elToOpen.empty(),
				i = 0, 
				l = elements.length;

			for(; i < l; i++) {
				ul.append(this._buildSubElement(elements[i]));
				if(elements[i].elements && elements[i].elements.length > 0) {
					ul.append(this._doElements(elements[i].elements));
				}
			}


			return ul;
		},

		_buildSubElement: function(el) {
			var self = this,
				dom = $("<li />").text(el.label || '');
			if(el.viewURL || el.dataURL) {
				dom.addClass('hasEvent').bind('click', function() {
					self.loadViewWith(el.viewURL, el.viewBranch);
					self.loadDataWith(el.dataURL, el.dataBranch);
				});
			}

			return dom;
		//	self.close();
		}
	});

	return el;
});