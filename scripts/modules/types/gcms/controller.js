define(['modules/defaultcontroller', 'util/datatraversing'], function(Default, Traversing) {


	function controller() {

	};

	controller.prototype = $.extend(true, {}, Default, {


		configurationSend: {
			
			events: {
				onZoomGCChange: {
					label: 'Zoom over GC spectra'
				},

				onZoomMSChange: {
					label: 'Zoom over MS spectra'
				},

				onIntegralSelect: {
					label: 'Integration is selected'
				},

				onIntegralAdd: {
					label: 'Integral is added',
					description: ''
				},

				onIntegralRemove: {
					label: 'Integral is removed',
					description: ''
				},

				onIntegralChange: {
					label: 'Integral is changed',
					description: ''
				},

				onMSTrackingAdded: {
					label: 'Add vertical tracking line over MS spectra'
				}
			},

			rels: {
				'msSelected': {
					label: 'Selected ms'
				},

				'annotation': {
					label: 'Annotation'
				}
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
			},

			gc: {
				type: ["jcamp"],
				label: 'GC'	
			},
			
			ms: {
				type: ["jcamp"],
				label: 'MS'	
			},

			mscont: {
				type: ["jcamp"],
				label: 'Continuous MS'	
			},

			annotationgc: {
				type: ["array"],
				label: 'Annotation for GC'
			}		
		},
		

		actions: {
			rel: {
				'fromtoGC': 'From - To on GC', 
				'fromtoMS': 'From - To on MS',
				'annotation': 'Annotation',
				'msIon': 'Correspond MS Ion'
			}
		},

		actionsReceive: {
			'fromtoGC': 'From - To on GC',
			'fromtoMS': 'From - To on MS',
			'zoomOnAnnotation': 'Zoom on annotation',
			'annotation': 'Annotation',
			'displayChemicalLabels': 'Display chemical labels',
			'hideChemicalLabels': 'Hide chemical labels'
		},

		moduleInformations: {
			moduleName: 'GC MS'
		},
		
		configurationStructure: function(section) {

			return {
				groups: {
					group: {
						options: {
							type: 'list'
						},

						fields: {
							
							continuous: {
								type: 'checkbox',
								title: 'MS Continuous',
								options: {'continuous': 'Continuous'}
							}
						}
					}
				}
			};
		},

		configAliases: {
			'continuous': function(cfg) { return cfg.groups.group[ 0 ].continuous[ 0 ][ 0 ] == "continuous"; }
		}
	});

	return controller;
});
