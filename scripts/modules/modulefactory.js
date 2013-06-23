define(['modules/module'], function(Module) {

	var incrementalId = 0;
	var modules = [];

	return {
		getTypes: function() {
			return {
				'grid': 'Grid',
				'table': 'Table'
			}
		},

		newModule: function(definition) {
			var module = new Module(definition);
			module.setId(++incrementalId);
			modules.push(module);
			return module;
		},

		removeModule: function(module) {
			modules.splice(modules.indexOf(module), 1);
		},

		getModules: function() {
			return modules;
		}
	}
});
