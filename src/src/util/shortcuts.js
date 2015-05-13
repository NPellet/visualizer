'use strict';

define(['jquery'], function ($) {
    $(document).keydown(function (event) {
            // If Control or Command key is pressed and the S key is pressed
            // run save function. 83 is the key code for S.
            if ((event.ctrlKey || event.metaKey) && (event.which == 191 || event.which === 111)) {
                event.preventDefault();
                require(['src/util/searchModule'], function (searchModule) {
                    searchModule();
                });
            }
        }
    );
});
