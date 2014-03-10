if(typeof LoadingPlot == 'undefined') LoadingPlot = {};
LoadingPlot.SpringLabels = function(svg) {
	this.labels = [];
	this.coords = [];
	this.lines = [];
	this.els = [];

	this.svg = svg;
}

LoadingPlot.SpringLabels.prototype.addElement = function(el, label, line) {
	
}


LoadingPlot.SpringLabels.prototype.resolve = function(coords) {
		
		var els = this.svg.getElementsForSprings();

		var coords = els[0];
		var labels = els[1];

		if(typeof CI == "undefined")
			return;

		CI.WebWorker.send('computesprings', {coords: coords, zoom: this.svg._zoom}, function(response) {
			coords = response.coords;

			for(var i = 0; i < coords.length; i++) {

				coords[i][6] = 0;
				coords[i][7] = 0;

				if(!isNaN(coords[i][0])) {
					
					labels[i][0].setAttributeNS(null, 'x', coords[i][0]);
					labels[i][0].setAttributeNS(null, 'y', coords[i][1]);

					labels[i][0].setAttributeNS(null, 'text-anchor', (coords[i][0] < coords[i][4]) ? 'end' : 'start');
					labels[i][1].setAttributeNS(null, 'display', 'none');

					labels[i][1].setAttribute('display', 'block');
					labels[i][1].setAttribute('stroke', 'black');
					labels[i][1].setAttribute('vector-effect', 'non-scaling-stroke');
					labels[i][1].setAttribute('x1', coords[i][0]);
					labels[i][1].setAttribute('x2', coords[i][4]);
					labels[i][1].setAttribute('y1', coords[i][1] - coords[i][3] / 2);
					labels[i][1].setAttribute('y2', coords[i][5]);

				} else {
					console.log('Error');
				}
			}
		});		

	console.timeEnd('Springs');
}


LoadingPlot.SpringLabels.prototype.allow = function() {
	this.allowed = true;
}


LoadingPlot.SpringLabels.prototype.forbid = function() {
	this.allowed = false;
}