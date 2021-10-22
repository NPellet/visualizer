'use strict';

define(['./versioning'], function (Versioning) {
  let config;
  // Default List of what should appear in the context menu
  // Based on the name attribute of the li tag of the context menu
  // If all is set everything will appear no matter what
  // If undefined is set then not setting the name attribute will add it anyway
  let defaultContextMenu = [
    'undefined',
    'all',
    'global-configuration',
    'configuration',
    'copy',
    'paste',
    'duplicate',
    'add',
    'layers',
    'utils',
    'remove',
    'export',
    'print',
    'refresh',
    'tofront',
    'toback',
    'move',
    'custom',
    'fullscreen'
  ];
  return {
    getConfig: function () {
      return config;
    },

    setConfig: function (c) {
      config = c;
    },

    contextMenu: function () {
      if (config && config.contextMenu) {
        return config.contextMenu;
      } else if (Versioning.isViewLocked()) {
        return [];
      } else {
        return defaultContextMenu;
      }
    }
  };
});
