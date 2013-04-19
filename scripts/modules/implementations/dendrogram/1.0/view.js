 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Copyright 2013 Luc Patiny - luc.patiny@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

 
if(typeof CI.Module.prototype._types.dendrogram == 'undefined')
	CI.Module.prototype._types.dendrogram = {};

CI.Module.prototype._types.dendrogram.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.dendrogram.View.prototype = {
	
	init: function() {
		console.log("Dendrogram: init");
		// When we change configuration the method init is called again
		if (! this.dom) {
			this._id = BI.Util.getNextUniqueId();
			this.dom = $('<div id="' + this._id + '"></div>').css('height', '100%').css('width', '100%');
			this.module.getDomContent().html(this.dom);
		} else {
			// in the dom exists and the preferences has been changed we need to clean the canvas
			this.dom.empty();
			delete this._rgraph;
		}
		this._highlighted = {};
		// this.typeToScreen.molfile2D = this.typeToScreen.dendrogram;
		this.updateOptions();
	},
	

	inDom: function() {
		console.log("Dendrogram: inDom");
		if(this._value === undefined) return;


//		this.drawDendrogram();
/*
		var canvas = new ChemDoodle.ViewerCanvas(this._id, 100, 100);

		canvas.specs.backgroundColor = "transparent";
		canvas.specs.bonds_width_2D = .6;
		canvas.specs.bonds_saturationWidth_2D = .18;
		canvas.specs.bonds_hashSpacing_2D = 2.5;
		canvas.specs.atoms_font_size_2D = 10;
		canvas.specs.atoms_font_families_2D = ['Helvetica', 'Arial', 'sans-serif'];
		canvas.specs.atoms_displayTerminalCarbonLabels_2D = true;

		this._canvas = canvas;
*/
	},

	onResize: function(width, height) {
		console.log("Dendrogram: onResize");
		this.createDendrogram();
		this.updateDendrogram();
/*		t
		this._height = height - 20;
		this._width = width - 20;
		this._canvas.resize(width - 20, height - 20);
		this.drawMolecule();
		*/
	},
	

	/* When a vaue change this method is called. It will be called for all 
	possible received variable of this module.
	It will also be called at the beginning and in this case the value is null !
	*/
	update2: {
		'dendrogram': function(moduleValue) {
			console.log("Dendrogram: update2 dendrogram");

			if (! moduleValue || ! moduleValue.value) return;
			// ????????? WHY THIS CODE IS CALLED 3 TIMES ?????

			this._value = moduleValue.value;

			if (! this._rgraph) this.createDendrogram();

			this.updateDendrogram();

			// ???????? why the following code does not work
			var view=this;
			CI.DataType.toScreen(moduleValue, this.module, this._id).done(function(dendrogram) {
				view._value = dendrogram;
				view.updateDendrogram();
			});


/*
			CI.DataType.toScreen(moduleValue, this.module, this._id).done(function(tree) {
				console.log("DONE");
				view.drawDendrogram(tree);
			});
 */

		}
	},
	
	updateDendrogram: function() {
		if (!this._rgraph || !this._value) return;
	    this._rgraph.loadJSON(this._value);
	    this._rgraph.compute('end');

	    this._rgraph.fx.animate({
	 		modes:['linear'],
	 		duration: 0,
	 		fps: 35 
	 	});

	},

	updateOptions: function() {
 		var cfg = this.module.getConfiguration();

		this._options={
			nodeSize: cfg.nodeSize || 1,
			nodeColor: cfg.nodeColor || "yellow",
			endNodeLabel: function(node) {
				if (node.data && node.data.label) return node.data.label;
				return "";
			},
			nodeLabel: function(node) {
				if (node.data && node.data.label) return node.data.label;
				return "";
			},
			labelStyle: function(style, node) {
	            // style.cursor = 'pointer';
	             if (node.data && node.data.labelSize) {
	            	style.fontSize = node.data.labelSize;
	            }
	            if (node.data && node.data.labelColor) {
	            	style.color = node.data.labelColor;
	            }
			},
		//	endNodeStyle: function(node) {
		//
		//	},
			nodeStyle: function(node) {
				if (node.data && node.data.nodeSize) {
	            	node.Node.dim = node.data.nodeSize;
		        }
				if (node.data && node.data.nodeColor) {
	            	node.Node.color = node.data.nodeColor;
	        	}
			}
			
		};

	},

	createDendrogram: function() {


		// ?????? how to put this in the model ?????
    	var actions=this.module.definition.dataSend;
    	var hover=function() {}
    	for (var i=0; i<actions.length; i++) {
    		if (actions[i].event=="onHover") {
    			var jpath=actions[i].jpath;
    			var name=actions[i].name;
    			hover=function(node) {
    				CI.API.setSharedVarFromJPath(name, node, jpath);
    			}
    		}
    	}


		var cfg = this.module.getConfiguration();

		if (!this._value) return;
		this.dom.empty();

		var options=this._options;
		this._rgraph = new $jit.RGraph({
	        injectInto: this._id,
		//	withLabels: true,
	     	levelDistance: 50,
	        //Optional: create a background canvas that plots
	        //concentric circles.
	        background: {
	          CanvasStyles: {
	            strokeStyle: '#555'
	          }
	        },
	        //Add navigation capabilities:
	        //zooming by scrolling and panning.
	        Navigation: {
	          enable: true,
	          panning: true,
	          zooming: 50
	        },
	        //Set Node and Edge styles.
	        Node: {
	        	overridable: true,
	        	type: 'circle'
	        },
	        
	        Edge: {
	          color: cfg.lineColor || 'green',
	          lineWidth: cfg.lineWidth || 0.5
	        },
	        //Add node click handler and some styles.
	        //This method is called only once for each node/label crated.
	        onCreateLabel: function(domElement, node){
	        	if (node.getSubnodes(1).length == 0) {
	        		if (options.endNodeLabel) {
	        			domElement.innerHTML=options.endNodeLabel(node);
	        		} else if (options.nodeLabel) {
	        			domElement.innerHTML=options.nodeLabel(node);
	        		}
	        	} else {
	        		 if (options.nodeLabel) {
	        			 domElement.innerHTML=options.nodeLabel(node);
	        		 }
	        	}
	        	if (options.labelStyle) {
	        		options.labelStyle(domElement.style, node);
	        	}
	        },
	        onBeforePlotNode: function(node) {
	            node.Node.color=options.nodeColor;
	            node.Node.dim=options.nodeSize;
	        	if (node.getSubnodes(1).length == 0) {
	        		if (options.endNodeStyle) {
	        			options.endNodeStyle(node);
	        		} else if (options.nodeStyle) {
	        			options.nodeStyle(node);
	        		}
	        	} else {
	        		if (options.nodeStyle) {
	        			options.nodeStyle(node);
	        		}
	        	}
	        },
	        //Change some label dom properties.
	        //This method is called each time a label is plotted.
	        onPlaceLabel: function(domElement, node){


	        	/*
	            var style = domElement.style;
	            style.display = '';
	            style.cursor = 'pointer';

	            if (node._depth <= 1) {
	                style.fontSize = "0.1em";name:"";
	            } else if(node._depth > 1 && node._depth <= 20){
	                style.fontSize = "0.1em";
					if(node.getSubnodes(1).length == 0)
						style.color = "#"+node.data.colorBatch;
					else
				      style.color = "#00f";
	            } else {
	                style.display = 'none';
	            }
	            */
	        },
	 	 	Events: {  
	 	 		enable: true,
	 	 		enableForEdges: true,
	//		    type: 'auto',
			    onClick: function(node, eventInfo, e) {
			    },
	//		    onRightClick: function(node, eventInfo, e) {},
	//		    onMouseMove: function(node, eventInfo, e) {},
			    onMouseEnter: function(node, eventInfo, e) {
			    	hover(node);

			    },
			    onMouseLeave: function(node, eventInfo, e) {

			    },
	//		    onDragStart: function(node, eventInfo, e) {},
	//		    onDragMove: function(node, eventInfo, e) {},
	//		    onDragCancel: function(node, eventInfo, e) {},
	//		    onDragEnd: function(node, eventInfo, e) {},
	//		    onTouchStart: function(node, eventInfo, e) {},
	//		    onTouchMove: function(node, eventInfo, e) {},
	//		    onTouchEnd: function(node, eventInfo, e) {},
	//		    onTouchCancel: function(node, eventInfo, e) {},
	//		    onMouseWheel:function(node, eventInfo, e) {},
	    	},
	  		Tips: {
	      		enable: false,
	     	},
	    	onBeforeCompute: function(node){
	            // Log.write("centering " + node.name + "...");
	            //Add the relation list in the right column.
	            //This list is taken from the data property of each JSON node.
	            $jit.id('inner-details').innerHTML = node.data.relation;
	        },
	        onAfterCompute: function(){
	            // Log.write("done");
	        }
	    });

/*
			var cfg = this.module.getConfiguration();
			CI.RepoHighlight.kill(this.module.id);
			var view = this, self = this;
			var type = CI.DataType.getType(moduleValue);
*/

		
	},
	
	getDom: function() {
		console.log("Dendrogram: getDom");
		return this.dom;
	},
	
	_doHighlight: function(id, val) {
		console.log("Dendrogram: _doHighlight");
		if(this._highlighted[id] && val)
			return;
		if(!this._highlighted[id] && !val)
			return;
		this._highlighted[id] = val;
		for(var i in this._currentValue._atoms) {
			if(this._currentValue._atoms[i].indexOf(id) > -1) {
				CI.RepoHighlight.set(i, val);
			}
		}
	},

	typeToScreen: {
	}
}

 
