define(['jquery', 'src/header/components/default', 'src/util/versioning'], function($, Default, Versioning) {

	var defaults = {
		label: false,
		elements: false,
		viewURL: false,
		dataURL: false,
		viewBranch: false,
		dataBranch: false,
		toggle: false
	};

	var el = function() {};
        
        var currentMenu;

	$.extend(el.prototype, Default, {
	
		initImpl: function() {},

                _onClick: function() {
                    
                    this.setStyleOpen(this._open);

                    if (this._open) {
                        if(currentMenu && (currentMenu !== this) && currentMenu._open)
                            currentMenu.onClick();
                        currentMenu = this;
                        
                        if(this.options.viewURL || this.options.dataURL)
                            this.load(this.options);

                        this.doElements();
                    }
                    else
                        this.close();

                },
                
                load: function(el) {
                    var result = {};
                    if(el.views || el.viewURL) {
                        result.view = {
                            url: el.viewURL,
                            branch: el.viewBranch,
                            urls: el.views
                        };
                    }
                    if(el.results || el.dataURL) {
                        result.data = {
                            url: el.dataURL,
                            branch: el.branchURL,
                            urls: el.views
                        };
                    }
                    Versioning.switchView(result, true);
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
                                    self.load(el);
                                    self.onClick();
				});
			}

			return dom;
		}
	});
                
	return el;
});