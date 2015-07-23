'use strict';

define(['jquery'], function ($) {
    var state;

    document.addEventListener('mousemove', function (e) {
        var id = e.target.id;
        if (id === 'modules-grid') {
            state = {
                kind: 'grid'
            };
            return;
        }
        var $target = $(e.target);
        if ($target.hasClass('ci-module-header')) {
            var moduleId = $target.parents('.ci-module-wrapper').attr('data-module-id');
            state = {
                kind: 'module',
                moduleId: Number(moduleId)
            };
            return;
        }

        state = {};
    });

    return {
        getState: function () {
            return state;
        }
    };
});
