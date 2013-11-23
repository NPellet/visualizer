define( [ 'jquery' ], function( $ ) {

	var Displayer = function( ) { 

		this.fieldSources = {};
		this.targets = {};
	};

	Displayer.prototype = {

		init: function( field, source, target ) {
			
			this.fieldSources.push( field );

			for( var i = 0, l = target.length ; i < l ; i ++ ) { // i is a value of field, source[ i ] will be the key to trigger

				this.targets[ source[ i ] ] = this.keys[ source[ i ] ] || [ ];
				this.keys[ source[ i ] ].push( field );

			}

		},

		changed: function( field, value ) {

			var source = field.options.displaySource;

			// If the conditional value exists
			if( typeof source[ value ] !== "undefined" ) {
				this.triggerValue( source[ value ] );
			}
		}
	};

});