define(['require', 'modules/defaultview', 'util/util', 'util/api', 'util/domdeferred', 'util/datatraversing', 'util/typerenderer', 'libs/jqgrid/js/jqgrid'], function(require, Default, Util, API, DomDeferred, Traversing, Renderer, JQGrid) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

	 	init: function() {	

	 		var self = this, lastTr;

	 		this.uniqId = Util.getNextUniqueId();
	 		this.dom = $('<div class="ci-displaylist-list"></div>');
	 		this.domTable = $("<table />").attr('id', this.uniqId).css({width: '100%'});

	 		this.dom.on('mouseover', 'tr.jqgrow', function() {

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

			var filter = this.module.getConfiguration( 'filterRow' );
			eval("self.filter = function(jqGrid, source, rowId) { try { \n " + filter + "\n } catch(_) { console.log(_); } }");

	 		this.module.getDomContent( ).html( this.dom );
	 		this._highlights = this._highlights || [];

	 		this.onReady = $.Deferred();
	 		this.onResize( );
	 	},

		exportToTabDelimited: function() {
 			if( ! this.jpaths ) {
 				return;
 			}

 			var result=[];
			var allEls = [],
				i = 0,
				l = this.elements.length;
			
			var header=[];
			for (var j=0; j<this.jpaths.length; j++) {
				header.push(this.jpaths[j].name);
			}
			result.push(header.join("\t"));

			for( ; i < l ; i++ ) {
				var line=[];
				for (var j=0; j<this.jpaths.length; j++) {
					Traversing.getValueFromJPath(this.elements[i], this.jpaths[j].jpath).done(function(elVal) {
						line.push(elVal);
						//allEls.push(elVal);
					});
				}
				result.push(line.join("\t"));
			}

			return (result.join("\r\n"));
		},

	 	unload: function() {

	 		this.jqGrid( 'GridDestroy' );
	 		this.jqGrid = false;
	 		this.module.getDomContent( ).empty( );
	 	},

	 	inDom: function() {

			var self = this, 
				colNames = [], 
				colModel = [], 
				j = 0,
				editable,
				jpaths = this.module.getConfiguration( 'colsjPaths' ),
				l;


			if( typeof jpaths == 'object' ) {

				l = jpaths.length;

				for( ; j < l ; j ++ ) {

					editable = ( jpaths[j].editable !== 'none' && jpaths[j].editable !== 'false' && jpaths[j].editable !== '' );
					colNames.push( jpaths[j].name );
					colModel.push({
						name: jpaths[ j ].name, 
						index: jpaths[ j ].name,
						title: false, 
						width: jpaths[ j ].width || 150,
						editable: editable,
						editoptions: jpaths[ j ].editable == 'select' ? { value: jpaths[ j ].options } : {},
						edittype: editable ? jpaths[ j ].editable : false,
						_jpath: jpaths[ j ].jpath,
						sortable: true,
						sorttype: jpaths[ j ].number[ 0 ] ? 'float' : 'text'
					});
				}
			}

			var nbLines = this.module.getConfiguration( 'nbLines' ) || 20;	

			this.domTable = $( '<table />' ).attr( 'id', this.uniqId ).appendTo( this.dom );
			this.domPaging = $( '<div />', { id: 'pager' + this.uniqId } ).appendTo( this.dom );
			

			$(this.domTable).jqGrid({		 			
			   	colNames: colNames,
			   	colModel: colModel,
			   	editable: true,
			   	sortable: true,
			   	loadonce: false,
				datatype: "local",
			   	gridview: true,
			   	scrollerbar: true,
			   	height: "100%",
			   	forceFit: true,
			   	shrinkToFit: true,
			   	cellsubmit: 'clientArray',
			   	cellEdit: true,
			   	rowNum: nbLines,
			   	rowList: [2, 10,20,30,100],
			  	pager: '#pager' + this.uniqId,

				resizeStop: function(width, index) { 

					self.domTable.children().children().eq(0).children().each( function( i ) {
						jpaths[ i ].width = $(this).width();
					});
				},

			   	rowattr: function() {

			   		if( arguments[1]._backgroundColor ) {
			   			return {'style': 'background-color: ' + arguments[1]._backgroundColor };
			   		}
			   	},

			   	afterSaveCell: function(rowId, colName, value, rowNum, colNum) {
			   	
			   	
			   		if( self.jpaths[ colNum ].number.indexOf('number') > -1 ) {
			   			value = parseFloat(value);
			   		}

			   		self.elements[ rowId.replace( self.uniqId, '') ].setChild( colModel[ colNum ]._jpath, value, { moduleid: self.module.getId( ) } );

			   		console.log(self.elements[ rowId.replace( self.uniqId, '') ]);
			   		self.applyFilterToRow( rowId.replace( self.uniqId, '' ), rowId );
			   	},

			   	loadComplete: function() {

			   		if( ! self.jqGrid ) {
			   			return;
			   		}

					var ids = self.jqGrid( 'getDataIDs' ),
						i = 0,
						l = ids.length,
						id;

					for( ; i < l ; i++ ) {
						id = ids[ i ].replace( self.uniqId, '' );
						self.applyFilterToRow( id , ids[ i ] );
						self.tableElements[ id ]._inDom.resolve( );
					}
			   	},

			    viewrecords: true,
			    onSelectRow: function( rowid, status ) {
			    	//rowid--; // ?? Plugin mistake ?

			    	if ( status ) {

			    		self.module.controller.onToggleOn( self.elements[ rowid.replace( self.uniqId, '' ) ] );

			    	} else {

			    		self.module.controller.onToggleOff( self.elements[ rowid.replace( self.uniqId, '' ) ] );

			    	}

					self.module.controller.lineClick( self.elements[ rowid.replace( self.uniqId, '' ) ] );
			    },
			});

			this.jqGrid = $.proxy( $( this.domTable ).jqGrid, $( this.domTable ) );
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

	 		this.jqGrid( 'setGridWidth', this.width );
	 		this.jqGrid( 'setGridHeight', this.height - 26 - 27 );
	 	},

	 	blank: {

	 		list: function() {
				this.jqGrid( 'clearGridData' );
				$( this.domTable ).trigger( 'reloadGrid' );
	 		}
	 	
	 	},

	 	update: {

	 		list: function(moduleValue) {

	 			if( ! moduleValue ) {
	 				return;
	 			}

	 			var self = this, 
	 				list = moduleValue.get(),
	 				jpaths = this.module.getConfiguration( 'colsjPaths' ), 
	 				elements = []

	 			this.jpaths = jpaths;
	 			this.elements = list;
	 			this.module.data = moduleValue;

	 			if( ! jpaths ) {
	 				return;
	 			}

				this.buildElements( list , elements , jpaths );
				this.gridElements = elements;
				this.tableElements = elements;

				var allEls = [],
					i = 0,
					l = elements.length;

				for( ; i < l ; i++ ) {
					allEls.push( elements[ i ] );
				}

				this.jqGrid('setGridParam', { datatype: 'local', data: allEls });
				$( this.domTable ).trigger( 'reloadGrid' );
			}
		},

		inDomEl: function(el) {

			if( el.build ) {
				el.build( );
			}

		},

		buildElements: function(source, arrayToPush, jpaths, colorJPath, muteListen) {
			var self = this,
				jpath,
				i = 0,
				l = source.length;

			self.done = 0;

			for( ; i < l ; i++) {
				arrayToPush.push( this.buildElement( source[ i ], self.uniqId + i, jpaths ) );
			}

		},

		buildElement: function(s, i, jp, m) {

			var self = this,
				element = { },
				j = 0,
				l = jp.length;

			if( !m ) {
				this.listenFor( s, jp, i );
			}

			element[ 'id' ] = String( i );
			element[ '__source' ] = s;

			if(s._highlight) {

				API.listenHighlight( s._highlight, function( onOff, key ) {

					$( "#" + i )[ onOff ? 'addClass' : 'removeClass' ]( 'ci-highlight' );
				});
			}

			element._inDom = $.Deferred();
			for( ; j < l ; j ++) {

				var jpath = jp[ j ].jpath;
				element[ jp[ j ].name ] = 'Loading';
				self.done ++;
				element[ ";" + jp[ j ].name ] = this.renderElement( element, s, jpath, jp[ j ].name );
			}
			
			s.getChild( this.module.getConfiguration( 'colorjPath' ) ).done( function(value) {
				element._backgroundColor = value;
			} );

			return element;
		},

		listenFor: function(source, jpaths, id) {
			var self = this;
			source.onChange(function( data ) {

				self.jqGrid( 'setRowData', id, self.buildElement( data, id, jpaths, true ) );
				var scroll = $( "body" ).scrollTop( );
				var target = $( "tr#" + id, self.domTable ).effect( 'highlight', {}, 1000 ).get( 0 );

				if(target) {
					target.scrollIntoView( );
					$("body").scrollTop( scroll );
				}
				
			}, self.module.getId( ) );
		},

		renderElement: function(element, source, jpath, l) {

			var self = this, box = self.module;
			var defScreen = Renderer.toScreen(source, box, {}, jpath);

			$.when(element._inDom, defScreen).then(function(something, value) {
				element[l] = value;
				self.done--;
				self.jqGrid('setCell', element.id, l, value);

				if(defScreen.build)
					defScreen.build();
				
				/* todo In this required ??? */
				if(self.done == 0) {
					self.onResize(self.width, self.height);
				}
			}, function(value) {

				element[l] = value;
				self.done--;
				
				/* todo In this required ??? */
				if(self.done == 0) {
					self.onResize(self.width, self.height);
				}
				
			});
		},

		getDom: function() {
			return this.dom;
		},

		onActionReceive:  {

			addRow: function(source) {
				
				this.elements = this.elements || [];
				this.elements.push(source);
				this.module.data = this.elements;
				var jpaths = this.module.getConfiguration( 'colsjPaths' );
				var l = this.elements.length - 1;
				var el = this.buildElement(source, this.uniqId + l, jpaths);
				this.gridElements.push(el);

				this.jqGrid('addRowData', el.id, el);

			//	API.setVariable(this.module.getNameFromRel('list'), this.module.data, false, true);
			},

			removeRow: function(el) {
				this.elements = this.elements || [];
				var id, index;
				
				for(var i = 0, l = this.gridElements.length; i < l; i++) {
					if(this.gridElements[i].__source == el) {

						id = this.gridElements[i].id;
						index = i;
						break;
					}
				}

				this.jqGrid('delRowData', id);
				
				this.elements.splice(index, 0, 1);
				this.gridElements.splice(index, 0, 1);
			},

			addColumn: function(jpath) {
				var module = this.module;
				var jpath2 = jpath.split('.');
					jpath2 = jpath2.pop();

				module.getConfiguration( 'colsjPaths' ).push({ name: jpath2, editable: false, jpath: jpath, number: false });
				this.reloadModule();
			},

			removeColumn: function(jpath) {
				var module = this.module,
					jpaths = module.getConfiguration( 'colsjPaths' ),
					i = 0,
					l = jpaths.length;


				for( ; i < l ; i ++) {
					if(jpaths[i].jpath == jpath) {
						jpaths.splice( i , 1 );
						break;
					}
				}
				
				this.reloadModule();

			}
		},

		reloadModule: function() {
			var module = this.module;

			if( module.view.unload ) {
				module.view.unload();
			}

			module.view.init();
			module.view.inDom();
			module.view.onResize();
			module.model.resetListeners();	
			module.updateAllView();
		},


		typeToScreen: {

		}
	});

	return view;
});