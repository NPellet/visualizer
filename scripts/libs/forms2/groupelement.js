define(['jquery'], function($) {

	var GroupElement = function() {};

	GroupElement.defaultOptions = {
		
	};

	$.extend(GroupElement.prototype, {
		
		init: function(options) {

			this.options = $.extend({}, GroupElement.defaultOptions, options); // Creates the options
			this.splice = Array.prototype.splice;

			this.readyDef = $.Deferred();
			this.fieldElements = {};
		},

		set section(section) {
			this._section = section;
		},

		get section() {
			return this._section;
		},

		set sectionElement(el) {
			this._sectionElement = el;
		},

		get sectionElement() {
			return this._sectionElement;
		},

		set group(group) {
			this._group = group;
		},

		get group() {
			return this._group;
		},

		_fill: function( json, clearFirst ) {
			
			var self = this,
				i, j, l,
				done = 0;
				
			this.group.eachFields(function(field) {
				self.getFieldElement( field.getName( ) , 0 );

				if( ! json[ field.getName() ] ) {

					json[ field.getName() ] = [];

				}

			});

			for( i in json ) {
				// i is fieldname, json[i] is mixed (obj/array)
				if( ! ( json[ i ] instanceof Array ) ) {
					json[ i ] = [ json[ i ] ];
				}
				
				j = 0,
				l = json[ i ].length;

				if( l == 0 ) {
					json[ i ][ 0 ] = null;
					l = 1;
				}

				for( ; j < l ; j ++ ) {
					done++;
					this.fillElement( i, j, json[ i ][ j ], clearFirst ).then( function () {
						done--;
						if(done == 0) { // All has been created and filled. We can release the deferreds
							self.readyDef.resolve();
						}
					});
				}
			}

			return self.readyDef;

		},

		fill: function( json, clearFirst ) {

			return this._fill( json, clearFirst );
		},

		fillElement: function( i, j, json, clear ) {

			return $.when( this.getFieldElement( i , j ) ).then( function( el ) {

				el.setDefaultOr( json );
				
			} );
		},

		inDom: function() {
			var self = this;

			this.group.eachFields( function( field ) {
				self.eachFieldElements( field.getName() , function( fieldElement ) {
					fieldElement.inDom();
				} );
			} );
		},

		visible: function() {

		},

		getFieldElement: function( fieldName, fieldId ) {
			var self = this,
				el;
		
			this.fieldElements[ fieldName ] = this.fieldElements[ fieldName ] || [];

			if( ! this.fieldElements[ fieldName ][ fieldId ] && this.group.getField( fieldName ) ) {

				el = this.group.getField( fieldName ).makeElement( ).done( function(value) {
					value.group = self.group;
					value.groupElement = self;
					self.fieldElements[ fieldName ][ fieldId ] = value;
				} );

				return el;
			}

			return this.fieldElements[ fieldName ][ fieldId ];
		},

		_getElement: function(stack, getter, name, id) {

			var el;
			stack[ name ] = stack[ name ] || [];
			
			return stack[ name ][ id ];
		},

		getFieldElements: function() {
			return this.fieldElements;
		},

		eachFieldElements: function(fieldName, callback) {

			var els = this.getFieldElements( )[ fieldName ],
				i, l;

			if( ! els ) {
				return this.form.throwError( "Cannot iterate over field. Field " + fieldName + " does not exist" );
			}

			for( i = 0, l = els.length; i < l ; i ++ ) {
				callback.call( this, els[ i ] );
			}
		}
	});

	return GroupElement;
});