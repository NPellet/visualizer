define(['modules/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this;
			this.dom = $('<div></div>');
			var button = new BI.Buttons.Button(this.module.getConfiguration().label || '', function() {
				self.buttonUpdate();
				self.module.controller.onClick();
			});

			this.module.getDomContent().html(this.dom);
			this.dom.html(button.render());
			this.button = button;
		},

		buttonUpdate: function(el) {

			if(el == true) {
				this.currentNumber++;
			} else if(el == false) {

			} else {
				this.currentNumber = 0;
			}

			var total = this.module.getConfiguration().variables.length;

			if(this.currentNumber == total) {
				var d = new Date();
				var str = d.getHours() + ":" + d.getMinutes();
			} else
				var str = this.currentNumber + " / " + total;

			this.button.getDom().html((this.module.getConfiguration().label || '') + " (" + str + ")");
		},


		blank: function() {
			this.domTable.empty();
			this.table = null;
		},



		buildElement: function(source, arrayToPush, jpaths, colorJPath) {
		
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		}

	});
	return view;
});
 
