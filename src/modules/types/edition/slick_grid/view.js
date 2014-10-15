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
        slickgrid:     ['slickcore', 'dragevent', 'dropevent','components/slickgrid/plugins/slick.cellrangedecorator',
            'components/slickgrid/plugins/slick.cellrangeselector' ,
            'components/slickgrid/plugins/slick.cellselectionmodel' ,
            'components/slickgrid/slick.formatters',
            'components/slickgrid/slick.editors'],
        slickdataview: ['slickgrid']

    }
});


define(['require', 'modules/default/defaultview', 'src/util/util', 'src/util/api', 'src/util/typerenderer','src/util/datatraversing', 'slickgrid', 'slickdataview'], function(require, Default, Util, API, Renderer, Traversing) {
    function View() {}
    Util.loadCss('./components/slickgrid/slick.grid.css');


    var formatters = {
        typerenderer: waitingFormatter,
        'slick.text': Slick.Formatters.Text
    };

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


            this.slick = {};
            this.colConfig = this.module.getConfiguration('colsjPaths');
            this.resolveReady();
        },

        getSlickColumns: function() {
            var that = this;
            var tp = $.proxy(typeRenderer, this);
            return this.colConfig.map(function(row) {
                return {
                    id: row.name,
                    name: row.name,
                    field: row.name.trim(),
                    width: row.width,
                    minWidth: row.minWidth || 10,
                    maxWidth: row.maxWidth,
                    resizable: !!(row.resizable),
                    editor: Slick.Editors.Text,
                    formatter: formatters[row.formatter],
                    asyncPostRender: (row.formatter === 'typerenderer') ? tp : undefined
                }
            });
        },

        getSlickOptions: function() {
            var that = this;
            console.log('slickcheck config', that.module.getConfiguration('slickCheck'));
            return {
                editable: that.module.getConfigurationCheckbox('slickCheck', 'editable'),
                enableAddRow: that.module.getConfigurationCheckbox('slickCheck', 'enableAddRow'),
                enableCellNavigation: that.module.getConfigurationCheckbox('slickCheck', 'enableCellNavigation'),
                autoEdit: that.module.getConfigurationCheckbox('slickCheck', 'autoEdit'),
                asyncEditorLoading: true,
                enableAsyncPostRender: true,
                asyncPostRenderDelay: 0
            };
        },

        getSlickData: function(value) {
            var data;
            data = [];
            for(var i=0; i<value.length; i++) {
                var d;
                data[i] = (d={});
                for(var j=0; j<this.colConfig.length; j++) {
                    d[this.slick.columns[j].field] = value.get(i).getChildSync(this.colConfig[j].jpath);
                }

            }
            return data;
        },

        updateSlickItem: function(value, idx, item) {
            var d;
            data = d = {};
            for(var j=0; j<this.colConfig.length; j++) {
                item[this.slick.columns[j].field] = value.get(idx).getChildSync(this.colConfig[j].jpath);
            }
            return d;
        },

        inDom: function(){




        },

        update: {

            list: function( moduleValue ) {

                var that =  this;
                var l = moduleValue.get().length;
                this.module.model.data = moduleValue;

                console.log('col config', this.colConfig);
                this.slick.columns = this.getSlickColumns();
                this.slick.options = this.getSlickOptions();
                this.slick.data = this.getSlickData(moduleValue);

                console.log('update list in slickgrid');
                for(var i=0; i< l; i++) {
                    (function(j) {
                        that.module.model.dataListenChange( that.module.model.data.get( j ), function() {
                            var item = that.grid.getDataItem(j);
                            item = that.getSlickData(that.module.model.data, j);
                            console.log('item changed', item);
                            that.grid.invalidateRow(j);
                            that.grid.render();
                        }, 'list');
                    })(i);
                }


                this.grid = new Slick.Grid("#"+this._id, this.slick.data, this.slick.columns, this.slick.options);

                this.grid.setSelectionModel(new Slick.CellSelectionModel());

                this.grid.onAddNewRow.subscribe(function (e, args) {
                    var item = args.item;
                    //that.grid.invalidateRow(data.length);
                    //data.push(item);
                    //that.grid.updateRowCount();
                    //that.grid.render();
                });

                this.grid.onMouseEnter.subscribe(function(e) {
                    var cell = that.grid.getCellFromEvent(e);
                    console.log('mouse enter cell', cell);
                });

                this.grid.onCellChange.subscribe(function(e, args) {
                    console.log('cell changed', e,args);
                    var row = args.row;
                    var cell = args.cell;
                    that.module.model.dataSetChild(that.module.model.data.get(row), that.colConfig[cell].jpath, args.item[that.slick.columns[cell].field]);
                });
            },
            showList: function( value ) {
                console.log('update showList');
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


        }



    });


    function waitForSheet() {
        var sheets = document.styleSheets;
        console.log(sheets.length);
        for (var i = 0; i < sheets.length; i++) {
            console.log(sheets[i]);
        }
    }

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

    function typeRenderer(cellNode, row, dataContext, colDef) {
        var def = Renderer.toScreen(dataContext[colDef.field]);

        def.always(function(value) {
            $(cellNode).html(value);
        });
    }

    return View;

});