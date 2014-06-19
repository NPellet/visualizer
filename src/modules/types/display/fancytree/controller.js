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
		},
		nodeData: {
			label: "Node data"
		}
	};
	
	controller.prototype.variablesIn = ['tree'];
	
	controller.prototype.events = {
		onActivate: {
			label: "Select a node",
			refVariable: ["nodeData"]
		}
	};

	controller.prototype.configurationStructure = function() {
		
		var jpaths = this.module.model.getjPath("nodeData");
		
		return {
			groups: {
				group: {
					options: {
						type: 'list',
						multiple: false
					},
					fields : {
						expand: {
							type: 'combo',
							title: 'Auto-expand children',
							default: 'none',
							options: [
								{
									title:'None',
									key:'none'
								},
								{
									title: 'First level',
									key:'lvl1'
								}
							]
						}
					}
				},
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
		columns: [ 'groups', 'cols', 0 ],
		expand: [ 'groups', 'group', 0, 'expand', 0 ]
	};
	
	controller.prototype.onActivate = function(data) {
		this.createDataFromEvent("onActivate", "nodeData", data);
	};

	return controller;
});