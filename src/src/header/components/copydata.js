define(['jquery', 'jqueryui', 'src/header/components/default', 'src/util/versioning'], function($, ui, Default, Versioning) {


	var Element = function() {};
	$.extend(Element.prototype, Default, {

		initImpl: function() {
			this.dataHandler = Versioning.getDataHandler();
		},

		_onClick: function() { // Overwrite usual onclick which loads a list / loads views/datas
			var str = Versioning.getDataJSON("\t");
			var strlen = str.length;
            var txtarea = $('<textarea/>').text(str).css({width: '100%', height: '200px'});

			$("<div />").html(txtarea).dialog({ modal: true, width: '80%' });
			var txtdom = txtarea.get(0);

			
			txtdom.selectionStart = 0;
            txtdom.selectionEnd = strlen;
            txtdom.focus();
		}

	
	});

	return Element;
});