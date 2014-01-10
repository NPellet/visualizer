
define(['jquery', 'src/util/lru', 'src/util/debug'], function($, LRU, Debug) {

	var pendings = {};
	Debug.setDebugLevel(0);
	function doByUrl(def, url, force) {
		Debug.log('DataURL: Looking for ' + url + ' by AJAX');
		// Nothing in the DB  -- OR -- force ajax => AJAX
		var dataType = false;
		if(url.indexOf('.json') > -1)
			dataType = 'json';

		return (pendings[url] = $.ajax({
			url: url,
			type: 'get',
			dataType: dataType || '',
			timeout: 120000, // 2 minutes timeout
			success: function(data) {

				Debug.log('DataURL: Found ' + url + ' by AJAX');

				// We set 20 data in memory, 500 in local database
				if(!LRU.exists('urlData')) {
					LRU.create('urlData', 20, 500);
				}
				
				LRU.store('urlData', url, data);

				delete pendings[url];
			}
		}).pipe(function(data) {

			def.resolve(data);
			
		}, function() {
			Debug.log('DataURL: Failing in retrieving ' + url + ' by AJAX.');
			return;
		}));
	}

	function doLRUOrAjax(def, url, force, timeout) {
		// Check in the memory if the url exists


		Debug.log('DataURL: Looking in LRU for ' + url + ' with timeout of ' + timeout + ' seconds');

		return doLRU(def, url).pipe(function(data) {

			Debug.log('DataURL: Found ' + url + ' in local DB. Timout: ' + data.timeout);

			// If timeouted. If no timeout is defined, then the link is assumed permanent
			if(timeout !== undefined && (Date.now() - data.timeout > timeout * 1000)) {
				Debug.log('DataURL: URL is over timeout threshold. Looking by AJAX');
				return doByUrl(def, url).pipe(function(data) { return data }, function() {
					Debug.log('DataURL: Failed in retrieving URL by AJAX. Fallback to cached version');
					def.resolve(data.data);
				});
			}

			Debug.log('DataURL: URL is under timeout threshold. Return cached version');
			
			def.resolve(data.data || data); 
		}, function() {

			Debug.log('DataURL: URL ' + url + ' not found in LRU. Look for AJAX');
			return doByUrl(def, url);
		});
	}

	function doLRU(def, url) {
		Debug.log('DataURL: Looking into LRU for ' + url);
		return LRU.get('urlData', url);
	}

	return {

		get: function(url, force, timeout) {
			var def = $.Deferred();
			var value;

			if(pendings[url])
				return pendings[url];

			if(typeof force == "number") {
				timeout = force;
				force = false;
			} else if(typeof timeout == "object") {
				data = timeout;
				timeout = 0;
				force = false;
			} else if(typeof force == "object") {
				data = force;
				force = false;
			}

			Debug.log('DataURL: getting ' + url + ' with force set to ' + force + ' and timeout to ' + timeout);
			// If we force to do ajax first. Fallback if we 
			if(force)
				doByUrl(def, url, force).pipe(function(data) { return data }, function() {
					// If ajax fails (no internet), go for LRU
					return doLRU(def, url, false).pipe(function(data) {
						def.resolve(data.data);
					});
				});

			// Standard: first LRU, then ajax
			doLRUOrAjax(def, url, force, timeout);
			return def;
		},

		post: function(url, data) {
			return $.ajax({
				url: url,
				timeout: 120000,
				data: data,
				type: 'post',
			});
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

