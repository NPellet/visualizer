
onMessage = function(event) {
	postMessage(event.data[1](event.data[0]));
}

