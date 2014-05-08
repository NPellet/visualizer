define(['components/twig.js/twig', 'src/util/typerenderer', 'src/util/util'],function(Twig, Renderer, Util){
	
	// Add support for deferred 
	
	// Add typerenderer support
	Twig.extendFunction("rendertype", function(value) {
		console.log(value)
		if(!value)
			return;
		
		var id = Util.getNextUniqueId();
		console.log("generated id", id)
		var def = Renderer.toScreen(value);
		
		def.always(function(value){console.log("RENDERING")
			console.log("div with id ",id, $("#" + id ), value);
			$("#" + id ).html( value );
		});
		
		Twig.blabla();
		
		return '<span id="'+id+'"></span>';
	});
	
	Twig.extend(function(Twig){
		Twig.exports.blabla = function(){
			console.log("BLABLA")
		}
	});
	
	return Twig;
});