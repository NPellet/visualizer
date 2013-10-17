
requirejs.config({
	"baseUrl": "./scripts",
	"paths": {
		"jquery": './jquery/jquery'
	},

	"shim": {
		
	}
});

require(['jquery', './forms2/form'], function($, Form) {

	var form = new Form();
	form.init();
	form.setStructure({
		sections: {

			sectionName: {
				groups: {

					groupName: {
						options: {
							type: 'table',
							multiple: true
						},

						fields: {
							text: {
								name: 'Hello',
								type: 'combo',
								multiple: true
							},

							text2: {
								name: 'Hello2',
								type: 'color',
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
								text2: ['1', '2', '3']
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
	$("body").html(form.makeDom());
});
	
});
