define(['modules/defaultview', 'util/datatraversing', 'util/api'], function(Default, DataTraversing, API) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {

			this.dom = $('<div />');
			this.module.getDomContent( ).html( this.dom );
			this.callback = null;
		},

		inDom: function() {

			var self = this,
				cfg = this.module.getConfiguration('json');
			
			try {

				json = JSON.parse(cfg);
			} catch(e) {
				console.log(cfg);
				console.log(e);
				return;
			}
		
			require(['./libs/forms2/form'], function(Form) {

				var form = new Form({
				});

				form.init({
					onValueChanged: function( value, fieldElement ) {
						var jpath = fieldElement.field.options.jpath;
						self.value.setChild( jpath, fieldElement.value );
					}
				});

				form.setStructure( json );
				form.onStructureLoaded( ).done( function( ) {
					form.fill( { } ); // For now let's keep it empty.
				} );

				form.onLoaded( ).done( function( ) {

					div.html( form.makeDom( ) );
					form.inDom( );
				} );

			});

			this.form = form;
		},
		

		update: {
			source: function(moduleValue, varName) {

				var self = this;

				if ( ! moduleValue ) {
					return;
				}

				this.value = moduleValue;

				form.onLoaded( ).done(function( ) {

					form.eachFieldsElements( function( fieldElement ) {

						var jpath = fieldElement.field.options.jpath;

						self.value.getChild( jpath ).done( function( val ) {

							fieldElement.value = val;

						} );
					} );
				} );
			}
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		
		}
	});
	return view;
});
 
