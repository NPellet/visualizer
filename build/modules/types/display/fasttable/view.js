define(['require', 'modules/default/defaultview', 'src/util/util', 'src/util/api', 'src/util/domdeferred', 'src/util/datatraversing', 'src/util/typerenderer'], function(require, Default, Util, API, DomDeferred, Traversing, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

	 	init: function() {	

	 		var self = this,
	 			lastTr,
	 			currentColSort;

	 		this.domTable = $( "<table />" , { cellpadding: 0, cellspacing: 0 } ).css( { width: '100%' } );
	 		this.domHead = $( "<thead />" ).appendTo( this.domTable );
	 		this.domBody = $( "<tbody />" ).appendTo( this.domTable );


	 		this.domTable.on('mouseover', 'tr', function() {

	 			if(this !== lastTr) {

	 				var dataRowId = parseInt( $(this).attr('data-row-id') ),
	 					el;
	 					
	 				if( ! isNaN ( dataRowId ) ) {
		 				el = self.module.data[ dataRowId ];
		 				self.module.controller.lineHover( el );
		 			}
	 			}
				lastTr = this;

	 		}).on('mouseout', 'tr', function() {

	 			if(this == lastTr) {

	 				var dataRowId = parseInt( $(this).attr('data-row-id') );

	 				if( ! isNaN ( dataRowId ) ) {
		 				var el = self.module.data[ dataRowId ];
						lastTr = this;
						self.module.controller.lineOut( el );
					}
	 			}

	 		}).on('click', 'tr', function() {

 				var el = self.module.data[ parseInt( $(this).attr('data-row-id') ) ];
 				self.module.controller.lineClick( el );

	 		}).on('click', 'th', function() { // Sorting

	 			var jpathId = $(this).attr('data-jpath-number'),
	 				data = self.module.getDataFromRel('list');

	 			if( ! currentColSort || currentColSort.col !== jpathId ) {

	 				if( currentColSort ) {
	 					self.domTable.find('th[data-jpath-number="' + currentColSort.col + '"] .sort').remove();
	 				}

	 				currentColSort = { asc: true, col: jpathId, span: $('<div class="sort up"></div>') };

					self.domTable.find('th[data-jpath-number="' + currentColSort.col + '"]').append( currentColSort.span );

	 			} else if( currentColSort.col == jpathId ) {
	 				currentColSort.asc = ! currentColSort.asc;
	 				currentColSort.span.toggleClass('up');
	 			}


	 			data.sort( function( a, b ) {
	 				
	 				return (currentColSort.asc ? 1 : -1) * ( self.jpaths[ jpaths[ jpathId ].jpath ]( a ) > self.jpaths[ jpaths[ jpathId ].jpath ]( b ) ? 1 : -1 );
	 			} );

	 			self.blank.list.call( self );
	 			self.update.list.call( self, data );
	 		});

	 		this.dom = this.domTable;

	 		this.module.getDomContent( ).html( this.dom );

	 		this.onReady = $.Deferred();
	 		this.onResize( );

	 		var jpaths = this.module.getConfiguration( 'colsjPaths' ),
				l = jpaths.length,
				j = 0;

			this.jpaths = {};

			thead = '<tr>';
			for( ; j < l ; j ++ ) {

				if( ! jpaths[ j ].jpath ) {
					continue;
				}

				Util.addjPathFunction( this.jpaths, jpaths[ j ].jpath );
				thead += '<th data-jpath-number="' + j + '">' + jpaths[ j ].name + '</th>';
			}
			thead += '</tr>';



			var colorjpath = this.module.getConfiguration( 'colorjPath' );

			if( colorjpath ) {
				Util.addjPathFunction( undefined, jpaths[ j ].jpath, this.colorjpath);
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
	 			
				var self = this, 
					jpaths = this.module.getConfiguration( 'colsjPaths' ),
					nbLines = this.module.getConfiguration( 'nbLines' ) || 20,
					html = '',
					i = 0,
					l = moduleValue.length,
					j,
					k = jpaths.length;

				this.module.data = moduleValue;

				for( ; i < l ; i ++ ) {
					html += '<tr';
					if( this.colorjpath ) {
						html += ' style="background-color: ' + this.colorjpath( moduleValue[ i ] ) + ';"';
					}
					html += ' data-row-id="' + i + '"';
					html += '>';
					j = 0;
					for( ; j < k ; j ++ ) {
						if( ! jpaths[ j ].jpath ) {
							continue;
						}
						
						html += '<td>';
						html += this.getValue( moduleValue[ i ], jpaths[ j ].jpath );
						html += '</td>';
					}
					html += '</tr>';
				}

				this.domBody.html( html );

				// Debouncing the highlighting

				if( this.timeout ) {
					window.clearTimeout( this.timeout );
				}

				this.timeout = window.setTimeout( function( ) {

					API.killHighlight( self.module.id );

					for( i = 0; i < l ; i++ ) {
							

						( function( j ) {

							API.listenHighlight( self.module.data[ j ], function( val ) {
								self.doHighlight( j, val );
							}, self.module.id );

						}) ( i );
						
					}

				}, 1000); // 1 sec timeout
			}
		},

		doHighlight: function( i, val ) {
			this.domBody.find('tr[data-row-id=' + i + ']')[ val ? 'addClass' : 'removeClass']( 'ci-highlight' );
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