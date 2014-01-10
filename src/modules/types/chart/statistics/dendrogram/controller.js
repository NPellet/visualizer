define(['modules/default/defaultcontroller','src/util/datatraversing'], function(Default, Traversing) {
	
	/**
	 * Creates a new empty controller
	 * @class Controller
	 * @name Controller
	 * @constructor
	 */
	function controller() { };

	// Extends the default properties of the default controller
	controller.prototype = $.extend( true, {}, Default );

	/*
		Information about the module
	*/
	controller.prototype.moduleInformation = {
		moduleName: 'Display dendrogram',
		description: 'Display a dendrogram based on jit',
		author: 'Luc Patiny',
		date: '30.12.2013',
		license: 'MIT',
		cssClass: 'dendrogram'
	};

	


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events

		onHover: {
			label: 'Hovers a node',
			refVariable: [ 'node' ]
		}
	};
	
	controller.prototype.onHover = function(element) {

console.log(element);

		if( ! element ) {
			return;
		}
		this.setVarFromEvent( 'onHover', element, 'node' );
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		tree: {
			type: ['tree'],
			label: 'A hierarchical tree'
		},
		row: {
			label: 'Row'
		}
	};



	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'tree' ];

	
	controller.prototype.moduleInformations = {
		moduleName: 'Dendrogram'
	};
	

	controller.prototype.configurationStructure = function() {
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
	};
	
	controller.prototype.configAliases = {
		'nodeType': [ 'groups', 'group', 0, 'nodeType', 0 ],
		'nodeSize': [ 'groups', 'group', 0, 'nodeSize', 0 ],
		'nodeColor': [ 'groups', 'group', 0, 'nodeColor', 0 ],
		'labelSize': [ 'groups', 'group', 0, 'labelSize', 0 ],
		'labelColor': [ 'groups', 'group', 0, 'labelColor', 0 ],
		'edgeWidth': [ 'groups', 'group', 0, 'edgeWidth', 0 ],
		'edgeColor': [ 'groups', 'group', 0, 'edgeColor', 0 ],
		'strokeWidth': [ 'groups', 'group', 0, 'strokeWidth', 0 ],
		'strokeColor': [ 'groups', 'group', 0, 'strokeColor', 0 ]
	};


 	return controller;
});

