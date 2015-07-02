'use strict';
define([], function () {
    var config;
    // Default List of what should appear in the context menu
    // Based on the name attribute of the li tag of the context menu
    // If all is set everything will appear no matter what
    // If undefined is set then not setting the name attribute will add it anyway
    var contextMenu = [
        'undefined', 'all', 'global-configuration', 'configuration',
        'copy', 'paste', 'duplicate', 'add', 'layers',
        'remove', 'export', 'print', 'refresh', 'tofront', 'toback', 'move', 'custom', 'fullscreen'
    ];
    return {
        getConfig: function () {
            return config;
        },

        setConfig: function (c) {
            config = c;
        },

        contextMenu: function () {
            return (config && config.contextMenu) || contextMenu;
        }
    };
});
