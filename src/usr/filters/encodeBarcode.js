'use strict';

define(['components/jsbarcode/jsBarcode.min'], function () {
  return {
    filter: function (dataObject, resolve, reject) {
      let $img = $('<img/>');
      let obj = dataObject.get();
      try {
        $img.JsBarcode(obj.val || 'Hi!', obj);
        return resolve({
          type: 'png',
          value: $img[0].src
        });
      } catch (e) {
        reject(e);
      }
    }
  };
});
