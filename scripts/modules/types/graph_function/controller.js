define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

        configurationStructure : function(){
            return {
                groups: {
                    group: {
                        options: {
                            type: 'list'
                        },

                        fields: {

                        	'function': {
                                type: 'text',
                                default: 'sin(sqrt(0.01*x^2  + 0.01*y^2))*10',
                                title: 'Mathematical function'
                            },

                            xMin: {
                                type: 'text',
                                default: -100,
                                title: 'Min X'
                            },

                            xMax: {
                                type: 'text',
                                default: 100,
                                title: 'Max X'
                            },

                            yMin: {
                                type: 'text',
                                default: -100,
                                title: 'Min Y'
                            },

                            yMax: {
                                type: 'text',
                                default: 100,
                                title: 'Max Y'
                            },

                            zMin: {
                                type: 'text',
                                title: 'Min Z'
                            },

                            zMax: {
                                type: 'text',
                                title: 'Max Z'
                            },

                            segments: {
                                type: 'text',
                                default: 100,
                                title: 'Number segments'
                            }
                        }
                    }
                }
            };
        },

        configAliases: {
        	'function': [ 'groups', 'group', 0, 'function', 0 ],
        	'xMin': [ 'groups', 'group', 0, 'xMin', 0 ],
        	'xMax': [ 'groups', 'group', 0, 'xMax', 0 ],
        	'yMin': [ 'groups', 'group', 0, 'yMin', 0 ],
        	'yMax': [ 'groups', 'group', 0, 'yMax', 0 ],
        	'zMin': [ 'groups', 'group', 0, 'zMin', 0 ],
            'zMax': [ 'groups', 'group', 0, 'zMax', 0 ],
			'segments': [ 'groups', 'group', 0, 'segments', 0 ]
        },

		configurationSend: {
		},
		
		configurationReceive: {
			"function": {
				type: ['string'],
				label: 'Mathematical function with x and y',
				description: ''
			}
		},

		moduleInformations: {
			moduleName: 'WebGL function grapher'
		}

		
	});

	return controller;
});