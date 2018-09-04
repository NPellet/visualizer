'use strict';

define(['src/header/components/default', 'src/util/util'], function (Default, Util) {
  function Element() {
  }

  Util.inherits(Element, Default, {

    _onClick: function () {
      if (this.options.url) {
        if (this.options.blank) {
          window.open(this.options.url);
        } else {
          window.location.assign(this.options.url);
        }
      }
    }

  });

  return Element;
});
