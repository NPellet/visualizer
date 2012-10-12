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

	/*if(!this.allowed)
		return;
*/
	var distance = 5 / this.svg._zoom;
	var distanceY = 25 / this.svg._zoom;
	var krep = 1.9 / this.svg._zoom;
	var kattr = 600 / this.svg._zoom;

	/*
	var krep = 0.10;
	var kattr = 0.00001;
	*/
	var damping = 0.7;
	var timestep = 0.05;
	var nodeMass = 5000000;
	var l = 0;
	var log = 0;
	var allowBreak;

	while(true) {

		l++;
		if(l > 20)
			break;
		allowBreak = true;
		var totalEnergy = 0;
		for(var i = coords.length - 1; i >= 0; i--) {
/*
			if(i == 0)
				console.log(coords[i][6]);
*/
			var force = [0, 0];

			var distX = (coords[i][0] - coords[i][2]);
			var distY = (coords[i][1] - coords[i][3]);

			var dist = Math.pow(Math.pow(distX, 2) + Math.pow(distY, 2), 1/2);

			if(dist < coords[i][6]) {
				if(dist == 0) {
					
					coords[i][0] = coords[i][0] + coords[i][6] * (Math.random() - 0.5);
					coords[i][1] = coords[i][1] + coords[i][6] * (Math.random() - 0.5);
				} else {
					coords[i][0] = (coords[i][0] - coords[i][2]) * (coords[i][6] / dist) + coords[i][2];
					coords[i][1] = (coords[i][1] - coords[i][3]) * (coords[i][6] / dist) + coords[i][3];
				}
				allowBreak = false;
			} else {

				force[0] -= kattr * Math.pow((dist - coords[i][6]), 3) * distX / dist * 2;
				force[1] -= kattr * Math.pow((dist - coords[i][6]), 3) * distY / dist * 10;
			}

			for(var j = coords.length - 1; j >= 0; j--) {
				
				if(j == i)
					continue;
				distX = Math.pow((coords[j][0] - coords[i][0]), 2);
				distY = Math.pow((coords[j][1] - coords[i][1]), 2);
				var dist = Math.pow((distX + distY), 1/2);
				if(dist > distance)
					continue
				force[0] -= krep / (Math.pow(dist, 3)) * (coords[j][0] - coords[i][0]) / dist * 0.2;
				force[1] -= krep / (Math.pow(dist, 3)) * (coords[j][1] - coords[i][1]) / dist * 5;
			}

			coords[i][4] = (coords[i][4] + timestep * force[0]) * damping;
			coords[i][5] = (coords[i][5] + timestep * force[1]) * damping;
		//	coords[i][7] = dist;
			coords[i][0] += timestep * coords[i][4];
			coords[i][1] += timestep * coords[i][5]; 

			totalEnergy += nodeMass * (Math.pow(coords[i][4], 2) + Math.pow(coords[i][5], 2))
		}

		if(isNaN(totalEnergy))
			break;

		console.log(totalEnergy / this.svg._zoom * coords.length);
		if(allowBreak && totalEnergy < 0.000000000001)
			break;
	}

	console.log(totalEnergy);

	for(var i = 0; i < coords.length; i++) {
		
		if(!isNaN(coords[i][0]) && coords[i][7]) {
			
			coords[i][7].setAttributeNS(null, 'x', coords[i][0]);
			coords[i][7].setAttributeNS(null, 'y', coords[i][1]);

			
			coords[i][7].setAttributeNS(null, 'text-anchor', (coords[i][0] < coords[i][2]) ? 'end' : 'start');
			coords[i][8].setAttributeNS(null, 'display', 'none');

			coords[i][8].setAttribute('display', 'block');
			coords[i][8].setAttribute('stroke', 'black');
			coords[i][8].setAttribute('vector-effect', 'non-scaling-stroke');
			coords[i][8].setAttribute('x1', coords[i][0]);
			coords[i][8].setAttribute('x2', coords[i][2]);
			coords[i][8].setAttribute('y1', coords[i][1]);
			coords[i][8].setAttribute('y2', coords[i][3]);
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