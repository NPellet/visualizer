'use strict';

define(['src/util/versioning', 'src/util/debug', 'src/util/util'], function (Versioning, Debug, Util) {

    var migrators = [

        '2.1.0', function (view) {
            if (view.entryPoint) {
                view.variables = view.entryPoint.variables;
                delete view.entryPoint;

                // we should also resize the modules
                var modules = view.modules;
                for (var i = 0; i < modules.length; i++) {
                    var module = modules[i];
                    module.position.left *= 2;
                    module.position.top *= 2;
                    module.size.width *= 2;
                    module.size.height *= 2;
                }
            }
        },

        '2.2.0', function (view) { // we change the grid to jqgrid and the editable_grid to jqgrid
            if (view.modules) {
                for (var i = 0; i < view.modules.length; i++) {
                    var module = view.modules[i];
                    if ((module.type === 'grid') || (module.type === 'editable_grid'))
                        module.type = 'jqgrid';
                }
            }
        },

        '2.2.1', function (view) { // modules are now defined based on URL
            if (view.modules) {
                for (var i = 0; i < view.modules.length; i++) {
                    var module = view.modules[i];
                    module.url = updateModule(module.type);
                    delete module.type;
                }
            }
        },

        '2.2.2', function (view) { // modules are now defined based on URL
            eachModule(view, function (module) {
                module.url = './modules/types/array_search/configured_search/';
            }, 'types/client_interaction/array_search');
        },

        '2.2.3', function (view) { // view title is in configuration.title
            if (view.title) {
                if (!view.configuration)
                    view.configuration = new DataObject();
                view.configuration.title = view.title;
                delete view.title;
            }
            eachModule(view, function (module) {
                var i;
                module.url = 'modules/types/client_interaction/code_editor/';
                if (module.configuration.groups.group[0].iseditable[0][0] === 'true')
                    module.configuration.groups.group[0].iseditable[0][0] = 'editable';
                delete module.configuration.groups.group[0].padding;
                module.configuration.groups.group[0].mode = ['text'];
                for (i = 0; i < module.vars_out.length; i++) {
                    var varout = module.vars_out[i];
                    if (varout.event) {
                        varout.event = 'onEditorChange';
                        varout.rel = 'value';
                    }
                }
                for (i = 0; i < module.actions_out.length; i++) {
                    var actout = module.actions_out[i];
                    if (actout.event) {
                        actout.event = 'onButtonClick';
                        actout.rel = 'value';
                    }
                }
            }, 'types/science/chemistry/jsmol_script');
        },

        '2.2.4', function (view) { // Change in the webservice search module
            eachModule(view, function (module) {
                var url = module.configuration.groups.group[0].url;
                if (url[0]) {
                    url[0] = url[0].replace(/<([a-zA-Z0-9]+)>/g, '{$1}');
                }
            }, 'types/server_interaction/webservice_search');
        },

        '2.2.5', function (view) {
            eachModule(view, function (module) {
                for (var j = 0; j < module.vars_out.length; j++) {
                    var var_out = module.vars_out[j];
                    var_out.event = 'onRead';
                    if (var_out.rel === 'data')
                        var_out.jpath = var_out.jpath + '.content';
                    else if (var_out.rel === 'filename') {
                        var_out.rel = 'data';
                        var_out.jpath = var_out.jpath + '.filename';
                    }
                }
            }, 'types/client_interaction/dragdrop');
        },

        '2.3.0-beta1', function (view) { // Add layers
            view.grid = DataObject.recursiveTransform({
                layers: {
                    'Default layer': {
                        name: 'Default layer'
                    }
                },
                xWidth: 10,
                yHeight: 10
            });
            eachModule(view, function (module) {
                if (!module.layers) {
                    module.layers = DataObject.recursiveTransform({
                        'Default layer': {
                            position: {
                                left: module.position.left,
                                top: module.position.top,
                                right: 0
                            },
                            size: {
                                width: module.size.width,
                                height: module.size.height
                            },
                            zIndex: module.zIndex,
                            display: true,
                            title: module.title,
                            bgColor: module.bgColor,
                            wrapper: module.displayWrapper,
                            created: true,
                            name: 'Default layer'
                        }
                    });
                    delete module.title;
                    delete module.position;
                    delete module.size;
                    delete module.zIndex;
                    delete module.displayWrapper;
                    delete module.bgColor;
                }
            });
        },

        '2.4.0-b0', function (view) {
            if (view.variables) {
                for (var i = 0; i < view.variables.length; i++) {
                    updateJpath(view.variables[i]);
                }
            }

            eachModule(view, function (module) {
                var i;
                if (module.vars_out) {
                    for (i = 0; i < module.vars_out.length; i++) {
                        updateJpath(module.vars_out[i]);
                    }
                }
                if (module.actions_out) {
                    for (i = 0; i < module.actions_out.length; i++) {
                        updateJpath(module.actions_out[i]);
                    }
                }

            });
        },

        '2.4.0-b1', function (view) {
            eachModule(view, function (module) {
                var out = module.vars_out;
                for (var i = 0; i < out.length; i++) {
                    out[i].setChild(['rel'], 'output');
                }
            }, 'types/edition/object_editor');
        },

        '2.4.0-b2', function (view) {
            eachModule(view, function (module) {
                var out = module.vars_out;
                for (var i = 0; i < out.length; i++) {
                    out[i].setChild(['rel'], 'filteredObject');
                }
            }, 'types/edition/filter_editor');
        },

        '2.4.1', function (view) {
            eachModule(view, function (module) {
                var i;
                var postvariables = module.configuration.sections.postvariables[0].groups.postvariables[0];
                for (i = 0; i < postvariables.length; i++) {
                    if (!postvariables[i].variable) {
                        postvariables.splice(i--, 1);
                    } else {
                        postvariables[i].destination = 'data';
                    }
                }
                var searchparams = module.configuration.groups.searchparams[0];
                for (i = 0; i < searchparams.length; i++) {
                    if (!searchparams[i].name) {
                        searchparams.splice(i--, 1);
                    } else {
                        searchparams[i].destination = 'url';
                    }
                }
                var input = module.vars_in;
                for (i = 0; i < input.length; i++) {
                    if (!input[i].rel) {
                        input.splice(i--, 1);
                    } else if (input[i].rel === 'varinput') {
                        module.configuration.sections.postvariables[0].groups.postvariables[0].push({
                            name: input[i].name,
                            destination: 'url',
                            variable: input[i].name,
                            filter: 'none'
                        });
                        input.splice(i--, 1);
                    } else if (input[i].rel === 'vartrigger') {
                        module.configuration.sections.postvariables[0].groups.postvariables[0].push({
                            name: input[i].name,
                            destination: 'url',
                            variable: input[i].name,
                            filter: 'none'
                        });
                    }
                }
            }, 'types/server_interaction/webservice_search');
        },

        '2.4.2', function (view) {
            eachModule(view, function (module) {
                if (module.layers) {
                    var layers = module.layers,
                        layer;
                    for (var i in layers) {
                        layer = layers[i];
                        if (layer.bgcolor) {
                            if (!layer.bgColor) {
                                layer.bgColor = layer.bgcolor;
                            }
                            delete layer.bgcolor;
                        }
                    }
                }
            });
        },

        '2.13.1-b0', function (view) {
            eachModule(view, function (module) {
                if (module.actions_in) {
                    module.actions_in.forEach(function (action) {
                        if (action.rel === 'fromTo') {
                            action.rel = 'fromToX';
                        }
                    });
                }
                if (module.actions_out) {
                    module.actions_out.forEach(function (action) {
                        if (action.rel === 'fromTo') {
                            action.rel = 'fromToX';
                        }
                    });
                }
            }, 'spectra_displayer');
        },

        '2.13.1-b1', function (view) {
            eachModule(view, function (module) {
                var plotinfos = module.getChildSync(['configuration', 'groups', 'plotinfos', 0]);
                if (plotinfos) {
                    plotinfos.forEach(function (infos) {
                        if (infos.plotcontinuous) {
                            infos.plotcontinuous = (infos.plotcontinuous[0] == 'continuous') ? 'continuous' : 'discrete';
                        } else {
                            infos.plotcontinuous = 'continuous';
                        }
                    });
                }
            }, 'spectra_displayer');
        },

        '2.13.1-b2', function(view) {
            eachModule(view, function(module) {
                debugger;
                var groupings = module.getChildSync(['configuration','groups', 'groupings', 0]);
                if(!groupings) return;
                for(var i=0; i<groupings.length; i++) {
                    groupings[i].getter = [groupings[i].getter];
                }
            }, 'slick_grid');
        }

//  Add new migration functions here
//      'x.y.z', function (view) {
//          // Do something to the view
//      }

    ];

    function eachModule(view, callback, moduleNames) {
        if (view.modules) {
            if (typeof(moduleNames) === 'string') {
                moduleNames = [moduleNames];
            } else if (!Array.isArray(moduleNames)) {
                moduleNames = [''];
            }
            var i = 0, ii = view.modules.length, module, url;
            var j, jj = moduleNames.length;
            for (; i < ii; i++) {
                module = view.modules[i];

                url = module.getChildSync(['url']);
                if (url) {
                    for (j = 0; j < jj; j++) {

                        if (String(url).indexOf(moduleNames[j]) >= 0) {
                            callback(module);
                            break;
                        }
                    }
                }

            }
        }
    }

    function updateModule(type) {
        if (type === 'display_value')
            return './modules/types/display/single_value/';
        if (type === 'jqgrid')
            return './modules/types/display/jqgrid/';
        if (type === 'fasttable')
            return './modules/types/display/fasttable/';
        if (type === '2d_list')
            return './modules/types/display/2d_list/';
        if (type === 'hashmap')
            return './modules/types/display/hashmap/';
        if (type === 'postit')
            return './modules/types/display/postit/';
        if (type === 'iframe')
            return './modules/types/display/iframe/';
        if (type === 'webservice_search')
            return './modules/types/server_interaction/webservice_search/';
        if (type === 'button_url')
            return './modules/types/server_interaction/button_url/';
        if (type === 'filter')
            return './modules/types/edition/filter/';
        if (type === 'form')
            return './modules/types/edition/form/';
        if (type === 'form_simple')
            return './modules/types/edition/form_simple/';
        if (type === 'var_editor')
            return './modules/types/edition/var_editor/';
        if (type === 'graph_function')
            return './modules/types/chart/advanced/plot_function/';
        if (type === 'canvas_matrix')
            return './modules/types/chart/advanced/canvas_matrix/';
        if (type === 'dendrogram')
            return './modules/types/chart/statistics/dendrogram/';
        if (type === 'loading_plot')
            return './modules/types/chart/statistics/loading_plot/';
        if (type === 'phylogram')
            return './modules/types/chart/statistics/phylogram/';
        if (type === 'spectra_displayer')
            return './modules/types/science/spectra/spectra_displayer/';
        if (type === 'jsme')
            return './modules/types/science/chemistry/jsme/';
        if (type === 'jsmol')
            return './modules/types/science/chemistry/jsmol/';
        if (type === 'jsmol_script')
            return './modules/types/science/chemistry/jsmol_script/';
        if (type === 'mol2d')
            return './modules/types/science/chemistry/mol2d/';
        if (type === '1dnmr')
            return './modules/types/science/spectra/nmr/1dnmr/';
        if (type === '2dnmr')
            return './modules/types/science/spectra/nmr/2dnmr/';
        if (type === 'webservice_nmr_spin')
            return './modules/types/science/spectra/nmr/webservice_nmr_spin/';
        if (type === 'gcms')
            return './modules/types/science/spectra/gcms/';
        if (type === 'ivstability')
            return './modules/types/science/spectra/ivstability/';
        if (type === 'array_search')
            return './modules/types/client_interaction/array_search/';
        if (type === 'dragdrop')
            return './modules/types/client_interaction/dragdrop/';
        if (type === 'button_action')
            return './modules/types/client_interaction/button_action/';
        if (type === 'grid_selector')
            return './modules/types/grid_selector/';
        if (type === 'xyzoomnavigator')
            return './modules/types/xyzoomnavigator/';
        if (type === 'webservice_cron')
            return './modules/types/webservice_cron/';
        console.error('viewmigration problem: ' + type + ' is unknown');
    }

    function updateJpath(element) {
        var jpath = element.getChildSync(['jpath']);
        if (jpath && jpath.split) {
            element.setChild(['jpath'], jpath.split('.').slice(1));
        }
    }

    function migrate(view) {

        if (Object.keys(view).length === 0) {
            view.version = Versioning.version;
            return view;
        }

        if (view._version) {
            view.version = view._version;
            delete view._version;
        }

        if (view.version === Versioning.version)
            return view;

        if (typeof view.version !== 'undefined') {
            Debug.info('Migrating view from version ' + view.version + ' to ' + Versioning.version);
        }

        // views without good version numbering
        switch (view.version) {
            case undefined:
                view.version = '0.0.0';
                break;
            case '2.1':
                view.version = '2.1.0';
                break;
            case '2.2':
                view.version = '2.2.0';
                break;
            case '2.4.0b0':
                view.version = '2.4.0-b0';
                break;
            case '2.4.0b1':
                view.version = '2.4.0-b1';
                break;
            case '2.4.0b2':
                view.version = '2.4.0-b2';
                break;
        }

        var versionSem = Util.semver(view.version);

        if (!versionSem) {
            return view;
        }

        if (versionSem.prerelease) {
            Debug.warn('Migrating a prerelease view, anything can happen !');
        }

        if (Util.semver(Versioning.version).prerelease) {
            Debug.warn('Migrating to a prerelease version of the visualizer, anything can happen !');
        }

        migrateView(view, versionSem);

        view.version = Versioning.version;

        return view;
    }

    function migrateView(view, version) {
        var i, j, k, l,
            major, minor, patch, release,
            found;
        for (i = version.major; i < migrationFunctions.length; i++) {
            major = migrationFunctions[i];
            if (major) {
                j = (i == version.major ? version.minor : 0);
                for (; j < major.length; j++) {
                    minor = major[j];
                    if (minor) {
                        k = ((i == version.major && j == version.minor) ? version.patch : 0);
                        for (; k < minor.length; k++) {
                            patch = minor[k];
                            if (patch) {
                                if (i == version.major && j == version.minor && k == version.patch) {
                                    if (version.prerelease) {
                                        for (l = 0; l < patch.length; l++) {
                                            release = patch[l];
                                            if (release.label == version.prerelease) {
                                                found = true;
                                            } else if (found) {
                                                Debug.debug("applying migration to v" + i + "." + j + "." + k + "-" + release.label);
                                                release.func(view);
                                            }
                                        }
                                    }
                                } else {
                                    for (l = 0; l < patch.length; l++) {
                                        release = patch[l];
                                        Debug.debug("applying migration to v" + i + "." + j + "." + k + "-" + release.label);
                                        release.func(view);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    var migrationFunctions = [];

    function addMigrationFunction(version, func) {

        var semVer = Util.semver(version);

        if (!semVer) {
            throw new Error('invalid semver for migration function: ' + version);
        }

        if (typeof func !== 'function') {
            throw new Error('object passed for migration ' + version + ' has to be a function');
        }

        var major = migrationFunctions[semVer.major] || (migrationFunctions[semVer.major] = []);
        var minor = major[semVer.minor] || (major[semVer.minor] = []);
        var patch = minor[semVer.patch] || (minor[semVer.patch] = []);

        if (semVer.prerelease) {
            patch.push({
                label: semVer.prerelease,
                func: func
            });
        } else {
            patch.push({
                label: 'release',
                func: func
            });
        }

    }

    if (migrators.length % 2 == 1) {
        throw new Error('Invalid length of the migrators array.');
    }

    for (var i = 0; i < migrators.length; i += 2) {
        addMigrationFunction(migrators[i], migrators[i + 1]);
    }

    return migrate;

});