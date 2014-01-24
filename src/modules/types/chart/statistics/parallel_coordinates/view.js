define(['modules/default/defaultview', "src/util/util","lib/parallel-coordinates/d3.parcoords"], function(Default, Util) {

    function view() {
        this._id = Util.getNextUniqueId();
    }
    ;

    Util.loadCss('lib/parallel-coordinates/d3.parcoords.css');

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var html = '<div id="'+this._id+'"></div>';

            this.dom = $(html).css({
                height: '100%',
                width: '100%'
            });

            this.module.getDomContent( ).html(this.dom);
            this.onReady = $.Deferred();
        },
        blank: {},
        inDom: function() {
            var paracoords = d3.parcoords()("#"+(this._id));
            /*var foods = [
                {name: "Asparagus", protein: 2.2, calcium: 0.024, sodium: 0.002},
                {name: "Butter", protein: 0.85, calcium: 0.024, sodium: 0.714},
                {name: "Coffeecake", protein: 6.8, calcium: 0.054, sodium: 0.351},
                {name: "Pork", protein: 28.5, calcium: 0.016, sodium: 0.056},
                {name: "Provolone", protein: 25.58, calcium: 0.756, sodium: 0.876}
            ];*/
            var cube = [
                [0, 0, 0],
                [1, 0, 0],
                [0, 1, 0],
                [1, 1, 0],
                [0, 0, 1],
                [1, 0, 1],
                [0, 1, 1],
                [1, 1, 1]
            ];
            paracoords.data(cube);
            //paracoords.dimensions([1,2]);
            paracoords.render().ticks(2).createAxes();
            this.onReady.resolve();
        },
        update: {
            value : function(value) {
                
            }
        }
      
    });

    return view;
});