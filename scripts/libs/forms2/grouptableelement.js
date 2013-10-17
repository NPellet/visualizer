define(['jquery', './groupelement'], function($, GroupElement) {

	var GroupTableElement = function() {
		this.duplicators = [];
	};

	GroupTableElement.prototype = new GroupElement();
	
	GroupTableElement.prototype.makeDom = function(forceMake) {

		var self = this,
			dom = $("<div />").addClass('form-group-table'),
			table, domHead, domBody, tr, th, divFieldElements;

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
		
		table.append(domHead).append(domBody);

		this.dom = dom;
		this.domHead = domHead;
		this.domBody = domBody;

		if( this.options.multiple ) {

			table.on('click', '.form-duplicator', function() {

				var add = $(this).hasClass('form-duplicator-add'),
					rowid = $(this).parent().attr('data-rowid');

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

	GroupTableElement.prototype.updateDom = function() {

		var self = this;
		var trs = [], tr, td, i = 0, l, j = 0, fields = [ ];

		this.domBody.empty( );

		this.group.eachFields( function( field ) {

			var fieldName = field.getName();
			self.getFieldElement( fieldName , 0 );
			//self.fieldElementsDom[ fieldName ].empty(); // Empty the dom

			i = 0;

			self.eachFieldElements( fieldName, function(fieldElement) {
				td = $( "<td />" ).html( fieldElement.getDom( ) );
				trs[ i ] = trs[ i ] || [ ];
				trs[ i ][ j ] = td;
				i++;
			});

			j++;

			fields[ j ] = field;
		});

		i = 0, l = trs.length;
		for( ; i < l; i++ ) {

			tr = $("<tr />");
			tr.append('<td>' + i + '</td>'); // Numbering
		
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

		$.when.apply($.when, els).then(function() {

			self.updateDom();
			var i = 0,
				l = arguments.length;

			for( ; i < l ; i ++ ) {

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

		var i, l, max = 0, j;

		this.group.eachFields(function( field ) {

			json[ field.getName() ] = json[ field.getName() ] || [];
			max = Math.max(max, json[ field.getName() ].length);

		});

		for(i in json) {
			for(j = json[ i ].length ; j < max ; j ++) {
				json[ i ][ j ] = null;
			}
		}
		
		this._fill( json, clearFirst );
	};


	GroupTableElement.prototype.getExpanderInfosFor = function( fieldElement ) {

		var fieldName = fieldElement.name,
			i = 0, j;

		this.eachFieldElements( fieldName, function( el ) {
			if( el == fieldElement) {
				j = i;
			}
			i++;
		});

		var posTr = this.domBody.children('tr:eq(' + j + ')').position();

		return {
			width: this.domBody.width(),
			left: posTr.left,
			top: posTr.top
		};
	};

	return GroupTableElement;
});