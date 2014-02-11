define(['jquery', 'src/header/components/default'], function($, Default) {
	var Element = function() {};
	$.extend(Element.prototype, Default, {

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