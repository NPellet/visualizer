define(['jquery', 'jqueryui', 'src/header/components/default', 'src/util/versioning', 'forms/button'], function($, ui, Default, Versioning, Button) {


	var Element = function() {};
	$.extend(Element.prototype, Default, {

		initImpl: function() {
			this.viewHandler = Versioning.getViewHandler();
		},

		_onClick: function() { // Overwrite usual onclick which loads a list / loads views/datas
			
			var txtarea = $('<textarea></textarea>').css({width: '100%', height: '200px'}),
				val,
				btn = new Button('Paste', function( ) {

					try {

						val = JSON.parse( txtarea.val(), Versioning.getViewHandler()._reviver );
						Versioning.setViewJSON( val );

					} catch(_) { }

					div.dialog( 'close' );
				}),
				div;

			div = $("<div />").html(txtarea).append( btn.render( ) ).dialog({ modal: true, width: '80%' });
		}
	});

	return Element;
});