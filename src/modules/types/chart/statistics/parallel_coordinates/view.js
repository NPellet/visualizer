define(['modules/default/defaultview', "src/util/util","lib/parallel-coordinates/d3.parcoords"], function(Default, Util) {

    function view() {
        this._id = Util.getNextUniqueId();
    }
    ;

    Util.loadCss('lib/parallel-coordinates/d3.parcoords.css');

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var html = '<div class="parcoords" id="'+this._id+'"></div>';

            this.dom = $(html).css({
                height: '100%',
                width: '100%'
            });

            this.module.getDomContent( ).html(this.dom);
            this.onReady = $.Deferred();
        },
        blank: {
            value: function() {
                this.dom.empty();
            }
        },
        update: {
            value : function(value) {
                if(!value)
                    return;
                value = value.get();
                if(!value instanceof Array)
                    return;
                
                this._data = value;
                this.redrawChart();
            }
        },
        onResize: function() {
            this.onReady.resolve();
            this.redrawChart();
        },
        redrawChart: function() {
            var that=this;
            this.dom.empty();
            var parcoords = d3.parcoords()("#"+(this._id));
                parcoords.data(this._data)
                        .render()
                        .brushable()
                        .reorderable();
                parcoords.on("brush", function(d){
                    that.module.controller.onBrushSelection(d);
                });
        }
      
    });

    return view;
});