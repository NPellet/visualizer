if(typeof LoadingPlot == 'undefined') LoadingPlot = {};

LoadingPlot.SVGElement = function() {};
LoadingPlot.SVGElement.prototype = {};


LoadingPlot.SVGElement.prototype.construct = function(svg, x, y, data) {
	this.svg = svg;
	this._x = x, this._y = y, this._data = data;
	this._label, this._line;
	this._visibility = {filter: true, zoom: false, force: false};
	this._fontsize = 12;
	this.highlightMag = 1;
	var self = this;
	this._highlightgroup = this.createElement('g', {'class': 'highlightgroup'}, false, true);
	this._labelVisible = true;
	this._zoomThreshLabel = 1500;
	this.allowLabelScale = false;
	this.highlightEffect = {};
}


LoadingPlot.SVGElement.prototype.createElement = function(nodeName, properties, doNotInclude, single) {

	var node = document.createElementNS('http://www.w3.org/2000/svg', nodeName);
	for(var i in properties) {
		node.setAttributeNS(null, i, properties[i]);
	}
	this._nodes = this._nodes || [];
	
	if(!doNotInclude) {
		if(!single)
			this._highlightgroup.appendChild(node);
		else
			this._nodes.push(node);
	}
	return node;
}


/*
		coords: Array
			0: x 	=> Current x
			1: y 	=> Current y
			2: w 	=> Width
			3: h 	=> Height
			4: x0	=> Initial x
			6: y0	=> Initial y
			7: vx	=> Speed x
			8: vy	=> Speed y
	*/


LoadingPlot.SVGElement.prototype.setLabelDisplayThreshold = function(val) {
	this._zoomThreshLabel = parseFloat(val);
	this.changeZoom();
}

LoadingPlot.SVGElement.prototype.setLabelStroke = function(bln) {
	this._labelStroke = bln;

	if(this._label && this._labelStroke) {
		this._label.setAttributeNS(null, 'stroke', 'black');
		this._label.setAttributeNS(null, 'stroke-width', 1 / this.svg._zoom);
	//	this._label.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');
	}
}

LoadingPlot.SVGElement.prototype.allowLabelDisplay = function(bln) {
	this.allowLabelDisplay = bln;
}

LoadingPlot.SVGElement.prototype.setLabelScale = function(bln) {
	this.allowLabelScale = bln;
}

LoadingPlot.SVGElement.prototype.setHighlightMag = function(mag) {
	this.highlightMag = mag;
}


LoadingPlot.SVGElement.prototype.setHighlightEffect = function(effect) {
	this.highlightEffect = effect;
}



LoadingPlot.SVGElement.prototype.labelVisibility = function() {

	if((this._visibility.filter && this._visibility.zoom) || this._visibility.force) {
		
		if(!this._labelVisible) {

			if(this._line)
				this._line.setAttributeNS(null, 'display', 'block');

			if(this._label) {
				this._label.setAttributeNS(null, 'pointer-events', 'none');
				this._label.setAttributeNS(null, 'display', 'block');
				this._labelVisible = true;
			}
		}

		
		this._label.setAttributeNS(null, 'stroke-width', 1 / this.svg._zoom);
		this._label.setAttributeNS(null, 'font-size', this._fontsize / ((!this.allowLabelScale) ? this.svg._zoom : this.svg._izoom));

	} else {
		
		if(this._labelVisible) {
			
			if(this._label) {
				this._labelVisible = false;
				this._label.setAttributeNS(null, 'display', 'none');
			}
			if(this._line)
				this._line.setAttributeNS(null, 'display', 'none');
			
		}
	}
}

LoadingPlot.SVGElement.prototype.isLabelVisible = function() {
	return this._labelVisible;
}

LoadingPlot.SVGElement.prototype.doDisplayLabel = function(bln) {
	this._visibility.zoom = bln;
	this.labelVisibility();
}

LoadingPlot.SVGElement.prototype.forceField = function(bln) {
	this._forceField = bln;
}

LoadingPlot.SVGElement.prototype.setLabelSize = function(fontsize) {
	if(this._label)
		this._label.setAttributeNS(null, 'font-size', fontsize / this.svg._zoom);
	this._fontsize = fontsize;
}

