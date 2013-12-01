define(['jquery', './sectionelement', './group'], function($, SectionElement, Group) {

	var _self = this;
	var Section = function(name) {

		this.name = name;
	};

	Section.defaultOptions = {
		
	};

	$.extend(Section.prototype, {
		
		init: function(options) {

			this.options = $.extend({}, Section.defaultOptions, options); // Creates the options
			this.splice = Array.prototype.splice;

			this.sections = {} // List all sections
			this.groups = {}; // All group fields

			this.sub = []; // Section elements
		},


		getName: function() {
			return this.name;
		},

		setStructure: function( json ) {

			if( json.sections ) {
				this._addSections( json.sections );
			}

			if( json.groups ) { 
				this._addGroups( json.groups );
			}
		},

		_addSections: function( sections ) {

			this._addElements(sections, this.sections, Section);
		},

		_addGroups: function( groups ) {

			this._addElements(groups, this.groups, Group);
		},

		_addElements: function( stackJson, stackTarget, constructor ) {
			var i;
			for( i in stackJson ) {
				this._addElement( stackJson[ i ], stackTarget, constructor, i );
			}
		},

		_addElement: function(objFrom, stackTarget, constructor, name) {

			if( ! ( objFrom instanceof constructor)) {

				var objFrom2 = new constructor( name );

				objFrom2.init(objFrom.options);
				objFrom2.sectionLevel = this.sectionLevel + 1;
				objFrom2.section = this;
				objFrom2.form = this.form;

				objFrom2.setStructure(objFrom);
				objFrom = objFrom2;

			}

			if( stackTarget[ objFrom.getName() ] ) {
				return this.form.throwError('Cannot add Section / Group. "' + objFrom.getName() + '" already exists');
			}

			stackTarget[ objFrom.getName() ] = objFrom;
		},


		/*

		 sections: {
			sectionName: {

				groups: {
					groupName: [{
						fieldName: ['12', '214', '2342']
					}]
				},

				sections: {
		
				}
			}
		}

		*/

		eachGroups: function( callback ) {
			var i;
			for(i in this.groups) {
				callback.call( this, this.groups[ i ] );
			}
		},

		eachSections: function( callback ) {
			var i;
			for(i in this.sections) {
				callback.call( this, this.sections[ i ] );
			}
		},

		getValue: function() {
			// Should only be called from form
			var json = {},
				i;

			this.eachSubSections(function( sub ) {
				json.push( sub.getValue() );
			});

			return json;
		},

		getSection: function(sectionName, sectionNumber) {
			
			var section = this.sections[ sectionName ];
			if( sectionNumber == undefined )
				return section;
			return section.getSectionElement( sectionNumber );
		},

		getSections: function() {
			return this.sections;
		},

		getGroups: function() {
			return this.groups;
		},

		sectionExists: function(sectionName) {
			return !! this.sections[ sectionName ];
		},

		getGroup: function( groupName ) {
			return this.groups[ groupName ] || this.form.throwError("Cannot find group " + groupName + ".");
		},

		groupExists: function( groupName ) {
			return !! this.groups[ groupName ];
		},

		makeElement: function(options) {
			var sub = new SectionElement( );
			sub.init( options );
			sub.section = this;
			this.sub.push( sub );

			return sub;
		},


		_setTpl: function( tpl ) {
			this._tpl = tpl;

			this.eachSections( function( section ) {
				section._setTpl( this._tpl.find( '.form-section[data-form-sectionname="' + section.name + '"]' ) );
			});

			this.eachGroups( function( group ) {
				group._setTpl( this._tpl.find( '.form-group[data-form-groupname="' + group.name + '"]' ) );
			});

			this._tplClean = this._tpl.clone();
			this._tplClean.find('.form-section-group-container:eq(0)').empty();
			this._tplClean.find('.form-section-section-container:eq(0)').empty();
		}
	});
	

	
	Object.defineProperty(Section.prototype, 'form', {
		
		enumerable: true,
		configurable: false,
		
		get: function() {
			return this._form;
		},

		set: function(form) {
			this._form = form;
		}
	
	});
	
	Object.defineProperty(Section.prototype, 'name', {
		
		enumerable: true,
		configurable: false,

		get: function() {
			return this._name;
		},

		set: function(name) {
			
			this._name = name;
		}
	
	});


	Object.defineProperty(Section.prototype, 'section', {
		
		enumerable: true,
		configurable: false,
		
		get: function() {
			return this._section;
		},

		set: function(section) {
			this._section = section;
		}
	
	});


	return Section;
});