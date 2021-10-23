'use strict';

define([
  'src/util/mousetracker',
  'modules/modulefactory',
  'src/util/ui',
  'src/util/versioning',
  'src/main/grid',
  'src/util/debug'
], function (mouseTracker, ModuleFactory, ui, Versioning, Grid, Debug) {
  document.addEventListener('copy', function (event) {
    var currentFocus = document.activeElement;
    if (currentFocus && currentFocus.nodeName === 'TEXTAREA') return;
    var success = false;
    var state = mouseTracker.getState();
    if (state.kind === 'grid') {
      event.clipboardData.setData('text/plain', Versioning.getViewJSON());
      ui.showNotification('View copied', 'success');
      success = true;
    } else if (state.kind === 'module') {
      var modules = ModuleFactory.getModules();
      modules = modules.filter(function (m) {
        return Number(m.getId()) === state.moduleId;
      });
      if (modules.length) {
        let currentDefinition = JSON.parse(
          JSON.stringify(modules[0].definition)
        );
        Object.keys(currentDefinition.layers).forEach((layer) => {
          if (layer !== 'Default layer') {
            delete currentDefinition.layers[layer];
          }
        });

        event.clipboardData.setData(
          'text/plain',
          JSON.stringify(currentDefinition)
        );
        ui.showNotification('Module copied', 'success');
        success = true;
      }
    }

    if (success) {
      event.preventDefault();
    }
  });

  document.addEventListener('paste', function (e) {
    var state = mouseTracker.getState();
    if (state.kind !== 'grid' && state.kind !== 'module') return;
    e.clipboardData.items[0].getAsString(function (s) {
      try {
        var obj = JSON.parse(s);
        if (obj.version) {
          Versioning.setViewJSON(obj);
        } else if (obj.url) {
          Grid.addModuleFromJSON(obj);
        }
      } catch (error) {
        Debug.info('Ignored error while pasting');
      }
    });
  });
});
