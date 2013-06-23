define(['jquery'], function() {

	var baseurl = '';

	icon = function() { }
	icon.prototype = {
		setBaseUrl: function(url) {
			baseurl = url;
		}
	}

	return icon;
});