define(['jquery', 'jquery-ui', 'src/header/components/default', 'src/util/versioning', 'forms/button', 'src/util/util'], function($, ui, Default, Versioning, Button, Util) {


	var Element = function() {};
	Util.inherits(Element, Default, {

		initImpl: function() {
			this.dataHandler = Versioning.getDataHandler();
		},

		_onClick: function() { // Overwrite usual onclick which loads a list / loads views/datas
			
			var txtarea = $('<textarea></textarea>').css({width: '100%', height: '200px'}),
				val, keys,
				btn = new Button('Paste', function( ) {

					try {
						val = JSON.parse( txtarea.val() );
                                                keys = Object.keys(val);
                                                for(var i = 0, ii = keys.length; i < ii; i++) {
                                                    if(keys[i].charAt(0)==="_")
                                                        delete val[keys[i]];
                                                }
						Versioning.setDataJSON( val );
					} catch(_) { }

					div.dialog( 'close' );
				}),
				div;

			div = $("<div />").html(txtarea).append( btn.render( ) ).dialog({ modal: true, width: '80%' });
		}
	});

	return Element;
});