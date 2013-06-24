
define(['jquery', 'util/lru'], function($, LRU) {

	var pendings = {};

	return {

		get: function(url, ajaxType) {
			var def = $.Deferred();
			var value;
			if(pendings[url])
				return pendings[url];

			// Check in the memory if the url exists
			return (LRU.get('urlData', url).pipe(function(data) {
				
				return data; 
			}, function() {

				// Nothing in the DB => AJAX
				return (pendings[url] = $.ajax({
					url: url,
					type: 'get',
					timeout: 120000, // 2 minutes timeout
					success: function(data) {
						// We set 20 data in memory, 500 in local database
						if(!LRU.exists('urlData'))
							LRU.create('urlData', 20, 500);
						LRU.store('urlData', url, data);

						delete pendings[url];
					}
				}).pipe(function(data) {
					return data;
				}));
			}));
		},

		emptyMemory: function() {
			LRU.empty('urlData', true, false);
		},

		emptyDB: function() {
			LRU.empty('urlData', false, true);
		},

		emptyAll: function() {
			LRU.empty('urlData', true, true);
		}
	}
});

