'use strict';

var blobCache = {};

define(['superagent'], function (agent) {
  return function getWorker(url) {
    return new Promise(function (resolve, reject) {
      if (blobCache[url]) {
        return resolve(new Worker(blobCache[url]));
      }
      agent.get(url).end(function (err, res) {
        if (err) {
          return reject(err);
        }
        if (res.status !== 200) {
          return reject(new Error(`Failed to download worker at ${url}`));
        }
        var blob = new Blob([res.text], { type: 'application/javascript' });
        var blobUrl = URL.createObjectURL(blob);
        blobCache[url] = blobUrl;
        resolve(new Worker(blobUrl));
      });
    });
  };
});
