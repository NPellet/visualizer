define(['modules/default/defaultview'], function(Default) {

    function view() {
    }

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            this.dom = $('<div></div>');
            this.logList = this.dom[0].children;
            this.module.getDomContent().html(this.dom);
            this.module.controller.start();
            this.maxLogs = this.module.getConfiguration('maxLogs');
        },
        log: function(success, variable) {
            var time = new Date();
            this.dom.prepend('<div>[' + time.toLocaleString() + '] - ' + (success ? 'Ok' : 'Error') + '; Variable: ' + variable + '</div>');
            if(this.logList.length > this.maxLogs) {
                this.logList[this.logList.length-1].remove();
            }
        }

    });
    return view;
});
 