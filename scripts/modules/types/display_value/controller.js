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
			"value": {
				type: ['string', 'number', 'mf', 'picture', 'gif', 'jpeg', 'png', 'mol2d', 'jpg'],
				label: 'Any string, number or picture',
				description: ''
			},
			
			"color": {
				type: "string",
				label: "A color to fill the module with"
			}
		},
		
		
		moduleInformations: {
			moduleName: 'Single value'
		},
		

		doConfiguration: function(section) {
			
			return {
				groups: {
					'module': {
						config: {
							type: 'list'
						},

						fields: [

							{
								type: 'Wysiwyg',
								name: 'defaultvalue',
								title: 'Default value'
							},

							{
								type: 'Color',
								name: 'fcolor',
								title: 'Foreground color'
							},

							{
								type: 'Combo',
								name: 'font',
								title: 'Font',
								options: [
									{title: 'Arial', key: 'arial'},
									{title: 'Arial Black', key: 'arial black'},
									{title: 'Comic Sans MS', key: 'comic sans ms'},
									{title: 'Courier', key: 'courier'},
									{title: 'Courier new', key: 'courier new'},
									{title: 'Georgia', key: 'georgia'},
									{title: 'Helvetica', key: 'helvetica'},
									{title: 'Impact', key: 'impact'},
									{title: 'Palatino', key: 'palatino'},
									{title: 'Times new roman', key: 'times new roman'},
									{title: 'Trebuchet MS', key: 'trebuchet ms'},
									{title: 'Verdana', key: 'verdana'}
								]
							},

							{
								type: 'Combo',
								name: 'fsize',
								title: 'Font size',
								options: [
									{title: '8pt', key: '8pt'},
									{title: '9pt', key: '9pt'},
									{title: '10pt', key: '10pt'},
									{title: '11pt', key: '11pt'},
									{title: '12pt', key: '12pt'},
									{title: '13pt', key: '13pt'},
									{title: '14pt', key: '14pt'},
									{title: '18pt', key: '18pt'},
									{title: '24pt', key: '24pt'},
									{title: '30pt', key: '30pt'},
									{title: '36pt', key: '36pt'},
									{title: '48pt', key: '48pt'},
									{title: '64pt', key: '64pt'}
								]
							},


							
							{
								type: 'Combo',
								name: 'align',
								title: 'Alignment',
								options: [
									{title: 'Left', key: 'left'},
									{title: 'Center', key: 'center'},
									{title: 'Right', key: 'right'}
								]
							},


							
							{
								type: 'Combo',
								name: 'valign',
								title: 'Vertical align',
								options: [
									{title: 'Top', key: 'top'},
									{title: 'Middle', key: 'middle'},
									{title: 'Bottom', key: 'bottom'}
								]
							},

							{
								type: 'Text',
								name: 'sprintf',
								title: 'Sprintf'
							}
						]
					}
				}
			}
		},
		
		doFillConfiguration: function() {
			
			var defaultvalue = this.module.getConfiguration().defaultvalue || "";
			var fcolor = this.module.getConfiguration().frontcolor || "";
			var font = this.module.getConfiguration().font || "arial";
			var fontsize = this.module.getConfiguration().fontsize || "";
			var align = this.module.getConfiguration().align || "left";
			var valign = this.module.getConfiguration().valign || "top";
			var sprintf = this.module.getConfiguration().sprintf || "";
		
			return {
				groups: {
					module: [{
						defaultvalue: [defaultvalue],
						fcolor: [fcolor],
						font: [font],
						fsize: [fontsize],
						align: [align],
						valign: [valign],
						sprintf: [sprintf]
					}]
				}
			}
		},
		
		
		doSaveConfiguration: function(confSection) {
			var group = confSection[0].module[0];
			var fcolor = group.fcolor[0];
			var font = group.font[0];
			var fsize = group.fsize[0];
			var align = group.align[0];
			var sprintf = group.sprintf[0];
			var valign = group.valign[0];
			var defaultvalue = group.defaultvalue[0];
			this.module.definition.configuration = {
				frontcolor: fcolor,
				font: font,
				fontsize: fsize,
				align: align,
				valign: valign,
				defaultvalue: defaultvalue,
				sprintf: sprintf
			};


		}

		
	});

	return controller;
});