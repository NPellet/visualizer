'use strict';

define(['modules/default/defaultview', 'src/util/api'], function(Default, API) {

    function view() {
    }

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var html = '';
            html += '<div></div>';

            this.dom = $(html).css({
                height: '100%',
                width: '100%'
            });
            this.currentValue = '';
            this.module.getDomContent( ).html(this.dom);
        },
        inDom: function() {
            var that = this;
            var defaultValue = this.module.getConfiguration('thevalue');
            var textarea = $('<textarea>').css({
                boxSizing: 'border-box',
                width: '99%',
                height: '99%'
            }).on('keyup', function() {
                var val = textarea.val();
                if (that.currentValue !== val) {
                    that.module.controller.valueChanged(val);
                    that.currentValue = val;
                }
            }).val(defaultValue);
            this.dom.append(textarea);
            that.currentValue = defaultValue;
            this.module.controller.valueChanged(defaultValue);
			this.resolveReady();
        }
    });

    return view;
});