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
		}

		view._version = Versioning.version;
		return view;
	}

	return migrate;
});