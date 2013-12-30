
var stringTarget = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus porta bibendum suscipit. Fusce at egestas lorem, et scelerisque odio. Phasellus sit amet neque vel magna aliquam pellentesque nec eget mauris. Morbi eu nulla eget quam posuere semper. Integer ut vulputate enim, eget tincidunt sapien. Aenean volutpat augue quis justo dictum, pulvinar laoreet justo egestas. Mauris ligula quam, consequat non ipsum eget, porta molestie erat. Curabitur tristique aliquam lobortis. Maecenas urna purus, lobortis id quam sit amet, vehicula aliquam orci. Proin vel mattis ipsum, sed molestie magna. Pellentesque quis ante sed felis aliquet iaculis at rutrum nulla. Ut ut magna vestibulum.';
var index = 0;

function setTimeoutWorker() {
	setTimeout( function() {
		index++;

		postMessage( { method: 'setVar', variables: { 'testString': stringTarget.substring( 0, index ) } } )
		
		if( index < stringTarget.length) {
			setTimeoutWorker();
		} else {
			postMessage( { method: 'terminate' } );
		}

	}, Math.round( Math.random() * 200));
}

setTimeoutWorker();