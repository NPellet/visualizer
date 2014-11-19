

requirejs.config({
	paths: {
		'jquery': './lib/components/jquery/dist/jquery.min',
		'jqueryui': './lib/components/jquery-ui/ui/minified/jquery-ui.min',
		'highlightjs': './lib/lib/highlight/highlight.pack',
		'forms': './lib/lib/forms/form',
		'components': './lib/components'
	}
});

require( [ 'src/molecule', 'highlightjs' ] , function( Molecule ) {



	var functions = [




[ function( domMolecule ) {

  var dom = document.getElementById( domMolecule );

  // Create a new molecule
  var molecule = new Molecule( {    maxBondLengthAverage: 40 } );

  // Adds the molecule somewhere in the DOM
  dom.appendChild( molecule.getDom() );

  // Set the size of the canvas
  molecule.resize( 300, 200 );

  // Fetches the JSON and uses it as the source data
  molecule.setDataFromJSONFile( './moleculeA.json' ).then( function() {

    molecule.render();
  });

}, "Basic functionnality", "" ],

/*

[ function( domMolecule ) {

  var dom = document.getElementById( domMolecule );

  // Create a new molecule
  var molecule = new Molecule( {

    displayCarbonLabels: true,
    maxBondLengthAverage: 40,
    hideImplicitHydrogens: false

  } );

  // Adds the molecule somewhere in the DOM
  dom.appendChild( molecule.getDom() );

  // Set the size of the canvas
  molecule.resize( 300, 200 );

  // Fetches the JSON and uses it as the source data
  molecule.setDataFromJSONFile( './moleculeA.json' ).then( function() {

    molecule.render();
  });

}, "Some molecule test", "" ]
*/
 ]



	for( var i = 0, l = functions.length ; i < l ; i ++ ) {

		$('#molecule-examples').append('<tr class="title"><td>' + functions[ i ][ 1 ] + '</td><td></td></tr>').append('<tr><td class="molecule"><div id="example-' + i + '-molecule"></div></td><td class="Source">Source code: <pre id="example-' + i + '-source"></pre></td><td>' + functions[ i ][ 2 ] + '</tr>');
		functions[ i ][ 0 ]("example-" + ( i ) + "-molecule");

		hljs.highlightBlock( $("#example-" + ( i  ) + "-source").html( functions[ i ][ 0 ].toString() ).get(0) );
	}

} );