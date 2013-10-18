
requirejs.config({
	"baseUrl": "./scripts",
	"paths": {
		"jquery": 'libs/jquery/jquery',
		'dynatree': 'libs/dynatree/dynatree',
		"jqueryui": "libs/jqueryui/jquery-ui.min",
		"ckeditor": "libs/ckeditor/ckeditor"
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
								type: 'combo',
								title: 'Module title',
								options: [{key: 1, title: "Salut"}, {key: 2, title: "Coucou"}, {key:3, title: "Hello"}]
							},

							bgcolor: {
								type: 'color',
								title: 'Background color'
							}
						}
					}
				}
			},


			module_specific_config: {

				options: {
					title: 'Module configuration',
					icon: 'page_white_wrench'
				},

				groups: {

					groupName: {
						options: {
							type: 'list',
							multiple: true
						},

						fields: {

							text: {
								name: 'Hello',
								type: 'text',
								options: [{ key: 'a', title: 'b'}, { key: 'c', title : 'd' }],
								multiple: true
							}
						}
					}
				}
			},


			vars_in: {

				options: {
					title: 'Variables in',
					icon: 'basket_put'
				},

				groups: {

					groupName: {
						options: {
							type: 'list',
							multiple: true
						},

						fields: {

							text: {
								name: 'Hello',
								type: 'text',
								options: [{ key: 'a', title: 'b'}, { key: 'c', title : 'd' }],
								multiple: true
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
							type: 'list',
							multiple: true
						},

						fields: {

							text: {
								name: 'Hello',
								type: 'text',
								options: [{ key: 'a', title: 'b'}, { key: 'c', title : 'd' }],
								multiple: true
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
							type: 'list',
							multiple: true
						},

						fields: {

							text: {
								name: 'Hello',
								type: 'text',
								options: [{ key: 'a', title: 'b'}, { key: 'c', title : 'd' }],
								multiple: true
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

							text: {
								name: 'Hello',
								type: 'text',
								options: [{ key: 'a', title: 'b'}, { key: 'c', title : 'd' }],
								multiple: true
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

form.onLoaded().done(function() {
	$("#form").html(form.makeDom());
	form.inDom();


});
	
});
