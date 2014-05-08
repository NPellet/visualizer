define(['components/twig.js/twig', 'src/util/typerenderer', 'src/util/util'],function(Twig, Renderer, Util){
	
	// Add support for deferred 
	
	// Add typerenderer support
	Twig.extendFunction("rendertype", function(value) {
		
		if(!value)
			return;
            
        var id = Util.getNextUniqueId();
        
        /*this.promises.push(new Promise(resolve){
            var def = Renderer.toScreen(value);
            def.always(function(value){
                $("#" + id ).html( value );
            });
        });*/
        
        return '<span id="'+id+'"></span>';		
		
	});
	
	Twig.extend(function(Twig){
        Twig.Template.prototype.renderAsync = function(data) {
            this.promises = [];
            var prom = this.promises;
            
            var def = $.Deferred();
            var result = this.render.apply(this, arguments);

            var toreturn = {
                then: def.then,
                render: function(){
                    Promise.all(prom).then(function(results){
                        var result;
                        for(var i = 0; i < results.length; i++) {
                            
                        }
                    });
                }
            };
           /* Promise.all(this.promises).then(function(){
                def.resolve(result);
            });*/
            
            return def;
        }
	});
	
	return Twig;
});