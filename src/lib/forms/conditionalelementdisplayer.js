define( [ 'jquery' ], function( $ ) {

	var Displayer = function( ) { 

		this.targets = {};
	};

	Displayer.prototype = {

		init: function( field, source, target ) {

		},

		changed: function( fieldElement, oldValue ) {

			var source = fieldElement.field.options.displaySource;
			var value = fieldElement.value;

			if( ! source ) {
				return;
			}

			// If the conditional value exists

			for( var i in source ) {
				if( i !== value ) {
					this.triggerValue( fieldElement, source[ i ], false );	
				}
			}
			
			if( typeof source[ value ] !== "undefined" ) {
				this.triggerValue( fieldElement, source[ value ], true );
			}
		},

		triggerValue: function( fieldElement, key, displayOrHide ) {

			var groupElement = fieldElement.groupElement;
			this.lookForField( groupElement, key, displayOrHide );

		},

		lookForField: function( groupElement, key, displayOrHide ) {
			
			var field,
				fieldName,
				sectionElement;

			for( fieldName in groupElement.fieldElements ) { // string -> array

				field = groupElement.group.fields[ fieldName ]; // Access to the field

				
				if( field.options.displayTarget && field.options.displayTarget.indexOf( key ) > -1 ) {

					groupElement.condDisplay( fieldName, displayOrHide );
				}
			}

			sectionElement = groupElement.sectionElement;
			this.lookForGroupOrSection( sectionElement, key, displayOrHide );
		},

		lookForGroupOrSection: function( sectionElement, key, displayOrHide ) {

			sectionElement.section.eachSections( function( section ) {

				if( section.options.displayTarget && section.options.displayTarget.indexOf( key ) > -1 ) {

					sectionElement.condDisplay( section.getName( ), 'section', displayOrHide );
				}
			});

			sectionElement.section.eachGroups( function( group ) {
				if( group.options.displayTarget && group.options.displayTarget.indexOf( key ) > -1 ) {
					sectionElement.condDisplay( group.getName( ), 'group', displayOrHide );
				}
			});

			sectionElement = sectionElement.sectionElement;

			if( sectionElement.eachElements ) {
				this.lookForGroupOrSection( sectionElement, key, displayOrHide );
			}
		}
	};

	return Displayer;
});