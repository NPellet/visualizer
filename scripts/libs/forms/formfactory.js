
define(['forms/form'], function(form) {

	return {

		newform: function(dom, structure, onReady) {
			
			var formInst = new form();

			formInst.setStructure(structure);
			formInst.onLoaded(function() {
				formInst.init(dom);
				formInst.afterInit();
				if(onReady)
					onReady(formInst);
				formInst.getTemplater().afterInit();
			});
		}
	}
	
});

