define(['jquery', 'src/header/components/default', 'src/util/util'], function($, Default, Util) {
	var Element = function() {};
	Util.inherits(Element, Default, {

		initImpl: function() {
		},

		_onClick: function() { // Overwrite usual onclick which loads a list / loads views/datas
                        if(this.options.url) {
                            if(this.options.blank)
                                window.open(this.options.url);
                            else
                                window.location.assign(this.options.url);
                        }
		}
	});
	return Element;
});