define(['modules/module'], function(Module) {

	var incrementalId = 0;
	var modules = [], definitions = [];

	return {
		getTypes: function() {
			return {

				'Displaying information': {
					'display_value': 'Single value',
					'jqgrid': 'Table',
					'2d_list': '2D List',
					'hashmap': 'Object viewer',
					'postit': 'Sticky note',
					'iframe': 'iFrame',
					'recursive_tree': 'Recursive tree (?)'
				},

				'Client interaction': {
					'dragdrop': 'Drag and Drop file',
					'button_action': 'Button to action',
					'grid_selector': 'Table Selector (?)',
					'xyzoomnavigator': 'XY zoom navigator (?)'
				},

				'Server interaction': {
					'button_url': 'Button URL',
					'webservice_button': 'Webservice button (?)',
					'webservice_cron': 'Webservice cron (?)',
					'webservice_search': 'Webservice search',
					'filelistupload': 'Files upload (?)'
				},

				'Data edition': {
					'object_editor': 'Object editor (?)',
					'var_editor': 'Manipulate variables values'
				},

				'Science': {
					'2dnmr': '2D NMR',
					'spectra_displayer': 'Spectra displayer',
					'gcms': 'GC-MS',
					'jsme': 'JSME Molecular Editor',
					'jsmol': 'JSMol',
					'jsmol_script': 'JSMol Script',
					'ivstability': 'IV stability',
					'mol2d': '2D Molecule viewer'
				},

				'Statistics': {
					'dendrogram': 'Dendrogram',
					'loading_plot': 'Loading plot'
				},

				'Charting': {
					'canvas_matrix': 'Matrix',
					'spectra_displayer': 'Plot',
					'phylogram': 'Display phylogram'
				}
			}
		},

		newModule: function(definition) {
			var module = new Module(definition);
			module.setId(++incrementalId);
			modules.push(module);
			definitions.push(definition);
			return module;
		},

		removeModule: function(module) {
			modules.splice(modules.indexOf(module), 1);
			definitions.splice(definitions.indexOf(module.definition), 1);
		},

		empty: function() {
			definitions = [];
			modules = [];
		},

		getModules: function() {
			return modules;
		},

		getDefinitions: function() {
			return definitions;
		}
	}
});
