'use strict';

define(['js-yaml'], function (Yaml) {
  return {
    filter: function base64Filter(dataObject, resolve, reject) {
      if (dataObject.getType() !== 'string')
        return reject(new TypeError('yaml2json filter expects a string'));

      let str = dataObject.get();
      let json = Yaml.safeLoad(str);

      resolve(json);
    }
  };
});
