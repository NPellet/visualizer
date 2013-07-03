
requirejs.config({
	"baseUrl": "scripts/",
	"paths": {
		"jquery": "libs/jquery/jquery",
		"jqueryui": "libs/jqueryui/jquery-ui.min",
		"forms": "libs/forms",
		"ckeditor": "libs/ckeditor/ckeditor"
	},

	"shims": {
		"ckeditor": ["libs/ckeditor/adapters/jquery"]
	}
});

require(['jquery', 'main/entrypoint', 'main/header'], function($, EntryPoint, Header) {

	$(document).ready(function() {

		var title = $("#visualizer-title");
		var buttons = $("#visualizer-buttons");

		var entryPoint = EntryPoint.init(function() {

			Header.addButtons(buttons, EntryPoint.getDataHandler(), EntryPoint.getViewHandler(), EntryPoint.getData(), EntryPoint.getView());
			
			
			if(EntryPoint.getDataHandler())
				EntryPoint.getDataHandler().updateButtons();

			if(EntryPoint.getViewHandler())
				EntryPoint.getViewHandler().updateButtons();

			if(EntryPoint.getViewHandler())
				Header.makeHeaderEditable(title, EntryPoint.getView(), EntryPoint.getViewHandler());
			else
				Header.makeHeader(title, EntryPoint.getView());
		});

	});
});

/*			
			CI.WebWorker.create('jsonparser', './scripts/webworker/scripts/jsonparser.js');
			CI.WebWorker.create('getminmaxmatrix', './scripts/webworker/scripts/getminmaxmatrix.js');
			CI.WebWorker.create('computesprings', './scripts/webworker/scripts/computesprings.js');
			CI.WebWorker.create('googleVisualizationArrayToDataTable', './scripts/webworker/scripts/googleVisualizationArrayToDataTable.js');
*/