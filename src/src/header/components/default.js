
define(['jquery'], function() {
	
	return {

		init: function(element) {
			this.options = element;
			this._open = false;
			this.makeDom();
			this.initImpl();
		},

		initImpl: function() {},
		makeDom: function() {

			var self = this;
			this._dom = document.createElement('li');
			this.$_dom = $(this._dom);
			this.$_dom.text(this.options.label || this.options.title || ''); 
			this.$_dom.bind('click', function() {
				self.onClick();
			})
		},

		getDom: function() {
			return this.$_dom;
		},

		onClick: function() {
			this._open = !this._open
			this._onClick();
		},

		setStyleOpen: function(opened) {
			this.$_dom[opened ? 'addClass' : 'removeClass']('opened');
		},

		_onClick: function() {},

		open: function() {
			//this.$_elToOpen = ul;
			this.$_elToOpen.addClass('header-button-list');
			$('body').append(this.$_elToOpen);

			var w = this.$_elToOpen.outerWidth(true),
				h = this.$_dom.outerHeight(true),
				pos = this.$_dom.position(),
				fullH = $(window).outerHeight(true),
				fullW = $("#header").outerWidth(true),
				newLeft, newTop

			if(pos.left + w >= fullW) {
				newLeft = fullW - w;
			} else {
				newLeft = pos.left;
			}
			newTop = h + pos.top - 1;


			this.$_elToOpen.css({
				top: newTop,
				left: newLeft
			})

			//this.open = true;
		},



		close: function() {
			this.$_elToOpen.remove();
		}
	};
});