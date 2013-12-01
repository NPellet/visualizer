define(['modules/defaultview', 'util/datatraversing', 'util/domdeferred', 'util/api', 'util/typerenderer'], function(Default, Traversing, DomDeferred, API, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			
			this.dom = $( '<div>' ).css( { } );
			this.module.getDomContent( ).html( this.dom );
			this.variables = {};
			this.cfgValue = {};

			this._jpathsFcts = {};

			var self = this,
				searchfields = this.module.getConfiguration( 'searchfields' ),
				varsoutCfg = this.module.definition.vars_out || [],
				varsout = [],
				i = 0,
				l = searchfields.length,
				j = 0,
				k = varsoutCfg.length,
				allFields = { },
				cfg = {
					sections: {
						cfg: {
							groups: {
								cfg: {
									options: {
										type: 'list'
									},
									fields: allFields
								}
							}
						}
					}
				};

			for( ; j < k ; j ++ ) {
				varsout.push( varsoutCfg[ j ].name );
			}
			
			for( ; i < l ; i ++ ) {

				if( ! searchfields[ i ].groups.general ) {
					continue;
				}

				allFields[ searchfields[ i ].groups.general[ 0 ].name[ 0 ] ] = {
					type: 	searchfields[ i ].groups.general[ 0 ].type[ 0 ],
					title: 	searchfields[ i ].groups.general[ 0 ].label[ 0 ]
				};

				for( var k = 0, m = searchfields[ i ].groups.general[ 0 ].searchOnField.length; k < m ; k ++) {
					eval('this._jpathsFcts[ "' + searchfields[ i ].groups.general[ 0 ].searchOnField[ k ] + '" ] = function( el ) { return el' + searchfields[ i ].groups.general[ 0 ].searchOnField[ k ].replace(/^element/, '') + '; }');
				}

				this.makeOptions( allFields[ searchfields[ i ].groups.general[ 0 ].name[ 0 ] ], searchfields[ i ] );
			}

			require( [ './libs/forms2/form' ], function( Form ) {

				var form = new Form( );
				
				form.init( {
					onValueChanged: function( value ) {
						var cfg = form.getValue().sections.cfg[ 0 ].groups.cfg[ 0 ],
							cfgFinal = {};

						for( var i in cfg ) {
							cfgFinal[ i ] = cfg[ i ][ 0 ];
						}

						$.extend( self.cfgValue, cfgFinal );
						self.search();
					}
				} );

				form.setStructure( cfg );
				form.onStructureLoaded().done(function() {
					form.fill({ });
				});

				form.onLoaded( ).done( function( ) {
					self.dom.html( form.makeDom( 2 ) );
					form.inDom();
				});
			});

			this.makeSearchFilter();
		},
		

		makeOptions: function( cfg, form ) {

			var type = form.groups.general[ 0 ].type[ 0 ];

			switch( type ) {

				case 'combo':
					cfg.options = this.makeComboOptions( form )
				break;

				case 'slider':
					cfg.min = parseFloat( form.groups.slider[ 0 ].start[ 0 ] || 0 );
					cfg.max = parseFloat( form.groups.slider[ 0 ].end[ 0 ] || 1 );
					cfg.step = parseFloat( form.groups.slider[ 0 ].step[ 0 ] || 0.1 );
				break;

			}
		},

		makeComboOptions: function( form ) {
			
			form = form.groups.options[ 0 ];

			var i = 0,
				l = form.length,
				cfg = [];

			for( ; i < l ; i ++ ) {

				cfg.push({ 
					title: form[ i ].label, 
					key: form[ i ].value
				});

			}

			return cfg;
		},


		blank: {
			value: function(varName) {
				this.dom.empty();
			}
		},
		
		inDom: function() { },

		search: function() {

			var self = this,
				cfg = this.cfgValue,
				val = this.module.getDataFromRel( 'array' ),
				i = 0,
				l = val.length,
				target = new DataArray();

			for( ; i < l ; i ++ ) {

				if( this.searchElement( cfg, val[ i ] ) ) {
					target.push( val[ i ] );
				}
			}

			this.module.controller.searchDone( target );		
		},

		_makeOp: function( op, val ) {

			val = "self.cfgValue[ '" + val + "' ] ";
			switch( op ) {

				case '=':
				case 'eq':
					return " (el + '') == " + val + " ";
				break;

				case '<>':
				case '><':
				case '!=':
					return " (el + '') !== " + val + " ";
				break;

				case '>':
					return " el > " + val + " ";
				break;

				case '>=':
					return " el >= " + val + " ";
				break;

				case '<':
					return " el > parseFloat( " + val + " ) ";
				break;

				case '<=':
					return " el <= parseFloat( " + val + " ) ";
				break;

				case 'btw':
					if( val instanceof Array ) {
						return " ( el > parseFloat( " + val[ 0 ] + " ) && el < parseFloat( " + val[ 1 ] + " ) ";
					}
				break;
			}

		},

		makeSearchFilter: function() {

			
			var self = this,
				searchfields = this.module.getConfiguration( 'searchfields' ),
				i = 0,
				l = searchfields.length,
					searchOn;


			var toEval = "";
			toEval += " this._searchFunc = function( cfg, row ) { ";
			
			toEval += " var el; "


			toEval += " var a = "
			for( ; i < l ; i ++ ) {

				searchOn = searchfields[ i ].groups.general[ 0 ].searchOnField || [];

				if( i > 0 ) {
					toEval += " && ";
				}

				j = 0,
				k = searchOn.length;

				/////////
				var add = "";
				if( k > 0 ) {
					toEval += " ( ";

					for( ; j < k ; j ++ ) {

						if( j > 0 ) {
							toEval += " || ";
						}

						toEval += " ( ( el = self.getJpath( '" + searchOn[ j ] + "', row ) ) && ( ";
						toEval += this._makeOp( searchfields[ i ].groups.general[ 0 ].operator[ 0 ], searchfields[ i ].groups.general[ 0 ].name[ 0 ] );
						toEval += " ) ) ";

					}
					toEval += " ) ";
				}
				/////////
			}

			toEval += "; ";
			toEval += add;
			toEval += " return a; ";
			toEval += "};";

			eval( toEval );
		},

		searchElement: function( cfg, row ) {
			return this._searchFunc( cfg, row );
		},

		getJpath: function( jpathEl, row ) {
			return this._jpathsFcts[ jpathEl ]( row );
		},

		update: {
			
			variable: function( variableValue, variableName ) {
				
				variableValue = Traversing.get( variableValue );

				this.variables[ variableName ] = variableValue;
				this.search( );
			}
		},
				
		typeToScreen: {}
	});

	return view;
});