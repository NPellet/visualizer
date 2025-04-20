'use strict';

define([
  'src/util/couchshare',
  'src/header/components/default',
  'src/util/util',
], function (couchshare, Default, Util) {
  function Element() {}

  Util.inherits(Element, Default, {
    initImpl() {
      this.dialogOptions = {
        title: 'Share view',
        width: 550,
        height: 170,
      };
    },
    _onClick() {
      couchshare.couchShare(this.options, this.dialogOptions);
    },
  });
  return Element;
});
