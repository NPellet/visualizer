define(['modules/default/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		move: function(x,y) {
			var actions;
			if(!(actions = this.module.vars_out()))	
				return;	
			for(var i = 0; i < actions.length; i++)
				if(actions[i].event == "onMove") {
					CI.API.setSharedVarFromJPath(actions[i].name, [x,y], actions[i].jpath);
				}
		},

		zoom: function(zoom) {
			var actions;
			if(!(actions = this.module.vars_out()))	
				return;	
			for(var i = 0; i < actions.length; i++)
				if(actions[i].event == "onZoomChange") {
					CI.API.setSharedVarFromJPath(actions[i].name, zoom, actions[i].jpath);
				}
		},
		
		configurationSend: {

			events: {

				onMove: {
					label: 'Move',
					description: ''
				},
				
				onZoomChange: {
					label: 'Changes Zoom',
					description: ''
				}
			},
			
			rels: {
				'xycoords': {
					label: 'XY Coords',
					description: ''
				},

				'zoom': {
					label: 'Zoom',
					description: ''
				}
			}
			
		},
		
		configurationReceive: {
			zoom: {
				type: "number",
				label: 'Zoom',
				description: ''
			},

			xycoords: {
				type: "array",
				label: 'X-Y Coords',
				description: ''
			}
		},
		
		
		moduleInformations: {
			moduleName: 'Navigator'
		},
		
		
		doConfiguration: function(section) {
			
			//return true;
		},
		
		doFillConfiguration: function() {
			return {
				groups: {
				}
			};
		},
		
		doSaveConfiguration: function(confSection) {
			
		},

		"export": function() {

		}

	});

	return controller;
});
