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
			self.$_dom.css({ color: '' });
			
			self.viewHandler.serverPush(Versioning.getView()).then(function() {
				self.$_dom.css({ color: '#357535' });
			}, function() {
				self.$_dom.css({ color: '#872A2A' });
			});
		},

		close: function() {
			window.clearTimeout(this.interval);
			this.$_dom.css({ color: '' });
			//this.$_dom.removeClass('toggledOn');
		}
	});

	return Element;
});