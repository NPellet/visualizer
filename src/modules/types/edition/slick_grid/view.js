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
        slickgrid:     ['slickcore', 'dragevent', 'dropevent'],
        slickdataview: ['slickgrid'],
        'components/slickgrid/plugins/slick.cellrangedecorator': ['slickcore'],
        'components/slickgrid/plugins/slick.cellrangeselector' : ['slickcore'],
        'components/slickgrid/plugins/slick.cellselectionmodel' : ['slickcore'],
        'components/slickgrid/slick.formatters' : ['slickcore'],
        'components/slickgrid/slick.editors' : ['slickcore']
    }
});


define(['require', 'modules/default/defaultview', 'src/util/util', 'src/util/api', 'src/util/typerenderer', 'slickgrid', 'slickdataview', 'components/slickgrid/plugins/slick.cellrangedecorator', 'components/slickgrid/plugins/slick.cellrangeselector',
    'components/slickgrid/plugins/slick.cellselectionmodel',
    'components/slickgrid/slick.formatters',
    'components/slickgrid/slick.editors'], function(require, Default, Util, API, Renderer) {
    Util.loadCss('./components/slickgrid/slick.grid.css');
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
            function waitingFormatter(value) {
                return "wait...";
            }

            function renderAsync(cellNode, row, dataContext, colDef) {
                setTimeout(function() {
                    $(cellNode).empty().html('done');
                },4000);
            }

            function requiredFieldValidator(value) {
                if (value == null || value == undefined || !value.length) {
                    return {valid: false, msg: "This is a required field"};
                } else {
                    return {valid: true, msg: null};
                }
            }

            var grid;
            var data = [];
            var columns = [
                {id: "title", name: "Title", field: "title", width: 120, cssClass: "cell-title", editor: Slick.Editors.Text, validator: requiredFieldValidator},
                {id: "desc", name: "Description", field: "description", width: 100, editor: Slick.Editors.LongText},
                {id: "duration", name: "Duration", field: "duration", editor: Slick.Editors.Text},
                {id: "%", name: "% Complete", field: "percentComplete", width: 80, resizable: false, formatter: Slick.Formatters.PercentCompleteBar, editor: Slick.Editors.PercentComplete},
                {id: "start", name: "Start", field: "start", minWidth: 60, editor: Slick.Editors.Date},
                {id: "finish", name: "Finish", field: "finish", minWidth: 60, editor: Slick.Editors.Date},
                {id: "effort-driven", name: "Effort Driven", width: 80, minWidth: 20, maxWidth: 80, cssClass: "cell-effort-driven", field: "effortDriven", formatter: waitingFormatter, rerenderOnResize: true, asyncPostRender: renderAsync, editor: Slick.Editors.Checkbox}
            ];
            var options = {
                editable: true,
                enableAddRow: true,
                enableCellNavigation: true,
                asyncEditorLoading: true,
                enableAsyncPostRender: true,
                autoEdit: false,
                asyncPostRenderDelay: 0
            };

                for (var i = 0; i < 10; i++) {
                    var d = (data[i] = {});

                    d["title"] = "Task " + i;
                    d["description"] = "This is a sample task description.\n  It can be multiline";
                    d["duration"] = "5 days";
                    d["percentComplete"] = Math.round(Math.random() * 100);
                    d["start"] = "01/01/2009";
                    d["finish"] = "01/05/2009";
                    d["effortDriven"] = (i % 5 == 0);
                }

                grid = new Slick.Grid("#"+this._id, data, columns, options);

                grid.setSelectionModel(new Slick.CellSelectionModel());

                grid.onAddNewRow.subscribe(function (e, args) {
                    var item = args.item;
                    grid.invalidateRow(data.length);
                    data.push(item);
                    grid.updateRowCount();
                    grid.render();
                });

                grid.onMouseEnter.subscribe(function(e) {
                    var cell = grid.getCellFromEvent(e);
                    console.log('mouse enter cell', cell);
                });

                grid.onCellChange.subscribe(function(e, args) {
                    console.log('cell changed', e,args);
                });
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