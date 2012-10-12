
onmessage = function(event) {
	
	var gridData = event.data.message;
	var minValue = false, maxValue = false;
	for (i=0;i<gridData.length;i++) {
		for (j=0;j<gridData[i].length;j++) {
			if (minValue === false || gridData[i][j]<minValue) minValue=gridData[i][j];
			if (maxValue === false || gridData[i][j]>maxValue) maxValue=gridData[i][j];
		}
	}
		
	event.data.message = { min: minValue, max: maxValue};
	postMessage(event.data);
}