LoadingPlot.SVGElement.prototype.createLabel = function(x, y, labelTxt) {
	var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	label.textContent = labelTxt;
	label.setAttributeNS(null, 'x', x);
	label.setAttributeNS(null, 'y', y);
//	label.setAttributeNS(null, 'font-size', this._fontsize / this.svg._izoom);
	label.setAttributeNS(null, 'fill', this._lc || this._data.lc || 'black');
	//label.setAttributeNS(null, 'transform', 'translate(' + this._x + ' ' + this._y + ') scale(' + (this.svg._izoom / this.svg._zoom) + ') translate(-' + this._x + ' -' + this._y + ')');
	//this._nodes.push(label);

	this.labelVisibility();
	this._label = label;
	return label;
}

LoadingPlot.SVGElement.prototype.getX = function() {
	return this._x;
}

LoadingPlot.SVGElement.prototype.getY = function() {
	return this._y;
}

LoadingPlot.SVGElement.prototype.changeZoom = function() {};
LoadingPlot.SVGElement.prototype.inDom = function() {};

LoadingPlot.SVGElement.prototype.mouseover = function() {
	//this.highlight(true);

	require(['util/api'], function(API) {
		API.highlight(this._data._highlight, 1);	
	});
	
	if(this.hoverCallback)
		this.hoverCallback.call(this);
}

LoadingPlot.SVGElement.prototype.mouseout = function() {
	//this.highlight(false);
	
	require(['util/api'], function(API) {
		API.highlight(this._data._highlight, 0);
	});
}



LoadingPlot.SVGElement.prototype.doLine = function() {
	var el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	this._line = el;
	this._nodes.push(el);
	return el;
}

LoadingPlot.SVGElement.prototype.writeLabel = function() {

	if(this._data.l) {
		label = this.createLabel(this._x, this._y, this._data.l);
		this.doLine();
	}
}

LoadingPlot.SVGElement.prototype.setColor = function(color) {
	this._color = color;
	this._a.setAttributeNS(null, 'fill', color);
	this._b.setAttributeNS(null, 'stroke', color);
}

LoadingPlot.SVGElement.prototype.highlight = function(bln) {
	//this._currentEl.setAttributeNS(null, 'class', 'nothighlight');
	

	var elementInDocument = function(element) {
	    while (element = element.parentNode) {
	        if (element == document) {
	            return true;
	        }
	    }
	    return false;
	}
	
	if(bln) {
		this._highlightgroup.setAttributeNS(null, 'transform', 'translate(' + this._x + ', ' + this._y + ') scale(' + this.highlightMag + ') translate(' + (-this._x) + ', ' + (-this._y) + ')');
		this._visibility.force = true;
		this.labelVisibility();
		this._label.setAttributeNS(null, 'font-size', this._fontsize * this.highlightMag / this.svg._zoom);
	} else {
		this._highlightgroup.removeAttributeNS(null, 'transform');
		this._visibility.force = false;
		this.labelVisibility();
		this._label.setAttributeNS(null, 'font-size', this._fontsize / this.svg._zoom);
	}

	if(this.implHighlight)
		this.implHighlight(bln);

	this.svg.timeSpringUpdate(200);
}



LoadingPlot.Ellipse = function(svg, x, y, data) {
	
	this.construct(svg,x,y,data);
	this._displayed = true;
	this._labelVisible = true;

	this.g = this.createElement('g');
	this._a = this.createElement('circle', {cx: 0, cy: 0, r: 1, fill: data.c, opacity: data.o, transform: 'translate(' + x + ' ' + y + ') rotate( ' + data.a + ') scale(' + data.w + ' ' + data.h + ')'}, false);
	this._b = this.createElement('circle', {cx: 0, cy: 0, r: 1, fill: 'transparent', stroke: data.c, 'vector-effect': 'non-scaling-stroke', transform: 'translate(' + x + ' ' + y + ') rotate( ' + data.a + ') scale(' + data.w + ' ' + data.h + ')'}, false);

	this.g.appendChild(this._a);
	this.g.appendChild(this._b);

	this.writeLabel();
	this.changeZoom();
	this._data = data;
}

