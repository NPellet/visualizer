define(['modules/defaultcontroller','util/datatraversing'], function(Default, Traversing) {
	
	function controller() {

	};
	
	controller.prototype = $.extend(true, {}, Default, {
		singleValueFields:['nodeType','nodeSize','nodeColor','labelSize','labelColor','edgeWidth','edgeColor','strokeWidth','strokeColor'],
		configurationSend: {
			events: {
				onHover: {
					label: 'Hovers a node',
					description: ''
				}
			},

			rels: {
				'node': {
					label: 'Node',
					description: 'Returns the selected node element'
				}
			}
			
		},
		
		hoverEvent: function(data) {

		},
		
		/*
			We define the information that will be received by the module.
			In a signle value module we will for example receive a value and a color
			This information will be used in the method "update" of the view.js
		*/
		configurationReceive: {
			dendrogram: {
				type: ['tree'],
				label: 'A hierarchical tree',
				description: ''
			}
		},
		
		moduleInformations: {
			moduleName: 'Dendrogram'
		},
		
		doConfiguration: function(section) {
			
			return {
				groups: {
					'module': {
						config: {
							type: 'list'
						},

						fields: [

							{
								type: 'Combo',
								name: 'nodeType',
								title: 'Node Type',
								options: [
									{title: 'Circle', key: 'circle'},
									{title: 'Triangle', key: 'triangle'},
									{title: 'Square', key: 'squqre'},
									{title: 'Star', key: 'star'},
									{title: 'Ellipse', key: 'ellipse'},
									{title: 'Rectangle', key: 'rectangle'},
									{title: 'Image', key: 'image'}
								]
							},

							{
								type: 'Text',
								name: 'nodeSize',
								title: 'Default node size'
							},

							{
								type: 'Color',
								name: 'nodeColor',
								title: 'Default node color'
							},

							{
								type: 'Text',
								name: 'labelSize',
								title: 'Default label size'
							},

							{
								type: 'Color',
								name: 'labelColor',
								title: 'Default label color'
							},

							{
								type: 'Text',
								name: 'edgeWidth',
								title: 'Default edge width'
							},

							{
								type: 'Color',
								name: 'edgeColor',
								title: 'Default edge color'
							},

							{
								type: 'Text',
								name: 'strokeWidth',
								title: 'Background line width'
							},

							{
								type: 'Color',
								name: 'strokeColor',
								title: 'Background line color'
							}
						]
					}
				}
			}
		},
		
		doFillConfiguration: function() {
			var cfg=this.module.getConfiguration();

			var module={};
			for (var i=0; i<this.singleValueFields.length; i++) {
				var varName=this.singleValueFields[i];
				module[varName]=[cfg[varName] || ""];
			}

			return configuration={
				groups: {
					module: [module]
				}
			}
		},
		
		
		doSaveConfiguration: function(confSection) {
			var group = confSection[0].module[0];
			this.module.definition.configuration={};

			for (var i=0; i<this.singleValueFields.length; i++) {
				var varName=this.singleValueFields[i];
				this.module.definition.configuration[varName]=group[varName][0];
			}
		},

		getNodeJpath: function() {
			var value=this.module.view._value || {};
			while (value.children && value.children.length>0) {
				value=value.children[0];
			}
			var jpaths = [];
			Traversing.getJPathsFromElement(value, jpaths);
			return jpaths;
		}

	});

 	return controller;
});

