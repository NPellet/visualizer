define(['require', 'modules/defaultview', 'util/util', 'util/api', 'util/domdeferred', 'util/datatraversing', 'util/typerenderer', 'libs/jqgrid/js/jqgrid'], function(require, Default, Util, API, DomDeferred, Traversing, Renderer, JQGrid) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

	 	init: function() {	

	 		var self = this,
	 			lastTr;

	 		this.domTable = $( "<table />" , { cellpadding: 0, cellspacing: 0 } ).css( { width: '100%' } );
	 		this.domHead = $( "<thead />" ).appendTo( this.domTable );
	 		this.domBody = $( "<tbody />" ).appendTo( this.domTable );


	 		this.domTable.on('mouseover', 'tr.jqgrow', function() {

	 			if(this !== lastTr) {
					self.module.controller.lineHover(self.elements[$(this).attr('id').replace(self.uniqId, '')]);
	 			}
				lastTr = this;

	 		}).on('mouseout', 'tr.jqgrow', function() {

	 			if(this == lastTr) {
					self.module.controller.lineOut(self.elements[$(this).attr('id').replace(self.uniqId, '')]);
					lastTr = this;
	 			}
	 		});

	 		this.dom = this.domTable;

	 		this.module.getDomContent( ).html( this.dom );
	 		this._highlights = this._highlights || [];

	 		this.onReady = $.Deferred();
	 		this.onResize( );

	 		var jpaths = this.module.getConfiguration( 'colsjPaths' ),
				l = jpaths.length,
				j = 0;

			this.jpaths = {};

			thead = '<tr>';
			for( ; j < l ; j ++ ) {
				eval('this.jpaths[ jpaths[ j ].jpath ] = function( el ) { return el' + jpaths[ j ].jpath.replace('element', '') + '; }');
				thead += '<th>' + jpaths[ j ].name + '</th>';
			}
			thead += '</tr>';

			var colorjpath = this.module.getConfiguration( 'colorjPath' );
			if(colorjpath) {
				eval('this.colorjpath = function( el ) { return el' + colorjpath.replace('element', '') + '; }');	
			}
		
			this.domHead.html( thead );
	 	},

	 	unload: function() {

	 		this.module.getDomContent( ).empty( );
	 	},

	 	inDom: function() {

			this.onReady.resolve( );
	 	},


	 	applyFilterToRow: function(elId, rowId) {

			if( this.filter ) {
			   	this.filter( this.jqGrid, this.elements[ elId ], rowId );
			}
	 	},

	 	onResize: function( ) {
	 		
	 		if( ! this.jqGrid ) {
	 			return;
	 		}

	 		
	 	},

	 	blank: {

	 		list: function() {
				
				
	 		}
	 	
	 	},

	 	update: {

	 		list: function(moduleValue) {

	 			if( ! moduleValue ) {
	 				return;
	 			}

	 			moduleValue = moduleValue.get();
				this.module.data = moduleValue; // Important for configuration. However, technically it shouldn't.

				var self = this, 
					j = 0,
					jpaths = this.module.getConfiguration( 'colsjPaths' ),
					l,
					nbLines = this.module.getConfiguration( 'nbLines' ) || 20;



				var html = '',
					i = 0,
					l = moduleValue.length,
					j,
					k = jpaths.length

				for( ; i < l ; i ++ ) {
					html += '<tr';
					if( this.colorjpath ) {
						html += ' style="background-color: ' + this.colorjpath( moduleValue[ i ] ) + ';"';
					}
					html += '>';
					j = 0;
					for( ; j < k ; j ++ ) {
						html += '<td>';
						html += this.getValue( moduleValue[ i ], jpaths[ j ].jpath );
						html += '</td>';
					}
					html += '</tr>';
				}

				this.domBody.html( html );
			}
		},

		getValue: function( trVal, jpath ) {
			return this.jpaths[ jpath ]( trVal );
		},

		getDom: function() {
			return this.dom;
		},

		onActionReceive:  {

		},

		typeToScreen: {

		}
	});

	return view;
});