'use strict';

define(['lib/pixastic/pixastic'], function (Pixastic) {
  return {
    filter: function histogramFilter(dataObject, resolve) {
      let image = new Image();
      image.src = dataObject.get();
      let hist = {};
      Pixastic.process(image, 'colorhistogram', { returnValue: hist });
      resolve(hist);
    }
  };
});
