define(['src/util/versioning'], function(Versioning) {

    var migrate = function(view) {

        if (view._version) {
            view.version = view._version;
            delete view._version;
        }

        if (view.version === Versioning.version)
            return view;

        switch (view.version) {
            case undefined:
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
            case "2.1": // we change the grid to jqgrid and the editable_grid to jqgrid
                if (view.modules) {
                    for (var i = 0; i < view.modules.length; i++) {
                        var module = view.modules[i];
                        if ((module.type === "grid") || (module.type === "editable_grid"))
                            module.type = "jqgrid";
                    }
                }
            case "2.2": // modules are now defined based on URL
                if (view.modules) {
                    for (var i = 0; i < view.modules.length; i++) {
                        var module = view.modules[i];
                        module.url = updateModule(module.type);
                        delete module.type;
                    }
                }
            case "2.2.1": // modules are now defined based on URL
                eachModule(view, function(module){
                    module.url = "./modules/types/array_search/configured_search/";
                }, "types/client_interaction/array_search");
                
            case "2.2.2": // view title is in configuration.title
                if (view.title) {
                    if (!view.configuration)
                        view.configuration = new ViewObject();
                    view.configuration.title = view.title;
                    delete view.title;
                }
                eachModule(view, function(module){
                    module.url = "modules/types/client_interaction/code_editor/";
                    if (module.configuration.groups.group[0].iseditable[0][0] === "true")
                        module.configuration.groups.group[0].iseditable[0][0] = "editable";
                    delete module.configuration.groups.group[0].padding;
                    module.configuration.groups.group[0].mode = ["text"];
                    for (var i = 0; i < module.vars_out.length; i++) {
                        var varout = module.vars_out[i];
                        if (varout.event) {
                            varout.event = "onEditorChange";
                            varout.rel = "value";
                        }
                    }
                    for (var i = 0; i < module.actions_out.length; i++) {
                        var actout = module.actions_out[i];
                        if (actout.event) {
                            actout.event = "onButtonClick";
                            actout.rel = "value";
                        }
                    }
                }, "types/science/chemistry/jsmol_script");
                
            case "2.2.3": // Change in the webservice search module
                eachModule(view, function(module){
                    var url = module.configuration.groups.group[0].url;
                    if (url[0]) {
                        url[0] = url[0].replace(/<([a-zA-Z0-9]+)>/g, "{$1}");
                    }
                }, "types/server_interaction/webservice_search");
                
            case "2.2.4": // Changes in the dragdrop module
                eachModule(view, function(module){
                    for (var j = 0; j < module.vars_out.length; j++) {
                        var var_out = module.vars_out[j];
                        var_out.event = "onRead";
                        if (var_out.rel === "data")
                            var_out.jpath = var_out.jpath + ".content";
                        else if (var_out.rel === "filename") {
                            var_out.rel = "data";
                            var_out.jpath = var_out.jpath + ".filename";
                        }
                    }
                }, "types/client_interaction/dragdrop");
                
        }
        view.version = Versioning.version;

        return view;
    };

    return migrate;
    
    function eachModule(view, callback, moduleNames) {
        if(view.modules) {
            if(typeof(moduleNames)==="string") {
                moduleNames = [moduleNames];
            } else if(!(moduleNames instanceof Array)) {
                moduleNames = [""];
            }
            var i = 0, ii = view.modules.length, module;
            var j, jj = moduleNames.length;
            for(; i < ii; i++) {
                module = view.modules[i];
                for(j = 0; j < jj; j++) {
                    if(module.url.indexOf(moduleNames[j]) >= 0) {
                        callback(module);
                        break;
                    }
                }
            }
        }
    }

    function updateModule(type) {
        if (type === "display_value")
            return "./modules/types/display/single_value/";
        if (type === "jqgrid")
            return "./modules/types/display/jqgrid/";
        if (type === "fasttable")
            return "./modules/types/display/fasttable/";
        if (type === "2d_list")
            return "./modules/types/display/2d_list/";
        if (type === "hashmap")
            return "./modules/types/display/hashmap/";
        if (type === "postit")
            return "./modules/types/display/postit/";
        if (type === "iframe")
            return "./modules/types/display/iframe/";
        if (type === "webservice_search")
            return "./modules/types/server_interaction/webservice_search/";
        if (type === "button_url")
            return "./modules/types/server_interaction/button_url/";
        if (type === "filter")
            return "./modules/types/edition/filter/";
        if (type === "form")
            return "./modules/types/edition/form/";
        if (type === "form_simple")
            return "./modules/types/edition/form_simple/";
        if (type === "var_editor")
            return "./modules/types/edition/var_editor/";
        if (type === "graph_function")
            return "./modules/types/chart/advanced/plot_function/";
        if (type === "canvas_matrix")
            return "./modules/types/chart/advanced/canvas_matrix/";
        if (type === "dendrogram")
            return "./modules/types/chart/statistics/dendrogram/";
        if (type === "loading_plot")
            return "./modules/types/chart/statistics/loading_plot/";
        if (type === "phylogram")
            return "./modules/types/chart/statistics/phylogram/";
        if (type === "spectra_displayer")
            return "./modules/types/science/spectra/spectra_displayer/";
        if (type === "jsme")
            return "./modules/types/science/chemistry/jsme/";
        if (type === "jsmol")
            return "./modules/types/science/chemistry/jsmol/";
        if (type === "jsmol_script")
            return "./modules/types/science/chemistry/jsmol_script/";
        if (type === "mol2d")
            return "./modules/types/science/chemistry/mol2d/";
        if (type === "1dnmr")
            return "./modules/types/science/spectra/nmr/1dnmr/";
        if (type === "2dnmr")
            return "./modules/types/science/spectra/nmr/2dnmr/";
        if (type === "webservice_nmr_spin")
            return "./modules/types/science/spectra/nmr/webservice_nmr_spin/";
        if (type === "gcms")
            return "./modules/types/science/spectra/gcms/";
        if (type === "ivstability")
            return "./modules/types/science/spectra/ivstability/";
        if (type === "array_search")
            return "./modules/types/client_interaction/array_search/";
        if (type === "dragdrop")
            return "./modules/types/client_interaction/dragdrop/";
        if (type === "button_action")
            return "./modules/types/client_interaction/button_action/";
        if (type === "grid_selector")
            return "./modules/types/grid_selector/";
        if (type === "xyzoomnavigator")
            return "./modules/types/xyzoomnavigator/";
        if (type === "webservice_cron")
            return "./modules/types/webservice_cron/";
        console.error("viewmigration problem: " + type + " is unknown");
    }
});