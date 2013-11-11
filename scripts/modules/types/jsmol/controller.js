define(['modules/defaultcontroller', 'util/datatraversing', 'util/api'], function(Default, Traversing, API) {
	
	function controller() {

	};

	controller.prototype = $.extend(true, {}, Default, {

		onJSMolScriptRecieve:function(a){
			this.module.view.executeScript(a.value);
		},

		configurationSend: {

			events: {

			},

			rels: {

			}
		},
		
		configurationReceive: {
			data: {
				type: ['pdb', 'mol3d'],
				label: 'A molecule/protein data',
				description: ''
			}
		},
		
		
		moduleInformations: {
			moduleName: 'JSMol'
		},
		
		
		actions: {
			rel: {}
		},

		actionsReceive: {
			'jsmolscript': 'Some JSMol Script recieved'
		}

	});

	return controller;
});