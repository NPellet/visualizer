'use strict';

define(['jquery', 'src/util/versioning'], function ($, Versioning) {
  $(document).keydown(
    function (event) {
      // If Control or Command key is pressed and the S key is pressed
      // run save function. 83 is the key code for S.
      if ((event.ctrlKey || event.metaKey) && !event.altKey && (event.which == 191 || event.which === 111 || event.which === 77)) {
        event.preventDefault();
        require(['src/util/searchBox'], function (searchModule) {
          searchModule();
        });
      }
    });
});
