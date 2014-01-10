define(['modules/default/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this;
			this.dom = $('<div></div>');
		/*	var button = new BI.Buttons.Button(this.module.getConfiguration().label || '', function() {
				self.module.controller.onClick();
			}, { 
				color: self.module.getConfiguration().color || 'Grey',
				disabled: this.module.getConfiguration().disabled
			});

			this.module.getDomContent().html(this.dom);
			this.dom.html(button.render());
			this.button = button;*/
		},


		inDom: function() {},
		
		
		blank: function() {
			this.domTable.empty();
			this.table = null;
		},

		update: {
			url: function(val) {
				if(val)
					this.url = val;
			},

			color: function(val) {
				if(val)
					this.button.setColor(val);
			},

			label: function(val) {

				if(val)
					this.button.setLabel(val);
			},

			disabled: function(val) {
				if(val)
					this.button.disable();
				else
					this.button.enable();
			}
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