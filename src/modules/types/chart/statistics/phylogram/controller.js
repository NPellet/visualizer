define(['modules/default/defaultcontroller'], function(Default) {
	
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
		moduleName: 'D3 Phylogram',
		description: 'Display phylogram using D3 library',
		author: 'Nathanaêl Khodl, Luc Patiny',
		date: '30.12.2013',
		license: 'MIT',
		cssClass: 'phylogram'
	};


	// Leaves
	controller.prototype.mouseOverLeaf = function(data) {
		this.sendTreeFromEvent(data,"onLeafHover");
	}
	controller.prototype.mouseOutLeaf = function() {

	}
	controller.prototype.clickLeaf = function(data) {
		this.sendTreeFromEvent(data,"onLeafSelect");
	}

	// BRanches
	controller.prototype.mouseOverBranch = function(data) {
		this.sendTreeFromEvent(data,"onBranchHover");
	}

	controller.prototype.mouseOutBranch = function() {
	}

	controller.prototype.clickBranch = function(data) {
		this.sendTreeFromEvent(data,"onBranchSelect");
	}

	controller.prototype.sendTreeFromEvent = function(data,name){
		var element = new DataObject({'type':'tree',value:data.data}, true);
		this.sendAction('tree', element, name);
		this.setVarFromEvent(name, element,'tree');
	}

    controller.prototype.configurationStructure = function(){
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },

                    fields: {
                        branchWidth: {
                            type: 'text',
                            default : 4,
                            title: 'Branch width'
                        },

                        /*
                        branchColor: {
                            type: 'color',
                            title: 'Branch color'
                        }
                        */
                    }
                }
            }
        };
    }

    controller.prototype.configAliases = {
        'branchWidth': [ 'groups', 'group', 0, 'branchWidth', 0 ],
        //'branchColor': [ 'groups', 'group', 0, 'branchColor', 0 ]
    }

	controller.prototype.configurationSend = {
		events: {

			onLeafSelect: {
				label: 'Select a leaf',
				description: 'Click on a leaf to select it'
			},

			onLeafHover: {
				label: 'Hovers a leaf',
				description: 'Pass the mouse over a leaf to select it'
			},

			onBranchSelect: {
				label: 'Select a branch',
				description: 'Click on a branch to select it'
			},

			onBranchHover: {
				label: 'Hovers a branch',
				description: 'Pass the mouse over a branch to select it'
			}
		},
		
		rels: {
			'tree': {
				label: 'Tree',
				description: 'Returns the selected tree'
			}
		}
	}
	
	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		tree: {
			type: ['tree'],
			label: 'A tree with children'
		}
	};

	controller.prototype.variablesIn = [ 'tree' ];


	return controller;
});