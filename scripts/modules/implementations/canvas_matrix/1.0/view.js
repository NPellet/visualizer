 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.canvas_matrix == 'undefined')
	CI.Module.prototype._types.canvas_matrix = {};

CI.Module.prototype._types.canvas_matrix.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.canvas_matrix.View.prototype = {
	
	init: function() {	
		this.canvas = document.createElement("canvas"); // Store the pointer
		this.canvasContext = this.canvas.getContext('2d'); // Store the context
		this.lastCanvasWidth = 0;
		this.lastCanvasHeight = 0;
		this.lastCellWidth = 0;
		this.lastCellHeight = 0;
		this.lastImageData = null;
		this.moduleCenterX = 0.5; //center is stored as 0.0-1.0 rather than pixels, to be zoom-level independent
		this.moduleCenterY = 0.5;
		this.lastModuleCenterX = 0.5; 
		this.lastModuleCenterY = 0.5;

		this.dom = document.createElement("div");
		var title = document.createElement("h3");
		
		this._domTitle = title;
		
		var canvasContainer = document.createElement("div");
		canvasContainer.className = "canvas-container";
		
		this.dom.appendChild(title);
		this.dom.appendChild(canvasContainer);
				
		canvasContainer.appendChild(this.canvas);

		this.module.getDomContent().html(this.dom);
		
		
		this.worker = new Worker('./scripts/modules/implementations/canvas_matrix/1.0/worker.js');
		var view = this;
		this.worker.addEventListener('message', function(event) {
			view.lastImageData = event.data;
			view.updateCanvas();
			console.profileEnd("gridGenWW");
		});
		this.gridImage = this.canvasContext.createImageData(this.canvas.width, this.canvas.height);
		
		this.fitFillMode = "fill";

		$(canvasContainer).on('mousewheel', 'canvas', function(e) {
			e.preventDefault();
			var delta = e.originalEvent.wheelDelta;
			var speed;
			// Get normalized wheel speed
			if (typeof (view.zoomMax) == 'undefined') {
				speed = Math.min(Math.abs(delta),3);
			} else {
				view.zoomMax = Math.max(view.zoomMax, Math.abs(delta));
				speed = 3*Math.abs(delta)/view.zoomMax;
			}
			
			view.onZoom((delta<0?-1:1)*speed);
		});
		
		$(canvasContainer).drag(function(e1, e2) {
			e1.preventDefault();
			view.moduleCenterX = view.lastModuleCenterX - (e2.deltaX)/view.lastImageData.width;
			view.moduleCenterY = view.lastModuleCenterY - (e2.deltaY)/view.lastImageData.height;
			view.updateCanvas();
		});		
		$(canvasContainer).drag("start",function(e1, e2) {
			e1.preventDefault();
			view.lastModuleCenterX = view.moduleCenterX;
			view.lastModuleCenterY = view.moduleCenterY;
		});
		
		this.onResize();
	},
	onDrag: function(x,y,newDrag) {
		if (newDrag) {
			this.startX = x;
			this.startY = y;
		}
	},
	
	onResize: function() {
		
		var container = this.module.getDomContent().find('.canvas-container');
		
		// Set the canvas to full width and height
		var moduleWidth = container.width();
		var moduleHeight = this.module.getDomContent().parent().height() - this.module.getDomContent().find("h3").outerHeight(true);
		
		container.height(moduleHeight);
		
		if(this.rowNumber == undefined || this.colNumber == undefined)
			return;
			
		if (typeof this.zoomLevelPreset == 'undefined' || !this.zoomLevelPreset) {
			var size;
			if (typeof this.fitFillMode != 'undefined' && this.fitFillMode == "fit")
				size = Math.min(moduleWidth, moduleHeight);
			else if (typeof this.fitFillMode != 'undefined' && this.fitFillMode == "fill")
				size = Math.max(moduleWidth, moduleHeight);
			else return;
			
			this.cellHeight = Math.ceil(size / this.rowNumber);
			this.cellWidth = Math.ceil(size / this.colNumber); 
			this.zoomLevelPreset = true;
		}
	
		this.canvas.width = moduleWidth;
		this.canvas.height = moduleHeight;
		
		this.updateCanvas();
	},
	
	//expects zoomFactor = 1-5
	onZoom: function(zoomFactor) {
		this.cellWidth+=Math.ceil(zoomFactor);
		this.cellHeight+=Math.ceil(zoomFactor);	
		this.zoomLevelPreset = true;
		this.updateCanvas();
	},
	
	update: function() {
		var moduleValue;
		
		if(!(moduleValue = this.module.getDataFromRel('matrix').getData()))
			return;
		
		if(moduleValue.xLabel && moduleValue.yLabel) {
			this.colNumber = moduleValue.value.xLabel.length;
			this.rowNumber = moduleValue.value.yLabel.length;
		} else {
			this.rowNumber = moduleValue.value.data.length;
			this.colNumber = moduleValue.value.data[0].length;
			
		}
		this.dataMatrix = moduleValue.value.data;
				
		/*this._domTitle.innerHTML = "Luc tell me where you want to put the title";//;
		if ( typeof moduleValue.data.title != 'undefined')
			this.module.domHeader.find("div")[0].innerHTML = moduleValue.data.title;
		*/
		this.onResize()
	},
	
	updateCanvas: function() {
		var moduleValue;
		if(!(moduleValue = this.module.getDataFromRel('matrix').getData()))
			return;
	
		this.canvasContext.clearRect(0,0,this.canvas.width, this.canvas.height);
		
		var newWidth = this.cellWidth;
		var newHeight = this.cellHeight;
		
		
		// We only need to trigger re-evaluation of the pixels when the zoom-level has changed.
		// Otherwise, keep the same imagedata, but draw it in another position
		if(newWidth != this.lastCellWidth || newHeight != this.lastCellHeight) {
			
			this.lastCellWidth = newWidth;
			this.lastCellHeight = newHeight;
			
			if(newWidth == 0 || newHeight == 0)
				return;
			
			this.gridImage = this.canvasContext.createImageData(newWidth * this.colNumber, newHeight * this.rowNumber); // Store the image
			for(var i in moduleValue) {
				if(moduleValue[i] != "matrix" || this.gridImage == undefined)
					continue;
				
				//first generate only the visible part of the grid
				this.worker.postMessage({
					gridData: moduleValue.value.data,
					gridImageData: this.gridImage,
					startCol: Math.floor(Math.max(0,(this.gridImage.width)*this.moduleCenterX - this.canvas.width*0.5 )/this.cellWidth),
					startRow: Math.floor(Math.max(0,(this.gridImage.height)*this.moduleCenterY - this.canvas.height*0.5)/this.cellHeight),
					endCol: this.colNumber - Math.ceil(Math.max(0,this.gridImage.width*(1-this.moduleCenterX) - this.canvas.width*0.5 - this.cellWidth)/this.cellWidth),
					endRow: this.rowNumber - Math.ceil(Math.max(0,this.gridImage.height*(1-this.moduleCenterY) - this.canvas.height*0.5 - this.cellHeight)/this.cellHeight),
					cellWidth: this.cellWidth,
					cellHeight: this.cellHeight
				});
				
				//then afterwards generate the whole thing
				this.worker.postMessage({
					gridData: moduleValue.value.data,
					gridImageData: this.gridImage,
					startCol: 0,
					startRow: 0,
					endCol: this.colNumber,
					endRow: this.rowNumber,
					cellWidth: this.cellWidth,
					cellHeight: this.cellHeight
				});
				break;
			}
		} else {
			this.canvasContext.putImageData(this.lastImageData, this.canvas.width*0.5 - (this.lastImageData.width)*this.moduleCenterX,  this.canvas.height*0.5 - (this.lastImageData.height)*this.moduleCenterY);
		}
	},
	
	getDom: function() {
		return this.dom;
	},
	
	// No additional type transform needed
	typeToScreen: {}
}