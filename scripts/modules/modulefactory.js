define(['modules/module'], function(Module) {

	var incrementalId = 0;
	var modules = [], definitions = [];

	return {
		getTypes: function() {
			return {
				'grid': 'Grid',
				'table': 'Table',
				'gcms': 'GC-MS'
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

		getModules: function() {
			return modules;
		},

		getDefinitions: function() {
			return definitions;
		}
	}
});
