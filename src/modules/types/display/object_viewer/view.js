define(['modules/default/defaultview', "src/util/util" ,"jstree"], function(Default, Util) {

    function view() {
        this._id = Util.getNextUniqueId();
    }
    ;

    Util.loadCss('components/jstree/dist/themes/default/style.min.css');

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var html = '<div></div>';

            this.dom = $(html).css({
                height: '100%',
                width: '100%'
            });

            this.module.getDomContent( ).html(this.dom);
        },
        blank: {},
        inDom: function() {
        },
        update: {

        }
      
    });

    return view;
});