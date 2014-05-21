define( [ 'modules/default/defaultcontroller' ], function( Default ) {
	
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
		moduleName: 'Loading plot',
		description: 'Display a loading plot',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'loading_plot'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		// Input
		loading: {
			label: 'Loading variable',
			type: "loading"
		},

		preferences: {
			label: 'Preferences',
			type: "object"
		},

		// Output
		element: {
			label: 'Selected element',
			type: 'object'
		},

		// Mixed
		zoom: {
			label: 'Zoom',
			type: 'string'
		},

		center: {
			label: 'Coordinates of the center',
			type: 'array'
		},

		viewport: {
			label: 'Viewport',
			type: 'object'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {


		onHover: {
			label: 'Hovers an element',
			refVariable: [ 'element' ]
		},

		onMove: {
			label: 'Move the map',
			refVariable: [ 'center', 'zoom', 'viewport' ]
		},

		onZoomChange: {
			label: 'Change the zoom',
			refVariable: [ 'center', 'zoom', 'viewport' ]
		},

		onViewPortChange: {
			label: 'Viewport has changed',
			refVariable: [ 'center', 'zoom', 'viewport' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'loading' ];

	/*
		Received actions
		In the form of

		{
			actionRef: 'actionLabel'
		}
	*/
	controller.prototype.actionsIn = {
		addElement: 'Add an element'
	};
	
		
	controller.prototype.configurationStructure = function() {
            var data = this.module.getDataFromRel('loading'), opts = [];
            if(data && data.value)
                for(var i = 0; i < data.value.series.length; i++) 
                    opts.push({title: data.value.series[i].label, key: data.value.series[i].category });
            return {
                groups: {
                    general: {
                        options: {
                            type: 'list',
                            multiple: false
                        },
                        fields: {
                            navigation: {
                                title: 'Navigation',
                                type: 'checkbox',
                                options: {navigation: 'Navigation only'}
                            }
                        }
                    }
                },
                sections: {
                    module_layers: {
                        options: {
                            multiple: true,
                            title: 'Layers'
                        },
                        groups: {
                            group: {
                                options: {
                                    type: 'list'
                                },
                                fields: {
                                    el: {
                                        type: 'combo',
                                        title: 'Layer',
                                        options: opts
                                    },
                                    type: {
                                        type: 'combo',
                                        title: 'Display as',
                                        options: [
                                            {key: 'ellipse', title: 'Ellipse / Circle'},
                                            {key: 'pie', title: 'Pie chart'},
                                            {key: 'img', title: 'Image'}
                                        ]
                                    },
                                    color: {
                                        type: 'color',
                                        title: 'Color (default)'
                                    },
                                    labels: {
                                        type: 'checkbox',
                                        title: 'Labels',
                                        options: {
                                            display_labels: 'Display',
                                            forcefield: 'Activate force field',
                                            blackstroke: 'Add a black stroke around label',
                                            scalelabel: 'Scale label with zoom'
                                        }
                                    },
                                    labelsize: {
                                        type: 'text',
                                        title: 'Label size'
                                    },
                                    labelzoomthreshold: {
                                        type: 'text',
                                        title: 'Zoom above which labels are displayed'
                                    },
                                    highlightmag: {
                                        type: 'text',
                                        title: 'Highlight magnification'
                                    },
                                    highlighteffect: {
                                        type: 'checkbox',
                                        title: 'Highlight effect',
                                        options: {
                                            stroke: 'Thick yellow stroke'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
	};
        
        controller.prototype.configAliases = {
		'navigation': [ 'groups', 'general', 0, 'navigation' ],
                'layers' : [ 'sections', 'module_layers' ]
	};

	controller.prototype.hover = function(data) {
            this.setVarFromEvent( 'onHover', data );
		/*var actions;
		if(!(actions = this.module.vars_out()))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onHover") {
				CI.API.setSharedVarFromJPath(actions[i].name, data, actions[i].jpath);
			}*/
	};

	controller.prototype.onZoomChange = function(zoom) {
            this.setVarFromEvent( 'onZoomChange', zoom, 'zoom' );
            /*
		var actions;
		if(!(actions = this.module.vars_out()))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onZoomChange") {
				CI.API.setSharedVarFromJPath(actions[i].name, zoom, actions[i].jpath);
			}*/
	};

	controller.prototype.onMove = function(x, y) {
            this.setVarFromEvent( 'onMove', [x,y], 'center' );
            /*
		var actions;
		if(!(actions = this.module.vars_out()))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onMove") {
				CI.API.setSharedVarFromJPath(actions[i].name, [x,y], actions[i].jpath);
			}*/
	};


	controller.prototype.onChangeViewport = function(vp) {
            this.setVarFromEvent( 'onChangeViewport', vp, 'viewport' );
            /*
		var actions;
		if(!(actions = this.module.vars_out()))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onViewPortChange") {
				CI.API.setSharedVarFromJPath(actions[i].name, vp, actions[i].jpath);
			}*/
	};

	return controller;
});
