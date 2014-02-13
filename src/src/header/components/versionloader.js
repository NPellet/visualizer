define(['jquery', 'src/header/components/default', 'src/util/versioning'], function($, Default, Versioning) {

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
        
        var currentMenu, currentDataURL, currentDataBranch, currentViewURL, currentViewBranch;

	$.extend(el.prototype, Default, {
	
		initImpl: function() {},

                _onClick: function() {
                    
                    this.setStyleOpen(this._open);

                    if (this._open) {
                        if(currentMenu && (currentMenu !== this) && currentMenu._open)
                            currentMenu.onClick();
                        currentMenu = this;
                        this.loadView();
                        this.loadData();
                        this.doElements();
                    }
                    else
                        this.close();

                },

		loadView: function() {
			if(!this.options.viewURL)
				return;
			this.loadViewWith(this.options.viewURL, this.options.viewBranch);
		},

		loadViewWith: function(url, branch) {
                    if (url !== currentViewURL || branch !== currentViewBranch)
			Versioning.setView(url, branch);
                    currentViewURL = url;
                    currentViewBranch = branch;
		},

		loadData: function() {
			
			if(!this.options.dataURL)
				return;
			this.loadDataWith(this.options.dataURL, this.options.dataBranch)
		},

		loadDataWith: function(url, branch) {
                    if (url !== currentDataURL || branch !== currentDataBranch)
			Versioning.setData(url, branch);
                    currentDataURL = url;
                    currentDataBranch = branch;
		},

		doElements: function() {
			this.$_elToOpen = this._doElements(this.options.elements);
			this.open();
		},

		_doElements: function(elements) {
                    
                    if(!elements)
                        return;

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

					if( el.viewURL || el.viewBranch ) {
						self.loadViewWith(el.viewURL, el.viewBranch);
					}

					if( el.dataURL || el.dataBranch ) {
						self.loadDataWith(el.dataURL, el.dataBranch);
					}
                                        self.onClick();
				});
			}

			return dom;
		//	self.close();
		}
	});
                
	return el;
});