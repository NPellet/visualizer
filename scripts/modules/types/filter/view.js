define(['modules/defaultview', 'util/datatraversing', 'util/domdeferred', 'util/api', 'util/typerenderer'], function(Default, Traversing, DomDeferred, API, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			
			this.dom = $( '<div>' ).css( { } );
			this.module.getDomContent( ).html( this.dom );
		},
		
		blank: {
			value: function(varName) {
				this.dom.empty();
			}
		},
		
		inDom: function() {


		},
		
		update: {
		

		},
				
		typeToScreen: {}
	});

	return view;
});