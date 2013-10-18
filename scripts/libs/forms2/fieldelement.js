define(['jquery'], function($) {

	var FieldElement = function() {};

	FieldElement.defaultOptions = {
		

	};

	$.extend(FieldElement.prototype, {

		init: function(options) {
			this.options = $.extend(true, {}, FieldElement.options, options);
		},

		getDom: function() {
			return this._dom || (this._dom = this._makeDom());
		},

		getName: function() {
			return this.field.name;
		},

		getExpander: function( delay ) {
			var dom = this.form.getExpanderDom();
			dom.css( this.groupElement.getExpanderInfosFor( this ) ).css( 'height', '' );
		},

		hideExpander: function() {
			this.form.hideExpander();
		},

		showExpander: function() {

			this.getExpander( );
			this.field.showExpander( this );

		},

		setValueSilent: function( value, doNotNotifyForm ) {
			this._value = value;
			
			if( ! doNotNotifyForm ) {
				this.form.fieldElementValueChanged( this, value );
			}
		},

		inDom: function() { },


		unSelect: function( mute ) {

			this.selected = false;

			if( ! mute ) {

				if( this.field.domExpander ) {

					this.hideExpander( );
				}

				this.form.unSelectFieldElement( this );
			}

			if( this.fieldElement ) {
				this.fieldElement.removeClass('selected');
			}
		},

		select: function( mute ) {

			this.selected = true;

			if( ! mute ) {

				// Does the dom exist ?
				if( this.field.domExpander ) {

					this.showExpander( );
				}

				this.form.selectFieldElement( this );
			}

			if( this.fieldElement ) {
				this.fieldElement.addClass('selected');
			}
		},

		toggleSelect: function( event ) {

			event.preventDefault( );
			event.stopPropagation( );

			if( !this.selected ) {
				this.select( );
			} else {
				this.unSelect( );
			}
		}
	});


	Object.defineProperty(FieldElement.prototype, 'form', {	
		enumerable: true,
		configurable: false,
		get: function() {
			return this._form || this.field.form;
		},

		set: function(form) {
			this._form = form;
		}
	});

	Object.defineProperty(FieldElement.prototype, 'field', {	
		enumerable: true,
		configurable: false,
		get: function() {
			return this._field;
		},

		set: function(field) {
			this._field = field;
		}
	});

	Object.defineProperty(FieldElement.prototype, 'groupElement', {	
		enumerable: true,
		configurable: false,
		get: function() {
			return this._groupElement;
		},

		set: function(field) {
			this._groupElement = field;
		}
	});

	Object.defineProperty(FieldElement.prototype, 'value', {	
		enumerable: true,
		configurable: false,
		get: function() {
			return this._value;
		},

		set: function(value) {
	//		console.log('set value from ' + this._value + ' to ' + value);
			this.setValueSilent(value);
			this.checkValue();
		}
	});

	return FieldElement;

});