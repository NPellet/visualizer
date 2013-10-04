define(['modules/defaultcontroller', 'util/api'], function(Default, API) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		getMatrixElementFromEvent: function(e) {

				var moduleValue;
				if(!(moduleValue = this.module.getDataFromRel('matrix')))
					return false;
				
				var pxPerCell = this.module.view.getPxPerCell();
				var shift = this.module.view.getXYShift();
				
				
				e.offsetX = (e.offsetX || e.pageX - $(e.target).offset().left); 
				e.offsetY = (e.offsetY || e.pageY - $(e.target).offset().top);
				
				var x = Math.floor((e.offsetX - shift.x) / pxPerCell);
				var y = Math.floor((e.offsetY - shift.y) / pxPerCell);
				
				moduleValue = moduleValue.value;
				var xLabel = moduleValue.xLabel;
				var yLabel = moduleValue.yLabel;
				var gridData = moduleValue.data;
				
				if (!gridData || !gridData[0] || x < 0 || y < 0 || y > gridData.length || x > gridData[0].length)
					return false;
				
				if(isNaN(x) || isNaN(y))
					return false;

				return [xLabel[x], yLabel[y], gridData[y][x]];
		},

		initimpl: function() {
			
			var module = this.module;
			var controller = this;
			var actions;

			// Nothing to send ?
			if(!(actions = this.module.definition.dataSend))	
				return;
			
			$(this.module.getDomContent()).on('mousemove', 'canvas',
				// Debounce the hover event
				$.debounce(25, function(e) {
					
					var keyed = controller.getMatrixElementFromEvent(e);
					if(!keyed)
						return;

					var value = false;
					for(var i in actions) {
						if(actions[i].event == "onPixelHover") {
							if(actions[i].rel == "row")
									value = keyed[0];
							else if(actions[i].rel == "col")
									value = keyed[1];
							else if(actions[i].rel == "intersect")
									value = keyed[2];


							API.setVariable(actions[i].name, value, actions[i].jpath);
						}
					}
				}))//.on('mousemove', 'canvas', function() {

/*				for(var i in actions)
					if(actions[i].event == "onPixelHover")
						API.blankSharedVar(actions[i].name);

				});
*/			
			


			$(this.module.getDomContent()).on('mousedown', 'canvas', function(e) {

				// No need to blank the var here
				// No event debouncing
				var keyed = controller.getMatrixElementFromEvent(e);
				if(!keyed)
					return;

				var value = false;
				for(var i in actions) {
					if(actions[i].event == "onPixelHover") {
						if(actions[i].rel == "row")
								value = keyed[0];
						else if(actions[i].rel == "col")
								value = keyed[1];
						else if(actions[i].rel == "intersect")
								value = keyed[2];
						API.setVariable(actions[i].name, value, actions[i].jpath);
					}
				}
			});
		},
		


		configurationSend: {

			events: {
				onPixelHover: {
					label: 'mouse hover pixel',
					description: 'When the mouses moves over a new pixel of the data matrix'
				},
				onPixelClick: {
					label: 'click on a pixel',
					description: 'When the users click on any pixel'
				},
				onPixelDblClick: {
					label: 'double click on a pixel',
					description: 'When the user double clics on any pixel'
				}
			},
			
			rels: {
				'row': {
					label: 'Row',
					description: 'Sends the information description the row'
				},
				
				'col': {
					label: 'Column',
					description: 'Sends the information description the column'
				},
				
				'intersect': {
					label: 'Intersection',
					description: 'Sends the information description the intersection where the mouse is located'
				}
			}
		},
		
		configurationReceive: {
			'matrix': {
				type: 'matrix',
				label: 'Matrix',
				description: 'Receives the matrix to display'
			}
		},
		
		moduleInformations: {
			moduleName: 'Matrix'
		},
		
		
		doConfiguration: function(section) {
			
			return {
				groups: {
					'opts': {
						config: {
							type: 'list'
						},

						fields: [

							{
								type: 'Checkbox',
								name: 'highcontrast',
								title: 'Contrast',
								options: { 'true': 'Take data min/max as boundaries'}
							},

							{
								type: 'Color',
								name: 'color',
								title: 'Color',
								multiple: true
							}
						]
					}
				}
			}
		},
		
		
		doFillConfiguration: function() {
			var cols = this.module.getConfiguration().colors || ['#ffffff', '#000000'];
			var highcontrast = this.module.getConfiguration().highContrast || false;
			return {
				groups: {
					opts: [{
						highcontrast: [highcontrast ? ['true'] : []]
					}], 
					colors: [{
						color: cols
					}]
				}
			}
		},
		
		doSaveConfiguration: function(confSection) {
			var group = confSection[0].colors[0];		
			var colors = [];
			for(var i = 0; i < group.length; i++)
				colors.push(group[i].color);
		
			this.module.getConfiguration().colors = colors;
			this.module.getConfiguration().highContrast = confSection[0].opts[0].highcontrast[0][0];
		}
	});

 	return controller;
});
