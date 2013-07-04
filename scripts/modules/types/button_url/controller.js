define(['modules/defaultcontroller','util/datatraversing'], function(Default,Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {
	
		onClick: function() {
			var self = this;
			var url = this.module.view.url || this.module.getConfiguration().url;

			if(url)
				document.location.href = url;

			if(this.module.getConfiguration().script)
				eval(this.module.getConfiguration().script);
		},

		configurationSend: {

			events: {

			},
			
			rels: {
				
			}		
		},
		
		configurationReceive: {
			
			label: {
				type: ["string"],
				label: 'Label',
				description: 'Label'
			},

			color: {
				type: ["string"],
				label: 'Color',
				description: 'Color'
			},


			disabled: {
				type: ["boolean", "number"],
				label: 'Disabled',
				description: 'Disabled'
			},

			url: {
				type: ["string"],
				label: 'URL',
				description: 'URL'
			}		
		},
		
		moduleInformations: {
			moduleName: 'Button to URL'
		},



		doConfiguration: function(section) {
			
			var jpaths = [], data;
			if((data = this.module.getDataFromRel('list') && data != null)
				Traversing.getJPathsFromElement(data[0], jpaths);
			
			return {
				groups: {
					'cfg': {
						config: {
							type: 'list'
						},

						fields: [

							{
								type: 'Text',
								name: 'label',
								title: 'Button label'
							},

							{
								type: 'Combo',
								name: 'color',
								title: 'Background color',
								options: [
									{ title: 'Grey', key: 'grey'}, 
									{ title: 'Blue', key: 'blue'}, 
									{ title: 'Green', key: 'green'},
									{ title: 'Red', key: 'red'}
								]
							},

							{
								type: 'Checkbox',
								name: 'disabled',
								title: 'Disabled',
								options: {'disabled': ''}
							},

							{
								type: 'Text',
								name: 'url',
								title: 'Target URL'
							},

							{
								type: 'JSCode',
								name: 'script',
								title: 'Alternative script'
							}
						]
					}
				}
			}
		},
		
		
		doFillConfiguration: function() {
			var cfg = this.module.getConfiguration();
			return {	
				groups: {
					cfg: [{
						label: [cfg.label],
						color: [cfg.color],
						disabled: [cfg.disabled ? ['disabled'] : []],
						url: [cfg.url],
						script: [cfg.script]
					}]
				}
			}
		},
		
		doSaveConfiguration: function(confSection) {
			this.module.getConfiguration().label = confSection[0].cfg[0].label[0];
			this.module.getConfiguration().url = confSection[0].cfg[0].url[0];
			this.module.getConfiguration().color = confSection[0].cfg[0].color[0];
			this.module.getConfiguration().script = confSection[0].cfg[0].script[0];
			this.module.getConfiguration().disabled = confSection[0].cfg[0].disabled[0][0] == 'disabled';
		},

		"export": function() {
		}
	});

	return controller;
});
