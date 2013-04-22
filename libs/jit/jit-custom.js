//Here we implement custom node rendering types for the RGraph  
//Using this feature requires some javascript and canvas experience.  
$jit.RGraph.Plot.NodeTypes.implement({  
    //This node type is used for plotting the upper-left pie chart  
    'image': {
    	'render': function(node, canvas){
    	    document.imageCache=document.imageCache || [];
    		var pos = node.pos.getc(true), 
    		dim = node.getData('dim');
		 	if (node.data.imageURL) {
		    	var ctx = canvas.getCtx();
			    var image = new Image();
			    image.src = node.data.imageURL.value;
				if (document.imageCache[image.src]) {
					image=document.imageCache[image.src];
					ctx.drawImage(image,pos.x-10, pos.y-10, image.width, image.height);
				} else {
				    image.onload=function() {
				    	ctx.drawImage(image,pos.x-10, pos.y-10, image.width, image.height);
				    	document.imageCache[image.src]=image;
				    }
				    
			    }
			    
			} else {   
       			this.nodeHelper.circle.render('fill', pos, dim, canvas);
			}
		},
		'contains': function(node, pos){
			return false;
	    }
    }
})