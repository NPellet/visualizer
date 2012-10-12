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
			

		this.canvas = document.createElement("canvas");
		this.canvasContext = this.canvas.getContext('2d');
		
		this.scaleCanvas = document.createElement("canvas");
		this.scaleCanvasContext = this.scaleCanvas.getContext('2d');
		
		
		this.canvasContainer = $("<div />").addClass('matrix-container');
		this.scaleContainer = $("<div />").addClass('scale-container');
		
		this.dom = $("<div />").addClass('canvasmatrix-container').append(this.canvasContainer.append(this.canvas)).append(this.scaleContainer.append(this.scaleCanvas));
		this.module.getDomContent().html(this.dom);
		
		
		this.squareLoading = 250;
		this.availableZooms = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
		
		this.workers;
		this.buffers = {};
		
		var self = this;
		self.accumulatedDelta = 0;
		$(this.canvasContainer).on('mousewheel', 'canvas', function(e) {
			
			e.preventDefault();
			var delta = e.originalEvent.detail || e.originalEvent.wheelDelta;

			if(self.max && delta > 0 || self.min && delta < 0)
				return;

			self.accumulatedDelta += delta;
			if(delta !== undefined)
				self.changeZoom(self.accumulatedDelta / 1000, (e.offsetX || e.pageX - $(e.target).offset().left), (e.offsetY || e.pageY - $(e.target).offset().top))
		});
		
		
		
		$(this.canvasContainer).drag(function(e1, e2) {
			
			e1.preventDefault();
			var baseShift = self.baseShift;
			var shift = self.getXYShift();
			shift.x = baseShift.x + e2.deltaX;
			shift.y = baseShift.y + e2.deltaY;
			self.doCanvasErase();
			self.doCanvasRedraw();
			self.launchWorkers(true);
		});
		
		$(this.canvasContainer).drag("start",function(e1, e2) {
			e1.preventDefault();
			self.baseShift = $.extend({}, self.getXYShift());
		});
	},
	
	inDom: function() {
		this.canvasContainer.width(this.dom.width() - 55);
		this.onResize(true);
		this.initWorkers();
	},
	
	onResize: function(doNotRedraw) {
		
		// We only care about resizing
		var containerWidth = this.canvasContainer.width(),
	 	    containerHeight = this.canvasContainer.height();
	 	
		this.canvas.width = containerWidth;
		this.canvas.height = containerHeight;

		if(!doNotRedraw)
			this.doCanvasRedraw();
	},
	
	doCanvasErase: function() {
		this.redrawStarted = false;	
		this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	
	doCanvasRedraw: function() {
		
		var bufferIndices = this.getBufferIndices(this.getPxPerCell());
		
		for(var i = bufferIndices.minXIndexBuffer; i <= bufferIndices.maxXIndexBuffer; i++) {
			for(var j = bufferIndices.minYIndexBuffer; j <= bufferIndices.maxXIndexBuffer; j++) {
				this.doCanvasDrawBuffer(i, j);
			}
		}
	},
	
	getBufferIndices: function(pxPerCell) {
		
		var currentPxPerCell = this.getPxPerCell();
		var ratioIndex = currentPxPerCell / pxPerCell;
				var shift = this.getXYShift();
		
		var minXIndex = 0;
		if(shift.x < 0)
			var minXIndex = Math.floor(- shift.x / currentPxPerCell / this.squareLoading);
		
		var minYIndex = 0;
		if(shift.y < 0)
			var minYIndex = Math.floor(- shift.y / currentPxPerCell / this.squareLoading);
		
		var maxXIndex = Math.min(this.canvasNbX / this.squareLoading - 1, (this.canvas.width - shift.x) / pxPerCell / this.squareLoading);//, (this.canvas.width + shift.x) / pxPerCell);
		var maxYIndex = Math.min(this.canvasNbY / this.squareLoading - 1, (this.canvas.height - shift.y) / pxPerCell / this.squareLoading);//, (this.canvas.height + shift.y) / pxPerCell);
		
		var currentIndices = { 
			minXIndexBuffer: minXIndex,  
			minYIndexBuffer: minYIndex, 
		 
			maxXIndexBuffer: Math.ceil(maxXIndex), 
			maxYIndexBuffer: Math.ceil(maxYIndex)
		}; 
		
		if(currentPxPerCell > pxPerCell) {
			
			var ultraMaxX = Math.ceil(this.canvasNbX / this.squareLoading) - 1;
			var ultraMaxY = Math.ceil(this.canvasNbY / this.squareLoading) - 1;
			
			var diff = (currentIndices.maxXIndexBuffer - currentIndices.minXIndexBuffer);
			var diff2 = (currentIndices.maxYIndexBuffer - currentIndices.minYIndexBuffer);
			
			currentIndices.minXIndexBuffer = Math.floor(Math.max(0, currentIndices.minXIndexBuffer - diff * (ratioIndex - 1)));
			currentIndices.maxXIndexBuffer = Math.floor(Math.min(ultraMaxX, currentIndices.maxXIndexBuffer + diff * (ratioIndex - 1) - 1));
			currentIndices.minYIndexBuffer = Math.floor(Math.max(0, currentIndices.minXIndexBuffer - diff2 * (ratioIndex - 1)));
			currentIndices.maxYIndexBuffer = Math.floor(Math.min(ultraMaxY, currentIndices.maxYIndexBuffer + diff2 * (ratioIndex - 1) - 1));
		}
		
		return currentIndices;
		/*
		 else if(currentPxPerCell < pxPerCell) {
			return currentIndices;
		} else
			return currentIndices;
		*/
 
	},
	
	getBufferKey: function(pxPerCell, x, y) {
		return pxPerCell + "-" + x + "-" + y;	
	},
	
	doCanvasDrawBuffer: function(bufferX, bufferY) {
		var shift = this.getXYShift();
		var pxPerCell = this.getPxPerCell();
		var bufferKey = this.getBufferKey(pxPerCell, bufferX, bufferY);
		
		if(!this.buffers[bufferKey])
			return;
			
		this.canvasContext.putImageData(this.buffers[bufferKey], bufferX * this.squareLoading * pxPerCell + shift.x, bufferY * this.squareLoading * pxPerCell + shift.y);
	},
	
	getPxPerCell: function(force) {
		if(this.pxPerCell && !force)
			return this.pxPerCell;
		this.pxPerCell = this.getOriginalPxPerCell();
		this.resetZoomPrefetch(this.pxPerCell);
		return this.pxPerCell;
	},
	
	resetZoomPrefetch: function() {
		
		var currentIndex;
		console.log(this.pxPerCell);
		for(var i = 0; i < this.availableZooms.length; i++) {
			if(this.availableZooms[i] == this.pxPerCell) {
				currentIndex = i;
				break;
			}
		}
		
		var arrBefore = this.availableZooms.slice(currentIndex - 2, currentIndex).reverse();
		var arrAfter = this.availableZooms.slice(currentIndex + 1, currentIndex + 3);
		this.availableZoomsForFetch = [];
		
		for(var i = 0, len = (arrBefore.length + arrAfter.length); i < len; i++) {
			
			if((i % 2 && arrBefore.length > 0) || arrAfter.length == 0)
				this.availableZoomsForFetch.push(arrBefore.shift());
			else
				this.availableZoomsForFetch.push(arrAfter.shift());
		}
	},
	
	getOriginalPxPerCell: function() {
		return this.getClosest(this.availableZooms, Math.max(1, Math.min(this.canvas.width / this.canvasNbX, this.canvas.height / this.canvasNbY)));
	},
	
	getClosest: function(haystack, needle) {
		var closest = false, newClosest;
		for(var i = 0; i < haystack.length; i++) 
			if(!closest || (haystack[i] - needle < 0 && needle - haystack[i] < needle - closest)) 
				closest = haystack[i];
		return closest;
	},
	
	changeZoom: function(diff, mouseX, mouseY) {
		var newPxPerCell = Math.max(1,this.getClosest(this.availableZooms, this.getOriginalPxPerCell() + this.tanh(diff)));
		
		if(this.pxPerCell != newPxPerCell) {
			var zoomRatio = newPxPerCell / this.pxPerCell;
			
			var shift = this.getXYShift();
			
			shift.x = mouseX - (mouseX - shift.x) * zoomRatio;
			shift.y = mouseY - (mouseY - shift.y) * zoomRatio;
			
			this.pxPerCell = newPxPerCell;
			
			if(this.pxPerCell == this.availableZooms[this.availableZooms.length - 1]) {
				this.max = true;
				this.min = false;
			} else if(this.pxPerCell == this.availableZooms[0]) {
				this.min = true;
				this.max = false;
			} else {
				this.min = false;
				this.max = false;
			}

			this.doCanvasErase();
			this.launchWorkers(true);
			this.doCanvasRedraw();
		}
	},
	
	tanh: function(arg) {
		var scaleX = 15;
		arg /= scaleX;
		return this.availableZooms[this.availableZooms.length - 1] * 2.5 * arg;
	},
	
	// Get the XY shift (in case you have zoomed on the canvas)
	// Used to center the canvas on the loading
	
	getXYShift: function() {
		if(this.xyShift)
			return this.xyShift;	
		var pxPerCell = this.getPxPerCell();
		var zoneX = pxPerCell * this.canvasNbX;
		var zoneY = pxPerCell * this.canvasNbY; 
		
		
		return this.xyShift = {x: Math.floor((this.canvas.width - zoneX) / 2), y: Math.floor((this.canvas.height - zoneY) / 2)};
	},
	
	// Here we receive new data, we need to relaunch the workers
	update2: {

		matrix: function(moduleValue) {

			this.doCanvasErase();
			if(!moduleValue)
					return;
			var gridData;
			// Get the new module value
			var moduleValue;	
			this.gridData = moduleValue.value.data;
			this.canvasNbX = this.gridData[0].length;
			this.canvasNbY = this.gridData.length;
			timeStart = Date.now();
			var self = this;

			CI.WebWorker.send('getminmaxmatrix', moduleValue.value.data, function(data) {
				self.minValue = data.min;
				self.maxValue = data.max;
				self.doChangeWorkersData();
				// We can keep the actual workers, not a problem. We just need to erase the buffers array	
				self.buffers = [];
				self.buffersDone = [];
				if(!self.getHighContrast()) {
					self.minValue = 0;
					self.maxValue = 1;
				}
				self.redoScale(self.minValue, self.maxValue);
				self.launchWorkers();
			});			
		}
	},
	
	initWorkers: function() {
		
		//for(var i = 0, len = this.availableZooms.length; i < len; i++) {
		//	if(!this.workers[this.availableZooms[i]])
				this.workers/*[this.availableZooms[i]]*/ = this.initWorker(/*this.availableZooms[i]*/);
	//	}
	},
	
	getCurrentPxPerCellFetch: function() {
		return this.currentPxFetch ? this.currentPxFetch : (this.currentPxFetch = this.getPxPerCell()); 
	},
	
	incrementPxPerCellFetch: function() {
		var next = false;
		return this.currentPxFetch = this.availableZoomsForFetch.shift();
	},
	
	launchWorkers: function(restartAtNormal) {
		
		this.cachedPxPerCell = this.pxPerCell;
		if(restartAtNormal) {
			var pxPerCell = this.getPxPerCell();
			this.resetZoomPrefetch(pxPerCell);
			this.pxPerCell = this.cachedPxPerCell;
			
		} else
			var pxPerCell = this.getCurrentPxPerCellFetch();
		
		//for(var i = 0, len = this.availableZooms.length; i < len; i++)
		if(!this.postNextMessageToWorker(pxPerCell)) {
			if(this.incrementPxPerCellFetch())
				this.launchWorkers();
			else
				return;
		}
	},
	
	//http://localhost:8888/git/visualizer/?viewURL=http%3A//script.epfl.ch/servletScript/JavaScriptServlet%3Faction%3DLoadFile%26filename%3Dlpatiny/data//Demo/Basic/LargeMatrix.view%26key%3DZv1Ib2VDf6&dataURL=http%3A//script.epfl.ch/servletScript/JavaScriptServlet%3Faction%3DLoadFile%26filename%3Dlpatiny/result/2012-07-06/2012-07-06_09-11-38oE4j5XDDPd%26key%3DieGxx34DhR&saveViewURL=http%3A//script.epfl.ch/servletScript/JavaScriptServlet%3Faction%3DSaveFile%26filename%3Dlpatiny/data//Demo/Basic/LargeMatrix.view%26key%3Dh5fKTxoIWD
	
	postNextMessageToWorker: function(pxPerCell) {
		
		var bufferIndices = this.getBufferIndices(pxPerCell);
		
		for(var i = bufferIndices.minXIndexBuffer; i <= bufferIndices.maxXIndexBuffer; i++) {
			for(var j = bufferIndices.minYIndexBuffer; j <= bufferIndices.maxYIndexBuffer; j++) {
				var key = this.getBufferKey(pxPerCell, i, j);
				
				if(typeof this.buffers[key] == "undefined") {
					this.doPostNextMessageToWorker(pxPerCell, i, j);
					return true;
				}
			}
		}
		
		var maxXBuffer = Math.ceil(this.canvasNbX / this.squareLoading) - 1;
		var maxYBuffer = Math.ceil(this.canvasNbY / this.squareLoading) - 1;
		
		return false;
	},
	
	doPostNextMessageToWorker: function(pxPerCell, indexX, indexY) {
		
		if(!this.buffers[this.getBufferKey(pxPerCell, indexX, indexY)]) {
		
			var w = this.squareLoading, 
			    h = this.squareLoading;
			    
			if((indexX + 1) * this.squareLoading > this.canvasNbX)
				w = (this.canvasNbX % this.squareLoading);
				
			if((indexY + 1) * this.squareLoading > this.canvasNbY)
				h = (this.canvasNbY % this.squareLoading);
			
			this.buffers[this.getBufferKey(pxPerCell, indexX, indexY)] = this.canvasContext.createImageData(w * pxPerCell, h * pxPerCell);
		}
			
		this.workers.postMessage({ title: "doPx", message: { pxPerCell: pxPerCell, indexX: indexX, indexY: indexY, buffer: this.buffers[this.getBufferKey(pxPerCell, indexX, indexY)], nbValX: w }})
	},
	
	doChangeWorkersData: function() {

		//for(var i in this.workers)
			this.workers.postMessage({ title: 'changeData', message: { data: this.gridData, min: this.minValue, max: this.maxValue }});
	},
	
	initWorker: function(pxPerCell) {
		
		var worker = new Worker('./scripts/modules/implementations/canvas_matrix/1.2/worker.js');
		worker.postMessage({ title: "init", message: { colors: this.getColors(), squareLoading: this.squareLoading, highcontrast: this.getHighContrast() } });
		
		var self = this;
		worker.addEventListener('message', function(event) {
			
			var data = event.data;
			var pxPerCell = data.pxPerCell;
			var buffIndexX = data.indexX;
			var buffIndexY = data.indexY;
			
			self.buffers[self.getBufferKey(pxPerCell, buffIndexX, buffIndexY)] = data.data;
			if(self.getPxPerCell() == pxPerCell)
				self.doCanvasDrawBuffer(buffIndexX, buffIndexY);
			
			self.launchWorkers();
			//self.postNextMessageToWorker(pxPerCell);
		});
		
		return worker;
	},
	
	getColors: function() {
		return this.colors || (this.colors = this.module.getConfiguration().colors)
	},
	
	getHighContrast: function() {
		return this.highContrast || (this.highContrast = this.module.getConfiguration().highContrast)
	},
	
	redoScale: function(min, max) {
		
		var colors = this.getColors();
		this.scaleCanvas.height = this.scaleContainer.height() - 20;
		this.scaleCanvas.width = 40;
		
		var gradHeight = this.scaleCanvas.height - 30;
		var step = (max - min) / (colors.length - 1);
		var stepPx = gradHeight / (colors.length - 1);
		
		var lineargradient = this.scaleCanvasContext.createLinearGradient(0, 0, 0, gradHeight);
	
		for(var i = 0; i < colors.length; i++) {
			lineargradient.addColorStop(i / (colors.length - 1), colors[i]);
			this.scaleCanvasContext.fillText(Math.round(100 * (i * step + min)) / 100, 5, stepPx * i <= 0 ? 15 : stepPx * i - 5);	
		}  
	
		this.scaleCanvasContext.fillStyle = lineargradient; 
  		this.scaleCanvasContext.fillRect(28, 5, 10, gradHeight);
	},
	
	erase: function() {
		
		this.dom.remove();
		this.highContrast = false;
		this.colors = false;
		
		//for(var i in this.workers)
			this.workers.terminate();
			
		this.workers = [];
		this.buffers = [];
	},
	
		/*
		
		
		
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
			
		this.worker = new Worker('./scripts/modules/implementations/canvas_matrix/1.1/worker.js');
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
			var delta = e.originalEvent.detail || e.originalEvent.wheelDelta;
			var speed;
			// Get normalized wheel speed
			if (typeof (view.zoomMax) == 'undefined') {
				speed = Math.min(Math.abs(delta),3);
			} else {
				view.zoomMax = Math.max(view.zoomMax, Math.abs(delta));
				speed = 3*Math.abs(delta)/view.zoomMax;
			}
			
			if(delta !== undefined)
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
	
	
	onResize: function(width, height, force) {
		
		var container = this.module.getDomContent().find('.canvas-container').each(function() {
			$(this).width($(this).parent().width() - 70);
		});
		
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
			this.cellHeight = Math.floor(size / this.rowNumber);
			this.cellWidth = Math.floor(size / this.colNumber); 
			this.zoomLevelPreset = true;
		}
	
		this.canvas.width = moduleWidth;
		this.canvas.height = moduleHeight;
		
		this.updateCanvas(force);
	},
	
	//expects zoomFactor = 1-5
	onZoom: function(zoomFactor) {
		
		this.cellWidth+=Math.ceil(zoomFactor);
		this.cellHeight+=Math.ceil(zoomFactor);	
		this.zoomLevelPreset = true;
		this.updateCanvas();
	},
	
	update: function() {
		var moduleValue, self = this;
		
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
				
		
		if(!CI.WebWorker.hasWorkerInit('getminmaxmatrix'))
			CI.WebWorker.create('getminmaxmatrix', './scripts/webworker/scripts/getminmaxmatrix.js');
		
		
		if(this.module.getConfiguration().highContrast) {
			CI.WebWorker.send('getminmaxmatrix', moduleValue.value.data, function(data) {
				self.minValue = data.min;
				self.maxValue = data.max;
				self.onResize(false, false, true);
				
				self.redoScale(self.minValue, self.maxValue, self.module.getConfiguration().colors);		
			});
		} else {
			self.onResize(false, false, true);
			self.minValue = 0;
			self.maxValue = 1;
			
			this.redoScale(self.minValue, self.maxValue, this.module.getConfiguration().colors);
		}
	},
	
	updateCanvas: function(force) {
		var moduleValue;
		if(!(moduleValue = this.module.getDataFromRel('matrix').getData()))
			return;
	
		this.canvasContext.clearRect(0,0,this.canvas.width, this.canvas.height);
		
		var newWidth = this.cellWidth;
		var newHeight = this.cellHeight;
		
		// We only need to trigger re-evaluation of the pixels when the zoom-level has changed.
		// Otherwise, keep the same imagedata, but draw it in another position
		if(newWidth != this.lastCellWidth || newHeight != this.lastCellHeight || force) {
			
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
					cellHeight: this.cellHeight,
					colors: this.module.getConfiguration().colors,
					highContrast: this.module.getConfiguration().highContrast || false,
					minValue: this.minValue,
					maxValue: this.maxValue
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
					cellHeight: this.cellHeight,
					colors: this.module.getConfiguration().colors,
					highContrast: this.module.getConfiguration().highContrast || false,
					minValue: this.minValue,
					maxValue: this.maxValue
				});
				
				break;
			}
		} else {
			this.canvasContext.putImageData(this.lastImageData, this.canvas.width*0.5 - (this.lastImageData.width)*this.moduleCenterX,  this.canvas.height*0.5 - (this.lastImageData.height)*this.moduleCenterY);
		}
	},
*/	
	
	getDom: function() {
		return this.dom;
	},
	
	// No additional type transform needed
	typeToScreen: {}
}