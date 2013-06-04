 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Copyright 2013 Luc Patiny - luc.patiny@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

 
if(typeof CI.Module.prototype._types.piechart == 'undefined')
	CI.Module.prototype._types.piechart = {};

CI.Module.prototype._types.piechart.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.piechart.View.prototype = {
	DEBUG: true,

	highlightNode: function(nodeID) {
		node.setCanvasStyle('shadowBlur', 0, 'start');  
		node.setCanvasStyle('shadowBlur', 10, 'end');  
		this._rgraph.fx.animate({  
			modes: ['node-style:shadowBlur'],  
			duration: 200  
		}); 
	},

	init: function() {
		if (this.DEBUG) console.log("piechart: init");

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
		// this.typeToScreen.molfile2D = this.typeToScreen.piechart;
		this.updateOptions();
	},
	

	inDom: function() {
		if (this.DEBUG) console.log("piechart: inDom");
		// if(this._value === undefined) return;
	},

	onResize: function(width, height) {
		if (this.DEBUG) console.log("piechart: onResize");
		this.createPiechart();
		this.updatePiechart();
	},
	

	/* When a vaue change this method is called. It will be called for all 
	possible received variable of this module.
	It will also be called at the beginning and in this case the value is null !
	*/
	update2: {
		'piechart': function(moduleValue) {
			if (this.DEBUG) console.log("piechart: update2");


			if (! moduleValue || ! moduleValue.value) return;

			// Should the convertion be here ?????
			this._value = this.convertChartFormat(moduleValue.value);

			if (! this._rgraph) {
				if (!document.getElementById(this._id)) return; // this is the case when we change of view
				this.createPiechart();
			} 

			this.updatePiechart();

			// ???????? why the following code does not work
			var view=this;
			CI.DataType.toScreen(moduleValue, this.module, this._id).done(function(piechart) {
				view._value = piechart;
				view.updatePiechart();
			});
		}
	},
	
	updatePiechart: function() {
		if (this.DEBUG) console.log("piechart: updatePiechart");
		if (!this._rgraph || !this._value) return;

	    this._rgraph.loadJSON(this._value);

	    // in each node we had the content of "label"
	    $jit.Graph.Util.each(this._piechart.graph, function(node) {
	    	if (node.data && node.data.label) {
	    		node.name=node.data.label
	    	} else {
	    		node.name="";
	    	}
		});  
	    this._rgraph.refresh();
	},

	updateOptions: function() {
 		var cfg = this.module.getConfiguration();

		this._options={
			nodeSize: cfg.nodeSize || 1,
			nodeColor: cfg.nodeColor || "yellow",
		}
	},

	createPiechart: function() {
		if (this.DEBUG) console.log("piechart: createPiechart");
		// ?????? how to put this in the model ?????
    	var actions=this.module.definition.dataSend;
    	if (! actions || actions.length==0) return;
    	var hover=hover=function(node) {
	    	for (var i=0; i<actions.length; i++) {
	    		if (actions[i].event=="onHover") {
	    			var jpath=actions[i].jpath;
	    			var name=actions[i].name;
					CI.API.setSharedVarFromJPath(name, node, jpath);
				}
    		}
    	}


		var cfg = this.module.getConfiguration();

		this.dom.empty();

		var options=this._options;
		this._rgraph = new $jit.PieChart({
	        injectInto: this._id,
			animate: false,
			//offsets
			offset: 30,
			sliceOffset: 0,
			labelOffset: 20,
			//slice style  'stacked'
			type: 'stacked:gradient',
			//whether to show the labels for the slices
			showLabels:true,
			//resize labels according to
			//pie slices values set 7px as
			//min label size
			resizeLabels: 7,
			//label styling
			Label: {
				type: 'Native', //Native or HTML
				size: 20,
				family: 'Arial',
				color: 'white'
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

			    },
	//		    onMouseMove: function(node, eventInfo, e) {},
			    onMouseEnter: function(node, eventInfo, e) {
			    	hover(node);
			    },
			    onMouseLeave: function(node, eventInfo, e) {
  					hover(null);
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
		if (this.DEBUG) console.log("piechart: getDom");
		return this.dom;
	},
	
	_doHighlight: function(id, val) {
		if (this.DEBUG) console.log("piechart: _doHighlight");
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
	},

	convertChartFormat: function(chart) {
		var result={};
		result.values=[];
		result.label=chart.serieLabels;
		if (chart.series && chart.series.length) {
			var series=chart.series;
			for (var i=0; i<series[0].length; i++) {
	     	   var values=[];
				for (var j=0; j<series.length; j++) {
					if (series[j] && series[j][i]) {
						values.push(series[j][i]);
					} else {
						values.push(0);
					}
				}
				result.values.push(
					{
						'label':chart.x[i],
						'values':values
					}
				);
			}
		}
		return result;
	}
}

 
