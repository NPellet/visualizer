'use strict';

define(['jquery', 'src/header/components/default', 'src/util/versioning', 'src/util/util'], function ($, Default, Versioning, Util) {
  function Element() {
  }

  Util.inherits(Element, Default, {

    _onClick: function () {
      Versioning.blankView();
    }

  });

  return Element;
});
