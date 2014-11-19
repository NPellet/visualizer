
define( [ 

		require, 
		'jquery',
		'./bond',
		'./atom',
		'./prototype'

	 ], function( 

		 require, 
		 $,
		 Bond,
		 Atom,
		 Prototype

	 ) {
	
	"use strict";

	var ns = 'http://www.w3.org/2000/svg';
	var nsxlink = "http://www.w3.org/1999/xlink";


	var defaultOptions = {

		fontFamily: 'Arial',
		fontSize: '12px',

		paddingTop: 10,
		paddingBottom: 0,
		paddingRight: 10,
		paddingLeft: 10,

		displayCarbonLabels: false,
		maxBondLengthAverage: 20,
		hideImplicitHydrogens: true
	}

	var Molecule = function( options, fileOrJson ) {

		this.options = $.extend( true, {}, defaultOptions, options );
		this.loading = true;
		this.setData( fileOrJson );
		
		this.atoms = [];
		this.bonds = [];
	}

	$.extend( Molecule.prototype, Prototype, {


		render: function() {

			var self = this,
				dom;

			$.when( this.loading ).then( function( ) {

				dom = self.getDomGroupMolecule();

				self.recalculateViewportRatio();

				self.eachAtoms( function( atom ) {

					atom.placeOn( dom );

				} );

				self.eachBonds( function( bond ) {

					bond.placeOn( dom );

				} );

			} );
		},

		resize: function( w, h ) {

			var dom = this.getDom();
			this.width = w;
			this.height = h;

			dom.setAttribute( 'width', w );
			dom.setAttribute( 'height', h );
		},

		checkX: function( x ) {
			this.maxX = Math.max( this.maxX, x );
			this.minX = Math.min( this.minX, x );
		},

		checkY: function( y ) {
			this.maxY = Math.max( this.maxY, y );
			this.minY = Math.min( this.minY, y );
		},

		recalculateViewportRatio: function() {

			var deltaX = this.maxX - this.minX,
				deltaY = this.maxY - this.minY,

				deltaXPx = this.width - this.options.paddingLeft - this.options.paddingRight,
				deltaYPx = this.height - this.options.paddingTop - this.options.paddingBottom
			;


			if( deltaX / deltaXPx > deltaY / deltaYPx ) { // Too large => limit in width

				this.ratio = deltaXPx / deltaX;

			} else {

				this.ratio = deltaYPx / deltaY;
			}

			this.ratio = this.checkRatioWithBonds( this.ratio );
		},

		checkRatioWithBonds: function( ratio ) {

			var bondLengthAverage = this.getBondLengthAverage(),
				bondLengthPx = bondLengthAverage * ratio;

			if( bondLengthPx > this.options.maxBondLengthAverage ) {
				return ratio * ( this.options.maxBondLengthAverage / bondLengthPx );
			}

			return ratio;
		},

		getBondLengthAverage: function() {

			if( this.bondLengthAverage ) {
				return this.bondLengthAverage;
			}


			var sum = 0,
				i = 0;

			this.eachBonds( function( bond ) {
				sum += bond.getLength();
				i ++;
			});

			return this.bondLengthAverage = sum / i; // In mol unit
		},

		mapX: function( x ) {

			return this.ratio * ( x - this.minX ) + this.options.paddingLeft;
		},

		mapY: function( y ) {

			return this.ratio * ( y - this.minY ) + this.options.paddingTop;
		},

		getDom: function() {

			if( this.domSVG ) {
				return this.domSVG;
			}

			// Create SVG element with the SVG namespace
			this.domSVG = document.createElementNS( ns, 'svg' );

			// Setts the xlink
			this.domSVG.setAttributeNS( "http://www.w3.org/2000/xmlns/", "xmlns:xlink", nsxlink );

			this.setAttributeTo( this.domSVG, {
				'xmlns': ns,
				'font-family': this.options.fontFamily,
				'font-size': this.options.fontSize 
			} );

			this.initSVG();

			return this.domSVG;
		},

		setDom: function( svg ) {

			this.domSVG = svg;
			this.initSVG();
		},

		getDefs: function() {
			return this.defs;
		},

		initSVG: function() {

			this.defs = document.createElementNS( ns, 'defs' );
			this.domSVG.appendChild( this.defs );

			this.domGroupMolecule = document.createElementNS( ns, 'g' );
			this.domSVG.appendChild( this.domGroupMolecule );
		},

		getDomGroupMolecule: function() {

			if( ! this.domGroupMolecule ) {
				this.getDom();
			}

			return this.domGroupMolecule;
		},

		/* ATOMS */

		_getAtomConstructor: function() {
			return Atom;
		},

		setAtomsFromJSON: function( json ) {
			this.atoms = [];
			this.maxX = Number.NEGATIVE_INFINITY;
			this.maxY = Number.NEGATIVE_INFINITY;
			this.minX = Number.POSITIVE_INFINITY;
			this.minY = Number.POSITIVE_INFINITY;

			this.addAtomsFromJSON( json );
		},

		addAtomsFromJSON: function( json ) {

			var i = 0,
				l = json.length;

			for( ; i < l ; i ++ ) {
				this.addAtomFromJSON( json[ i ] );
			}
		},

		addAtomFromJSON: function( atomJson ) {

			var atom = new Atom( atomJson, this );
			atom.setId( this.atoms.length );
			this.atoms.push( atom );

			return atom;
		},

		eachAtoms: function( callback ) {

			var i = 0, 
				l = this.atoms.length;

			for( ; i < l ; i ++ ) {
				callback( this.atoms[ i ] );
			}

			return this;
		},

		/* BOMDS */

		_getBondConstructor: function() {
			return Bond;
		},

		setBondsFromJSON: function( json ) {

			this.bonds = [];
			this.addBondsFromJSON( json );
		},

		addBondsFromJSON: function( json ) {

			var i = 0,
				l = json.length;

			for( ; i < l ; i ++ ) {
				this.addBondFromJSON( json[ i ] );
			}
		},

		addBondFromJSON: function( bondJson ) {

			var bond = new Bond( bondJson, this );
			bond.setId( this.bonds.length );
			this.bonds.push( bond );

			return bond;
		},

		eachBonds: function( callback ) {

			var i = 0,
				l = this.bonds.length;

			for( ; i < l ; i ++ ) {
				callback( this.bonds[ i ] );
			}

			return this;
		},

		getAtomById: function( id ) {
			return this.atoms[ id ];
		},

		getWidth: function() {
			return this.width;
		},

		getHeight: function() {
			return this.height;
		},

		setData: function( fileOrJson ) {

			if( typeof fileOrJson == "object" ) {
				this.setDataFromJSON( fileOrJson );
			} else if( typeof fileOrJson == "string" ) {
				this.setDataFromJSONFile( fileOrJson );
			}
			
		},

		setDataFromJSONFile: function( filePath ) {

			var self = this;
			return this.loading = $.getJSON( filePath ).then( function( moleculeJson ) {

				self.setDataFromJSON( moleculeJson );
			} );
		},

		setDataFromJSON: function( data ) {

			this.setAtomsFromJSON( data.atoms );
			this.setBondsFromJSON( data.bonds );
		}
		
	} );

	return Molecule;

} );
