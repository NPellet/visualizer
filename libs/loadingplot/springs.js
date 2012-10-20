LoadingPlot.SpringLabels = function(svg) {
	this.labels = [];
	this.coords = [];
	this.lines = [];
	this.els = [];

	this.svg = svg;
}

LoadingPlot.SpringLabels.prototype.addElement = function(el, label, line) {
	
}


LoadingPlot.SpringLabels.prototype.resolve = function() {
	
	var coords = this.svg.getElementsForSprings();
	/*
		coords: Array
			0: x 	=> Current x
			1: y 	=> Current y
			2: w 	=> Width
			3: h 	=> Height
			4: x0	=> Initial x
			5: y0	=> Initial y
			6: vx	=> Speed x
			7: vy	=> Speed y
	*/


	var distance = 1500 / this.svg._zoom;
	var distanceY = 25 / this.svg._zoom;
	var krep = 0.2 / this.svg._zoom;;//1.9 / this.svg._zoom;
	var kattr = 6 / this.svg._zoom;

	/*
	var krep = 0.10;
	var kattr = 0.00001;
	*/
	var damping = 0.5;
	var timestep = 2;
	var nodeMass = 5000000;
	var l = 0;
	var log = 0;
	var allowBreak;
	while(true) {

		l++;
		if(l > 200)
			break;
		allowBreak = true;
		var totalEnergy = 0;
		var k = 0;
		for(var i = coords.length - 1; i >= 0; i--) {

			var coordsI = coords[i];

/*
			if(i == 0)
				console.log(coords[i][6]);
*/
			var force = [0, 0];

			var distX = (coords[i][0] - coords[i][4]);
			var distY = (coords[i][1] - coords[i][5]);

			var dist = Math.pow(Math.pow(distX, 2) + Math.pow(distY, 2), 1/2);

			if(dist < coords[i][10]) {
				if(dist == 0) {
					
					coords[i][0] = coords[i][0] + coords[i][6] * (Math.random() - 0.5);
					coords[i][1] = coords[i][1] + coords[i][6] * (Math.random() - 0.5);
				} else {
					coords[i][0] = (coords[i][0] - coords[i][4]) * (coords[i][10] / dist) + coords[i][4];
					coords[i][1] = (coords[i][1] - coords[i][5]) * (coords[i][10] / dist) + coords[i][5];
				}
				allowBreak = false;
			} else {
				force[0] -= kattr * Math.pow((dist - coords[i][10]), 2) * distX / dist;
				force[1] -= kattr * Math.pow((dist - coords[i][10]), 2) * distY / dist;
			}

			var maxYI = coordsI[1] + coordsI[3] * 1.4;
			var minYI = coordsI[1] - coordsI[3] * 1.4;

			if(coords[i][0] > coords[i][4]) {
				var maxXI = coordsI[0] + coordsI[2] * 1.1;
				var minXI = coordsI[0] - coordsI[2] * 0.1;
				var ix = coordsI[0] + coordsI[2] / 2;
			} else {
				var minXI = coordsI[0] - coordsI[2] * 1.1;
				var maxXI = coordsI[0] + coordsI[2] * 0.1;
				var ix = coordsI[0] - coordsI[2] / 2;
			}

			for(var j = coords.length - 1; j >= 0; j--) {
				


				if(j == i)
					continue;
				var coordsJ = coords[j];


				var maxYJ = coordsJ[1] + coordsJ[3] * 1.4;
				var minYJ = coordsJ[1] - coordsJ[3] * 1.4;

				if(coordsJ[0] > coordsJ[4]) {
					var maxXJ = coordsJ[0] + coordsJ[2] * 1.1;
					var minXJ = coordsJ[0] - coordsJ[2] * 0.1;
					var jx = coordsJ[0] + coordsJ[2] / 2;
				} else {
					var minXJ = coordsJ[0] - coordsJ[2] * 1.1;
					var maxXJ = coordsJ[0] + coordsJ[2] * 0.1;
					var jx = coordsJ[0] - coordsJ[2] / 2;
				}
				
				var dx = Math.min(maxXI, maxXJ) - Math.max(minXI, minXJ);
				var dy = Math.min(maxYI, maxYJ) - Math.max(minYI, minYJ);
				var s = Math.max(dx, 0) * Math.max(dy, 0);

				if(coordsI[8].textContent == 'Bearss Lime' && coordsJ[8].textContent == 'Annick Goutal Eau d\'Hadrien')
					console.log(dx, dy, s);


				if(s == 0)
					continue;

				
			

				k++;
				var f = s * krep;

				var ijx = jx - ix;
				var ijy = coordsJ[1] + coordsJ[3] / 2 - coordsI[1] - coordsI[3] / 2;
				var ij = ijx * ijx + ijy * ijy;
				
				force[0] -= f * ijx / Math.pow(ij, 0.5) / (coordsI[2] * coordsI[3]);
				force[1] -= f * ijy / Math.pow(ij, 0.5) / (coordsI[2] * coordsI[3]);
			}

			coords[i][6] = (coords[i][6] + timestep * force[0]) * damping;
			coords[i][7] = (coords[i][7] + timestep * force[1]) * damping;
		//	coords[i][7] = dist;
			coords[i][0] += timestep * coords[i][6];
			coords[i][1] += timestep * coords[i][7]; 
/*			if(i == 0)
console.log(coords[i]);*/
			totalEnergy += nodeMass * (Math.pow(coords[i][6], 2) + Math.pow(coords[i][7], 2))
		}

		if(isNaN(totalEnergy))
			break;

		if(allowBreak && totalEnergy < 0)
			break;

	}

	for(var i = 0; i < coords.length; i++) {

		coords[i][6] = 0;
		coords[i][7] = 0;

		if(!isNaN(coords[i][0])) {
			
			coords[i][8].setAttributeNS(null, 'x', coords[i][0]);
			coords[i][8].setAttributeNS(null, 'y', coords[i][1]);

			
			coords[i][8].setAttributeNS(null, 'text-anchor', (coords[i][0] < coords[i][4]) ? 'end' : 'start');
			coords[i][9].setAttributeNS(null, 'display', 'none');

			coords[i][9].setAttribute('display', 'block');
			coords[i][9].setAttribute('stroke', 'black');
			coords[i][9].setAttribute('vector-effect', 'non-scaling-stroke');
			coords[i][9].setAttribute('x1', coords[i][0]);
			coords[i][9].setAttribute('x2', coords[i][4]);
			coords[i][9].setAttribute('y1', coords[i][1]);
			coords[i][9].setAttribute('y2', coords[i][5]);

		} else {
			console.log('Error');
		}
/*	
		if(this.coords[i][7] < 0.004)
			this.lines[i].setAttributeNS(null, 'display', 'none');
		else {
			this.lines[i].setAttributeNS(null, 'display', 'block');
			this.lines[i].setAttribute('x1', this.coords[i][0]);
			this.lines[i].setAttribute('x2', this.els[i].getX());
			this.lines[i].setAttribute('y1', this.coords[i][1]);
			this.lines[i].setAttribute('y2', this.els[i].getY());
			this.lines[i].setAttribute('stroke', 'black');
			this.lines[i].setAttribute('vector-effect', 'non-scaling-stroke');			
		}*/
	}
}


LoadingPlot.SpringLabels.prototype.allow = function() {
	this.allowed = true;
}


LoadingPlot.SpringLabels.prototype.forbid = function() {
	this.allowed = false;
}