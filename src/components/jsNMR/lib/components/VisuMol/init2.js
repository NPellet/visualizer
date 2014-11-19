

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



function doMolecule( domMolecule, content ) {

  var dom = document.getElementById( domMolecule );

  // Create a new molecule
  var molecule = new Molecule( {    maxBondLengthAverage: 40 } );

  // Adds the molecule somewhere in the DOM
  dom.appendChild( molecule.getDom() );

  // Set the size of the canvas
  molecule.resize( 300, 200 );

  // Fetches the JSON and uses it as the source data
  molecule.setDataFromJSON( content );

  molecule.render();
  

}


$.getJSON('./molecules.json', function( allmolecules ) {


console.log( allmolecules );

  for( var i = 0, l = allmolecules.length ; i < l ; i ++ ) {
console.log( allmolecules[ i ] );
    $('#molecule-examples').append('<tr class="title"><td></td><td></td></tr>').append('<tr><td class="molecule"><div id="example-' + i + '-molecule"></div></td><td class="Source"></td><td></tr>');
    doMolecule("example-" + ( i ) + "-molecule", allmolecules[ i ] );

  }

});


} );