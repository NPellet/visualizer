CI.ConfMenuElement = function(options) {

	this.options = $.extend(this.defaults, options);
}

CI.ConfMenuElement.prototype = {

	defaults: {
		title: null,
		dblclickhandler: null,
		clickhandler: null
	},

	render: function() {

		var dom = $('<div class="ConfMenuElement">' + this.options.title + '</div>');
		if(this.options.clickhandler)
			dom.bind("click", this.options.clickhandler);

		if(this.options.dblclickhandler)
			dom.bind("dblclick", this.options.bblclickhandler);

		this.dom = dom;
		return this.dom;
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

		this.elements.append(el)

	},

	render: function() {

		var menu = this;
		var _class = this.options.openedState ? 'triangle-down' : 'triangle-up';
		var dom = $('<div><h3><span class="' + _class + '"></span></h3></div>');
		for(var i in this.elements)
			dom.append(this.elements[i].render());

		dom.children('h3').bind('click', function() {
			if(menu.options.openedState) {
				$(this).children('span').removeClass('triangle-down').addClass('triangle-up');
				$(this).next().hide();
				menu.options.openedState = 0;
			} else {
				$(this).children('span').addClass('triangle-down').removeClass('triangle-up');
				$(this).next().show();
				menu.options.openedState = 1;
			}
		});
		return dom;
	}
}

/*
CI.ConfElement.prototype = {
	buildWith: ["dblclickable", "contextmenu", "clickable", "hoverable"];	
}


CI.Util.objectBuilder = function() {}

$.extend(CI.ConfElement.prototype, CI.Util.objectBuilder);


CI.Util.objectBuilder.prototype = {

	build: function() {

		var allbuild = this.buildWidth;
		if(!all) return;

		for(var i in allBuild) {
			CI.Util.buildable[allBuild[i]].setup();
		}
	}
}


CI.Util.dblClickable.prototype = {

	dblClickableSet: function() {

		this.getDom().bind('dblclick')
		this.confirguration.dblclickable.handler

	}





}*/