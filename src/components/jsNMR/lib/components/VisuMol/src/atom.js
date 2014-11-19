
define( [

		require,
		'jquery',
		'./prototype'

	], function(

		require,
		$,
		prototype

	) {

	"use strict";

	var ns = 'http://www.w3.org/2000/svg';

	var Atom = function( specs, molecule ) {

		if( ! specs || ! molecule ) {
			return this.error( "Cannot initalize atom. Either specs or molecule not defined" );
		}

		this.specs = specs;
		this.molecule = molecule;

		this.molecule.checkX( this.specs.x );
		this.molecule.checkY( this.specs.y );

		this.bonds = [];
	}

	$.extend( true, Atom.prototype, prototype, {

		placeOn: function( domMolecule ) {
			var dom = this.getDom();
			domMolecule.appendChild( dom );
			this.makeMask();
			this.makeRectSize();
		},

		hide: function() {

			this.getDom().setAttribute( 'display', 'none' );
		},

		getDom: function() {

			if( ! this.group ) {
				this.makeDom();
			}
			
			return this.group;
		},

		makeDom: function() {

			var self = this;
			this.group = document.createElementNS( ns, 'g' );

			this.rectEvent = document.createElementNS( ns, 'rect' );

			this.rectEvent.setAttribute( 'x', '-3');
			this.rectEvent.setAttribute( 'y', '-3');
			this.rectEvent.setAttribute( 'width', '6');
			this.rectEvent.setAttribute( 'height', '6');

			this.rectEvent.setAttribute('stroke', 'none');
			this.rectEvent.setAttribute('fill', 'transparent');

			this.rectEvent.setAttribute('cursor', 'pointer');
			this.rectEvent.setAttribute('pointer-events', 'fill');

			this.rectEvent.setAttribute('class', 'bindable');


			this.rectEvent.addEventListener( 'mouseover', function( e ) {

				self.rectEvent.setAttribute('stroke', 'black');
//				self.rectEvent.setAttribute('fill', 'white');

			} );


			this.rectEvent.addEventListener( 'mouseout', function( e ) {

				self.rectEvent.setAttribute('stroke', 'none');
				self.rectEvent.setAttribute('fill', 'transparent');

			} );

			this.rectEvent.element = this;

			this.group.appendChild( this.rectEvent );


			if( this.hasLabel() ) {
				this.label = document.createElementNS( ns, 'text' );
				this.label.textContent = this.specs.symbol;
				this.label.setAttribute('text-anchor', 'middle');
				this.label.setAttribute('dominant-baseline', 'middle');
				this.label.setAttribute('pointer-events', 'none');
				this.group.appendChild( this.label );
			}


			this.group.setAttribute('transform', 'translate( ' + this.molecule.mapX( this.specs.x ) + ' ' + this.molecule.mapY( this.specs.y ) + ' )');
		//	this.text.setAttribute('color', 'black');
			
		},

		hasLabel: function() {
			return ! ! this.specs.symbol && ( this.molecule.options.displayCarbonLabels || this.specs.symbol.toLowerCase() !== "c" );
		},

		getMaskUrl: function() {
			return "atommask" + this.getId();
		},

		makeMask: function() {

			if( ! this.hasLabel() ) {
				return false;
			}

			var mask = document.createElementNS( ns, 'mask' );
			mask.setAttribute( 'id', this.getMaskUrl( ) );

			var rectData = this.label.getBBox();


			var rect = document.createElementNS( ns, 'rect' );
			rect.setAttribute( 'x', 0 );
			rect.setAttribute( 'y', 0 );
			rect.setAttribute( 'width', this.molecule.getWidth() );
			rect.setAttribute( 'height', this.molecule.getHeight() );
			rect.setAttribute( 'fill', 'white' );
			
			mask.appendChild( rect );

			var rect = document.createElementNS( ns, 'rect' );
			rect.setAttribute( 'x', this.molecule.mapX( this.specs.x ) + rectData.x - 2 );
			rect.setAttribute( 'y', this.molecule.mapY( this.specs.y ) + rectData.y - 2 );
			rect.setAttribute( 'height', rectData.height + 4 );
			rect.setAttribute( 'width', rectData.width + 4 );
			rect.setAttribute( 'fill', 'black' );
			
			mask.appendChild( rect );



			this.molecule.getDefs().appendChild( mask );
		},

		makeRectSize: function() {

			if( ! this.hasLabel() ) {
				return;
			}

			var bbox = this.label.getBBox();
			
			this.rectEvent.setAttribute('x', bbox.x - 2);
			this.rectEvent.setAttribute('y', bbox.y -2);
			this.rectEvent.setAttribute('width', bbox.width + 4 );
			this.rectEvent.setAttribute('height', bbox.height + 4 );


		},

		setId: function( id ) {
			this.id = id;
		},

		getId: function() {
			return this.id;
		},

		getX: function() {
			return this.specs.x;
		},

		getY: function() {
			return this.specs.y;
		},

		getSymbol: function() {
			return this.specs.symbol;
		},

		getOtherAtom: function( atom ) {

			if( this.getAtomA() == atom ) {
				return this.getAtomB();
			}

			if( this.getAtomB() == atom ) {
				return this.getAtomA();
			}
		},

		addBond: function( bond ) {
			this.bonds.push( bond );
		},

		eachBonds: function( callback, exclude ) {

			var i = 0,
				l = this.bonds.length;

			for( ; i < l ; i ++ ) {

				if( exclude == this.bonds[ i ] ) {
					continue;
				}

				callback( this.bonds[ i ] );
			} 
		},

		highlight: function() {

			if( this.circle ) {
				return;
			}
			
			this.circle = document.createElementNS( ns, 'circle' );
			this.circle.setAttribute('r', 30 );
			this.circle.setAttribute( 'cx', 0 );
			this.circle.setAttribute( 'cy', 0 );
			this.circle.setAttribute( 'fill', 'rgba(0, 100, 100, 0.2)' );


			this.group.insertBefore( this.circle, this.group.firstChild );
		},

		unhighlight: function() {

			if( this.circle ) {
				this.group.removeChild( this.circle );
			}

			this.circle = false;
		}

	} );

	return Atom;
} );