
define(['modules/defaultcontroller', 'libs/formcreator/formcreator'], function(Default, FormCreator) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {
			
		configurationSend: {
			events: {
				
			},
			rels: {
				
			}			
		},
		
		configurationReceive: {
		},
		
		configurationStructure: function() {

			return {
				sections: {

					structure: FormCreator.makeConfig(),
			
					template: {

						options: {
							title: 'Template'
						},

						groups: {
							template: {
								options: {
									type: 'list',
									multiple: false
								},

								fields: {
									file: {
										type: 'text',
										title: 'Template file'
									},
									
									html: {
										type: 'textarea',
										title: 'HTML template'
									}
								}
							}
						}
					}
				}
			}
		},
		
		"export": function() {

		},

		configAliases: {
			structure: [ 'sections', 'structure' ],
			tpl_file: [ 'sections', 'template', 0, 'groups', 'template', 0, 'file', 0 ],
			tpl_html: [ 'sections', 'template', 0, 'groups', 'template', 0, 'html', 0 ]
		}

	});

	return controller;
});
