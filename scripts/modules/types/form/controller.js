
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

			source: {
				type: [ "object" ],
				label: 'Source object'
			}
		},
		
		configurationStructure: function() {

			return {
				sections: {

					structure: {

						options: {
							title: 'Form structure'
						},

						groups: {
							group: {
								options: {
									type: 'list'
								},

								fields: {

									json: {
										type: 'textarea',
										title: 'Form structure'
									}
								}
							}
						}
					},
				

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
			structure: [ 'sections', 'structure', 0, 'groups', 'group', 0, 'json', 0 ],
			tpl_file: [ 'sections', 'template', 0, 'groups', 'template', 0, 'file', 0 ],
			tpl_html: [ 'sections', 'template', 0, 'groups', 'template', 0, 'html', 0 ]
		}

	});

	return controller;
});
