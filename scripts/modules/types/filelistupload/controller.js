define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		configurationSend: {

			events: {

			},
			
			rels: {
				
			}
			
		},
		
		configurationReceive: {
			filelist: {
				type: ["array"],
				label: 'List',
				description: 'A list of files'
			}		
		},
		
		
		moduleInformations: {
			moduleName: 'Upload files'
		},
		
		
		actions: {
		
		},

		actionsReceive: {
		
		},
		
		
		doConfiguration: function(section) {

			return {
				groups: {
					'gen': {
						config: { type: 'list' },
						fields: [
							{
								type: 'Text',
								name: 'fileuploadurl',
								title: 'Upload URL'
							}
						]
					}
				}
			}
		},
		
		doFillConfiguration: function() {
			
			return {	

				groups: {
					gen: [{
						fileuploadurl: [this.module.getConfiguration().fileuploadurl],
					}],
				}
			}
		},
		
		doSaveConfiguration: function(confSection) {
			this.module.getConfiguration().fileuploadurl = confSection[0].gen[0].fileuploadurl[0];
		},

		"export": function() {
		
		}

	});

	return controller;
});