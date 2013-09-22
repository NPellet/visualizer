define(['jquery', 'jqueryui', 'main/elements/default', 'util/versioning'], function($, ui, Default, Versioning) {


	var Element = function() {};
	$.extend(Element.prototype, Default, {

		initImpl: function() {
			this.viewHandler = Versioning.getViewHandler();
		},

		_onClick: function() { // Overwrite usual onclick which loads a list / loads views/datas
			console.log(Versioning.getView());
			console.log(JSON.stringify(Versioning.getView()));
			$("<div />").html($('<textarea>' + JSON.stringify(Versioning.getView(), null, "\t") + "</textarea>").css({width: '100%', height: '200px'})).dialog({ modal: true, width: '80%' });
		}

	
	});

	return Element;
});