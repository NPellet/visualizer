define(['jquery', 'src/header/components/default', 'src/util/versioning'], function($, Default, Versioning) {


	var Element = function() {};
	$.extend(Element.prototype, Default, {

		initImpl: function() {
			this.viewHandler = Versioning.getViewHandler();
		},

		_onClick: function() { // Overwrite usual onclick which loads a list / loads views/datas
			
			if(this._open) {
				Versioning.blankView();
			} else {
				
			}
		}
	});

	return Element;
});