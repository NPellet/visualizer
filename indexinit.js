
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
	form.setStructure({
		sections: {

			sectionName: {
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

				options: {
					icon: 'layer_export'
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
							},


							text2: {
								name: 'Hello2',
								type: 'checkbox',
								options: {'c':'d'}
							}
						}
					}
				}
			},


			sectionName2: {
				groups: {

					groupName: {
						options: {
							type: 'table',
							multiple: true
						},

						fields: {

							text3: {
								name: 'Hello',
								type: 'jscode',
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
