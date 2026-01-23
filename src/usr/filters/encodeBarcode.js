'use strict';

define(['jsbarcode'], function () {
  return {
    filter(dataObject, resolve, reject) {
      var $img = $('<img/>');
      var obj = dataObject.get();
      try {
        $img.JsBarcode(obj.val || 'Hi!', obj);
        return resolve({
          type: 'png',
          value: $img[0].src,
        });
      } catch (error) {
        reject(error);
      }
    },
  };
});