$.extend(LoadingPlot.Ellipse.prototype, LoadingPlot.SVGElement.prototype);
LoadingPlot.Ellipse.prototype.filter = function(filter) {
	if(filter[this._data.n] !== undefined) {
		this._a.setAttributeNS(null, 'display', (filter[this._data.n] ? 'block' : 'none'));
		this._b.setAttributeNS(null, 'display', (filter[this._data.n] ? 'block' : 'none'));
		this._visibility.filter = !!filter[this._data.n];
		this.labelVisibility();
	}
}

LoadingPlot.Ellipse.prototype.getOptimalSpringParameter = function() {
	return Math.max(this._data.w, this._data.h) * 1.2;
}

LoadingPlot.Ellipse.prototype.inDom = function() {
	this._highlightgroup.setAttributeNS(null, 'data-id', this.id);
}

LoadingPlot.Ellipse.prototype.changeZoom = function() {
	
	this.doDisplayLabel(this.svg._zoom >= this._zoomThreshLabel);
}

LoadingPlot.Ellipse.prototype.implHighlight = function(bln) {

	if(this.highlightEffect.yStroke) {
		if(bln) {
			this._b.setAttributeNS(null, 'stroke', 'yellow');
			this._b.setAttributeNS(null, 'stroke-width', '5px');
		} else {
			this._b.setAttributeNS(null, 'stroke', this._data.c);
			this._b.setAttributeNS(null, 'stroke-width', '1px');
		}
	}

}

LoadingPlot.Ellipse.prototype.getCoordsSprings = function(coords) {
	if(!this._forceField)
		return;

	if(!this._labelSpringEl) {
		var buff = new ArrayBuffer(36);
		this._labelSpringEl = new Float32Array(buff);
		this._labelSpringEl[0] = this._x + Math.max(this._data.w, this._data.h) * 1.2;
		this._labelSpringEl[1] = this._y;
		this._labelSpringEl[2] = 0;
		this._labelSpringEl[3] = this._fontsize / this.svg._zoom;
		this._labelSpringEl[4] = this._x;
		this._labelSpringEl[5] = this._y;
		this._labelSpringEl[6] = 0;
		this._labelSpringEl[7] = 0;
	}
	
	if(this.isLabelVisible() && this._label) {

		if(isNaN(this._labelSpringEl[0]) || isNaN(this._labelSpringEl[1])) {
			this._labelSpringEl[0] = this._x + Math.max(this._data.w, this._data.h) * 1.2;
			this._labelSpringEl[1] = this._y;
		}

		this._labelSpringEl[2] = this._label.getComputedTextLength();
		this._labelSpringEl[3] = this._fontsize /  this.svg._zoom;
		this._labelSpringEl[8] = this.getOptimalSpringParameter();
		coords.push(this._labelSpringEl);
		return [this._label, this._line];
	}
}









LoadingPlot.Image = function(svg, x, y, data) {
	
	this.construct(svg,x,y,data);
	this._displayed = true;
	this._labelVisible = true;

	this.g = this.createElement('g');
	this._i = this.createElement('image', {x: 0, y: 0, width: 1, height: 1, transform: 'translate(' + x + ' ' + y + ') rotate( ' + data.a + ') scale(' + data.w + ' ' + data.h + ')'}, false, false);

	this.g.appendChild(this._i);

	this.writeLabel();
	this.changeZoom();
	this._data = data;
}

$.extend(LoadingPlot.Image.prototype, LoadingPlot.SVGElement.prototype);
LoadingPlot.Image.prototype.filter = function(filter) {
	if(filter[this._data.n] !== undefined) {
		this._i.setAttributeNS(null, 'display', (filter[this._data.n] ? 'block' : 'none'));
		this._visibility.filter = !!filter[this._data.n];
		this.labelVisibility();
	}
}

LoadingPlot.Image.prototype.getOptimalSpringParameter = function() {
	return Math.max(this._data.w, this._data.h) * 1.2;
}

LoadingPlot.Image.prototype.inDom = function() {
	this._highlightgroup.setAttributeNS(null, 'data-id', this.id);

	this._i.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this._data.iu);
}

