
requirejs.config({
	"baseUrl": "./scripts",
	"paths": {
		"jquery": 'libs/jquery/jquery',
		'dynatree': 'libs/dynatree/dynatree',
		"jqueryui": "libs/jqueryui/jquery-ui.min",
		"ckeditor": "libs/ckeditor/ckeditor",
		"forms": "libs/forms"
	},

	"shim": {
		'dynatree': ['jquery', 'jqueryui'],
		"ckeditor": ["libs/ckeditor/adapters/jquery"]
	}
});

require(['jquery', './libs/forms2/form'], function($, Form) {

	var form = new Form({



	});
	form.init({
		onValueChanged: function( value ) {

			$("#json").html(JSON.stringify(value, null, '\t'))
			
		}
	});

	/*
'basket_put',
'basket_remove',
'door_in',
'door_out',
'page_white_wrench',
'page_white_paint',
'wrench',
'layer_import',
''
*/



	form.setStructure({

		sections: {

			module_config: {

				options: {
					title: 'General configuration',
					icon: 'page_white_paint'
				},

				groups: {

					groupName: {
						options: {
							type: 'list',
							multiple: true
						},

						fields: {

							moduletitle: {
								type: 'Text',
								name: 'moduletitle',
								multiple: false,
								title: 'Module title'
							},

							bgcolor: {
								type: 'Color',
								name: 'bgcolor',
								multiple: false,
								title: 'Background color'
							},

							modulewrapper: {
								type: 'Checkbox',
								name: 'modulewrapper',
								title: 'Module boundaries',
								options: {'display': ''}
							}
						}
					}
				}
			},


			module_specific_config: 
				$.extend(module.controller.doConfiguration() || {}, 	{
					options: {
						title: 'Module configuration',
						icon: 'page_white_wrench'
					}
				}),

			vars_in: {

				options: {
					title: 'Variables in',
					icon: 'basket_put'
				},

				groups: {

					groupName: {
						options: {
							type: 'table',
							multiple: true
						},

						fields: {

							rel: {
								type: 'combo',
								options: allRels2,
								title: 'Reference'
							},

							name: {
								type: 'text',
								title: 'From variable',
								autoComplete: autoComplete
							}
						}
					}
				}
			},


			vars_out: {

				options: {
					title: 'Variables out',
					icon: 'basket_remove'
				},

				groups: {

					groupName: {
						options: {
							type: 'list'
						},

						fields: {

							event: {
								type: 'combo',
								title: 'Event',
								options: allEvents
							},

							rel: {
								type: 'combo',
								title: 'Internal ref.',
								options: allRels
							},

							jpath: {
								type: 'combo',
								title: 'jPath',
								options: {}
							},

							name: {
								type: 'text',
								title: 'To variable'
							}
						}
					}
				}
			},


			actions_in: {

				options: {
					title: 'Actions in',
					icon: 'door_in'
				},

				groups: {

					groupName: {

						options: {
							type: 'list'
						},

						fields: {

							rel: {
								type: 'combo',
								title: 'Reference',
								options: allActionsReceive
							},

							name: {
								type: 'text',
								title: 'Action name'
							}
						}
					}
				}
			},


			actions_out: {

				options: {
					title: 'Actions out',
					icon: 'door_out'
				},

				groups: {

					groupName: {
						options: {
							type: 'list',
							multiple: true
						},

						fields: {

							event: {
								type: 'combo',
								title: 'On event',
								options: allEvents
							},

							rel: {
								type: 'combo',
								title: 'Reference',
								options: allActionsRels,
							},

							jpath: {
								type: 'combo',
								title: 'jPath',
								options: {}
							},

							name: {
								type: 'text',
								title: 'Action name'
							}
						}
					}
				}
			}
		}
	});

form.onStructureLoaded().done(function() {
	form.fill({ 

		sections: {
			sectionName: [
				{
					groups: {

						groupName: [
							{
								text: ['asd', 'fdgdfg']
							}
						]
					}
				},


				{
					groups: {
						groupName: [
							{
								text: ['sdfjushdfhjsdgf', 'lmno'],
								text2: ['a', 'b', '3']
							},

							{
								text: ['hijk', 'lmno']
							}
						]
					}
				}

			]
		}

	});
});

form.addButton('Save', { color: 'blue' }, function() {

});

form.onLoaded().done(function() {
	$("#form").html(form.makeDom());
	form.inDom();


});
	
});
