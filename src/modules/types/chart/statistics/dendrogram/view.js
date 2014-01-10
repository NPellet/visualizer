define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util','libs/jit/jit-custom'], function(Default, Traversing, API, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		DEBUG: false,
		highlightNode: function(nodeID) {
			node.setCanvasStyle('shadowBlur', 0, 'start');  
			node.setCanvasStyle('shadowBlur', 10, 'end');  
			this._rgraph.fx.animate({  
				modes: ['node-style:shadowBlur'],  
				duration: 200  
			}); 
		},

		init: function() {
			if (this.DEBUG) console.log("Dendrogram: init");

			// When we change configuration the method init is called again. Also the case when we change completely of view
			if (! this.dom) {
				this._id = Util.getNextUniqueId();
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
			this.updateOptions();

			if (this.DEBUG) console.log("Dendrogram: ID: "+this._id);

		},
		

		inDom: function() {
			if (this.DEBUG) console.log("Dendrogram: inDom");
		},

		onResize: function() {
			if (this.DEBUG) console.log("Dendrogram: onResize");
			this.createDendrogram();
			this.updateDendrogram();
		},
		

		getIdHash: function(currentNode) {
			if (currentNode.id) {
				this._idHash[currentNode.id]=currentNode;
			}
			if (currentNode.children instanceof Array) {
				for (var i=0; i<currentNode.children.length; i++) {
					this.getIdHash(currentNode.children[i]);
				}
			}
		},


		/* When a vaue change this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {
			'tree': function(moduleValue) {
				if (this.DEBUG) console.log("Dendrogram: update");


				if (! moduleValue || ! moduleValue.value) return;

				this._value= $.extend(true, new DataObject({}),  moduleValue.get());
				this._idHash={};
				this.getIdHash(moduleValue.get());


			//	this._value = moduleValue.get();

				if (! this._rgraph) {
					if (!document.getElementById(this._id)) return; // this is the case when we change of view
					this.createDendrogram();
				} 

				this.updateDendrogram();
/*
				moduleValue.fetch().done(
					function(dendrogram) {
						self._value = dendrogram.get();
						self.updateDendrogram();
					}
				);
*/
			}
		},
		
		updateDendrogram: function() {
			if (this.DEBUG) console.log("Dendrogram: updateDendrogram");
			if (!this._rgraph || !this._value) return;

		    this._rgraph.loadJSON(this._value);

		    // in each node we had the content of "label"
		    $jit.Graph.Util.each(this._rgraph.graph, function(node) {
		    	if (node.data && node.data.label) {
		    		node.name=node.data.label
		    	} else {
		    		node.name="";
		    	}
			});  
		    this._rgraph.refresh();
		},

		updateOptions: function() {
	 		var cfg = $.proxy( this.module.getConfiguration, this.module );

			this._options={
				nodeSize: cfg('nodeSize') || 1,
				nodeColor: cfg('nodeColor') || "yellow",
			}
		},


		createDendrogram: function() {
			var self = this;

			if (this.DEBUG) console.log("Dendrogram: createDendrogram");
			// ?????? how to put this in the model ?????

	    	var actions=this.module.vars_out();
	    	if (! actions || actions.length==0) return;
	    	var hover=hover=function(node) {
	    	//	self.module.controller.onHover(new DataObject(self._idHash[node.id]), 'node');
	    		self.module.controller.onHover(self._idHash[node.id]);
	    	}


			var cfg = $.proxy( this.module.getConfiguration, this.module );

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
		            strokeStyle: cfg('strokeColor') || '#333',
		            lineWidth: cfg('strokeWidth') || '1'
		          }
		        },
		        
		     	// onCreateLabel: function(domElement, node){},
				// onPlaceLabel: function(domElement, node){},
				
				/*
		        NodeStyles: {  
				    enable: true,  
				    type: 'Native',  
				    stylesHover: {  
				      CanvasStyles: {
				      	lineWidth: 10,
				      	strokeStyle: "#f00",
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
		        
		        Edge: {
		        	overridable: true,
		        	/*
		        	CanvasStyles: { // we need to specify it here if we want to change it later
			        	shadowColor: "rgb(0, 0, 0)",
						shadowBlur: 0
		        	},
		        	*/
		         	color: cfg('edgeColor') || 'green',
		         	lineWidth: cfg('edgeWidth') || 0.5,

		        },
		        Label: {  
				  overridable: true,  
				  type: 'Native', //'SVG', 'Native', "HTML" 
				  size: cfg('labelSize') || 10,  
				  family: 'sans-serif',  
				  textAlign: 'center',  
				  textBaseline: 'alphabetic',  
				  color: cfg('labelColor') || "black"  
				},
				
				Node: {
					CanvasStyles: { // we need to specify it here so that we can change it later (mouse enter, leave or external highlight)
			            shadowColor: "rgb(0, 0, 0)",
						shadowBlur: 0
		        	},
		        
					overridable: true,  
					type: cfg('nodeType') || "circle",  
					color: cfg('nodeColor') || "yellow",  
					dim: cfg('nodeSize') || 3,  
					height: 3,  
					width: 3,
					lineWidth: 10
				},
				
		 	 	Events: {
		 	 		getRgraph: function(e) {
		 	 			var src=e.srcElement.id.replace(/-.*/,"");
		 	 			if ($jit.existingInstance[src]) return $jit.existingInstance[src];
		 	 			// maybe we clicked on a label
		 	 			src=e.srcElement.parentElement.id.replace(/-.*/,"");
		 	 			if ($jit.existingInstance[src]) return $jit.existingInstance[src];
		 	 			return;
		 	 		},
		 	 		enable: true,
		 	 		enableForEdges: true,
				    type: 'Native', // otherwise the events are only on the labels (if auto)
		//		    onRightClick: function(node, eventInfo, e) {},
				    onClick: function(node, eventInfo, e) {
				    	if (! node) return;
				    	var rgraph=this.getRgraph(e);

				    	var currentNode;
						// the problem is that the event may be taken by a hidden node ...
						if (node.collapsed) { // we click on a collapsed node
							currentNode=node;
						} else if (node.ignore) { // hidden node ?
							// in this case we should check the first node that is not hidden and expand it
							currentNode=node.getParents()[0];
							while (currentNode.ignore) {
								currentNode=currentNode.getParents()[0];
							}
						} else if (node.nodeFrom) { // click on an edge
							// we should always take the higher depth
							currentNode=(node.nodeFrom._depth>node.nodeTo._depth)?node.nodeFrom:node.nodeTo;
							if (node.nodeFrom.collapsed) {
								currentNode=node.nodeFrom;
							}
							if (node.nodeTo.collapsed) {
								currentNode=node.nodeTo;
							}
						}
						if (currentNode) { 
							// is there one collapsed node ? We expand it
							if (currentNode.collapsed) {
								rgraph.op.expand(currentNode, {  
										type: 'animate',  
										duration: 1000,  
										hideLabels: false,  
										transition: $jit.Trans.Quart.easeInOut  
								}); 
							} else {
								rgraph.op.contract(node.nodeFrom, {  
									type: 'animate',  
									duration: 1000,  
									hideLabels: true,  
									transition: $jit.Trans.Quart.easeInOut  
								});  
							}
						} else {	// click on a node
							if (! node.ignore) { // hidden node ?
								rgraph.onClick(node.id);
							}
							
						}
				    },
		//		    onMouseMove: function(node, eventInfo, e) {},
				    onMouseEnter: function(node, eventInfo, e) {
				    	hover(node);
				    	this.getRgraph(e).canvas.getElement().style.cursor = 'pointer';
				    },
				    onMouseLeave: function(node, eventInfo, e) {
				    	this.getRgraph(e).canvas.getElement().style.cursor = '';  
				    },
		    	},
		  		Tips: {
		      		enable: false,
		     	}
		    });

	 		// we store in a cache to have access to the rgraph from an ID
	 		$jit.existingInstance=$jit.existingInstance || {};
	 		$jit.existingInstance[this._id]=this._rgraph;



		},
		
		getDom: function() {
			if (this.DEBUG) console.log("Dendrogram: getDom");
			return this.dom;
		},
		
		_doHighlight: function(id, val) {
			if (this.DEBUG) console.log("Dendrogram: _doHighlight");

			if(this._highlighted[id] && val)
				return;
			if(!this._highlighted[id] && !val)
				return;
			this._highlighted[id] = val;
			for(var i in this._currentValue._atoms) {
				if(this._currentValue._atoms[i].indexOf(id) > -1) {
					API.highlight(i, val);
				}
			}
		},
	});

	return view;
});