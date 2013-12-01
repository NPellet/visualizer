define(['jquery', './groupelement'], function($, GroupElement) {

	var GroupListElement = function() {};

	GroupListElement.prototype = new GroupElement();
	
	GroupListElement.prototype.makeDom = function(forceMake) {

		if( ! forceMake && this.dom ) {
			this.updateDom();
		}

		var self = this,
			dom = $("<div />").addClass('form-group-list'),
			div, 
			label, 
			divFieldElements;

		if( this.group.getTitle() ) {
			dom.append('<div class="form-groupelement-title">' + this.group.getTitle() + '</div>');
		}

		self.fieldElementsDom = self.fieldElementsDom || { };
		this.group.eachFields( function( field ) {

			div = $( "<div />" ).addClass( 'form-field-list-' + field.getType( ) );
			label = $( "<label />" ).html( field.getTitle( true ) ); // Title is attached to field element

			div.append( label );
			divFieldElements = $( '<div />' ).addClass( 'form-field-list-elements' );
			div.append( divFieldElements );
			dom.append( div );

			self.fieldElementsDom[ field.getName( ) ] = divFieldElements;
		});

		this.updateDom();
		this.dom = dom;
		return this.dom;
	};

	GroupListElement.prototype.updateDom = function() {

		var self = this;

		self.fieldElementsDom = self.fieldElementsDom || { };

		this.group.eachFields( function( field ) {

			if( self.fieldElementsDom[ field.getName() ] ) {
				self.fieldElementsDom[ field.getName() ].children().detach(); // Empty the dom

				self.eachFieldElements( field.getName(), function(fieldElement) {
					self.fieldElementsDom[ field.getName() ].append( fieldElement.getDom( ) );
				});
			}
			//self.fieldElementsDom[ field.getName() ] = divFieldElements;
		});

		this.group.form.redoTabIndices();

		return this.dom;
	};


	GroupListElement.prototype._makeDomTpl = function() {

		var self = this;

		this.dom = this.group._tplClean.clone();
		self.fieldElementsDom = self.fieldElementsDom || { };
		
		this.dom.find('.form-dyn').each( function( i, el ) {

			el = $( el );

			var content = el.attr( 'data-form-content' ).split(':');

			switch( content[ 0 ] ) {

				case 'field':
console.log(self.fieldElements);	
					if( self.fieldElements[ content[ 1 ] ] ) {

						switch( content[ 2 ] ) {

							case 'dom':
								self.fieldElementsDom[ content[ 1 ] ] = el;
							break;

							case 'label':
								el.html( self.group.fields[ content[ 1 ] ].name );
							break;
						}
					}
				break;
			}
			
		} );

		this.updateDom();
		return this.dom;
	}



	GroupListElement.prototype.condDisplay = function( fieldName, displayOrHide ) {
		this.eachFieldElements( fieldName, function( fieldEl ) {
			if( displayOrHide ) {
				this.fieldElementsDom[ fieldName ].parent( ).show();
			} else {
				this.fieldElementsDom[ fieldName ].parent( ).hide();
			}
		});		
	}

	GroupListElement.prototype.getFieldIndex = function( fieldElement ) {

		var name = fieldElement.field.getName();

		if( ! this.fieldElements[ name ]) {
			return this.form.throwError("Cannot get field index. Field name " + name + " doesn't exist");
		}

		var index = this.fieldElements[ name ].indexOf( fieldElement );

		if( index < 0 ) {
			return this.form.throwError("Cannot get field index. Cannot find field element");
		}

		return index;
	};



	GroupListElement.prototype.getValue = function(stackFrom, stackTo) {

		var i, j, l, stackTo = { };

		for( i in this.fieldElements ) {

			j = 0, 
			l = this.fieldElements[ i ].length,
			stackTo[ i ] = [ ];

			for( ; j < l ; j ++) {
				stackTo[ i ].push( this.fieldElements[ i ][ j ].value );
			}
		}

		return stackTo;
	};



	GroupListElement.prototype.duplicateFieldElement = function( fieldElement ) {

		var self = this,
			name = fieldElement.field.getName( ),
			fieldIndex = this.getFieldIndex( fieldElement );

		if(fieldIndex === false) {
			return;
		}

		var newElement = this
							.group
							.getField( name )
							.makeElement( )
							.done(function( value ) {

								value.setDefaultOr();
								value.group = self.group;
								value.groupElement = self;
								self.fieldElements[ name ].splice( fieldIndex + 1, 0, value );
							});
		
		return newElement;
	};

	GroupListElement.prototype.removeFieldElement = function( fieldElement ) {

		var name = fieldElement.field.getName(),
			fieldIndex = this.getFieldIndex( fieldElement );

		if(fieldIndex === false)
			return;

		fieldElement.field.removeElement( fieldElement );
		this.fieldElements[ name ].splice( fieldIndex, 1 );
	}


	GroupListElement.prototype.getExpanderInfosFor = function( fieldElement ) {

		var fieldName = fieldElement.name,
			i = 0;

		var posDom = fieldElement._dom.position();
		var posWrap = this.group.form.dom.find('.form-sections-wrapper').position();

		return {
			width: fieldElement._dom.innerWidth(),
			left: posDom.left + posWrap.left,
			top: posDom.top + posWrap.top + fieldElement._dom.height() - 1
		};
	}

	GroupListElement.prototype.redoTabIndices = function( ) {

		var self = this;
		this.group.eachFields( function( field ) {

			self.eachFieldElements( field.getName() , function( fieldElement ) {

				fieldElement.redoTabIndices();
			} );
			
		} );
	}
	
	return GroupListElement;
});