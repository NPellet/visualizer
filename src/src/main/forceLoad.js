'use strict';

// force loading of important dynamic files to put them in the build
define([
  'src/header/components/blankview',
  'src/header/components/copydata',
  'src/header/components/copyview',
  'src/header/components/couchshare',
  'src/header/components/default',
  'src/header/components/feedback',
  'src/header/components/pastedata',
  'src/header/components/pasteview',

  'src/util/sandbox',
  'src/util/searchBox',

  'modules/default/defaultcontroller',
  'modules/default/defaultmodel',
  'modules/default/defaultview'
], function () {
  return {};
});
