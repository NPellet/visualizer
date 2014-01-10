
onmessage = function(event) {
	
	var message = event.data.message;
	event.data.message = JSON.parse(message);
	postMessage(event.data);
}
