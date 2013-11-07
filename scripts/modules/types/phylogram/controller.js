define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		// Leaves
		mouseOverLeaf: function(data) { this.sendTreeFromEvent(data,"onLeafHover"); },
		mouseOutLeaf:function(){},
		clickLeaf: function(data) { this.sendTreeFromEvent(data,"onLeafSelect"); },

		// BRanches
		mouseOverBranch: function(data) { this.sendTreeFromEvent(data,"onBranchHover"); },
		mouseOutBranch:function(){},
		clickBranch: function(data) { this.sendTreeFromEvent(data,"onBranchSelect"); },

		// Send event + var
		sendTreeFromEvent : function(data,name){

			var element = new DataObject({'type':'tree',value:data.data}, true);
			/*console.log(name);
			console.warn(element);*/
			//this.setVarFromEvent('leafSelect', element,'tree');
			this.sendAction('tree', element, name);
			this.setVarFromEvent(name, element,'tree');
		},

		configurationSend: {
			events: {

				onLeafSelect: {
					label: 'Select a leaf',
					description: 'Click on a leaf to select it'
				},

				onLeafHover: {
					label: 'Hovers a leaf',
					description: 'Pass the mouse over a leaf to select it'
				},

				onBranchSelect: {
					label: 'Select a branch',
					description: 'Click on a branch to select it'
				},

				onBranchHover: {
					label: 'Hovers a branch',
					description: 'Pass the mouse over a branch to select it'
				}
			},
			
			rels: {
				'tree': {
					label: 'Tree',
					description: 'Returns the selected tree'
				}
			}
		},
		
		configurationReceive: {
			"array": {
				type: ['tree'],
				label: 'A tree with children',
				description: ''
			}
		},

		moduleInformations: {
			moduleName: 'D3 Test'
		},
		

		doConfiguration: function(section) {
			return {};
			/*
			return {
				groups: {
					'module': {
						config: {
							type: 'list'
						},

						fields: []
					}
				}
			}
			*/
		},
		
		doFillConfiguration: function() {
			return {}
		},
		
		
		doSaveConfiguration: function(confSection) {

			this.module.definition.configuration = {};
		}

		
	});

	return controller;
});