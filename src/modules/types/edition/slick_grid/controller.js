define(['modules/default/defaultcontroller'], function(Default) {

	var controller = function() {};

    controller.prototype = $.extend(true, {}, Default);

	/*
		Information about the module
	*/
	controller.prototype.moduleInformation = {
		moduleName: 'Slick Grid',
		description: 'Table editor based on SlickGrid',
		author: 'Daniel Kostro',
		date: '14.10.2014',
		license: 'MIT',
		cssClass: 'slickgrid'
	};

controller.prototype.configurationStructure = function(section) {

    var jpaths = this.module.model.getjPath('row', false );


    return {
        groups: {

            group: {
                options: {
                    type: 'list',
                    multiple: false
                },

                fields: {

                    toggle: {
                        type: 'combo',
                        title: 'Line toggling',
                        options: [{key: "0", title: "No"}, {key: "single", title:"Single row"}, {key: "multiple", title:"Multiple rows"}]
                    },

                    colorjpath: {
                        type: 'combo',
                        title: 'Color jPath',
                        options: jpaths
                    },

                    filterRow: {
                        type: 'jscode',
                        title: 'Filter'
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

                    number: {
                        type: 'checkbox',
                        title: 'Number ?',
                        options: {number: 'Yes'}
                    },

                    editable: {
                        type: 'combo',
                        title: 'Editable',
                        default: 'none',
                        options: [{key: 'none', title: 'No'}, {key: 'text', title: 'Text'}, {key: 'checkbox', title: 'Checkbox'}, {key: 'select', title: 'Combo'}]
                    },

                    options: {
                        type: 'text',
                        title: 'Options (; separated)'
                    },

                    width: {
                        type: 'text',
                        title: 'Width'
                    }
                }
            }
        }
    }
};


	return controller;
});