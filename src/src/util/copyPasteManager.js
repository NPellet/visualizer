'use strict';

define(['src/util/mousetracker', 'modules/modulefactory', 'src/util/ui', 'src/util/versioning', 'src/main/grid', 'src/util/debug'], function (mouseTracker, ModuleFactory, ui, Versioning, Grid, Debug) {
    document.addEventListener('copy', function (e) {
        var success = false;
        var state = mouseTracker.getState();
        if (state.kind === 'grid') {
            e.clipboardData.setData('text/plain', Versioning.getViewJSON());
            ui.showNotification('View copied', 'success');
            success = true;
        } else if (state.kind === 'module') {
            var modules = ModuleFactory.getModules();
            modules = modules.filter(function (m) {
                return Number(m.getId()) === state.moduleId;
            });
            if (modules.length) {
                e.clipboardData.setData('text/plain', JSON.stringify(modules[0].definition));
                ui.showNotification('Module copied', 'success');
                success = true;
            }
        }

        if (success) {
            e.preventDefault();
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
            } catch (e) {
                Debug.info('Ignored error while pasting');
            }
        });
    });
});
