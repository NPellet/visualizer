/**
 * @namespace
 * Represents a grid to which modules can be added, removed, moved and resized.
 */
CI.Grid = {

	/**
	 * Initialise the module grid in the div with id="ci-modules-grid"
	 * @param {object} definition An object containing options for the grid (is merged into {@link CI.Grid.defaults})
	 * @param {integer} [definition.xWidth] The width of the grid cells
	 * @param {integer} [definition.xHeight] The height of the grid cells
	 */
	init: function(definition) {
		CI.Grid.definition = $.extend(true, CI.Grid.defaults, definition);
		
		CI.Grid._el = $("#ci-modules-grid");
	},
	
	/**
	 * Used to define the grid-cell sizes. On initialisation, the object passed is merged with this object 
	 * @type object
	 * @hide
	 */
	defaults: {
		xWidth: 20,
		yHeight: 20
	},
	
	/**
	 * Add a module to the grid 
	 * @param module {Module} The module to add.
	 */
	addModule: function(module) {
		
		var grid = this;
		var modulePos = module.getPosition();
		var moduleSize = module.getSize();
		
		module.getDomWrapper().appendTo(CI.Grid._el).css({
			top: Math.round(modulePos.top) * CI.Grid.definition.yHeight,
			left: Math.round(modulePos.left) * CI.Grid.definition.xWidth,
			width: Math.round(moduleSize.width) * CI.Grid.definition.xWidth,
			height: Math.round(moduleSize.height) * CI.Grid.definition.yHeight
		});
		
		module.inDom();
		
		module.getDomWrapper().find('.ci-module-header').bind('mousedown', function() {
			CI.Grid.checkDimensions(true);
		});
		// Insert jQuery UI resizable and draggable
		module.getDomWrapper().resizable({
			grid: [CI.Grid.definition.xWidth, CI.Grid.definition.yHeight],
			resize: function() {

				//CI.Grid.moduleResize(module);
			},
			
			start: function() {
				CI.Util.maskIframes();
				module.resizing = true;
			},
			
			stop: function() {
				CI.Util.unmaskIframes();
				CI.Grid.moduleResize(module);
				module.resizing = false;

				CI.Grid.checkDimensions(false);
			},
			
			containment: "parent"
			
		}).draggable({
			
			grid: [CI.Grid.definition.xWidth, CI.Grid.definition.yHeight],
			containment: "parent",
			handle: '.ci-module-header',
			start: function() {
				
				CI.Util.maskIframes();
				var myZIndex  = $(this).css("zIndex");
				var count = 0;
				for (var i in CI.modules) {
					if (CI.modules[i].dom.css("zIndex")>myZIndex) {
						CI.modules[i].dom.css("zIndex","-=1")
					}
					count++;
				}
				CI.Grid.checkDimensions(true);
				module.moving = true;
				$(this).css("zIndex",count);
			},
			
			stop: function() {
				var position = $(this).position();
				
				CI.Util.unmaskIframes();
				module.getPosition().left = position.left / CI.Grid.definition.xWidth;
				module.getPosition().top = position.top / CI.Grid.definition.yHeight;
				module.moving = false;

				CI.Grid.checkDimensions(false);
			},
			
			drag: function() {
				CI.Grid.checkDimensions(true);
			}

		}).trigger('resize').bind('mouseover', function() {
			
			if(module.resizing || module.moving)
				return;
				
			if(module.getDomHeader().hasClass('ci-hidden')) {
				module.getDomHeader().removeClass('ci-hidden').addClass('ci-hidden-disabled');
				//module.getDomContent().parent().height("-=" + module.getDomHeader().outerHeight(true));
				grid.moduleResize(module);
			}
			
		}).bind('mouseout', function() {
			
			
			if(module.resizing || module.moving)
				return;
				
			if(module.getDomHeader().hasClass('ci-hidden-disabled')) {
				//module.getDomContent().parent().height("+=" + module.getDomHeader().outerHeight(true));
				module.getDomHeader().addClass('ci-hidden').removeClass('ci-hidden-disabled');
				grid.moduleResize(module);	
			}
		});
		

		module.getDomWrapper().find('.ui-resizable-handle').bind('mousedown', function() {
			CI.Grid.checkDimensions(true);
		});



		module.getDomWrapper().on('click', '.ci-module-expand', function() {
			module.getDomWrapper().height((module.getDomContent().outerHeight() + module.getDomHeader().outerHeight(true)));
			CI.Grid.moduleResize(module);
		});
		
		CI.Grid.moduleResize(module);
	},
	
	checkDimensions: function(extend) {
		
		var bottomMax = 0;
		for(var i in CI.modules) {
			var pos = CI.modules[i].getPosition();
			var size = CI.modules[i].getSize();
			if(pos.top && size.height)
				bottomMax = Math.max(bottomMax, pos.top + size.height);
		}

		CI.Grid._el.css('height', Math.max($(window).height(), (CI.Grid.defaults.yHeight * bottomMax + (extend ? 1000 : 0))));
	},
	
	
	removeModule: function(module) {
		
		module.getDomWrapper().remove().unbind();
	},
	
	
	/**
	 * Is called by jQuery UI when a module is resized, to resize the module and allow the module view's contents to update accordingly.
	 * @param module The module to resize.
	 */
	moduleResize: function(module) {
		
		var wrapper = module.getDomWrapper();
		module.getSize().width = wrapper.width() / CI.Grid.definition.xWidth;
		module.getSize().height = wrapper.height() / CI.Grid.definition.yHeight;
		var containerHeight = wrapper.height() - (module.getDomHeader().is(':visible') ? module.getDomHeader().outerHeight(true) : 0);
		
		module.getDomContent().css({
			height: containerHeight
		});
		module.view.onResize(module.getDomContent().width(), containerHeight);
		//CI.Grid.checkModuleSize(module);
	},
	
	checkModuleSize: function(module) {
/*		
		if(module.getDomContent().height() > module.getDomContent().parent().height(false))
			module.getDomContent().parent().after(module.viewExpander);*/
	}
}
