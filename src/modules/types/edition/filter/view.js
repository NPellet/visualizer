define(['modules/default/defaultview', 'src/util/datatraversing', 'src/util/api', 'src/util/typerenderer', 'lib/formcreator/formcreator'], function(Default, Traversing, API, Renderer, FormCreator) {
	
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
				cfg = {
					sections: {
						cfg: {
							groups: {
								cfg: {
									options: {
										type: 'list'
									},
									fields: FormCreator.makeStructure( filters )
								}
							}
						}
					}
				};

			for( ; j < k ; j ++ ) {
				varsout.push( varsoutCfg[ j ].name );
			}
			
			var form = FormCreator.makeForm();
			
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