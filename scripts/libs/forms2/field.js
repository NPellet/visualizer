define(['require', 'jquery'], function(require, $) {

	var Field = function(name) {
		this.name = name;
	};

	Field.defaultOptions = {
		
	};

	$.extend(Field.prototype, {
		
		init: function(options) {
			this.options = $.extend({}, Field.defaultOptions, options); // Creates the options
			this.elements = [];

			this.initimpl( );
		},

		initimpl: function() {

		},

		getTitle: function() {
			return this.options.title || 'Title';
		},

		getType: function() {
			return this.options.type;
		},

		getName: function() {			
			return this.name || '';
		},

		makeElement: function() {

			var 
				self = this,
				groupType = this.group.options.type,
				fieldType = this.options.type,
				deferred = $.Deferred();
			
			require( [ './types/' + fieldType + '/' + groupType ] , function(ElementConstructor) {

				var element = new ElementConstructor();

				element.init( self.options );
				element.field = self;

				self.elements.push( element );
			

				$.when( element.ready ).then( function() {
					deferred.resolve( element );
				} );
			});

			this.group.form.addFieldElement(deferred);

			return deferred;
		},

		removeElement: function( element ) {

			this.elements.splice( this.elements.indexOf( element ) , 1 );
		},


		showExpander: function( fieldElement ) {

			this._showExpander( fieldElement );
		},

		_showExpander: function( fieldElement ) {
			var dom = fieldElement.domExpander || this.domExpander;
			this.fieldElementExpanded = fieldElement;
			this.form.setExpander( dom, fieldElement );
		},

		getElementExpanded: function( ) {
			return this.fieldElementExpanded;
		},

		changed: function( fieldElement ) {
			if( this.options.onChange ) {
				this.options.onChange.call( this, fieldElement );
			}
		},

		getOptions: function( fieldElement ) {
			return fieldElement.getOptions() || this.options.options;
		}

	});
	


	Object.defineProperty(Field.prototype, 'form', {
		
		enumerable: true,
		configurable: false,
		
		get: function() {

			return this._form || this.group.form;
		},

		set: function(form) {
			this._form = form;
		}
	
	});



	return Field;

});