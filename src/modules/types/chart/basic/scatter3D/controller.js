define(['modules/default/defaultcontroller','src/util/datatraversing','src/util/api'], function(Default, Traversing, API) {
	
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
		moduleName: '3D Scatter Plot',
		description: 'Display',
		author: 'Daniel Kostro',
		date: '01.04.2014',
		license: 'MIT',
		cssClass: 'scatter_3D'
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events

		onHover: {
			label: 'Hover a 3D point',
			refVariable: [ 'point', 'info' ]
		}
	};
	
	controller.prototype.onHover = function(element) {
    console.log(element);
		if( ! element ) {
			return;
		}
    // this.setVarFromEvent( 'onHover', DataObject.check(element), 'point');
    this.setVarFromEvent( 'onHover', DataObject.check(element), 'info');
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		chart: {
			type: [],
			label: 'A json describing a chart'
		},
		yArray: {
			type: 'array',
			label: '1D Y array'
		},
    point: {
      label: 'Point label' 
    },
    info: {
      label: 'Point info'
    }
	};



	controller.prototype.elementHover = function(element) {
		if( ! element ) {
			return;
		}

		// this.setVarFromEvent( 'onHover', element, 'row' );
		if (this._highlighted) {
			API.highlight( this._highlighted, 0 );
		}
		API.highlight( element, 1 );
		this._highlighted=element;
	},

	controller.prototype.elementOut = function() {
		if (this._highlighted) {
			API.highlight( this._highlighted, 0 );
		}
	};


	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'chart', 'yArray' ];
	

	controller.prototype.configurationStructure = function() {
    var jpath = [];
    Traversing.getJPathsFromElement(this.module._data, jpath);
		return {
			groups: {
				group: {
					options: {
						type: 'list'
					},
          
					fields: {
            tooltip: {
                type: 'checkbox',
                title: 'Show tooltip',
                options: {show: 'Yes'}
            },
            
            tooltipJpath: {
                type: 'combo',
                title: 'Tooltip jPath',
                options: jpath
            },
            
            grid: {
              type: 'checkbox',
              title: 'Grids',
              options: {
                'xy': 'XY Main',
                'yz': 'YZ Main',
                'xz': 'XZ Main',
                'xysec': 'XY Secondary',
                'yzsec': 'YZ Secondary',
                'xzsec': 'XZ Secondary'
              },
              default: ['xy','yz','xz']
            },
            
            projection: {
              type: 'checkbox',
              title: 'Projections',
              options: {
                'show': 'Show'
              },
              default: ['show']
            },
            
            ticks: {
              type: 'checkbox',
              title: 'Ticks',
              options: {
                'x': 'X',
                'y': 'Y',
                'z': 'Z',
                'xlab': 'X Label',
                'ylab': 'Y Label',
                'zlab': 'Z Label'
              },
              default: ['x','y','z', 'xlab', 'ylab', 'zlab']
            },
            
            labels: {
              type: 'combo',
              title: 'Labels',
              options: [
              { title: 'None', key: 'none'},
              { title: 'As Legend', key: 'alegend'},
              { title: 'On axis', key: 'axis'}
              ]
            },
            
						minX: {
							type: 'text',
							title: 'Min X',
							default: ''
						},
            
						maxX: {
							type: 'text',
							title: 'Max X',
							default: ''
						},
						minY: {
							type: 'text',
							title: 'Min Y',
							default: ''
						},
            
						maxY: {
							type: 'text',
							title: 'Max Y',
							default: ''
						},
						minZ: {
							type: 'text',
							title: 'Min Z',
							default: ''
						},
            
						maxZ: {
							type: 'text',
							title: 'Max Z',
							default: ''
						},
            
            backgroundColor: {
              type: 'color',
              title: 'Background Color',
              default: 'rgb(230,230,230)',
            }
            
					}
				}
			}
		}
	};
	
	controller.prototype.configAliases = {
    'tooltip': ['groups', 'group', 0, 'tooltip', 0],
    'tooltipJpath': ['groups', 'group', 0, 'tooltipJpath', 0],
    'grid': ['groups', 'group', 0, 'grid', 0],
    'ticks': ['groups', 'group', 0, 'ticks', 0],
    'projection': ['groups', 'group', 0, 'projection', 0],
    'labels': ['groups', 'group', 0, 'labels', 0],
    'minX': ['groups', 'group', 0, 'minX', 0],
    'maxX': ['groups', 'group', 0, 'maxX', 0],
    'minY': ['groups', 'group', 0, 'minY', 0],
    'maxY': ['groups', 'group', 0, 'maxY', 0],
    'minZ': ['groups', 'group', 0, 'minZ', 0],
    'maxZ': ['groups', 'group', 0, 'maxZ', 0],
    'backgroundColor': ['groups', 'group', 0, 'backgroundColor', 0],
	};


 	return controller;
});

