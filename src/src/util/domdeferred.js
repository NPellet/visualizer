define(function() {
	var deferred = $.Deferred();
	return {
		notify: function(dom) {
			deferred.notify(dom);
		},
		progress: deferred.progress
	}
});