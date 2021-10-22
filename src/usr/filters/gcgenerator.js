'use strict';

define(['lib/chemistry/gc-generator'], function (GC) {
  return {
    filter: function gcFilter(gc, resolve) {
      let generator = new GC();
      generator.appendPeaks(gc);
      resolve(generator.getSpectrum());
    }
  };
});
