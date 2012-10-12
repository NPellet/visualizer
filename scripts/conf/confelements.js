CI.ConfMenuElement = function(options) {
	this.options = $.extend({}, this.defaults, options);
}

CI.ConfMenuElement.prototype = {

	defaults: {
		title: null,
		dblclickhandler: null,
		clickhandler: null
	},

	render: function() {

		var that = this;
		var dom = $('<div class="ConfMenuElement">' + this.options.title + '</div>');
		if(this.options.clickhandler)
			dom.bind("click", this.options.clickhandler);
		if(this.options.dblclickhandler) {
			dom.bind("dblclick", function(e) { that.options.dblclickhandler(e, that) });
		}
		
		this.dom = dom;
		return this.dom;
	},

	getTitle: function() { return this.options.title },

	get: function(param) {
		return this.options[param] || false;
	}

}

CI.ConfMenuSupElement = function(options) {
	this.options = $.extend(this.defaults, options);
	this.elements = [];
}

CI.ConfMenuSupElement.prototype = {

	defaults: {
		title: null,
		openedState: 1
	},


	addElement: function(el) {

		this.elements.push(el);

	},

	render: function() {

		var menu = this;
		var _class = this.options.openedState ? 'triangle-down' : 'triangle-up';
		var dom = $('<div><h3><span class="' + _class + '"></span>' + this.options.title + '</h3></div>');

		var domchildren = $("<div />").appendTo(dom);

		for(var i in this.elements)
			domchildren.append(this.elements[i].render());

		dom.children('h3').bind('click', function() {
			var h3 = $(this);
			domchildren.toggle();
			h3.children('span').toggleClass('triangle-down triangle-right');
		});
		return dom;
	}
}

