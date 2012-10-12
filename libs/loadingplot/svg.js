
if(typeof LoadingPlot == 'undefined') LoadingPlot = {};

LoadingPlot.SVG = function(width, height, viewWidth, viewHeight) {
	this._nameSpace = 'http://www.w3.org/2000/svg';
	this._px = new String('px');
	this.create(width, height, viewWidth, viewHeight);
	this.zonesDone = [];
}

LoadingPlot.SVG.prototype = {};
LoadingPlot.SVG.prototype.create = function() {
	var self = this;

	this._els = [];
	this._viewBox = [];
	this._svgEl = document.createElementNS(this._nameSpace, 'svg');
	this._svgEl.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	this._svgEl.setAttribute('draggable', 'true');
	this._svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

	this._groupElements = document.createElementNS(this._nameSpace, 'g');
	this._svgEl.appendChild(this._groupElements);

	this._groupLabels = document.createElementNS(this._nameSpace, 'g');
	this._svgEl.appendChild(this._groupLabels);


	$(this._svgEl).on('mouseover', '.highlightgroup', function() {
		var id = $(this).data('id');
		self._els[id].mouseover();
	}).on('mouseout', '.highlightgroup', function() {
		var id = $(this).data('id');
		self._els[id].mouseout();
	});

	this.deltaZoom(0, 0, 0);
	this._setEvents();
}

LoadingPlot.SVG.prototype.setViewBoxWidth = function(w, h) {
	this._viewWidth = w;
	this._viewHeight = h;
	this._viewBox = [0, 0, this._viewWidth, this._viewHeight];
	this.zones = [];

	this.initZoom();
}



LoadingPlot.SVG.prototype.setSize = function(width, height) {

	this._width = width;
	this._height = height;

	this._svgEl.setAttribute('width', width + this._px);
	this._svgEl.setAttribute('height', height + this._px);


	this.initZoom();
}

LoadingPlot.SVG.prototype.initZoom = function() {
	if(!this._viewBox[2])
		return;

	var rX = this._width / this._viewBox[2];
	var rY = this._height / this._viewBox[3];

	var zoom = Math.min(rY, rX);
	this._zoom = zoom;
	this._izoom = zoom;
	this._zoomMode = zoom == rY ? 'y' : 'x';
}

LoadingPlot.SVG.prototype.bindTo = function(dom) {
	this._wrapper = dom;
}

LoadingPlot.SVG.prototype.ready = function() {
	$(this._wrapper).append(this._svgEl);
	this.setViewBox();
	var pos = $(this._svgEl).offset();
	
	
	this._svgPosX = pos.left;
	this._svgPosY = pos.top;

}

LoadingPlot.SVG.prototype._setEvents = function() {
	var self = this;
	$(this._svgEl).mousewheel(function(event, delta) {		
		self.deltaZoom(event.pageX - self._svgPosX, event.pageY - self._svgPosY, delta);
		return false;
	});
	this._svgEl.addEventListener('mousedown', function(event) {
		self._dragStart(event);
	});
	this._svgEl.addEventListener('mouseup', function(event) {
		self._dragStop(event);
	});
	this._svgEl.addEventListener('mousemove', function(event) {
		viewRatioX = (event.pageX - self._svgPosX) / self._width;
		viewRatioY = (event.pageY - self._svgPosY) / self._height;
		self._dragMove(event);
	});
}


LoadingPlot.SVG.prototype._dragStart = function(event) {
	this._dragging = true;
	this._dragX = event.pageX;
	this._dragY = event.pageY;
	return;
}


LoadingPlot.SVG.prototype._dragMove = function(event) {

	if(!this._dragging)
		return;

	var newX = event.pageX, diffX = (newX - this._dragX);
	var newY = event.pageY, diffY = (newY - this._dragY);

	var ratioX = diffX / this._width, ratioY = diffY / this._height;
	var diffXViewbox = ratioX * this._viewBox[2];
	var diffYViewbox = ratioY * this._viewBox[3];

	this._viewBox[0] -= diffXViewbox;
	this._viewBox[1] -= diffYViewbox;
	this._dragX = newX, this._dragY = newY;
	this.setViewBox();
	this.doZones();
}

LoadingPlot.SVG.prototype._dragStop = function() {
	this._dragging = false;
}

