define(['jquery', './groupelement'], function($, GroupElement) {

	var GroupTableElement = function() {
		this.duplicators = [];
	};

	GroupTableElement.prototype = new GroupElement();
	
	GroupTableElement.prototype.makeDom = function(forceMake) {

		var self = this,
			dom = $("<div />").addClass('form-group-table'),
			table, domHead, domBody, tr, th, divFieldElements;


		if( this.group.getTitle() ) {
			dom.append('<div class="form-groupelement-title">' + this.group.getTitle() + '</div>');
		}

		table = $("<table />", { cellpadding: 0, cellspacing: 0 } ).css( { width: '100%' } );
		domHead = $("<thead />");
		domBody = $("<tbody />");

		tr = $("<tr />").appendTo(domHead);

		tr.append( "<th />" ); // Numbering

		this.group.eachFields( function( field ) {

			th = $( "<th />" ).html( field.getTitle( true ) );
			tr.append( th );

		});

		if( this.options.multiple ) {
			tr.append("<th />");	
		}
		
		table.append( domHead ).append( domBody );

		this.dom = dom;
		this.domHead = domHead;
		this.domBody = domBody;

		if( this.options.multiple ) {

			table.on('click', '.form-duplicator', function() {

				var add = $( this ).hasClass( 'form-duplicator-add' ),
					rowid = parseInt( $( this ).parent( ).attr( 'data-rowid' ) );

				if( add ) {

					self.duplicate( rowid );

				} else {

					self.remove( rowid );
				}

			});
		}

		this.updateDom();
		this.dom.append(table);
		return this.dom;
	};



	GroupTableElement.prototype._makeDomTpl = function() {


		return this.makeDom();
	}

	GroupTableElement.prototype.visible = function() {

		var w = this.domBody.width(), $el, self = this;

		w -= 20;
		if( this.options.multiple ) {
			w -= 30;
		}

		w /= this.group.nbFields;

		this.domHead.children().children().each(function( i , el ) {
			$el = $(el);

			if( i == 0 ) {
				$el.css('width', 20);
				return;
			}

			if( self.group.options.multiple && i == self.group.nbFields + 1) {
				$el.css('width', 30);
				return;
			}

			$el.css('width', w);

		});
	}


	GroupTableElement.prototype.updateDom = function() {

		var self = this;
		var trs = [], tr, td, i = 0, l, j = 0, fields = [ ];

		this.domBody.children().detach( );

		this.group.eachFields( function( field ) {

			var fieldName = field.getName();
			self.getFieldElement( fieldName , 0 );
			//self.fieldElementsDom[ fieldName ].empty(); // Empty the dom

			i = 0;

			self.eachFieldElements( fieldName, function( fieldElement ) {

				td = $( "<td />" ).html( fieldElement.getDom( ) );
				trs[ i ] = trs[ i ] || [ ];
				trs[ i ][ j ] = td;
				i++;

			});

			j++;

			fields[ j ] = field;
		});

		i = 0, l = trs.length;
		for( ; i < l ; i++ ) {

			tr = $("<tr />");
			tr.append('<td>' + ( i + 1 ) + '</td>'); // Numbering
		
			for(j = 0, m = trs[ i ].length; j < m ; j++ ) {
/*
				if(!trs[ i ][ j ]) {

					trs[ i ][ j ] = fields[ j ].makeElement( ); // No choice we need to create if doesn't exist
					trs[ i ][ j ].groupElement( this );
				}
*/
				tr.append( trs[ i ][ j ] ); // Add td to tr
			}

			if( this.options.multiple ) {
				tr.append( this.makeDuplicator( i ) ); // Numbering
			}

			this.domBody.append( tr );
		}


		this.group.form.redoTabIndices();
	
		return this.dom;
	};

	GroupTableElement.prototype.makeDuplicator = function(rowId) {
		if( this.duplicators[ rowId ] ) {
			return this.duplicators[ rowId ];
		}

		var td = $( "<td></td>" , { "data-rowid": rowId } ).addClass( 'form-table-duplicator' );
		td.append( '<span class="form-duplicator form-duplicator-add">+</span>' );
		td.append( '<span class="form-duplicator form-duplicator-remove">-</span>' );

		this.duplicators[ rowId ] = td;

		return td;
	};

	GroupTableElement.prototype.duplicate = function(rowId) {

		var self = this,
			els = [];

		this.group.eachFields( function( field ) {

			var el = field.makeElement( ).done(function( value ) {

				value.group = self.group;
				value.groupElement = self;
				self.fieldElements[ field.getName() ].splice( rowId + 1, 0, value );
			});

			els.push( el );

		});

		$.when.apply( $.when, els ).then(function() {

			self.updateDom( );
			var i = 0,
				l = arguments.length;

			for( ; i < l ; i ++ ) {

				arguments[ i ].setDefaultOr();
				arguments[ i ].inDom( );
			}

		});
	};

	GroupTableElement.prototype.remove = function(rowId) {

		var self = this,
			length;

		this.group.eachFields( function( field ) {

			field.removeElement( self.fieldElements[ field.getName() ][ rowId ] );
			self.fieldElements[ field.getName() ].splice( rowId, 1 );
			length = self.fieldElements[ field.getName() ].length;

		});

		if( length == 0 ) {

			this.duplicate( -1 );
		} else {

			self.updateDom();
		}

	};

	GroupTableElement.prototype.fill = function( json, clearFirst ) {

		if( ! ( json instanceof Array ) ) {
			return this.fillOld( json, clearFirst );
		}

		var i = 0,
			l = json.length,
			j,
			finalEl = {},
			allJ = {},
			fields = this.group.fields;

		for( ; i < l ; i ++ ) {

			for( j in fields ) {

				finalEl[ j ] = finalEl[ j ] || [ ];
				finalEl[ j ][ i ] = json[ i ][ j ]; 
				allJ[ j ] = true;
			}
		}

		for( j in fields ) {
			i = 0;
			for( ; i < l ; i ++ ) {
				finalEl[ j ][ i ] = finalEl[ j ][ i ] || null; 
			}
		}

		return this._fill( finalEl, clearFirst );
	};


	GroupTableElement.prototype.fillOld = function( json, clearFirst ) {

	
		var i, l, max = 0, j;

		this.group.eachFields(function( field ) {

			json[ field.getName() ] = json[ field.getName() ] || [];
			max = Math.max(max, json[ field.getName() ].length);

		});

		for( i in json ) {
			for( j = json[ i ].length ; j < max ; j ++ ) {
				json[ i ][ j ] = null;
			}
		}
		
		return this._fill( json, clearFirst );
	}

	GroupTableElement.prototype.getValue = function(stackFrom, stackTo) {

		var i, j, l, stackTo = [ ];

		for( i in this.fieldElements ) {

			j = 0, 
			l = this.fieldElements[ i ].length;
			
			for( ; j < l ; j ++) {

				stackTo[ j ] = stackTo[ j ] || { };
				stackTo[ j ][ i ] = this.fieldElements[ i ][ j ].value;
			}
		}

		return stackTo;
	};




	GroupTableElement.prototype.getExpanderInfosFor = function( fieldElement ) {

		var fieldName = fieldElement.getName(),
			i = 0, j;

		this.eachFieldElements( fieldName, function( el ) {
			if( el == fieldElement) {
				j = i;
			}
			i++;
		});

		var posWrap = this.group.form.dom.find('.form-sections-wrapper').position();
		var posDom = fieldElement.dom.position();
		var row = this.domBody.children('tr:eq(' + j + ')');
		var tablePos = this.domBody.position();

		return {
			width: row.outerWidth() - posDom.left + tablePos.left + 2,
			left: posDom.left + posWrap.left - 1,
			top: posDom.top + posWrap.top + this.domBody.children('tr:eq(' + j + ')').innerHeight() - 1
		};
	};




	GroupTableElement.prototype.redoTabIndices = function( ) {

		var self = this,
			increment = 0,
			nbFields = this.group.nbFields,
			fieldPos = 0,
			stack = [],
			i = 0, l;

		this.group.eachFields( function( field ) {

			increment = 0;
			self.eachFieldElements( field.getName() , function( fieldElement ) {
				stack[ increment * nbFields + fieldPos ] = fieldElement;
				increment ++;
			} );

			fieldPos++;
		} );

		for( l = stack.length ; i < l ; i ++ ) {
			this.group.form.incrementTabIndex( stack[ i ] );
		}
	}
	

	GroupTableElement.prototype.getFieldElementCorrespondingTo = function( element, name ) {
		var field;
		if( this.fieldElements[ name ] && ( field = this.fieldElements[ name ][ this.fieldElements[ element.getName() ].indexOf( element ) ] ) ) {
			return field;
		}
	}


	return GroupTableElement;
});