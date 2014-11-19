
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

	var Bond = function( specs, molecule ) {

		if( ! specs || ! molecule ) {
			return this.error( "Cannot initalize bond. Either specs or molecule not defined" );
		}

		this.specs = specs;
		this.molecule = molecule;

		this.getAtomA().addBond( this );
		this.getAtomB().addBond( this );
	}

	$.extend( true, Bond.prototype, prototype, {

		placeOn: function( domMolecule ) {

			var dom = this.getDom(),
				atom;

			if( ! this.isShown() ) {
			//	atom.hide();
				return;
			}

			domMolecule.appendChild( dom );
		},

		isShown: function() {
			return ! this.molecule.options.hideImplicitHydrogens || ! this.isImplicit();
		},

		getDom: function() {

			if( ! this.group ) {
				this.makeDom();
			}

			return this.group;
		},




		makeDom: function() {

			var line,
				group,
				i = 0,
				nb;

			this.group = document.createElementNS( ns, 'g' );

			switch( this.specs.type ) {

				case 1:
					nb = 1;
				break;

				case 2:
					nb = 2;
				break;

				case 3:
					nb = 3;
				break;
			}

			this.getAngle();
			this.getLength();

			var coords = this.computeCoordinates();

			if( this.getAtomB().hasLabel() ) {
				this.group.setAttribute('mask', 'url(#' + this.getAtomB().getMaskUrl() + ')');
			}


			group = document.createElementNS( ns, 'g' );
			if( this.getAtomA().hasLabel() ) {
				group.setAttribute('mask', 'url(#' + this.getAtomA().getMaskUrl() + ')');
			}
		

			for( ; i < nb; i ++ ) {

				line = document.createElementNS( ns, 'line' );
				line.setAttribute( 'stroke', 'black' );
				line.setAttribute( 'pointer-events', 'none' );

				line.setAttribute('x1', this.molecule.mapX( coords[ i ][ 0 ][ 0 ] ) );
				line.setAttribute('y1', this.molecule.mapY( coords[ i ][ 0 ][ 1 ] ) );
				line.setAttribute('x2', this.molecule.mapX( coords[ i ][ 1 ][ 0 ] ) );
				line.setAttribute('y2', this.molecule.mapY( coords[ i ][ 1 ][ 1 ] ) );

				group.appendChild( line );
			}

			this.group.appendChild( group );
		},

		isImplicit: function() {

			var sA = this.getAtomA().getSymbol(),
				sB = this.getAtomB().getSymbol();

			if( ( sA == 'C' && sB == 'H' ) ) {
				return this.getAtomB();
			} else if( sA == 'H' && sB == 'C' ) {
				return this.getAtomA();
			}

			return false;
		},

		computeCoordinates: function( force ) {

			if( this.coords && ! force ) {
				return this.coords;
			}

			var coords,
				atomA = this.getAtomA(),
				atomB = this.getAtomB();

	/*	if( this.isSymmetric() ) {
				return this.handleSymmetry();
			}
*/
			var coords = [ [ [ atomA.getX(), atomA.getY() ], [ atomB.getX(), atomB.getY() ] ] ];	


			var i = 1,
				nb;

			var nb = this.getBondNb();

			if( nb > 1 ) {

				var deltaA = this.computeStandoffCoordinates( atomA );
				var deltaB = this.computeStandoffCoordinates( atomB );				
			}

			for( ; i < nb; i ++ ) {

				coords[ i ] = [ 
								[ 
									coords[ 0 ][ 0 ][ 0 ] + deltaA[ 0 ] - deltaA[ 2 ],
									coords[ 0 ][ 0 ][ 1 ] + deltaA[ 1 ] + deltaA[ 3 ]
								],
								[
									coords[ 0 ][ 1 ][ 0 ] + deltaB[ 0 ] - deltaB[ 2 ],
									coords[ 0 ][ 1 ][ 1 ] + deltaB[ 1 ] + deltaB[ 3 ]
								]
							];


			}

			this.coords = coords;

			return this.coords;
		},

		getBondNb: function() {

			var nb;
			switch( this.specs.type ) {

				case 1:
					nb = 1;
				break;

				case 2:
					nb = 2;
				break;

				case 3:
					nb = 3;
				break;
			}

			return nb;
		},


		computeStandoffCoordinates: function( atom ) {

			var angle = Math.PI,
				bond;
			var self = this;

			atom.eachBonds( function( bondIterative ) {

				if( bondIterative.isShown() ) {

					var angle2 = self.computeAngleWithBond( atom, bondIterative );

					if( angle2 < angle ) {
						angle = angle2;
						bond = bondIterative;
					}	

				}
			
			}, this );

		
			var standoff = 0.1 * this.getLength();
			var hyp = standoff * Math.cos( angle / 2 );

			var r = hyp / this.getLength();
			var dx = r * this.dxatoms;
			var dy = r * this.dyatoms;

			if( ! this.isAtomA( atom ) ) {
				dx *= -1;
				dy *= -1;
			}

			var rx = standoff / this.getLength() * this.dxatoms;
			var ry = standoff / this.getLength() * this.dyatoms;

			return [ dx, dy, ry, rx ];
		},

		isAtomSymmetric: function( atom ) {

			var angles2 = [];
			atom.eachBonds( function( bondIterative ) {

				var angle2 = self.computeAngleWithBond( atom, bondIterative );
				if( ( index = angles.indexOf( angle2 ) ) > -1 ) {
					angles2.splice( index, 1 );
				} else {
					angles2.push( angle2 );
				}

			}, this );

			return angles2.length == 0;
		},

		isSymmetric: function() {

			if( this.isAtomSymmetric( this.getAtomA() ) && this.isAtomSymmetric( this.getAtomB() ) ) {
				return true;
			}

			return false;
		},

		handleSymmetry: function() {

			var coords,
				atomA = this.getAtomA(),
				atomB = this.getAtomB();

			if( this.isSymmetric() ) {
			//	return this.handleSymmetry();
			}

			var coords = [ [ [ atomA.getX(), atomA.getY() ], [ atomB.getX(), atomB.getY() ] ] ];	


			var i = 1,
				nb;

			var nb = this.getBondNb();

			if( nb > 1 ) {

				var deltaA = this.computeStandoffCoordinates( atomA );
				var deltaB = this.computeStandoffCoordinates( atomB );				
			}

			for( ; i < nb; i ++ ) {

				coords[ i ] = [ 
								[ 
									coords[ 0 ][ 0 ][ 0 ] + deltaA[ 0 ] - deltaA[ 2 ],
									coords[ 0 ][ 0 ][ 1 ] + deltaA[ 1 ] + deltaA[ 3 ]
								],
								[
									coords[ 0 ][ 1 ][ 0 ] + deltaB[ 0 ] - deltaB[ 2 ],
									coords[ 0 ][ 1 ][ 1 ] + deltaB[ 1 ] + deltaB[ 3 ]
								]
							];


			}

		},


		computeAngleWithBond: function( atom, bond ) {

			var dx1 = this.dxatoms;
			var dy1 = this.dyatoms;

			if( this.isAtomA( atom ) && ! bond.isAtomA( atom ) || ( ! this.isAtomA( atom ) && bond.isAtomA( atom ) ) ) {
				dx1 = - dx1;
				dy1 = - dy1;
			}

			var dx2 = bond.dxatoms;
			var dy2 = bond.dyatoms;


			return Math.acos( ( dx1 * dx2 + dy1 * dy2 ) / ( bond.getLength() * this.getLength() )  );
		},

		getAngle: function() {

			if( this.angle === undefined ) {
				this.computeAngle();
			}
			
			return this.angle;

		},

		computeAngle: function() {

			this.getDeltas();

			this.angle = Math.atan( this.dyatoms / this.dxatoms ); // Angle in radian			
		},

		getDeltas: function() {


			if( this.dxatoms !== undefined && this.dyatoms !== undefined ) {
				return true;
			}


			var atomA = this.getAtomA();
			var atomB = this.getAtomB();

			if( ! atomA || ! atomB ) {
				return this.error("Cannot compute angle. Atoms are misdefined");
			}


			this.dxatoms = atomB.getX() - atomA.getX(),
			this.dyatoms = atomB.getY() - atomA.getY();
		},

		getLength: function() {

			if( this.length === undefined ) {
				this.computeLength();
			}

			return this.length;
		},

		computeLength: function() {

			this.getDeltas();
			this.length = Math.pow( this.dyatoms * this.dyatoms + this.dxatoms * this.dxatoms, 0.5 );
		},

		getAtomA: function() {

			if( ! this.atomA ) {
				this.atomA = this.molecule.getAtomById( this.specs.from );
			}
			
			return this.atomA;	
		},


		getAtomB: function() {

			if( ! this.atomB ) {
				this.atomB = this.molecule.getAtomById( this.specs.to );
			}
			
			return this.atomB;	
		},

		isAtomA: function( atom ) {
			return atom == this.getAtomA();
		},

		setId: function( id ) {
			this.id = id;
		},

		sign: function(x) {
			  if(isNaN(x)) {
			    return NaN;
			  } else if(x === 0) {
			    return x;
			  } else {
			    return (x > 0 ? 1 : -1);
		  }
		}

	} );

	return Bond;
} );