define(['jquery', 'util/versioning'], function($, Versioning) {

	var migrate = function(view) {

		if(view._version == Versioning.version)
			return view;

		switch(view._version) {
			case undefined:
				if(view.entryPoint) {
					view.variables = view.entryPoint.variables;
					delete view.entryPoint;

						// we should also resize the modules
					var modules=view.modules;
					for (var i=0; i<modules.length; i++) {
						var module=modules[i];
						module.position.left*=2;
						module.position.top*=2;
						module.size.width*=2;
						module.size.height*=2;
					}
				}
			
			case "2.1": // we change the grid to jqgrid and the editable_grid to jqgrid
				if (view.modules) {
					for (var i=0; i<view.modules.length; i++) {
						var module=view.modules[i];
						if ((module.type=="grid") || (module.type=="editable_grid")) module.type="jqgrid";
					}
				}


			case "2.2": // modules are now defined based on URL
				if (view.modules) {
					for (var i=0; i<view.modules.length; i++) {
						var module=view.modules[i];
						module.url=updateModule(module.type);
					//	delete module.type;
					}
				}				
		}

		view._version = Versioning.version;

		return view;
	}

	return migrate;

	function updateModule(type) {
		if (type=="display_value") return "./modules/types/display/single_value/";
		if (type=="jqgrid") return "./modules/types/display/jqgrid/";
		if (type=="fasttable") return "./modules/types/display/fasttable/";
		if (type=="2d_list") return "./modules/types/display/2d_list/";
		if (type=="hashmap") return "./modules/types/display/hashmap/";
		if (type=="postit") return "./modules/types/display/postit/";
		if (type=="iframe") return "./modules/types/display/iframe/";


		if (type=="dragdrop") return "./modules/types/dragdrop/";
		if (type=="button_action") return "./modules/types/button_action/";
		if (type=="webservice_search") return "./modules/types/webservice_search/";
		if (type=="filelistupload") return "./modules/types/filelistupload/";
		if (type=="filter") return "./modules/types/filter/";
		if (type=="form") return "./modules/types/form/";
		if (type=="form_simple") return "./modules/types/form_simple/";
		if (type=="var_editor") return "./modules/types/var_editor/";
		if (type=="array_search") return "./modules/types/array_search/";
		if (type=="1dnmr") return "./modules/types/1dnmr/";
		if (type=="2dnmr") return "./modules/types/2dnmr/";
		if (type=="spectra_displayer") return "./modules/types/spectra_displayer/";
		if (type=="webservice_nmr_spin") return "./modules/types/webservice_nmr_spin/";
		if (type=="gcms") return "./modules/types/gcms/";
		if (type=="jsme") return "./modules/types/jsme/";
		if (type=="jsmol") return "./modules/types/jsmol/";
		if (type=="jsmol_script") return "./modules/types/jsmol_script/";
		if (type=="ivstability") return "./modules/types/ivstability/";
		if (type=="mol2d") return "./modules/types/mol2d/";
		if (type=="graph_function") return "./modules/types/graph_function/";
		if (type=="dendrogram") return "./modules/types/dendrogram/";
		if (type=="loading_plot") return "./modules/types/loading_plot/";
		if (type=="canvas_matrix") return "./modules/types/canvas_matrix/";
		if (type=="phylogram") return "./modules/types/phylogram/";
		if (type=="grid_selector") return "./modules/types/grid_selector/";
		if (type=="xyzoomnavigator") return "./modules/types/xyzoomnavigator/";
		if (type=="object_editor") return "./modules/types/object_editor/";
		if (type=="webservice_button") return "./modules/types/webservice_button/";
		if (type=="webservice_cron") return "./modules/types/webservice_cron/";


		console.log("viewmigration problem: "+type+" is unknown");
	}

});