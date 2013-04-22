//Here we implement custom node rendering types for the RGraph  
//Using this feature requires some javascript and canvas experience.  
$jit.RGraph.Plot.NodeTypes.implement({  
    //This node type is used for plotting the upper-left pie chart  
    'image': {
    	'render': function(type, pos, radius, canvas){
    		console.log(arguments);
		 	if ( type.data && type.data.imageURxxL) {
		    	var ctx = canvas.getCtx();
			    var image = new Image();
			    image.src = node.data.imageURL;
			    ctx.drawImage(image,pos.x-10, pos.y-10, image.width, image.height);
			    ctx[type]();
			} else {   
			    var ctx = canvas.getCtx();
	      		ctx.beginPath();
	   			ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2, true);
	   			ctx.closePath();
	     		ctx[type]();
			}
		},
		'contains': function(npos, pos, radius){
	      var diffx = npos.x - pos.x, 
	          diffy = npos.y - pos.y, 
	          diff = diffx * diffx + diffy * diffy;
	      return diff <= radius * radius;
	    }
    }
})