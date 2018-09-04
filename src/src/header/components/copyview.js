'use strict';

define(['src/header/components/default', 'src/util/versioning', 'src/util/util'], function (Default, Versioning, Util) {
  function Element() {
  }

  Util.inherits(Element, Default, {
    _onClick() {
      Versioning.copyView();
    }
  });

  return Element;
});