LoadingPlot.SVG.prototype.deltaZoom = function(x, y, delta) {
	var self = this;
	if(!this._currentDelta) {
		this._currentDelta = 0;
		this._accumulatedDelta = 0;
	}
	if(delta == 0)
		return;
	

	var parent = this._svgEl.parentNode;
	this._currentDelta += delta;
	var boxWidthX = this._viewWidth * Math.pow(2, this._currentDelta);
	var boxWidthY = this._viewHeight * Math.pow(2, this._currentDelta);
	this._viewBox[0] -= viewRatioX * (boxWidthX - this._viewBox[2]);
	this._viewBox[1] -= viewRatioY * (boxWidthY - this._viewBox[3]);
	this._viewBox[2] = boxWidthX;
	this._viewBox[3] = boxWidthY;
	this.setViewBox();

	this._zoom = (this._zoomMode == 'y') ? this._height / this._viewBox[3] : this._width / this._viewBox[2];
	this.changeZoomElements(this._zoom);

	window.clearTimeout(this._timeoutZoom);
	this._timeoutZoom = window.setTimeout(function() {
		LoadingPlot.SVGElement.prototype.Springs.resolve();
	}, 200);
	//parent.appendChild(this._svgEl);
}

LoadingPlot.SVG.prototype.setViewBox = function(x1, y1, x2, y2) {
	if(x1 && x2 && y1 && y2)
		this._viewBox = [x1, y1, x2, y2];
	this._svgEl.setAttributeNS(null, 'viewBox', this._viewBox.join(' '));
}

LoadingPlot.SVG.prototype.doZones = function() {

	var minX = Math.floor(20 * this._viewBox[0] / this._viewWidth) - 2;
	var minY = Math.floor(20 * this._viewBox[1] / this._viewHeight) - 2;
	var nbX = Math.ceil(20 * this._viewBox[2] / this._viewWidth) + 2;
	var nbY = Math.ceil(20 * this._viewBox[3] / this._viewWidth) + 2;

	this._zoneMinX = minX; this._zoneMinY = minY; this._zoneNbX = nbX; this._zoneNbY = nbY;

	for(var i = 0; i <= nbX; i++) {
		for(var j = 0; j <= nbY; j++) {
			var index = (i + minX) * 1000 + j + minY;
			if(this.zonesDone[index])
				continue;
			if(this.zones[i + minX] && this.zones[i + minX][j + minY])
				for(var k = 0; k < this.zones[i + minX][j + minY].length; k++)		
					this.zones[i + minX][j + minY][k].changeZoom(this._zoom);
			this.zonesDone[index] = true;
		}
	}
}

LoadingPlot.SVG.prototype.changeZoomElements = function(newZoom) {
//	console.time('1');
/*	var parent = this._groupLabels.parentNode;
	var next = this._groupLabels.nextSibling;
	parent.removeChild(this._groupLabels);*/
	this._zoom = newZoom;
	this.zonesDone = [];
	this.doZones();



/*
	if(next)
		parent.insertBefore(this._groupLabels, nextSibling);
	else
		parent.appendChild(this._groupLabels);
*/
//	console.timeEnd('1');
}

LoadingPlot.SVG.prototype.add = function(el) {
	this._els.push(el);
	var _x = el.getX(), _y = el.getY();
	
	var indexX = Math.floor(20 * _x / this._viewWidth);
	var indexY = Math.floor(20 * _y / this._viewHeight);

	this.zones[indexX] = this.zones[indexX] || [];
	this.zones[indexX][indexY] = this.zones[indexX][indexY] || [];
	this.zones[indexX][indexY].push(el);

	el.id = this._els.length - 1;
	el.zoneIndexX = indexX;
	el.zoneIndexY = indexY;

	if(!el._nodes)
		return;
	for(var i in el._nodes)	
		this._groupElements.appendChild(el._nodes[i]);

	if(el._label)
		this._groupLabels.appendChild(el._label);
	el.inDom();
}


LoadingPlot.SVG.prototype.getElementsForSprings = function() {

	//console.log(this._zoneMinX, this._zoneMinY, this._zoneNbX, this._zoneNbY)
	var coords = [];
	for(var i = 0; i <= this._zoneNbX; i++) {
		for(var j = 0; j <= this._zoneNbY; j++) {
			if(this.zones[i + this._zoneMinX] && this.zones[i + this._zoneMinX][j + this._zoneMinY])
				for(var k = 0; k < this.zones[i + this._zoneMinX][j + this._zoneMinY].length; k++)		
					this.zones[i + this._zoneMinX][j + this._zoneMinY][k].getCoordsSprings(coords);
		}
	}

	return coords;
}