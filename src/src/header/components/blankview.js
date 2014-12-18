define(['jquery', 'src/header/components/default', 'src/util/versioning', 'src/util/util'], function($, Default, Versioning, Util) {


	var Element = function() {};
	Util.inherits(Element, Default, {

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