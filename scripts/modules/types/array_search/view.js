define(['modules/defaultview', 'util/datatraversing', 'util/domdeferred', 'util/api', 'util/typerenderer'], function(Default, Traversing, DomDeferred, API, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
				

			this.dom = $( '<div>' ).css( { } );
			this.module.getDomContent( ).html( this.dom );
			this.variables = {};
			this.cfgValue = {};

			var self = this,
				filters = this.module.getConfiguration( 'filters' ),
				script = this.module.getConfiguration( 'script' ),
				varsoutCfg = this.module.definition.vars_out || [],
				varsout = [],
				i = 0,
				l = filters.length,
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

				if( ! filters[ i ].groups.general ) {
					continue;
				}

				allFields[ filters[ i ].groups.general[ 0 ].name[ 0 ] ] = {
					type: filters[ i ].groups.general[ 0 ].type[ 0 ],
					title: filters[ i ].groups.general[ 0 ].label[ 0 ]
				};

				this.makeOptions( allFields[ filters[ i ].groups.general[ 0 ].name[ 0 ] ], filters[ i ] );
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
						self.filter();
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


			this._filter = ( function( API, _cfg, _varsIn, _varsOut, script ) {

				var _varsToSet = [];
				function getVar( vName ) {

					if( typeof _varsIn[ vName ] !== "undefined" ) {
						return _varsIn[ vName ];
					}

					console.warn( " Variable " + vName + " does not exist. Returning null ");
					return null;
				}

				function setVar( vName, vValue ) {

					if( _varsOut.indexOf( vName ) > -1 ) {
						_varsToSet[ vName ] = vValue;
						return;
					}
					console.warn( " Variable " + vName + " has not been selected for variable out" );
				}

				function getConfig() {
					return _cfg;
				}

				function _doSetVars() {

					var i;
					for( i in _varsToSet ) {
						API.setVar( i, _varsToSet[ i ] );
					}
				}

				eval("var f = function() { \n" + script + "\n  _doSetVars(); \n }");
				return f;

			}) ( API, this.cfgValue, this.variables, varsout, script );

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
				cfg.push({ title: form[ i ].label, key: form[ i ].value });
			}

			return cfg;
		},


		blank: {
			value: function(varName) {
				this.dom.empty();
			}
		},
		
		inDom: function() { },

		filter: function() {

			this._filter();

		},

		update: {
			
			variable: function( variableValue, variableName ) {
				
				variableValue = Traversing.get( variableValue );

				this.variables[ variableName ] = variableValue;
				this.filter( );
			}
		},
				
		typeToScreen: {}
	});

	return view;
});