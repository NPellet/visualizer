define(['require', 'jquery'], function(require, $) {

	var SectionElement = function() {

		console.log('MAKE');
	};

	SectionElement.defaultOptions = {
		
	};

	$.extend(SectionElement.prototype, {
		
		init: function(options) {

			this.options = $.extend({}, SectionElement.defaultOptions, options); // Creates the options
			this.splice = Array.prototype.splice;

			this.groupElements = {};
			this.sectionElements = {};
		},

		fill: function( json, clearFirst ) {

			this._fillGroups( json.groups, clearFirst );
			this._fillSections( json.sections, clearFirst );
		},

		_fillGroups: function( groupsObj, clearFirst ) {

			// Let's make at least 1 section element
			var groups = this.section.getGroups();
			for( i in groups ) {
				this.getGroupElement( groups[ i ].getName( ), 0 );
			}

			this._fill( groups, this.getGroupElement, groupsObj, clearFirst );
		},

		_fillSections: function( sectionsObj, clearFirst ) {

			// Let's make at least 1 section element
			var sections = this.section.getSections();
			for( i in sections ) {
				this.getSectionElement( sections[ i ].getName( ), 0 );
			}

			this._fill( sections, this.getSectionElement, sectionsObj, clearFirst );
		},

		_fill: function( stackStructure, getter, stack, clearFirst ) {

			if( ! stack ) {
				stack = { };
			}

			var i, j, l;
			for( i in stackStructure ) {

				if( ! ( stack[ i ] ) ) {
					stack[ i ] = { };
				}
				// i is groupname, groupsObj[i] is mixed (obj/array)
				if( ! ( stack[ i ] instanceof Array ) ) {
					stack[ i ] = [ stack[ i ] ];
				}
				
				j = 0,
				l = stack[ i ].length;

				for( ; j < l ; j ++) {

					getter.call( this, i , j ).fill( stack[ i ][ j ] , clearFirst );
				}
			}
		},

		visible: function() {
			this.eachElements( function( element ) {
				element.visible();
			} );
		},

		eachGroupElements: function(groupName, callback) {
			if( ! this.groupElements[ groupName ]) {
				return;
			}

			var i = 0, 
				l = this.groupElements[ groupName ].length;

			for( ; i < l ; i ++ ) {
				callback.call( this, this.groupElements[ groupName ][ i ] )
			}
		},

		inDom: function( ) {
			this.eachElements( function( element ) {
				element.inDom();
			} );
		},

		eachElements: function( callback ) {

			var self = this;
			this.section.eachGroups( function( group ) {

				self.eachGroupElements( group.getName() , function( groupElement ) {

					callback( groupElement );					
				});
			});

			this.section.eachSections( function( section ) {

				self.eachSectionElements( section.getName() , function( sectionElement ) {

					callback( sectionElement );
				});
			});
		},

		redoTabIndices: function() {
			this.eachElements( function( element ) {
				element.redoTabIndices();
			} );
		},

		eachSectionElements: function(sectionName, callback) {
			if( ! this.sectionElements[ sectionName ]) {
				return;
			}

			var i = 0, 
				l = this.sectionElements[ sectionName ].length;

			for( ; i < l ; i ++ ) {
				callback.call( this, this.sectionElements[ sectionName ][ i ] )
			}
		},


		getGroupElement: function( groupName, groupInternalId ) {

			return this._getElement(this.groupElements, this.section.getGroup, this.section, groupName, groupInternalId);
		},


		getSectionElement: function( sectionName, sectionInternalId ) {

			return this._getElement(this.sectionElements, this.section.getSection, this.section, sectionName, sectionInternalId);
		},
		

		_getElement: function(stack, getter, scope, name, id) {

			var el;
			stack[ name ] = stack[ name ] || [];
			
			if( ! stack[ name ][ id ] ) {

				el = getter.call( scope, name ).makeElement( );
				el.sectionElement = this;
				stack[ name ][ id ] = el;
			}

			return stack[ name ][ id ];
		},

		getSectionElements: function() {
			return this.sectionElements;
		},

		getGroupElements: function() {
			return this.groupElements;
		},

		getValue: function() {

			var groupEls = this.getGroupElements(),
				sectionEls = this.getSectionElements();

				json = { sections: {}, groups: {} };

			this._getValue(sectionEls, json.sections);
			this._getValue(groupEls, json.groups);

			return json;
		},

		_getValue: function(stackFrom, stackTo) {

			var i, j, l;

			for( i in stackFrom ) {

				j = 0, 
				l = stackFrom[ i ].length,
				stackTo[ i ] = [];

				for( ; j < l ; j ++) {
					stackTo[ i ].push( stackFrom[ i ][ j ].getValue( ) );
				}
			}

			return stackTo;
		},

		getTitle: function() {
			return this.section.options.title || 'No title';
		},

		getTitleIcon: function() {
			var html = '';
			if(this.section.options.icon) {
				html += '<img src="' + require.toUrl('./images/' + this.section.options.icon + '.png') + '" />';
			}
			html += '<div>' + this.getTitle() + '</div>';
			return html;
		},

		makeDom: function() {

			var dom = $("<div />"),
				i;

			switch( this.section.form.tplMode ) {
				case 1:
				
					if( this.section.sectionLevel == 1 ) {
						this.section.form.sectionLvl1Buttons.append('<div data-section-name="' + this.section.getName() + '" class="form-section-select">' + this.getTitleIcon( ) + '</div>');	
						dom.hide();
					}
					
				break;

				default:
					dom.append('<h' + (this.section.sectionLevel) + '>' + this.getTitle( ) + '</h' + (this.section.sectionLevel) + '>')
				break;

			}

			for( i in this.sectionElements ) {
				l = this.sectionElements[ i ].length;
				for( j = 0 ; j < l ; j++) {
					dom.append( this.sectionElements[ i ][ j ].makeDom( ) );
				}
			}
			
			for( i in this.groupElements ) {
				l = this.groupElements[ i ].length;
				for( j = 0; j < l ; j++) {
					dom.append( this.groupElements[ i ][ j ].makeDom( ) );
				}
			}
	
			return (this.dom = dom);
		}
		
	});



/*
	Object.defineProperty(SectionElement.prototype, 'sectionElement', {
		
		enumerable: true,
		configurable: false,
		
		get: function() {
			return this._sectionElement;
		},

		set: function(section) {
			this._sectionElement = section;
		}
	
	});*/


	return SectionElement;
});