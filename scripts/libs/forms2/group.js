define(['require', 'jquery', './field', './grouplistelement', './grouptableelement', './grouptextelement'], function(require, $, Field, GroupListElement, GroupTableElement, GroupTextElement) {

	var Group = function(name) {
		this.name = name;
	};

	Group.defaultOptions = {
		
	};

	$.extend(Group.prototype, {
		
		init: function(options) {
			this.options = $.extend({}, Group.defaultOptions, options); // Creates the options

			this.fields = {};
			this.deferreds = {};
			this.elements = [];
			this.nbFields = 0;
		},

		getName: function() {
			return this.name;
		},

		getTitle: function() {
			return this.options.title;
		},

		setStructure: function(json) {
			
			var i;
			json = json.fields;

			for( i in json ) {
				this.addField( json[ i ], i );
			}
		},

		addField: function(fieldobj, name) {

			var fieldName = ( name || fieldobj.name ),
				self = this;

			if( this.fields[ fieldName ] ) {
				return this.form.throwError('Field "' + sectionobj.getName( ) + '" already exists');
			}

			this.nbFields++;

			if( ! ( fieldobj instanceof Field ) ) {

				var type = fieldobj.type,
					deferred = $.Deferred( );

				require( [ './types/' + type + '/field' ], function( FieldConstructor ) {

					field = new FieldConstructor( fieldName );
					field.init( fieldobj );
					field.group = self;
					
					self.fields[ fieldName ] = field;

					if( field.options.displaySource || field.options.displayTarget ) {
						self.form.conditionalDisplayer.init( field, field.options.displaySource, field.options.displayTarget );
					}
					
					deferred.resolve( field );
				});

				this.form.addField( deferred );

				this.deferreds[ fieldName ] = deferred;
				this.fields[ fieldName ] = false;

				return deferred;

			} else {

				this.sections[ fieldobj.getName() ] = fieldobj;
				return fieldobj;
			}

			
		},

		_setTpl: function( tpl ) {
			this.tpl = tpl;
			this._tplClean = tpl;
		},

		fieldExists: function(fieldName) {
			return !! this.fields[ fieldName ];
		},

		getField: function(fieldName, fieldId) {

			if( fieldId !== undefined ) {
				return this.getFieldElement(fieldName, fieldId);
			}

			if( ! this.fields[ fieldName ] ) {
				return this.form.throwError('Cannot return field "' + fieldName + '". Field does not exist');
			}

			return this.fields[ fieldName ];
		},

		eachFields: function(callback) {
			var i;
			for(i in this.fields) {
				callback.call(this, this.fields[i]);
			}
		},

		makeElement: function() {

			var subelement;
			switch( this.options.type ) {

				case 'table':

					subelement = new GroupTableElement();

				break;

				case 'text':
					subelement = new GroupTextElement();
				break;

				case 'list':
				default:

					subelement = new GroupListElement();

				break;
			}

			subelement.init( this.options );
			subelement.group = this;

			this.elements.push( subelement );

			return subelement;
		},

		ready: function() {
			return $.when( this.deferreds )
		}
	});


	Object.defineProperty(Group.prototype, 'section', {
		
		enumerable: false,
		configurable: false,
		
		
		get: function() {
			return this._section;
		},

		set: function(section) {
			this._section = section;
		}
		
	});

	
	Object.defineProperty(Group.prototype, 'form', {
		
		enumerable: true,
		configurable: false,
		
		get: function() {

			return this._form || this.section.form;
		},

		set: function(form) {
			this._form = form;
		}
	
	});

	Object.defineProperty(Group.prototype, 'name', {
		
		enumerable: true,
		configurable: false,
		
		get: function() {
			return this._name;
		},

		set: function(name) {
			this._name = name;
		}
	
	});

	return Group;
});