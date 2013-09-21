define(['jquery', 'jqueryui', 'main/elements/default', 'util/versioning'], function($, ui, Default, Versioning) {


	var Element = function() {};
	$.extend(Element.prototype, Default, {

		initImpl: function() {
			this.viewHandler = Versioning.getViewHandler();
		},

		_onClick: function() { // Overwrite usual onclick which loads a list / loads views/datas
			
			$("<div />").html(JSON.stringify(Versioning.getView(), null, "\t")).dialog({ modal: true, width: '80%' });
		}

	
	});

	return Element;
});