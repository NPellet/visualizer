define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		initimpl: function() {
			var actions;
			module.getActionForEvent('onHover', function(action) {
				this.module.getDomView().on('hover', 'table td', function() {
					var tdIndex = $(this).index();
					var trIndex = $(this).parent().index();
					var cols = module.getConfiguration().colnumber || 4;
					var elementId = trIndex * cols + tdIndex;
					if(!(moduleValue = module.getDataFromRel('list')))
						return;
					var value = CI.DataType.getValueIfNeeded(moduleValue);
					CI.API.setSharedVarFromJPath(actions[j].name, value[elementId], actions[j].jpath);
				});

			});

		},
		
		configurationSend:  {

				events: {
					onHover: {
						label: 'Hovers a cell',
						description: ''
					}
				},
				
				rels: {
					'cell': {
						label: 'Cell',
						description: 'Returns the selected cell element'
					}
				}
		},
		
		configurationReceive: {
			list: {
				type: 'array',
				label: 'List',
				description: 'Any list of displayable element'
			
			}
		},
		
		moduleInformations: {
				moduleName: 'Grid'
		},
		
		doConfiguration: function(section) {
			
			var jpaths = [], data;
			if((data = this.module.getDataFromRel('list') && data != null)
				CI.DataType.getJPathsFromElement(data[0], jpaths);
			
			return {
				groups: {
					'module': {
						config: {
							type: 'list'
						},

						fields: [

							{
								type: 'Text',
								name: 'colnumber',
								title: 'Number of columns'
							},

							{
								type: 'Combo',
								name: 'valjPath',
								title: 'Value jPath',
								options: jpaths
							},

							{
								type: 'Combo',
								name: 'colorjPath',
								title: 'Color jPath',
								options: jpath
							},

							{
								type: 'Text',
								name: 'width',
								title: 'Cell width'
							},

							{
								type: 'Text',
								name: 'height',
								title: 'Cell height'
							}
						]
					}
				}
			}
		},
		
		doFillConfiguration: function() {
			
			var valJpath = this.module.getConfiguration().valjpath || "";
			var colorJpath = this.module.getConfiguration().colorjpath || "";
			var cols = this.module.getConfiguration().colnumber || 4;
			
			var height = this.module.getConfiguration().height || "";
			var width = this.module.getConfiguration().width || "";
			
			return { groups: {
					module: [{
						colnumber: [cols],
						valjPath: [valJpath],
						colorjPath: [colorJpath],
						width: [width],
						height: [height]
					}]
				}
			}
		},
		
		
		doSaveConfiguration: function(confSection) {
			
			var group = confSection[0].module[0];
			
			var colnumber = group.colnumber[0];
			var valjpath = group.valjPath[0];
			var colorjpath = group.colorjPath[0];
			var height = group.width[0];
			var width = group.height[0];
			
			this.module.definition.configuration = {
				colnumber: colnumber,
				valjpath: valjpath,
				colorjpath: colorjpath,
				width: width,
				height: height
			};
		}
	});

 	return controller;
});