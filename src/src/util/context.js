
// Context menu
define(['jquery', 'modules/modulefactory'], function($, ModuleFactory) {

	var contextMenu;

	return {

		listen: function(dom, elements, callback) {
			if(!(elements[0] instanceof Array))
				elements = [elements];
			dom.addEventListener('contextmenu', function(e) {	
				for(var i = 0, l = elements.length; i < l; i++) {
					(function(element, callback) {
						contextMenu.append(element.bind('click', function(e2) {
							callback.call(this, e);
						}));	
					}) ($(elements[i][0]), elements[i][1]);
				}
				if(callback)
					callback(contextMenu);
			}, true);
		},

		unlisten: function(dom) {
			dom.removeEventListener('contextmenu');
		},

		getRootDom: function() {
			return this.dom;
		},
		
		init: function(dom) {
			this.dom = dom;
			dom.addEventListener('contextmenu', function(e) {
				e.preventDefault();
				if(contextMenu)
					contextMenu.menu('destroy').remove();
				contextMenu = null;
				$menu = $('<ul class="ci-contextmenu"></ul>').css({
					'position': 'absolute',
					'left': e.pageX,
					'top': e.pageY,
					'z-index': 10000
				}).appendTo($("body"));

				contextMenu = $menu;

				var clickHandler = function() {
					if(contextMenu)
						contextMenu.menu('destroy').remove();
					contextMenu = null;
					$(document).unbind('click', clickHandler);
				}

				var rightClickHandler = function() {
					if(contextMenu)
						contextMenu.menu('destroy').remove();
					contextMenu = null;
				}
				
				$(document).bind('click', clickHandler);
				return false;

			}, true);


		dom.parentNode.addEventListener('contextmenu', function(e) {
			contextMenu.menu({
				select: function(event, ui) {
					var moduleName = ui.item.attr('name');
				}
			});
			e.preventDefault();
			e.stopPropagation();
			return false;

		}, false);


		}


	}
});
