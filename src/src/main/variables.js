define([ 
	'src/util/util',
	'src/main/datas',
	'src/util/debug',
	'src/main/variable'
	], 

	function( Util, Datas, Debug, Variable, Versioning ) { // Ensures Data is loaded, although not compulsory

	"use scrict";

	var allVariables = {};

	function getVariable( varName ) {

		if( allVariables[ varName ] ) {
			return allVariables[ varName ];
		}

		return newVariable( varName );		
	}

	function newVariable( varName ) {

		allVariables[ varName ] = new Variable( varName );
		return allVariables[ varName ];
	}

	function setVariable( name, jpath, newData, filter ) {

		var variable = getVariable( name );
		
		if( jpath ) {

			variable.setjPath( jpath, filter ? function( value, resolve ) {

				
				require( [ filter ], function( filterFunction ) {
				
					resolve( filterFunction( value ) );

				} );
			
			} : false);

		} else if( ! jpath && newData ) {
			variable.createData( [ name ], newData );
		}
	}

	return {

		getVariable: getVariable,
		setVariable: setVariable
	}
});