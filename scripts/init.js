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
		CI.WebWorker.create('computesprings', './scripts/webworker/scripts/computesprings.js');
		CI.WebWorker.create('googleVisualizationArrayToDataTable', './scripts/webworker/scripts/googleVisualizationArrayToDataTable.js');

		Saver = new CI.Saver();
		ajaxManager = new CI.Util.AjaxManager();
	//	ajaxManager.setProxyUrl('http://localhost:8888/git/visualizer/proxify.php?url=<url>');
		
		var dom = $("body");
	
		window.Entry = new CI.EntryPoint({}, function() {
			$(dom).unmask();
			CI.ConfigVisualizer();			
		});



	$("#visualizer-dataviews-button").bind('click', function() {

		if($(this).hasClass('bi-active')) {
			$("#visualizer-dataviews").remove();
			$(this).removeClass('bi-active');

			return;
		}

		$(this).addClass('bi-active');
		var dom = $("<div>").attr('id', 'visualizer-dataviews').appendTo('body');


		dom.append('<h1>Data</h1>');

		dom.append(buttons.data.copyToLocal.render());
		dom.append(buttons.data.localToServer.render());
		dom.append(buttons.data.snapshotLocal.render());
		dom.append(buttons.data.autosaveLocal.render());
		dom.append(buttons.data.branchLocal.render());
		dom.append(buttons.data.revertLocal.render());

		var _dom = $('<div class="ci-dataview-path"><label>Data path : </label></div>');
		dom.append(_dom);
		var _domel = $("<div />").appendTo(_dom);
		_domel.append(CI.Data.getDom());


		dom.append('<br /><br />');
		dom.append('<h1>View</h1>');

		dom.append(buttons.view.copyToLocal.render());
		dom.append(buttons.view.localToServer.render());
		dom.append(buttons.view.snapshotLocal.render());
		dom.append(buttons.view.autosaveLocal.render());
		dom.append(buttons.view.branchLocal.render());
		dom.append(buttons.view.revertLocal.render());


		var _dom = $('<div class="ci-dataview-path"><label>View path : </label></div>');
		dom.append(_dom);
		var _domel = $("<div />").appendTo(_dom);
		_domel.append(CI.View.getDom());
	
	});



	});
}) (jQuery);


CI.AddButton = $('<div class="ci-cfg-add">+ Add</div>').bind('click', function() {
	$(this).prev().children(':last').clone(true).appendTo($(this).prev());
});


CI.SaveButton = $('<div class="ci-cfg-save">Save</div>');
