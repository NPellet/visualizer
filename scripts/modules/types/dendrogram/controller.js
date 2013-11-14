define(['modules/defaultcontroller','util/datatraversing'], function(Default, Traversing) {
	
	function controller() {};
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
		

		configurationStructure: function() {
			
			return {
				groups: {
					group: {
						options: {
							type: 'list'
						},

						fields: {
							nodeType : {
								type: 'combo',
								title: 'Node Type',
								default: 'circle',
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

							nodeSize: {
								type: 'text',
								title: 'Default node size'
							},

							nodeColor: {
								type: 'color',
								title: 'Default node color'
							},

							labelSize: {
								type: 'text',
								title: 'Default label size'
							},

							labelColor: {
								type: 'color',
								title: 'Default label color'
							},

							edgeWidth: {
								type: 'text',
								title: 'Default edge width'
							},

							edgeColor: {
								type: 'color',
								title: 'Default edge color'
							},

							strokeWidth: {
								type: 'text',
								title: 'Background line width'
							},

							strokeColor: {
								type: 'color',
								title: 'Background line color'
							}
						}
					}
				}
			}
		},
		
		configAliases: {
			'nodeType': [ 'groups', 'group', 0, 'nodeType', 0 ],
			'nodeSize': [ 'groups', 'group', 0, 'nodeSize', 0 ],
			'nodeColor': [ 'groups', 'group', 0, 'nodeColor', 0 ],
			'labelSize': [ 'groups', 'group', 0, 'labelSize', 0 ],
			'labelColor': [ 'groups', 'group', 0, 'labelColor', 0 ],
			'edgeWidth': [ 'groups', 'group', 0, 'edgeWidth', 0 ],
			'edgeColor': [ 'groups', 'group', 0, 'edgeColor', 0 ],
			'strokeWidth': [ 'groups', 'group', 0, 'strokeWidth', 0 ],
			'strokeColor': [ 'groups', 'group', 0, 'strokeColor', 0 ]
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

