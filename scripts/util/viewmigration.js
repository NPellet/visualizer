define(['jquery', 'util/Versioning'], function($, Versioning) {

	var migrate = function(view) {

		if(view._version == Versioning.version)
			return view;

		switch(view._version) {
			case undefined:
				view.variables = view.entryPoint.variables;
				delete view.entryPoint;
			break;
		}

		return view;
	}

	return migrate;
});