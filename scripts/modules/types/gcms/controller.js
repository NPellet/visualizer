define(['modules/defaultcontroller', 'util/datatraversing'], function(Default, Traversing) {


	function controller() {

	};

	controller.prototype = $.extend(true, {}, Default, {


		configurationSend: {

			events: {
				
			},
			
			rels: {
				
			}
			
		},
		
		configurationReceive: {
			gcms: {
				type: ["jcamp", "array", "object"],
				label: 'GC-MS data'
			},

			jcamp: {
				type: ["jcamp", "string"],
				label: 'GC-MS data via JCamp'
			}		
		},
		
		actions: {
			//rel: {'addSerie': 'Add a serie', 'removeSerie': 'Remove a serie'}
		},


		actionsReceive: {
			'addSerie': 'Add a new serie',
			'removeSerie': 'Remove a serie'
		},


		moduleInformations: {
			moduleName: 'GC MS'
		},
		
		doConfiguration: function(section) {

			return {
				groups: {
					'gencfg': {
						config: {
							type: 'list'
						},

						fields: [
							{
								type: 'Checkbox',
								name: 'continuous',
								title: 'Continuous',
								options: {'continuous': 'Continuous'}
							},

							{
								type: 'Text',
								name: 'nbzones',
								title: 'Maximum number of zones'
							}
						]
					}
				}
			};
		},
		
		doFillConfiguration: function() {

			return {
				groups: {
					gencfg: [{
						continuous: [this.module.getConfiguration().continuous ? ['continuous'] : []],
						nbzones: [this.module.getConfiguration().nbzones || 1]
					}]
				}
			}
		},
			
		doSaveConfiguration: function(confSection) {	

			this.module.getConfiguration().continuous = confSection[0].gencfg[0].continuous[0][0] == 'continuous';
			this.module.getConfiguration().nbzones = confSection[0].gencfg[0].nbzones[0];
		

		}
	});

	return controller;
});
