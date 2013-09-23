define(['modules/defaultcontroller','util/datatraversing'], function(Default,Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		init: function() {
			
		},

		onDropped: function(obj) {
			
			this.setVarFromEvent('onDropped', obj);
		},

		configurationSend: {

			events: {
				onDropped: {
					label: 'A file has been opened'
				}
			},
			
			rels: {
				'object': {
					label: 'Dropped file'
				}
			}		
		},
		
		actions: {
			rel: {

			}
		},

		actionsReceive: { },

		configurationReceive: {
				
		},
		
		
		doConfiguration: function(section) {
			
			var jpaths = this.module.model.getjPath();

			return {
				groups: {
					'gencfg': {
						config: {
							type: 'list'
						},

						fields: [
							{
								type: 'Text',
								name: 'vartype',
								title: 'Variable type (optional)'
							}
						]
					}
				}
			}		
		},
		
		doFillConfiguration: function() {

			var cfg = this.module.getConfiguration();
			var cols = cfg.colsjPaths;

			return {	
				groups: {
					gencfg: [{
						vartype: [cfg.vartype]
					}]
				}
			}
		},
		
		doSaveConfiguration: function(confSection) {
			this.module.getConfiguration().vartype = confSection[0].gencfg[0].vartype[0];
		},

		onVarReceiveChange: function(name, rel, confSection) {
		},

		"export": function() {
		}
	});

	return controller;
});
