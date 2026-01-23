'use strict';

define(['jquery'], ($) => {
  $(document).on('keydown', (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      (event.which === 191 || event.which === 111 || event.which === 77)
    ) {
      event.preventDefault();
      require(['src/util/searchBox'], (searchModule) => {
        searchModule();
      });
    } else if (event.key === ' ' && event.target === document.body) {
      // Avoid scrolling the page. The space key can be used by modules.
      event.preventDefault();
    }
  });
});
