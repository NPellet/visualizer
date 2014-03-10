
define(['jquery', 'jqueryui', 'src/util/util', 'modules/modulefactory', 'src/util/context', 'src/util/versioning'], function($, ui, Util, ModuleFactory, Context, Versioning) {	


	var definition, jqdom, self = this, moduleMove;

	var defaults = {
		xWidth: 10, // 20px per step
		yHeight: 10 // 20px per step
	};

	function checkDimensions(extend) {
			
		var bottomMax = 0;
		for(var i in this.modules) {
			var pos = this.modules[i].getPosition(),
				size = this.modules[i].getSize();

			if(pos.top && size.height) {
				bottomMax = Math.max( bottomMax, pos.top + size.height );
			}
		}

		jqdom.css('height', 
			Math.max($(window).height() - $("#ci-header").outerHeight(true) - 1, (defaults.yHeight * bottomMax + (extend ? 1000 : 0)))
		);
	}

	function addModuleFromJSON( json ) {

		var module = ModuleFactory.newModule( json );
		$.when( module.ready ).then( function( ) {

			addModule( module );	
		} );
	}

	function duplicateModule( module ) {

		var def = JSON.parse( JSON.stringify( module.definition ), Versioning.getViewHandler()._reviver );
		def.position.left += 2;
		def.position.top += 2;
		addModuleFromJSON( def );
	}

	function addModule(module) {
		
		var grid = this,
			modulePos = module.getPosition( ),
			moduleSize = module.getSize( );

		module.getDomWrapper( ).appendTo( jqdom ).css( {

			top: Math.round( modulePos.top ) * definition.yHeight,
			left: Math.round( modulePos.left ) * definition.xWidth,
			width: Math.round( moduleSize.width ) * definition.xWidth,
			height: Math.round( moduleSize.height ) * definition.yHeight

		} );

		Context.listen(module.getDomWrapper().get(0), [

			['<li><a><span class="ui-icon ui-icon-arrowreturn-1-n"></span> Move to front</a></li>', 
			function() {
				moveToFront(module);
			}],
			
			['<li><a><span class="ui-icon ui-icon-arrowreturn-1-s"></span> Move to back</a></li>', 
			function() {
				moveToBack(module);
			}],
			
			['<li><a><span class="ui-icon ui-icon-close"></span> Remove module</a></li>', 
			function() {
				removeModule(module);
			}],

			['<li><a><span class="ui-icon ui-icon-arrow-4"></span> Move</a></li>', 
			function(e) {
				var pos = module.getDomWrapper().position();
				var shiftX = e.pageX - pos.left;
				var shiftY = e.pageY - pos.top;
				moveModule(module, shiftX, shiftY);
			}],


			['<li><a><span class="ui-icon ui-icon-copy"></span> Duplicate</a></li>', 
			function() {
				duplicateModule( module );
			}]
		]);

		module.ready.done(function() {

			if( module.inDom ) {
				module.inDom( );
			}
			// Expands the grid when one click on the header
			module.getDomHeader().bind('mousedown', function() {
				checkDimensions(true);
			});
			
			// Insert jQuery UI resizable and draggable
			module.getDomWrapper().resizable({
				grid: [ definition.xWidth, definition.yHeight ],
				start: function() {
					Util.maskIframes();
					module.resizing = true;
				},
				stop: function() {
					Util.unmaskIframes();
					moduleResize(module);
					module.resizing = false;
					checkDimensions(false);
				},
				containment: "parent"
				
			}).draggable({
				
				grid: [definition.xWidth, definition.yHeight],
				containment: "parent",
				handle: '.ci-module-header',
				start: function() {
					Util.maskIframes();
					checkDimensions(true);
					module.moving = true;
				},
				stop: function() {
					var position = $(this).position();
					Util.unmaskIframes();
					module.getPosition().set('left', position.left / definition.xWidth);
					module.getPosition().set('top', position.top / definition.yHeight);
					module.moving = false;
					checkDimensions(false);
				},
				drag: function() {
					checkDimensions(true);
				}

			}).trigger('resize').bind('mouseover', function() {
				
				if(module.resizing || module.moving)
					return;
				if(module.getDomHeader().hasClass('ci-hidden')) {
					module.getDomHeader().removeClass('ci-hidden').addClass('ci-hidden-disabled');
					moduleResize(module);
				}
				
			}).bind('mouseout', function() {
				
				if(module.resizing || module.moving)
					return;
					
				if(module.getDomHeader().hasClass('ci-hidden-disabled')) {
					module.getDomHeader().addClass('ci-hidden').removeClass('ci-hidden-disabled');
					moduleResize(module);	
				}
			});

			module.setDisplayWrapper();
			module.getDomWrapper().find('.ui-resizable-handle').bind('mousedown', function() {
				checkDimensions(true);
			});

			module.getDomWrapper().on('click', '.ci-module-expand', function() {
				module.getDomWrapper().height((module.getDomContent().outerHeight() + module.getDomHeader().outerHeight(true)));
				moduleResize(module);
			});
			
			moduleResize(module);
		});
	}


	function moduleResize(module) {
		
		var wrapper = module.getDomWrapper();
		
		module.getSize().set('width', wrapper.width() / definition.xWidth);
		module.getSize().set('height', wrapper.height() / definition.yHeight);

		var containerHeight = wrapper.height() - (module.getDomHeader().is(':visible') ? module.getDomHeader().outerHeight(true) : 0);
		
		module.getDomContent().css({
			height: containerHeight
		});

		module.view.width = module.getDomContent( ).width( );
		module.view.height = containerHeight;
		module.view.onResize();
	}

	function newModule( url ) {

		var modulePos = {};

		var mouseUpHandler = function() {

			var gridPos = jqdom.position();
			var left = Math.round((modulePos.left - gridPos.left) / definition.xWidth);
			var top = Math.round((modulePos.top - gridPos.top) / definition.yHeight);
			var width = Math.round(modulePos.width / definition.xWidth);
			var height = Math.round(modulePos.height / definition.yHeight);

			modulePos.div.remove();
			modulePos = {};

			var module = ModuleFactory.newModule(new ViewObject({
				//type: type,
				url: url,
				title: "Untitled module",
				displayWrapper: true,
				position: new ViewObject({
					left: left,
					top: top	
				}),
				
				size: new ViewObject({
					width: width,
					height: height
				})
			}));

			$.when(module.ready).then(function() {
				addModule(module);	
			});
		
			$(document)
				.unbind('mousedown', mouseDownHandler)
				.unbind('mousemove', mouseMoveHandler)
				.unbind('mouseup', mouseUpHandler);

			jqdom.css('cursor', 'default');
		};

		var mouseDownHandler = function(e) {
			modulePos.left = e.pageX;
			modulePos.top = e.pageY;

			modulePos.ileft = e.pageX;
			modulePos.itop = e.pageY;

			modulePos.div = $("<div>").css( {

				border: '1px solid red',
				backgroundColor: 'rgba(255, 0, 0, 0.2)',
				width: 0,
				height: 0,
				left: modulePos.left,
				top: modulePos.top,
				position: 'absolute'

			} ).appendTo( $ ( "body" ) );
		}

		var mouseMoveHandler = function(e) {
			
			if(!modulePos.left)
				return;

			modulePos.width = Math.abs(e.pageX - modulePos.ileft);
			modulePos.height = Math.abs(e.pageY - modulePos.itop);

			modulePos.left = Math.min(modulePos.ileft, e.pageX);
			modulePos.top = Math.min(modulePos.itop, e.pageY);


			modulePos.div.css({
				width: modulePos.width,
				height: modulePos.height,
				left: modulePos.left,
				top: modulePos.top
			});
		};

		$(document)
				.bind('mousedown', mouseDownHandler)
				.bind('mousemove', mouseMoveHandler)
				.bind('mouseup', mouseUpHandler);

		jqdom.css('cursor', 'crosshair');
	};

	function moveToFront(module) {

		var modules = ModuleFactory.getModules(),
			dom = module.dom,
			myZIndex  = module.definition.zindex || 1,
			count = 0, i
		for (i in modules) {
			modules[i].definition.zindex = modules[i].definition.zindex || 1;
			if(modules[i].definition.zindex >= myZIndex)
				modules[i].definition.zindex--;
			modules[i].dom.css("zIndex", modules[i].definition.zindex);
			count++;
		}
		$(dom).css("zIndex", count);
		module.definition.zindex = count;
	};

	function moveToBack(module) {

		var modules = ModuleFactory.getModules(),
			dom = module.dom,
			myZIndex  = module.definition.zindex || 1,
			count = 0, i;

		for (i in modules) {
			modules[i].definition.zindex = modules[i].definition.zindex || 1;
			if(modules[i].definition.zindex <= myZIndex)
				modules[i].definition.zindex++;
			modules[i].dom.css("zIndex", modules[i].definition.zindex);
			count++;
		}

		$(dom).css("zIndex", 1);
		module.definition.zindex = 1;
	};
	
	function removeModule( module ) {

		if( module.controller && module.controller.onBeforeRemove ) {
			if( module.controller.onBeforeRemove( ) === false ) {
				return;
			}
		}

		module.getDomWrapper().remove().unbind();
		ModuleFactory.removeModule(module);

		if( module.controller && module.controller.onRemove ) {
			module.controller.onRemove( );
		}
	};


	function moveModule(module, shiftX, shiftY) {

		moduleMove = { module: module, div: module.getDomWrapper() };
		Util.maskIframes();

		var mouseMoveHandler = function(e) {
			
			var gridPos = jqdom.position();

			moduleMove.top = e.pageY - shiftY;
			moduleMove.left = e.pageX - shiftX;
			moduleMove.div.css({
				top: moduleMove.top,
				left: moduleMove.left
			});
		};

		var clickHandler = function(e) {

			if(!moduleMove.left)
				return;

			var gridPos = jqdom.position();

			var left = Math.max(0, Math.round((moduleMove.left) / definition.xWidth));
			var top = Math.max(0, Math.round((moduleMove.top) / definition.yHeight));
			moduleMove.module.getPosition().top = top;
			moduleMove.module.getPosition().left = left;
			
			moduleMove.div.css({
				top: top * definition.yHeight,
				left: left * definition.xWidth
			});

			Util.unmaskIframes();
			moduleMove = null;
			$(document)
				.unbind('click', clickHandler)
				.unbind('mousemove', mouseMoveHandler);

		}

		$(document)
			.bind('click', clickHandler)
			.bind('mousemove', mouseMoveHandler);
	};


	return {

		/**
		 * Initialise the module grid in the div with id="ci-modules-grid"
		 * @param {object} definition An object containing options for the grid (is merged into {@link CI.Grid.defaults})
		 * @param {integer} [definition.xWidth] The width of the grid cells
		 * @param {integer} [definition.xHeight] The height of the grid cells
		 */
		init: function( def, dom, modules ) {
			
			this.modules = modules;
			jqdom = $( dom );
			
			function makeRecursiveMenu( elements, dom ) {

				if( elements.modules ) {

					for( var i = 0, l = elements.modules.length ; i < l ; i ++ ) {
						dom.append('<li class="ci-item-newnmodule" data-url="' + encodeURIComponent( elements.modules[ i ].url ) + '"><a>' + elements.modules[ i ].moduleName + '</a></li>');
					}

				} 

				if( elements.folders ) { // List of folders

					for( var i in elements.folders ) {

						var el = $('<li><a>' + i + '</a></li>');
						var ul = $("<ul />").appendTo( el );
						makeRecursiveMenu( elements.folders[ i ], ul  )
						dom.append( el );
					}
				}
			}
			
			Context.listen(dom, [], function(contextDom) {
				$li = $('<li><a> Add a module</a></li>');

				$ulModules = $("<ul />").appendTo($li);
				var allTypes = ModuleFactory.getTypes();
				$.when( allTypes ).then( function( json ) {

					if( typeof json == "object" && ! Array.isArray( json ) ) {
						json = [ json ];
					}

					if( Array.isArray( json ) ) {					
						for( var i = 0, l = json.length ; i < l ; i ++) {
							makeRecursiveMenu( json[ i ], $ulModules );	
						}
					} else {

					}
					
				});

				$(contextDom).append( $li );

				$li.bind( 'click', function( event ) {
					newModule( decodeURIComponent( $( event.target.parentNode ).attr( 'data-url' ) ) );
				});
			});

			this.reset( def );
		},

		reset: function( def ) {

			definition = $.extend(true, defaults, def);
			$( jqdom ).empty( );
			checkDimensions( );
		},

		addModule: addModule,
		addModuleFromJSON: addModuleFromJSON,
		checkDimensions: checkDimensions,
		moduleResize: moduleResize
	}
});
