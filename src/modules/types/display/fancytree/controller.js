define(['modules/default/defaultcontroller'], function(Default) {

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
							options: [{title:"plop", key:"element.plop"}]
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