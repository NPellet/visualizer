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
		CI.Grid._el.get(0).addEventListener('contextmenu', function(e) {
			e.preventDefault();

			if(CI.Grid.contextMenu)
				CI.Grid.contextMenu.menu('destroy').remove();
			CI.Grid.contextMenu = null;

			$menu = $('<ul class="ci-contextmenu"></ul>').css({
				'position': 'absolute',
				'left': e.pageX,
				'top': e.pageY,
				'z-index': 10000
			}).appendTo($("body"));

			$li = $('<li><a> Add a module</a></li>');
			$ulModules = $("<ul />").appendTo($li);
			
			for(var i in CI.Module.prototype._types) {
				$ulModules.append('<li class="ci-item-newnmodule" name="' + i + '"><a>' + CI.Module.prototype._types[i].Controller.prototype.moduleInformations.moduleName + '</a></li>');

			}
			$menu.append('<li class="ci-item-refresh" name="refresh"><a><span class="ui-icon ui-icon-arrowrefresh-1-s"></span>Refresh page</a></li>');
			$menu.append($li);
			
			CI.Grid.contextMenu = $menu;

			var clickHandler = function() {
				if(CI.Grid.contextMenu)
					CI.Grid.contextMenu.menu('destroy').remove();
				CI.Grid.contextMenu = null;
				$(document).unbind('click', clickHandler);
			}

			var rightClickHandler = function() {
				if(CI.Grid.contextMenu)
					CI.Grid.contextMenu.menu('destroy').remove();
				CI.Grid.contextMenu = null;
				$("#ci-header").unbind('contextmenu', rightClickHandler);
			}
			
			$("#ci-header").bind('contextmenu', rightClickHandler);
			$(document).bind('click', clickHandler);
			return false;

		}, true);


		CI.Grid._el.get(0).addEventListener('contextmenu', function(e) {			
			CI.Grid.contextMenu.menu({
				select: function(event, ui) {
					var moduleName = ui.item.attr('name');
					if(ui.item.hasClass('ci-item-newnmodule'))
						CI.Grid.newModule(moduleName);
					else if(ui.item.hasClass('ci-item-refresh'))
						document.location.href = document.location.href;

				}
			});
			e.preventDefault();
			return false;
		}, false);

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
				BI.Util.maskIframes();
				module.resizing = true;
			},
			
			stop: function() {
				BI.Util.unmaskIframes();
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
				
				BI.Util.maskIframes();

		//		CI.Grid.rebuildZIndices(module);				
				CI.Grid.checkDimensions(true);
				module.moving = true;
				
			},
			
			stop: function() {
				var position = $(this).position();
				
				BI.Util.unmaskIframes();
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
		module.setDisplayWrapper();

		module.getDomWrapper().find('.ui-resizable-handle').bind('mousedown', function() {
			CI.Grid.checkDimensions(true);
		});



		module.getDomWrapper().on('click', '.ci-module-expand', function() {
			module.getDomWrapper().height((module.getDomContent().outerHeight() + module.getDomHeader().outerHeight(true)));
			CI.Grid.moduleResize(module);
		});
		
		CI.Grid.moduleResize(module);
	},
	

	newModule: function(type) {
		CI.Grid.modulePos = {};


		var mouseUpHandler = function() {

			var gridPos = $("#ci-modules-grid").position();

			var left = Math.round((CI.Grid.modulePos.left - gridPos.left) / CI.Grid.definition.xWidth);
			var top = Math.round((CI.Grid.modulePos.top - gridPos.top) / CI.Grid.definition.yHeight);
			var width = Math.round(CI.Grid.modulePos.width / CI.Grid.definition.xWidth);
			var height = Math.round(CI.Grid.modulePos.height / CI.Grid.definition.yHeight);

			CI.Grid.modulePos.div.remove();
			CI.Grid.modulePos = {};

			var module = {
				type: type,
				title: "Untitled module",
				displayWrapper: true,
				position: {
					left: left,
					top: top	
				},
				
				size: {
					width: width,
					height: height
				}
			};
			
			Entry.addModuleFromJSON(module, true);

			$(document).unbind('mousedown', mouseDownHandler).unbind('mousemove', mouseMoveHandler).unbind('mouseup', mouseUpHandler);
			CI.Grid._el.css('cursor', 'default');
		};

		var mouseDownHandler = function(e) {
			CI.Grid.modulePos.left = e.pageX;
			CI.Grid.modulePos.top = e.pageY;

			CI.Grid.modulePos.ileft = e.pageX;
			CI.Grid.modulePos.itop = e.pageY;

			CI.Grid.modulePos.div = $("<div>").css({
				border: '1px solid red',
				backgroundColor: 'rgba(255, 0, 0, 0.2)',
				width: 0,
				height: 0,
				left: CI.Grid.modulePos.left,
				top: CI.Grid.modulePos.top,
				position: 'absolute'
			}).appendTo($("body"));
		}

		var mouseMoveHandler = function(e) {
			
			if(!CI.Grid.modulePos.left)
				return;

			CI.Grid.modulePos.width = Math.abs(e.pageX - CI.Grid.modulePos.ileft);
			CI.Grid.modulePos.height = Math.abs(e.pageY - CI.Grid.modulePos.itop);

			CI.Grid.modulePos.left = Math.min(CI.Grid.modulePos.ileft, e.pageX);
			CI.Grid.modulePos.top = Math.min(CI.Grid.modulePos.itop, e.pageY);


			CI.Grid.modulePos.div.css({
				width: CI.Grid.modulePos.width,
				height: CI.Grid.modulePos.height,
				left: CI.Grid.modulePos.left,
				top: CI.Grid.modulePos.top
			});
		};

		$(document).bind('mousedown', mouseDownHandler).bind('mousemove', mouseMoveHandler).bind('mouseup', mouseUpHandler);
		CI.Grid._el.css('cursor', 'crosshair');
	},

	moveModule: function(module, shiftX, shiftY) {

		CI.Grid.moduleMove = { module: module, div: module.getDomWrapper() };

		var mouseMoveHandler = function(e) {
			var gridPos = $("#ci-modules-grid").position();
			CI.Grid.moduleMove.top = e.pageY/* - gridPos.left*/ - shiftY;
			CI.Grid.moduleMove.left = e.pageX /*- gridPos.left*/	 - shiftX;
			CI.Grid.moduleMove.div.css({
				top: CI.Grid.moduleMove.top,
				left: CI.Grid.moduleMove.left
			});
		};

		var clickHandler = function(e) {

			if(!CI.Grid.moduleMove.left)
				return;

			var gridPos = $("#ci-modules-grid").position();

			var left = Math.max(0, Math.round((CI.Grid.moduleMove.left) / CI.Grid.definition.xWidth));
			var top = Math.max(0, Math.round((CI.Grid.moduleMove.top) / CI.Grid.definition.yHeight));
			CI.Grid.moduleMove.module.getPosition().top = top;
			CI.Grid.moduleMove.module.getPosition().left = left;
			
			CI.Grid.moduleMove.div.css({
				top: top * CI.Grid.definition.yHeight,
				left: left * CI.Grid.definition.xWidth
			});

			CI.Grid.moduleMove = null;
			$(document).unbind('click', clickHandler).unbind('mousemove', mouseMoveHandler)
		}

		$(document).bind('click', clickHandler).bind('mousemove', mouseMoveHandler);
	},


	checkDimensions: function(extend) {
		
		var bottomMax = 0;
		for(var i in CI.modules) {
			var pos = CI.modules[i].getPosition();
			var size = CI.modules[i].getSize();
			if(pos.top && size.height)
				bottomMax = Math.max(bottomMax, pos.top + size.height);
		}

		CI.Grid._el.css('height', Math.max($(window).height() - $("#ci-header").outerHeight(true) - 1, (CI.Grid.defaults.yHeight * bottomMax + (extend ? 1000 : 0))));
	},
	

	moveToFront: function(module) {
		var dom = module.dom;
		var myZIndex  = module.definition.zindex || 1;
		var count = 0;
		for (var i in CI.modules) {
			CI.modules[i].definition.zindex = CI.modules[i].definition.zindex || 1;
			if(CI.modules[i].definition.zindex>=myZIndex) {
				CI.modules[i].definition.zindex--;
			}
			CI.modules[i].dom.css("zIndex", CI.modules[i].definition.zindex);
			count++;
		}
		$(dom).css("zIndex", count);
		module.definition.zindex = count;
	},

	moveToBack: function(module) {
		var dom = module.dom;
		var myZIndex  = module.definition.zindex || 1;
		var count = 0;
		for (var i in CI.modules) {
			CI.modules[i].definition.zindex = CI.modules[i].definition.zindex || 1;
			if(CI.modules[i].definition.zindex <= myZIndex) {
				console.log(CI.modules[i].definition.zindex, myZIndex);
				CI.modules[i].definition.zindex++;
			}
			CI.modules[i].dom.css("zIndex", CI.modules[i].definition.zindex);
			count++;
		}
		console.log($(dom).get(0))
		$(dom).css("zIndex", 1);
		module.definition.zindex = 1;
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
