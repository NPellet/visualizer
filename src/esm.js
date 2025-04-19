'use strict';

// ESM loader plugin.
// Use like this in dependencies: `require(['esm!https://example.com/lib.js'], (lib) => {})`.
define({
  load: function (url, req, onload) {
    import(url).then(
      function (mod) {
        onload(mod);
      },
      function (error) {
        onload.error(error);
      },
    );
  },
});
