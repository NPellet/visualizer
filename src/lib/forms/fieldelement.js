define(['jquery'], function($) {

	var FieldElement = function() {};

	FieldElement.defaultOptions = {
		

	};

	$.extend(FieldElement.prototype, {

		init: function(options) {
			this.options = $.extend(true, {}, FieldElement.options, options);
		},

		getDom: function() {
			this._dom || ( this._dom = this._makeDom( ) );
			this.field.changed( this );
			return this.dom;
		},

		display: function() {
			this.getDom().show();
		},

		hide: function() {
			this.getDom().hide();
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

		redoTabIndices: function( ) {

			if ( this.fieldElement ) {
				this.fieldElement.attr( 'tabindex', 1 );
			}
			this.form.incrementTabIndex( this );
		},

		focus: function( ) {
			
			if( this.fieldElement ) {
				this.fieldElement.trigger( 'click' ).trigger( 'focus' );
			}
		},

		setValueSilent: function( value, doNotNotifyForm ) {
			var oldValue = this._value;

			this._value = value;
			this.field.changed( this );

			if( ! doNotNotifyForm ) {
				this.form.fieldElementValueChanged( this, value, oldValue );
			}

			// The conditional displaying will mess with the dom. This can be done only if the dom whole document model is 
			// already created. Otherwise nevermind, all fields will be examined when the dom is created.
			// This is due to the fact that setting a value may (and will) occur before creating the dom.
			if( this._inDom ) {
				this.form.conditionalDisplayer.changed( this, oldValue );
			}
		},

		setDefaultOr: function( el ) {

			if( el !== undefined && el !== null) {
				this.value = el;
			} else {
				this.value = this.field.options.default;
			}
		},

		inDom: function() { },

		unSelect: function( event ) {

			if( event ) {
				event.preventDefault( );
				event.stopPropagation( );
			}

			this.selected = false;
			this.form.unSelectFieldElement( this );

			if( this.field.domExpander ) {
				this.hideExpander( );
			}

			
			if( this.fieldElement ) {
				this.fieldElement.removeClass('selected');
			}
		},

		select: function( event ) {

			if( event ) {
				event.preventDefault( );
				event.stopPropagation( );
			}

			this.selected = true;

			this.form.selectFieldElement( this );
			
			// Does the dom exist ?
			if( this.field.domExpander ) {
				this.showExpander( );
			}


			if( this.fieldElement ) {
				this.fieldElement.addClass('selected');
			}
		},

		toggleSelect: function( event ) {

			if( !this.selected ) {
				this.select( event );
			} else {
				this.unSelect( event );
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
	
			this.setValueSilent(value);
			this.checkValue();
		}
	});

	return FieldElement;

});