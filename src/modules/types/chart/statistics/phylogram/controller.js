define(['modules/default/defaultcontroller'], function(Default) {

    function controller() {
        this._data=new DataObject();
    }

    // Extends the default properties of the default controller
    controller.prototype = $.extend(true, {}, Default);

    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        name: 'Phylogram',
        description: 'Display phylogram using D3 library',
        author: 'Nathanaêl Khodl, Luc Patiny, Michaël Zasso',
        date: '30.12.2013',
        license: 'MIT',
        cssClass: 'phylogram'
    };

    controller.prototype.mouseOverLeaf = function(data) {
        if(data.data) {
            this._data = DataObject.check(data.data);
            this.createDataFromEvent("onLeafHover", 'leaf', DataObject.check(this._data));
        }
    };
    controller.prototype.mouseOutLeaf = function() {

    };
    controller.prototype.clickLeaf = function(data) {
        if(data.data) {
            this._data = DataObject.check(data.data);
            this.createDataFromEvent("onLeafSelect", 'leaf', DataObject.check(this._data));
        }
    };

    controller.prototype.mouseOverBranch = function(data) {
        this.sendTreeFromEvent(data, "onBranchHover");
    };

    controller.prototype.mouseOutBranch = function() {
    };

    controller.prototype.clickBranch = function(data) {
        this.sendTreeFromEvent(data, "onBranchSelect");
    };

    controller.prototype.sendTreeFromEvent = function(data, name) {
        var element = new DataObject({'type': 'tree', value: data}, true);
        this.sendAction('tree', element, name);
        this.createDataFromEvent(name, 'tree', element);
		this.createDataFromEvent(name, 'list', function(){
            var arr = [];
            treeToArray(arr, data);
            return DataArray(arr);
        });
    };
	
	function treeToArray(arr, tree) {
		if(tree.children) {
			for(var i = 0, ii = tree.children.length; i < ii; i++) {
				treeToArray(arr, tree.children[i]);
			}
		}
		else if(tree.data) {
			arr.push(tree.data);
		}
	}

    controller.prototype.configurationStructure = function() {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        branchWidth: {
                            type: 'text',
                            default: 4,
                            title: 'Branch width'
                        }
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
    };

    controller.prototype.configAliases = {
        'branchWidth': ['groups', 'group', 0, 'branchWidth', 0]
        //'branchColor': [ 'groups', 'group', 0, 'branchColor', 0 ]
    };

    controller.prototype.events = {
        onLeafSelect: {
            label: 'Select a leaf',
            refVariable: ['leaf']
        },
        onLeafHover: {
            label: 'Hovers a leaf',
            refVariable: ['leaf']
        },
        onBranchSelect: {
            label: 'Select a branch',
            refVariable: ['tree','list']
        },
        onBranchHover: {
            label: 'Hovers a branch',
            refVariable: ['tree','list']
        }
    };

    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        tree: {
            type: ['tree'],
            label: 'A tree with children'
        },
        leaf: {
            label: 'Value of the leaf'
        },
		list: {
			type: 'array',
			label: 'A list of children'
		}
    };

    controller.prototype.variablesIn = ['tree'];


    return controller;
});