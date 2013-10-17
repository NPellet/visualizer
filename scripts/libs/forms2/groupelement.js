define(['jquery'], function($) {

	var GroupElement = function() {};

	GroupElement.defaultOptions = {
		
	};

	$.extend(GroupElement.prototype, {
		
		init: function(options) {

			this.options = $.extend({}, GroupElement.defaultOptions, options); // Creates the options
			this.splice = Array.prototype.splice;

			this.done = 0;
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
				i, j, l;
				
			for( i in json ) {
				// i is fieldname, json[i] is mixed (obj/array)
				if( ! ( json[ i ] instanceof Array ) ) {
					json[ i ] = [ json[ i ] ];
				}
				
				j = 0,
				l = json[ i ].length;

				for( ; j < l ; j ++ ) {

					this.fillElement( i, j, json[ i ][ j ], clearFirst );
				}
			}

			this.group.eachFields(function(field) {

				self.getFieldElement( field.getName( ) , 0 );

			});
		},

		fill: function( json, clearFirst ) {
			this._fill( json, clearFirst );
		},

		fillElement: function( i, j, json, clear ) {

			$.when( this.getFieldElement( i , j ) ).then( function( el ) {
				el.setValueSilent( json, true );
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


		getFieldElement: function( fieldName, fieldId ) {
			
			var self = this,
				el;

			this.fieldElements[ fieldName ] = this.fieldElements[ fieldName ] || [];

			if( ! this.fieldElements[ fieldName ][ fieldId ] ) {

				self.done++;
				el = this.group.getField( fieldName ).makeElement( ).done( function(value) {

					value.group = self.group;
					value.groupElement = self;
					self.fieldElements[ fieldName ][ fieldId ] = value;

					self.done--;
					self.checkDone();

				} );

				this.fieldElements[ fieldName ][ fieldId ] = el;
			}	

			return this.fieldElements[ fieldName ][ fieldId ];
		},


		checkDone: function() {

			if( this.done == 0 ) {

			}
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

			var els = this.getFieldElements( )[ fieldName ];

			if( ! els ) {
				return this.form( ).throwError( "Cannot iterate over field. Field " + fieldName + " does not exist" );
			}

			for( i in els ) {
				callback.call( this, els[ i ] );
			}
		},

		getValue: function(stackFrom, stackTo) {

			var i, j, l, stackTo = { };

			for( i in this.fieldElements ) {

				j = 0, 
				l = this.fieldElements[ i ].length,
				stackTo[ i ] = [ ];

				for( ; j < l ; j ++) {
					stackTo[ i ].push( this.fieldElements[ i ][ j ].value );
				}
			}

			return stackTo;
		}
	});

	return GroupElement;
});