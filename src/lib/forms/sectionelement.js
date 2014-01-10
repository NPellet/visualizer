define(['require', 'jquery'], function(require, $) {

	var SectionElement = function() {

	};

	SectionElement.defaultOptions = {
		
	};

	$.extend(SectionElement.prototype, {
		
		init: function(options) {

			this.options = $.extend({}, SectionElement.defaultOptions, options); // Creates the options
			this.splice = Array.prototype.splice;
		
			this.groupElements = {};
			this.sectionElements = {};

			// Collection of all field elements in groupElements and sectionElements...
			this.fieldElements = [];

			this.readyDef = $.Deferred();
			this.done = 0;
		},

		fill: function( json, clearFirst ) {

			this._fillGroups( json.groups, clearFirst );
			this._fillSections( json.sections, clearFirst );

			// Check for empty shit
			if( this.done == 0 ) { // All subgroups and subsections are loaded. Let's move to the parent !
				this.readyDef.resolve();
			}

			return this.readyDef;
		},

		_fillGroups: function( groupsObj, clearFirst ) {

			// Let's make at least 1 section element
			var groups = this.section.getGroups();
	/*		for( i in groups ) {
				this.getGroupElement( groups[ i ].getName( ), 0 );
			}
*/
			this._fill( groups, this.getGroupElement, groupsObj, clearFirst );
		},

		_fillSections: function( sectionsObj, clearFirst ) {

			// Let's make at least 1 section element
			var sections = this.section.getSections();
	/*		for( i in sections ) {
				this.getSectionElement( sections[ i ].getName( ), 0 );
			}
*/
			this._fill( sections, this.getSectionElement, sectionsObj, clearFirst );
		},

		_fill: function( stackStructure, getter, stack, clearFirst ) {

			var self = this;

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

				if( l == 0 ) {
					stack[ i ][ 0 ] = { };
					l++;
				}

				for( ; j < l ; j ++) {

					self.done++;
					getter.call( this, i , j ).fill( stack[ i ][ j ] , clearFirst ).done( function() { // Returns a deferred
						self.done--;
						if( self.done == 0 ) { // All subgroups and subsections are loaded. Let's move to the parent !
							self.readyDef.resolve();
						}
					});

				}
			}

		},

		visible: function() {
			this.eachElements( function( element ) {
				element.visible();
			} );
		},


		condDisplay: function( elementName, elementType, displayOrHide ) {

			var els,
				i = 0,
				l;

			switch( elementType ) {

				case 'section':
					els = this.sectionElements[ elementName ];
				break;

				case 'group':
					els = this.groupElements[ elementName ];
				break;
			}

			for( l = els.length ; i < l ; i ++ ) {

				if( displayOrHide ) {
					els[ i ].show();
				} else {
					els[ i ].hide();
				}

			}
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

					callback( groupElement, 'group', group.getName( ) );					
				});
			});

			this.section.eachSections( function( section ) {

				self.eachSectionElements( section.getName() , function( sectionElement ) {

					callback( sectionElement, 'section', section.getName( ) );
				});
			});
		},

		redoTabIndices: function() {
			this.eachElements( function( element ) {
				element.redoTabIndices();
			} );
		},

		addFieldElement: function( fieldElement ) {
			this.fieldElements.push( fieldElement );
		},

		removeFieldElement: function( fieldElement ) {
			this.fieldElements.splice( this.fieldElements.indexOf( fieldElement ), 1 );
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
				sectionEls = this.getSectionElements(),
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
			return this.section.options.title || false;
		},

		getTitleIcon: function() {
			var html = '',
				title = this.getTitle();
			if(this.section.options.icon) {
				html += '<img src="' + require.toUrl('./images/' + this.section.options.icon + '.png') + '" />';
			}

			if( title ) {
				html += '<div>' + title + '</div>';
			}
			return html;
		},

		makeDom: function() {

			var self = this,
				dom = $("<div />"),
				i,
				h,
				j,
				l;

			switch( this.section.form.tplMode ) {
				case 1:
				
					if( this.section.sectionLevel == 1 ) {
						this.section.form.sectionLvl1Buttons.append('<div data-section-name="' + this.section.getName() + '" class="form-section-select">' + this.getTitleIcon( ) + '</div>');	
						dom.hide();
					} else {
						this.stdTitle( dom );
					}
				break;

				default:
					this.stdTitle( dom );
				break;

			}

			for( i in this.groupElements ) {
				l = this.groupElements[ i ].length;
				for( j = 0; j < l ; j++) {
					dom.append( this.groupElements[ i ][ j ].makeDom( ) );
				}
			}

			for( i in this.sectionElements ) {
				l = this.sectionElements[ i ].length;
				for( j = 0 ; j < l ; j++) {
					dom.append( this.sectionElements[ i ][ j ].makeDom( ) );
				}
			}
			
	
			return (this.dom = dom);
		},

		stdTitle: function( dom ) {

			var title = this.getTitle(),
				lvl = this.section.sectionLevel;

			if( title || this.section.options.multiple ) { // If no title and no duplicate, no reason to add the title I think

				h = $('<h' + lvl + '>' + title + '</h' + lvl + '>');

				if( this.section.options.multiple ) {
					h.append( this.makeDuplicator( ) );
				}

				dom.append(h);
			}
		},

		makeDuplicator: function( ) {

			var self = this;

			return $('<div class="form-duplicator-wrapper"><span class="form-duplicator form-duplicator-add">duplicate</span> - <span class="form-duplicator form-duplicator-remove">remove</span></div>').on('click', 'span', function() {
				var dupl = $(this).hasClass('form-duplicator-add');
				// Duplicate function as to be called on the parent with self as a parameter
				self.sectionElement[ dupl ? 'duplicateSectionElement' : 'removeSectionElement']( self );
			});
		},

		show: function() {
			this.dom.show();
		},

		hide: function() {
			this.dom.hide();
		},

		getSectionIndex: function( sectionElement ) {

			var name = sectionElement.section.getName();

			if( ! this.sectionElements[ name ]) {
				return this.form.throwError("Cannot get section index. Section name " + name + " doesn't exist");
			}

			var index = this.sectionElements[ name ].indexOf( sectionElement );

			if( index < 0 ) {
				return this.form.throwError("Cannot get section index. Cannot find section element");
			}

			return index;
		},

		removeSectionElement: function( sectionElement ) {

			var self = this,
				name = sectionElement.section.getName( ),
				sectionIndex = this.getSectionIndex( sectionElement );

			if( sectionIndex === false ) {
				return;
			}

			if( this.sectionElements[ name ].length == 1 ) {
				this.duplicateSectionElement( sectionElement );
			}

			this.sectionElements[ name ].splice( sectionIndex, 1 ); // Remove the element from the stack
			sectionElement.dom.remove( );
			sectionElement.dom = null;
			sectionElement = null;
		},


		duplicateSectionElement: function( sectionElement ) {

			var self = this,
				name = sectionElement.section.getName( ),
				sectionIndex = this.getSectionIndex( sectionElement );

			if(sectionIndex === false) {
				return;
			}

			var newSectionEl = this
								.section
								.getSection( name )
								.makeElement( );

			newSectionEl.sectionElement = this; // Sets the parent element as being this

			this.sectionElements[ name ].splice( sectionIndex + 1, 0, newSectionEl ); // Add the section in the stack
			
			newSectionEl.fill( { } ); // Fill the section with empty stuff
			
			newSectionEl.readyDef.then( function() { // Only when all fields have loaded we can trigger a dom creation

				if( sectionElement && sectionElement.dom ) { // If we actually duplicate an existing section, we add it right after

					sectionElement.dom.after( newSectionEl.makeDom( ) );

				} else { // Else we add it at the end

					self.dom.append( newSectionEl.makeDom( ) );

				}

				for( var i = 0, l = newSectionEl.fieldElements.length ; i < l ; i ++ ) {
					self.section.form.conditionalDisplayer.changed( newSectionEl.fieldElements[ i ] );
				}

				newSectionEl.inDom( );
			});
		
			return newSectionEl;
		},

		ready: function() {
			return $.when.apply( $.when, this.deferreds );
		},


		makeDomTpl: function( ) {

			return this._makeDomTpl();
		},


		_makeDomTpl: function( ) {

			this.dom = this.section._tplClean.clone();

			for( i in this.sectionElements ) {
				j  = 0, 
				l = this.sectionElements[ i ].length;

				for( ; j < l ; j++) {
					this.dom.find('.form-section-section-container').append( this.sectionElements[ i ][ j ].makeDomTpl( ) );
				}
			}

			for( i in this.groupElements ) {
				j  = 0, 
				l = this.groupElements[ i ].length;
				
				for( ; j < l ; j++) {
					this.dom.find('.form-section-group-container').append( this.groupElements[ i ][ j ].makeDomTpl( ) );
				}
			}

			return this.dom;
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