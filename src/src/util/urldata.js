
define(['jquery', 'src/util/lru', 'src/util/debug'], function($, LRU, Debug) {
	"use strict";

	var pendings = {};
	
	function doByUrl(def, url, headers) {
		Debug.debug('DataURL: Looking for ' + url + ' by AJAX');
		// Nothing in the DB  -- OR -- force ajax => AJAX
		var dataType = false;
		if( url.indexOf('.json') > -1 ) {
			dataType = 'json';
		}

		return (pendings[url] = $.ajax({
			url: url,
			type: 'get',
			dataType: dataType || '',
			timeout: 120000, // 2 minutes timeout
			headers: headers || {},
			success: function(data) {

				Debug.info('DataURL: Found ' + url + ' by AJAX');

				// We set 20 data in memory, 500 in local database
				if(!LRU.exists('urlData')) {
					LRU.create('urlData', 20, 500);
				}
				
				LRU.store('urlData', url, data);

				delete pendings[url];
			}
		}).then(function(data) {

			def.resolve(data);
			
		}, function() {
			Debug.info('DataURL: Failing in retrieving ' + url + ' by AJAX.');
			return;
		}));
	}

	function doLRUOrAjax(def, url, force, timeout, headers) {
		// Check in the memory if the url exists

		Debug.debug('DataURL: Looking in LRU for ' + url + ' with timeout of ' + timeout + ' seconds');

		return doLRU(def, url).pipe(function(data) {

			Debug.debug('DataURL: Found ' + url + ' in local DB. Timeout: ' + data.timeout);

			// If timeouted. If no timeout is defined, then the link is assumed permanent
			if(timeout !== undefined && (Date.now() - data.timeout > timeout * 1000)) {
				Debug.debug('DataURL: URL is over timeout threshold. Looking by AJAX');
				return doByUrl(def, url, headers ).pipe(function(data) { return data; }, function() {
					Debug.debug('DataURL: Failed in retrieving URL by AJAX. Fallback to cached version');
					def.resolve(data.data);
				});
			}

			Debug.info('DataURL: URL is under timeout threshold. Return cached version');
			def.resolve(data.data || data); 
			
		}, function() {

			Debug.debug('DataURL: URL ' + url + ' not found in LRU. Look for AJAX');
			return doByUrl(def, url, headers );
		});
	}

	function doLRU(def, url) {
		Debug.debug('DataURL: Looking into LRU for ' + url);
		return LRU.get('urlData', url);
	}

	return {

		get: function(url, force, timeout, headers) {

			var def = $.Deferred();

			if( pendings[ url ] ) {
				return pendings[ url ];
			}

			if(typeof force === "number") {
				timeout = force;
				force = false;
			} else if(typeof timeout === "object") {
			//	data = timeout;
				timeout = 0;
				force = false;
			} else if(typeof force === "object") {
			//	data = force;
				force = false;
			}

			Debug.debug('DataURL: getting ' + url + ' with force set to ' + force + ' and timeout to ' + timeout);
			// If we force to do ajax first. Fallback if we 
			if( force || timeout<0 ) {

				doByUrl(def, url, headers)
					.pipe(
						function(data) { return data },
						function() {
							// If ajax fails (no internet), go for LRU
							return doLRU(def, url, false).pipe(function(data) {
								def.resolve(data.data);
							});
					});
			}
			// Standard: first LRU, then ajax
			else {
				doLRUOrAjax(def, url, force, timeout, headers);
			}
			return def;
		},

		post: function(url, data) {
			return $.ajax({
				url: url,
				timeout: 120000,
				data: data,
				type: 'post'
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
	};
});