LoadingPlot.Image.prototype.changeZoom = function() {
	
	this.doDisplayLabel(this.svg._zoom >= this._zoomThreshLabel);
}

LoadingPlot.Image.prototype.implHighlight = function(bln) {


}

LoadingPlot.Image.prototype.getCoordsSprings = function(coords) {
	if(!this._forceField)
		return;

	if(!this._labelSpringEl) {
		var buff = new ArrayBuffer(36);
		this._labelSpringEl = new Float32Array(buff);
		this._labelSpringEl[0] = this._x + Math.max(this._data.w, this._data.h) * 1.2;
		this._labelSpringEl[1] = this._y;
		this._labelSpringEl[2] = 0;
		this._labelSpringEl[3] = this._fontsize / this.svg._zoom;
		this._labelSpringEl[4] = this._x;
		this._labelSpringEl[5] = this._y;
		this._labelSpringEl[6] = 0;
		this._labelSpringEl[7] = 0;
	}
	
	if(this.isLabelVisible() && this._label) {

		if(isNaN(this._labelSpringEl[0]) || isNaN(this._labelSpringEl[1])) {
			this._labelSpringEl[0] = this._x + Math.max(this._data.w, this._data.h) * 1.2;
			this._labelSpringEl[1] = this._y;
		}

		this._labelSpringEl[2] = this._label.getComputedTextLength();
		this._labelSpringEl[3] = this._fontsize /  this.svg._zoom;
		this._labelSpringEl[8] = this.getOptimalSpringParameter();
		coords.push(this._labelSpringEl);
		return [this._label, this._line];
	}
}








LoadingPlot.Pie = function(svg,x, y, data) {
	this.construct(svg,x,y,data);
	this.pieElements = [];
	this._chart = data.chart;
	
	this._displayed = true;
	this._failure = {};

	this.charthashmap = {};
	this._rmin = 1;
	this._rzoom0 = 3;
	this._rthresh = 10;
	this._rmaxpie = 30;
	this._circleSlope = (this._rzoom0 - this._rmin) / this.svg._izoom;
	this._zoomThresh = (this._rthresh - this._rzoom0) / this._circleSlope;
	this._lastAngle = 0;

	this._circle = this.createElement('circle', {fill: data.c, stroke: 'black', 'vector-effect': 'non-scaling-stroke', cx: this._x, cy: this._y, r: 10 / 1000});
	this._g = this.createElement('g', {'transform': 'translate(' + this._x + ', ' + this._y + ')'})	
	
	this.writeLabel();
	this.changeZoom(this.svg._izoom);
}


$.extend(LoadingPlot.Pie.prototype, LoadingPlot.SVGElement.prototype);

