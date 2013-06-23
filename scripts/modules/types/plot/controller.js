
define(function(['modules/defaultcontroller'], function(Default)) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {


		configurationSend: {

			events: {
				
			},
			
			rels: {
				
			}
			
		},
		
		configurationReceive: {
			"plotdata": {
				type: ['object'],
				label: 'The plot data',
				description: ''
			},

			"serieSet": {
				type: ['object'],
				label: 'A set of series',
				description: ''
			}
		},
		
		actions: {
			rel: {'addSerie': 'Add a serie', 'removeSerie': 'Remove a serie'}
		},


		actionsReceive: {
			'addSerie': 'Add a new serie',
			'removeSerie': 'Remove a serie'
		},


		moduleInformations: {
			moduleName: 'Chart (Norman)'
		},
		
		doConfiguration: function(section) {
			


			var group = new BI.Forms.GroupFields.Table('spectrainfos');
			section.addFieldGroup(group);

			field = group.addField({
				'type': 'Combo',
				'name': 'variable',
				title: new BI.Title('Variable')
			});

			var vars = [];
			var currentCfg = this.module.definition.dataSource;

			if(currentCfg)
				for(var i = 0; i < currentCfg.length; i++) {
					if(currentCfg[i].rel == 'serieSet')
						vars.push({title: currentCfg[i].name, key: currentCfg[i].name});
				}

			field.implementation.setOptions(vars);


			field = group.addField({
				'type': 'Color',
				'name': 'plotcolor',
				title: new BI.Title('Color')
			});


			return true;
		},
		
		doFillConfiguration: function() {


			var spectrainfos = { 'variable': [], 'plotcolor': [] };
			var infos = this.module.getConfiguration().plotinfos || [];
			for(var i = 0, l = infos.length; i < l; i++) {
				spectrainfos.variable.push(infos[i].variable);
				spectrainfos.plotcolor.push(infos[i].plotcolor);
			}

			return {
				groups: {
					spectrainfos: [spectrainfos]
				}
			}	
		},
		
		
		doSaveConfiguration: function(confSection) {	
			this.module.getConfiguration().plotinfos = confSection[0].spectrainfos[0];
		}

		
	});

	return controller;
});

