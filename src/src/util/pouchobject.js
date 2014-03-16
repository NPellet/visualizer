
define( function() {
	
	PouchObject = function(l, checkDeep) {	
		for(var i in l) {
			if(l.hasOwnProperty(i)) {
				if(!checkDeep) {
					this[i] = l[i];
					continue;
				} else {
					this[i] = DataObject.check(l[i], true);
				}
			}
		}

		l.listenDataChanged( function() {
			PouchDB.getPouchInstance( l.__parent.getPouch() ).put( l, l._id, l._rev );
		} )
	};

	PouchObject.prototype = DataObject.prototype;

	
	function PouchArray(arr, deep) { 
	  arr = { type: 'array', value: arr || [] };
	  
	  if(deep) {
	  	for(var i = 0, l = arr.length; i < l; i++) {
	  		arr.value[i] = PourchObject.check(arr[i], deep);
	  	}
	  }

	  arr.__proto__ = PouchArray.prototype;
	  return arr;
	}

	PouchArray.prototype = new Array;

	PouchArray.prototype.setPouch = function( pouchName ) {
		this.pouchName = pouchName;
	}

	PouchArray.prototype.getPouch = function( ) {
		return this.pouchName;
	}

	PouchArray.prototype.push = function() {
		// arguments contain the element to push
		Array.prototype.push.apply( this.value, arguments );
		console.log( "Pouch Array has a new element. Pushing into Pouch");

		PouchDB.getPouchInstanceFor( this.pouchName ).post( arguments[ 0 ] ).then( function() {
			console.log( "Pouch has saved your data" );
		});
	}

	PouchArray.prototype.splice = function() {

		var elementsRemoved = Array.prototype.splice.apply( this.value, arguments ),
			pouch = PouchDB.getPouchInstanceFor( this.pouchName );

		for( var i = 0, l = elementsRemoved.length ; i < l ; i ++ ) {
			pouch.remove( elementsRemoved[ i ] );
		}
	}

	window.PouchObject = PouchObject;
	window.PouchArray = PouchArray;

});