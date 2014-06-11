define(['jquery', 'src/header/components/default', 'src/util/versioning'], function($, Default, Versioning, Button, Util) {


	var Element = function() {};
	$.extend(Element.prototype, Default, {

		initImpl: function() {
			this.viewHandler = Versioning.getViewHandler();
		},

		_onClick: function() { // Overwrite usual onclick which loads a list / loads views/datas
			
			if(this._open) {
				this.open();
			} else {
				this.close();
			}
		},

		open: function() {
			var self = this;
			this.interval = window.setInterval(function() {
				var view = Versioning.getView();
				
				if(self.viewHandler.currentPath[3] !== 'head') 
					self.viewHandler.serverCopy(view);

				self.viewHandler._localSave(view, 'head', view._name);
				self.$_dom.css({ color: '#BCF2BB' });
			/*	}
				else // We're not on the HEAD ! Therefore we cannot autosave (revert needed first)
					self.$_dom.css({ color: '#E0B1B1' });
*/
			}, 1000);

			this.$_dom.addClass('toggledOn');
		},

		close: function() {
			window.clearTimeout(this.interval);
			this.$_dom.css({ color: '' });
			this.$_dom.removeClass('toggledOn');
		}
	});

	return Element;
});