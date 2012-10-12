/**
 * @namespace Holds all the functionality for the visualizer
 */

_namespaces = {
	title: 'CI',
	table: 'CI',
	lang: 'CI',
	util: 'CI',
	visualizer: 'CI',
	buttons: 'CI'
};

CI = new Object();

(function($) {
	
	$(document).ready(function() {
		
		CI.WebWorker.create('jsonparser', './scripts/webworker/scripts/jsonparser.js');
		CI.WebWorker.create('getminmaxmatrix', './scripts/webworker/scripts/getminmaxmatrix.js');
		CI.WebWorker.create('googleVisualizationArrayToDataTable', './scripts/webworker/scripts/googleVisualizationArrayToDataTable.js');

		Saver = new CI.Saver();
		ajaxManager = new CI.Util.AjaxManager();
	//	ajaxManager.setProxyUrl('http://localhost:8888/git/visualizer/proxify.php?url=<url>');
		
		var dom = $("body");
		$(dom).mask('Data is loading. Please wait...');
		
		window.Entry = new CI.EntryPoint(_structure, _data, {}, function() {
			$(dom).unmask();
			
			CI.ConfigVisualizer();
			
			
		});
	});
}) (jQuery);


CI.AddButton = $('<div class="ci-cfg-add">+ Add</div>').bind('click', function() {
	$(this).prev().children(':last').clone(true).appendTo($(this).prev());
});


CI.SaveButton = $('<div class="ci-cfg-save">Save</div>');
