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

		// When we change configuration the method init is called again. Also the case when we change completely of view
		if (! this.dom) {
			this._id = BI.Util.getNextUniqueId();
			this.dom = $('<div id="' + this._id + '"></div>').css('height', '100%').css('width', '100%');
			this.module.getDomContent().html(this.dom);
		}

		if (this.dom) {
			// in the dom exists and the preferences has been changed we need to clean the canvas
			this.dom.empty();
			
		}
		if (this._rgraph) { // if the dom existedd there was probably a rgraph or when changing of view
			delete this._rgraph;
		}
		this._highlighted = {};
		// this.typeToScreen.molfile2D = this.typeToScreen.dendrogram;
		this.updateOptions();
	},
	

	inDom: function() {
		console.log("Dendrogram: inDom");
		// if(this._value === undefined) return;
	},

	onResize: function(width, height) {
		console.log("Dendrogram: onResize");
		this.createDendrogram();
		this.updateDendrogram();
	},
	

	/* When a vaue change this method is called. It will be called for all 
	possible received variable of this module.
	It will also be called at the beginning and in this case the value is null !
	*/
	update2: {
		'dendrogram': function(moduleValue) {
			console.log("Dendrogram: update2");


			if (! moduleValue || ! moduleValue.value) return;

			this._value = moduleValue.value;

			if (! this._rgraph) {
				if (!document.getElementById(this._id)) return; // this is the case when we change of view
				this.createDendrogram();
			} 

			this.updateDendrogram();

			// ???????? why the following code does not work
			var view=this;
			CI.DataType.toScreen(moduleValue, this.module, this._id).done(function(dendrogram) {
				view._value = dendrogram;
				view.updateDendrogram();
			});
		}
	},
	
	updateDendrogram: function() {
		console.log("Dendrogram: updateDendrogram");
		if (!this._rgraph || !this._value) return;

	    this._rgraph.loadJSON(this._value);
	//    this._rgraph.compute('end');

	    this._rgraph.refresh();



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
	            if (cfg.labelSizejPath) {
	            	// ??????? how to do in a "simple" way. The async approach will give trouble ...
					CI.DataType.getValueFromJPath(node, cfg.labelSizejPath).done(function(val) {
						style.fontSize=val;
					});
				}
	        
	            if (node.data && node.data.labelSize) { // temporary code till we solve the other problem
	            	style.fontSize = node.data.labelSize;
	            } else {
	            	style.fontSize = cfg.labelSize || "0em";
	            }
	            if (node.data && node.data.labelColor) { // temporary code till we solve the other problem
	            	style.color = node.data.labelColor;
	            } else {
	            	style.color = cfg.labelColor;
	            }
			},
		//	endNodeStyle: function(node) {},
			nodeStyle: function(node) {
				if (node.data && node.data.nodeSize) {
	            	node.Node.dim = node.data.nodeSize;
		        }
				if (node.data && node.data.nodeColor) {
	            	node.Node.color = node.data.nodeColor;
	        	}
			}	
		}
	},

	createDendrogram: function() {
		console.log("Dendrogram: createDendrogram");
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
	        /*
	        NodeStyles: {  
			    enable: true,  
			    type: 'Native',  
			    stylesHover: {  
			      CanvasStyles: {
			      	shadowColor: '#ccc',  
		      		shadowBlur: 10
		      	  }
			    },  
			    duration: 0  
			  },
			  */

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
	        	type: cfg.nodeType || "circle"
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
	            // we could think about a way to dynamically give the style
	            // node.Node.type="triangle";
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
	//		    onClick: function(node, eventInfo, e) {},
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
	    	// onBeforeCompute: function(node){},
	        // onAfterCompute: function(){},
	  		Tips: {
	      		enable: false,
	     	}
	    });
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
		// ?????????????? A quoi cela sert ????
	}
}

 