LoadingPlot.Pie.prototype.inDom = function() {

	if(!this._chart)
		return;

	this._highlightgroup.setAttributeNS(null, 'data-id', this.id);

	for(var i = 0; i < this._chart.length; i++) {

		this.charthashmap[this._chart[i].n] = this._chart[i].v;
		var el = this.createElement('path', {fill: this._chart[i].c, stroke: 'black', 'stroke-width': 1, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke'}, false);
		this._g.appendChild(el);
		this.pieElements.push(el);
	}
	this.drawPie();
}


LoadingPlot.Pie.prototype.getPiePart = function(element) {
	var newAngle = - 2 * Math.PI * element.v,
		radius = 1, x0, y0, x1, y1;
	x0 = Math.cos(this._lastAngle) * radius,
	y0 = Math.sin(this._lastAngle) * radius,	
	this._lastAngle += newAngle;
	x1 = Math.cos(this._lastAngle) * radius - x0,
	y1 = Math.sin(this._lastAngle) * radius - y0;

	return 'M 0, 0 l ' + x0 + ' ' + y0 + ' a ' + radius + ', ' + radius  + ' 0 ' + (element.v > 0.5 ? 1 : 0) + ', 0 ' + x1 + ', ' + y1 + ' z';
}

LoadingPlot.Pie.prototype.drawPie = function() {
	for(var i = 0, l = this.pieElements.length; i < l; i++)
		this.pieElements[i].setAttributeNS(null, 'd', this.getPiePart(this._data.chart[i]));
}

LoadingPlot.Pie.prototype.setPieVisibility = function(bln) {
	this._pieVisible = bln;
	if(this._displayed)
		this._g.setAttributeNS(null, 'display', bln ? 'block' : 'none');
		
}

LoadingPlot.Pie.prototype.setCircleVisibility = function(bln) {
	if(this._displayed)
		this._circle.setAttributeNS(null, 'display', bln ? 'block' : 'none');

}


LoadingPlot.Pie.prototype.changeZoom = function() {
	var zoom = this.svg._zoom;

	if(zoom < this._zoomThresh) {
		this.setPieVisibility(false);
		this.setCircleVisibility(true);
		this._pieradius = false;
		this._currentEl = this._circle;
		this._circleradius = this._rmin + (this._circleSlope * zoom);
		this._lastRadius = this._circleradius / zoom;
		

	} else {
		if(!this._pieVisible) {
			this.setPieVisibility(true);
			this.setCircleVisibility(false);
		}
		var rad = this._rmin + (this._circleSlope * zoom);
		if(rad > this._rmaxpie)
			rad = this._rmaxpie;
		this._lastRadius = rad / zoom;
		this._g.setAttributeNS(null, 'transform', 'translate(' + this._x + ' ' + this._y +') scale(' + this._lastRadius + ')');	
		this._currentEl = this._g;
	}
	this._circle.setAttributeNS(null, 'r', this._lastRadius);	
	this.doDisplayLabel(zoom >= this._zoomThreshLabel);
}

LoadingPlot.Pie.prototype.getOptimalSpringParameter = function() {
	return this._lastRadius * 1.5;
}
	
LoadingPlot.Pie.prototype.getCoordsSprings = function(coords) {
if(!this._forceField)
		return;

	if(!this._labelSpringEl) {
		var buff = new ArrayBuffer(36);
		this._labelSpringEl = new Float32Array(buff);
		this._labelSpringEl[0] = this._x + Math.max(this._data.w, this._data.h) * 1.2;
		this._labelSpringEl[1] = this._y;
		this._labelSpringEl[2] = 0;
		this._labelSpringEl[3] = 0;
		this._labelSpringEl[4] = this._x;
		this._labelSpringEl[5] = this._y;
		this._labelSpringEl[6] = 0;
		this._labelSpringEl[7] = 0;
	}
	
	if(this.isLabelVisible() && this._label) {
		this._labelSpringEl[2] = this._label.getComputedTextLength();
		this._labelSpringEl[3] = this._fontsize /  this.svg._zoom;
		this._labelSpringEl[8] = this.getOptimalSpringParameter();
		coords.push(this._labelSpringEl);
		return [this._label, this._line];
	}
}


LoadingPlot.Pie.prototype.filter = function(filter) {
	var val = 0;
	for(var i in filter) {
		if(this.charthashmap[i] !== undefined)
			val = this.charthashmap[i];

		var inside = (val >= filter[i][0] && val <= filter[i][1]);
		if(!inside)
			this._failure[i] = true;
		
		if(this._displayed && !inside) {

			this._currentEl.setAttributeNS(null, 'display', 'none');
			this._displayed = false;

			this._visibility.filter = false;
			this.labelVisibility();
			
		} else if(!this._displayed && this._failure[i] && inside) {
			
			this._failure[i] = false;
			for(var j in this._failure)
				if(this._failure[j] === true)
					return;
			this._displayed = true;
			this._currentEl.setAttributeNS(null, 'display', 'block');

			this._visibility.filter = true;
			this.labelVisibility();
		}
	}
}

LoadingPlot.Pie.prototype.implHighlight = function(bln) {


	if(this.highlightEffect.yStroke) {
		if(bln) {
			this._circle.setAttributeNS(null, 'stroke', 'yellow');
			this._circle.setAttributeNS(null, 'stroke-width', '7px');
			this._circle.setAttributeNS(null, 'display', 'block');
		} else {
			this._circle.setAttributeNS(null, 'stroke', 'black');
			this._circle.setAttributeNS(null, 'stroke-width', '1px');

			if(this._currentEl != this._circle)
				this._circle.setAttributeNS(null, 'display', 'none');
		}
	}
}

