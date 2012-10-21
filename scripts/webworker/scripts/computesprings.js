
onmessage = function(event) {
	
	var coords = event.data.message.coords;
	var zoom = event.data.message.zoom;
	
	var distance = 1500 / zoom;
	var distanceY = 25 / zoom;
	var krep = 8 / zoom;//1.9 / this.svg._zoom;
	var kattr = 6 / zoom;

	/*
	var krep = 0.10;
	var kattr = 0.00001;
	*/
	var damping = 0.5;
	var timestep = 0.2;
	var nodeMass = 5000000;
	var l = 0;
	var log = 0;
	var allowBreak;
	var totalEnergy, i, coordsI, coordsJ, j, distX, distY, dist, maxXI, maxXJ, maxYI, maxYJ, minXI, minXJ, minYI, minYJ;
	var dx, dy, s, f, idx, ijy, ij;

	
	while(true) {

		l++;
		if(l > 2000)
			break;
		allowBreak = true;
		totalEnergy = 0;
		
		for(i = coords.length - 1; i >= 0; i--) {

			coordsI = coords[i];
			force = [0, 0];
			distX = (coordsI[0] - coordsI[4]);
			distY = (coordsI[1] - coordsI[5]);

			dist = Math.pow(Math.pow(distX, 2) + Math.pow(distY, 2), 1/2);

			if(dist < coordsI[10]) {
				if(dist == 0) {
					coordsI[0] = coordsI[0] + coordsI[6] * (Math.random() - 0.5);
					coordsI[1] = coordsI[1] + coordsI[6] * (Math.random() - 0.5);
				} else {
					coordsI[0] = (coordsI[0] - coordsI[4]) * (coordsI[8] / dist) + coordsI[4];
					coordsI[1] = (coordsI[1] - coordsI[5]) * (coordsI[8] / dist) + coordsI[5];
				}
				allowBreak = false;
			} else {
				force[0] -= kattr * Math.pow((dist - coordsI[8]), 2) * distX / dist;
				force[1] -= kattr * Math.pow((dist - coordsI[8]), 2) * distY / dist;
			}

			maxYI = coordsI[1] + coordsI[3] * 1.4;
			minYI = coordsI[1] - coordsI[3] * 1.4;

			if(coordsI[0] > coordsI[4]) {
				maxXI = coordsI[0] + coordsI[2] * 1.1;
				minXI = coordsI[0] - coordsI[2] * 0.1;
				ix = coordsI[0] + coordsI[2] / 2;
			} else {
				minXI = coordsI[0] - coordsI[2] * 1.1;
				maxXI = coordsI[0] + coordsI[2] * 0.1;
				ix = coordsI[0] - coordsI[2] / 2;
			}

			for(j = coords.length - 1; j >= 0; j--) {
			
				if(j == i)
					continue;
				coordsJ = coords[j];


				maxYJ = coordsJ[1] + coordsJ[3] * 1.4;
				minYJ = coordsJ[1] - coordsJ[3] * 1.4;

				if(coordsJ[0] > coordsJ[4]) {
					maxXJ = coordsJ[0] + coordsJ[2] * 1.1;
					minXJ = coordsJ[0] - coordsJ[2] * 0.1;
					jx = coordsJ[0] + coordsJ[2] / 2;
				} else {
					minXJ = coordsJ[0] - coordsJ[2] * 1.1;
					maxXJ = coordsJ[0] + coordsJ[2] * 0.1;
					jx = coordsJ[0] - coordsJ[2] / 2;
				}
				
				dx = Math.min(maxXI, maxXJ) - Math.max(minXI, minXJ);
				dy = Math.min(maxYI, maxYJ) - Math.max(minYI, minYJ);
				s = Math.max(dx, 0) * Math.max(dy, 0);
				if(s == 0)
					continue;
				f = s * krep;

				ijx = jx - ix;
				ijy = coordsJ[1] + coordsJ[3] / 2 - coordsI[1] - coordsI[3] / 2;
				ij = Math.pow(ijx * ijx + ijy * ijy, 0.5);
				
				force[0] -= f * ijx / ij / (coordsI[2] * coordsI[3]);
				force[1] -= f * ijy / ij, 0.5 / (coordsI[2] * coordsI[3]);
			}

			coordsI[6] = (coordsI[6] + timestep * force[0]) * damping;
			coordsI[7] = (coordsI[7] + timestep * force[1]) * damping;
			coordsI[0] += timestep * coordsI[6];
			coordsI[1] += timestep * coordsI[7];
			totalEnergy += nodeMass * (Math.pow(coordsI[6], 2) + Math.pow(coordsI[7], 2))
		}

		if(isNaN(totalEnergy))
			break;

		if(allowBreak && totalEnergy < 0)
			break;

	}
	
	postMessage(event.data);
}