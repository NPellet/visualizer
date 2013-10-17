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
			dom.css( this.group.getExpanderInfosFor( this ) );
		},

		showExpander: function() {
			this.field.showExpander( this );
		},

		setValueSilent: function( value, doNotNotifyForm ) {
			this._value = value;
			
			if( ! doNotNotifyForm ) {
				this.form.fieldElementValueChanged( this, value );
			}
		},

		inDom: function() { }



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