define(['jquery'], function($) {

	var zone = function(options) {
		this.buttons = {};	
		this.options = options || {};
		this.hAlign = this.options.hAlign || 'left';
		this.vAlign = this.options.vAlign || 'vertical';
	}

	zone.prototype = {

		addButton: function(button) {
			this.buttons[button.getId()] = button;
		},
		
		render: function() {

			var dom = $('<div class="bi-buttonzone"><div>');
			if(this.hAlign)
				dom.addClass('bi-align-' + this.hAlign);
			
			if(this.vAlign)
				dom.addClass('bi-align-' + this.vAlign);
			
			for(var i in this.buttons) {
				dom.append(this.buttons[i].render());
			}
			
			return dom;
		},
		
		getButton: function(id) {
			return this.buttons[id];
		},
		
		setAlignment: function(align) {
			this.hAlign = align;
		},
		
		setVerticalAlignment: function(align) {
			this.vAlign = align;
		}
	}

	return zone;
});


