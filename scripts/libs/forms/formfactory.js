
define(['forms/form'], function(form) {

	return {

		newform: function(dom, structure, onReady, options) {
			
			var formInst = new form(options);

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

