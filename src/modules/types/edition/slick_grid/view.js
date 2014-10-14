'use strict';

require.config({
    paths: {
        // jQuery & jQuery UI

        dragevent:     'components/slickgrid/lib/jquery.event.drag-2.2',
        dropevent:     'components/slickgrid/lib/jquery.event.drop-2.2',

        // SlickGrid
        slickcore:     'components/slickgrid/slick.core',
        slickgrid:     'components/slickgrid/slick.grid',
        slickdataview: 'components/slickgrid/slick.dataview'
    },
    shim: {
        dragevent:     ['jquery'],
        dropevent:     ['jquery'],
        slickcore:     ['jqueryui', 'components/jquery/jquery-migrate.min'],
        slickgrid:     ['slickcore', 'dragevent', 'dropevent'
            ],
        slickdataview: ['slickgrid']
    }
});


define(['require', 'modules/default/defaultview', 'src/util/util', 'src/util/api', 'src/util/typerenderer', 'slickgrid', 'slickdataview'], function(require, Default, Util, API, Renderer) {
    Util.loadCss('./components/slickgrid/slick.grid.css');
    waitForSheet();
    setInterval(waitForSheet, 2000);
    Util.loadCss('./components/slickgrid/examples/slick-default-theme.css');
    function View() {}

    View.prototype = $.extend(true, {}, Default, {

        init: function() {
            if (! this.$dom) {
                this._id = Util.getNextUniqueId();
                this.$dom = $('<div>').attr('id', this._id).css({
                    width: '100%',
                    height: '100%'
                });
                console.log(this.module.getDomContent(), this.$dom);
                this.module.getDomContent().html(this.$dom);
                //$('body').append(this.$dom);
            }

            this.resolveReady();
        },

        inDom: function(){




        },



        blank: {

        },

        update: {

            list: function( moduleValue ) {


            },
            showList: function( value ) {
                if(!(value instanceof Array)) {
                    return;
                }

                this.showList = value;
                this.updateVisibility();
            }

        },


        doHighlight: function( i, val ) {

        },

        onResize: function() {
            var that = this;
            var grid;
            var columns = [
                {id: "title", name: "Title", field: "title"},
                {id: "duration", name: "Duration", field: "duration"},
                {id: "%", name: "% Complete", field: "percentComplete"},
                {id: "start", name: "Start", field: "start"},
                {id: "finish", name: "Finish", field: "finish"},
                {id: "effort-driven", name: "Effort Driven", field: "effortDriven"}
            ];

            var options = {
                enableCellNavigation: true,
                enableColumnReorder: false
            };

                var data = [];
                for (var i = 0; i < 500; i++) {
                    data[i] = {
                        title: "Task " + i,
                        duration: "5 days",
                        percentComplete: Math.round(Math.random() * 100),
                        start: "01/01/2009",
                        finish: "01/05/2009",
                        effortDriven: (i % 5 == 0)
                    };
                }
                console.log(data);
                grid = new Slick.Grid('#'+this._id, data, columns, options);


        }



    });


    function waitForSheet() {
        var sheets = document.styleSheets;
        console.log(sheets.length);
        for (var i = 0; i < sheets.length; i++) {
            console.log(sheets[i]);
        }
    }
    return View;

});