
define(['require', 'forms/form', 'util/util'], function(require, form, UTIL) {


	UTIL.loadCss(require.toUrl('./styles/std/std.style.css'));
	
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

