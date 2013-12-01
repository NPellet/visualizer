define(['jquery', './section', './sectionelement', './conditionalelementdisplayer'], function($, Section, SectionElement, ConditionElementDispalyer) {

	var Form = function() { };

	Form.defaultOptions = {

	};

	Form.prototype = new Section();
	$.extend(Form.prototype, {
		
		init: function(options) {

			var self = this;

			this.options = $.extend({}, Form.defaultOptions, options); // Creates the options
			this.splice = Array.prototype.splice;

			this.section = this;

			this.sections = {}; // List all sections
			this.sectionElements = {};

			this.allFields = []; // List all fields, DEFERRED
			this.allFieldElements = []; // List of all field elements, DEFERRED

			this._onStructureLoaded = $.Deferred();
			this._onValueLoaded = $.Deferred();	

			this.sectionLevel = 0;
			this.expander = {};
			this.form = this;

			this.conditionalDisplayer = new ConditionElementDispalyer();

			this.buttons = [];
			this.buttonsDom = $("<div />").addClass('form-buttonzone');
		},

		triggerAction: function() {

			if( ! arguments[ 0 ] ) {
				return;
			}

			var func = arguments[ 0 ];
			if(typeof this.options[ func ] == "function") {

				var args = this.splice.call( arguments, 0, 1 );
				this.options[ func ].apply(this, arguments);
			}
		},


		addFieldElement: function( deferred ) { // Called from field.js, method makeElement()

			this.allFieldElements.push( deferred );
		},

		fieldElementValueChanged: function( fieldElement, value, oldValue ) {

			if( this.doneDom ) {
				this.triggerAction('onValueChanged', fieldElement, this.getValue( ) );
			}
		},

		addField: function( deferred ) {

			this.allFields.push( deferred );
		},

		eachFields: function(callback) {

			return this._each( this.allFields, callback );
		},

		eachFieldsElements: function(callback) {

			return this._each( this.allFieldElements, callback );
		},

		_each: function(stack, callback) {

			var self = this, 
				i = 0, 
				l = stack.length;

			$.when.apply( $.when, stack ).then( function() {

				for( ; i < l ; i ++) {

					callback.call( self, arguments[ i ] );
				}
			});
		},

		setTpl: function( tpl ) {
			console.log(tpl);
			tpl = $( tpl );
			console.log( tpl.html() );
			this._setTpl( tpl );
		},

		makeDomTpl: function( ) {
			return this._makeDomTpl( );
		},

		_makeDomTpl: SectionElement.prototype._makeDomTpl,
		
		makeDom: function(tplMode) {

			var self = this,
				dom = $('<form class="forms" tabindex="1" />'),
				i,
				j, 
				l,
				sections = $("<div />").addClass('form-sections-wrapper');
			
			this.tplMode = tplMode || 1;

			switch(this.tplMode) {
				case 1:

					this.sectionLvl1Buttons = $("<div />")
												.addClass( 'form-section-select-wrapper' )
												.appendTo( dom );

					this.sectionLvl1Buttons.on( 'click' , '.form-section-select' , function() {

						$(this).siblings().removeClass('selected');
						$(this).addClass('selected');

						sections.children().hide().eq( $(this).index() ).show();

						var j = 0,
							els = self.sectionElements[ $(this).attr('data-section-name') ],
							l = els.length;

						for( ; j < l ; j ++ ) {
							els[ j ].visible();
						}

					});

				break;
			}

			this.bindEvents( dom );


			for( i in this.sectionElements ) {

				j  = 0, 
				l = this.sectionElements[ i ].length;

				for( ; j < l ; j++) {
					sections.append( this.sectionElements[ i ][ j ].makeDom( ) );
				}
			}

			this.doneDom = true;

			dom.append( sections );

			switch(this.tplMode) {
				case 1:
					this.sectionLvl1Buttons.children().eq(0).trigger( 'click' );
				break;
			}

			dom.append( this.buttonsDom );

			// When the dom is created we can display / hide additional fields based on conditioning
			$.when.apply( $, this.allFieldElements ).then( function( ) {

				var i = 0,
					l = arguments.length;

				for( ; i < l ; i ++ ) {
					self.conditionalDisplayer.changed( arguments[ i ] );
				}

			} );

			return (this.dom = dom);
		},

		bindEvents: function( dom ) {

			var self = this;

			dom.get(0).addEventListener('click', function() {
				self.hideExpander();
				self._unselectField();
			}, false);



			dom.get(0).addEventListener('keydown', function( event ) {
				
				self.tabPressed( event );

			}, false);



		},

		_unselectField: function() {

			if( this.selectedFieldElement ) {
				this.selectedFieldElement.unSelect(  );
			}
		},

		selectFieldElement : function ( fieldElement ) {
			
			this._unselectField( );
			this.selectedFieldElement = fieldElement;
			this.hideExpander( );
		},


		unSelectFieldElement : function ( fieldElement ) {
			this.selectedFieldElement = false;
		},

		// Getting the value
		getValue: function() {
			var json = { sections: { } };
			this._getValue(this.sectionElements, json.sections);
			return json;

		},
		_getValue: SectionElement.prototype._getValue,


		// Setting the value
		fill: function( json, clearFirst ) {

			var self = this;
			json = json || {};

			this._fillSections( json.sections, clearFirst );
			
			$.when.apply( $.when, this.allFieldElements ).then(function() {

				self._onValueLoaded.resolve( );	
			})
			
		},
		_fillSections: SectionElement.prototype._fillSections,
		_fill: SectionElement.prototype._fill,

		getSectionElement: SectionElement.prototype.getSectionElement,
		_getElement: SectionElement.prototype._getElement,

		getSection: function( sectionName ) {
			return this.sections[ sectionName ] || this.throwError("Cannot find section " + secionName + ".");
		},


		eachSectionElements: function( callback ) {

			var i, j, l;

			for( i in this.sectionElements ) {

				j  = 0, 
				l = this.sectionElements[ i ].length;

				for( ; j < l ; j ++ ) {

					callback.call( this, this.sectionElements[ i ][ j ] );
				}
			}
		},

		tabPressed: function( event, fieldElement ) {

			if( event.keyCode == 9 ) {
				event.preventDefault( );
				event.stopPropagation( );

				if( ! fieldElement ) {
					if( this.selectedFieldElement ) {
						fieldElement = this.selectedFieldElement;
					} else {
						return;
					}
				}

				fieldElement.unSelect();
				var index = this.tabIndexed.indexOf( fieldElement );
				this.tabIndexed[ index + ( event.shiftKey ? -1 : 1)  ].focus();

				return true;
			}
		},

		incrementTabIndex: function( field ) {
			return this.tabIndexed[ ++ this.lastIndex ] = field;
		},

		redoTabIndices: function() {

			this.lastIndex = 1;
			this.tabIndexed = [];

			this.eachSectionElements( function( element ) {
				element.redoTabIndices( );
			})
		},

		inDom: function( ) {
			this.eachSectionElements( function( element ) {
				element.inDom( );
			});


			// We make all sections visible at this point
			// (usefull for tables to resize their own columns)
			var i,
				j = 0,
				l;
			for( i in this.sectionElements ) {
				l = this.sectionElements[ i ].length;
				for( ; j < l ; j++) {
					this.sectionElements[ i ][ j ].visible( );
				}
			}
			////////////

			this.dom.focus();
			this.redoTabIndices( );
		},

		onReady: function( callback ) {
			return this._onValueLoaded;
		},

		onLoaded: function( callback ) {
			return this.onReady( callback );
		},

		// Setting the structure 
		setStructure: function(json) {

			if( json.sections ) {
				this._addSections( json.sections );
			}

			this.structureIsSet();
		},
	/*	_addSections: Section.prototype._addSections,
		_addElements: Section.prototype._addElements,
		_addElement: Section.prototype._addElement,
*/
		// Called when all the structure is set.
		structureIsSet: function() {
			var self = this;
			$.when.apply($, this.allFields).then(function() {
				self._onStructureLoaded.resolve();
			});
		},

		onStructureLoaded: function() {
			return this._onStructureLoaded;
		},


		getExpanderDom: function() {
			return this.expander.dom || ( 
						this.expander.dom = $("<div />")
												.addClass('form-expander')
												.appendTo( this.dom )
												.on('click', function( event ) {
													event.stopPropagation();
													event.preventDefault();
												} ) 
										);
		},

		setExpander: function(dom, fieldElement) {

			var self = this;
			if( this.expander.open ) {
				this.hideExpander( true );
			} else {
				this.getExpanderDom().hide();
			}
			
			this.getExpanderDom().children().detach();
			this.getExpanderDom().html(dom);
			
			this.getExpanderDom().stop(true).show();
			self.expander.open = true;

		},

		hideExpander: function(fast) {
			
			if( this.expander.open ) {
				this.getExpanderDom( ).stop( true ).hide( );//[fast ? 'hide' : 'slideUp']();
				this.expander.open = false;
			}
		},

		addButton: function( label, options, callback ) {

			var self = this;
			require( [ 'forms/button' ], function( Button ) {

				var btn = new Button( label, callback, options );
				self.buttons.push( btn );
				self.onReady( ).done( function( ) {
					self.buttonsDom.append( btn.render( ) );	
				});
			});
		},

		throwError: function(error) {
			console.error(error);
			return false;
		}

	});


	return Form;
});