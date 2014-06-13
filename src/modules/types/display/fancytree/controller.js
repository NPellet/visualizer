define(['modules/default/defaultcontroller','src/util/datatraversing'], function(Default, Traversing) {

	function controller() {}
	
	controller.prototype = $.extend(true, {}, Default);

	controller.prototype.moduleInformation = {
		moduleName: 'Hierarchical structure',
		description: 'Displays a hierarchical structure',
		author: 'Michaël Zasso',
		date: '02.06.2014',
		license: 'MIT',
		cssClass: 'fancytree'
	};
	
	controller.prototype.references = {
		tree: {
			label: "Hierarchical structure (tree)",
			type: "tree"
		}
	};
	
	controller.prototype.variablesIn = ['tree'];

	controller.prototype.configurationStructure = function() {
		
		var jpaths = [];
		if(this.module.model._objectModel)
			Traversing.getJPathsFromElement(this.module.model._objectModel, jpaths);
		
		return {
			groups: {
				cols: {
					options: {
						type: 'table',
						multiple: true,
						title: 'Columns'
					},

					fields: {

						name: {
							type: 'text',
							title: 'Columns title'
						},

						jpath: {
							type: 'combo',
							title: 'jPath',
							options: jpaths
						},

						width: {
							type: 'text',
							title: 'Width'
						}
					}
				}
			}
		};
	};
	
	controller.prototype.configAliases = {
		columns: [ 'groups', 'cols', 0 ]
	};

	return controller;
});