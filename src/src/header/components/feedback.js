'use strict';

define(['src/header/components/default', './../../util/couchshare', 'src/util/util'], function (Default, Sharer, Util) {
  function Element() {
  }

  const shareOptions = {
    couchUrl: 'https://visualizer.epfl.ch',
    database: 'x',
    tinyUrl: 'https://visualizer.epfl.ch/tiny'
  };

  Util.inherits(Element, Default, {
    _onClick() {
      Sharer.feedback(this.options, shareOptions);
    }
  });

  return Element;
});
