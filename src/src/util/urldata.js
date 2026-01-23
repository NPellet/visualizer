'use strict';

define(['src/util/lru', 'src/util/debug'], function (LRU, Debug) {
  const credentials = {};
  const DEFAULT_STORE_NAME = 'urlData';
  const DEFAULT_STORE_DB_LIMIT = 500;

  async function doByUrl(url, headers, options) {
    let host;
    var storeName = options.storeName || DEFAULT_STORE_NAME;
    try {
      host = new URL(url).host;
    } catch {
      // `new URL()` can fail with relative URLs. Use current host in that case.
      host = window.location.host;
    }
    const withCredentials = options.withCredentials || credentials[host];

    Debug.debug(`DataURL: Looking for ${url} by AJAX`);
    const res = await fetch(url, {
      headers: headers || {},
      signal: AbortSignal.timeout(120000),
      credentials: withCredentials ? 'include' : 'same-origin',
    });
    if (
      res.status === 401 &&
      !withCredentials &&
      credentials[host] === undefined
    ) {
      credentials[host] = true;
      return doByUrl(url, headers, options);
    }

    if (res.status !== 200) {
      Debug.info(`DataURL: Failing in retrieving ${url} by AJAX.`);
      throw new Error(`Expected status === 200, got ${res.status}`);
    }
    let data;
    if (res.headers.get('Content-Type') === 'application/json') {
      data = await res.json();
    } else {
      data = await res.text();
    }
    Debug.info(`DataURL: Found ${url} by AJAX`);
    LRU.create(storeName, options.databaseLimit || DEFAULT_STORE_DB_LIMIT);
    LRU.store(storeName, url, data);
    return data;
  }

  function doLRUOrAjax(url, force, timeout, headers, options) {
    // Check in the memory if the url exists
    Debug.debug(
      `DataURL: Looking in LRU for ${url} with timeout of ${timeout} seconds`,
    );
    return doLRU(url, options).then(
      function foundLRU(data) {
        Debug.debug(
          `DataURL: Found ${url} in local DB. Timeout: ${data.timeout}`,
        );

        // If timeouted. If no timeout is defined, then the link is assumed permanent
        if (
          timeout !== undefined &&
          Date.now() - data.timeout > timeout * 1000
        ) {
          Debug.debug(
            'DataURL: URL is over timeout threshold. Looking by AJAX',
          );
          return doByUrl(url, headers, options).catch(function notFoundAjax() {
            Debug.debug(
              'DataURL: Failed in retrieving URL by AJAX. Fallback to cached version',
            );
            return data.data;
          });
        }

        Debug.info(
          'DataURL: URL is under timeout threshold. Return cached version',
        );
        return data.data || data;
      },
      function notFoundLRU() {
        Debug.debug(`DataURL: URL ${url} not found in LRU. Look for AJAX`);
        return doByUrl(url, headers, options);
      },
    );
  }

  function doLRU(url, options) {
    Debug.debug(`DataURL: Looking into LRU for ${url}`);
    return Promise.resolve(
      LRU.get(options.storeName || DEFAULT_STORE_NAME, url),
    );
  }

  return {
    get: function urldataGet(url, force, timeout, headers, options) {
      options = options || {};

      if (typeof force === 'number') {
        headers = timeout;
        timeout = force;
        force = false;
      } else if (typeof force === 'object') {
        headers = force;
        timeout = 0;
        force = false;
      } else if (typeof timeout === 'object') {
        headers = timeout;
        timeout = 0;
      }

      Debug.debug(
        `DataURL: getting ${url} with force set to ${force} and timeout to ${timeout}`,
      );

      if (force || timeout < 0 || timeout === undefined) {
        return doByUrl(url, headers, options).catch(
          function notFoundForceAjax() {
            // If ajax fails (no internet), go for LRU
            return doLRU(url, options).then(function foundLRUForceAjax(data) {
              return data.data;
            });
          },
        );
      } else {
        return doLRUOrAjax(url, force, timeout, headers, options);
      }
    },

    empty(options) {
      options = options || {};
      LRU.empty(options.storeName || DEFAULT_STORE_NAME);
    },
  };
});
