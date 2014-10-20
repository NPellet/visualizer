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
            'components/slickgrid/slick.editors',
            'modules/types/edition/slick_grid/slick.editors.custom'],
        slickdataview: ['slickgrid']

    }
});


define(['require', 'modules/default/defaultview', 'src/util/debug', 'lodash', 'src/util/util', 'src/util/api', 'src/util/typerenderer','src/util/datatraversing', 'slickgrid', 'slickdataview'], function(require, Default, Debug, _, Util, API, Renderer, Traversing) {
    function View() {}
    Util.loadCss('./components/slickgrid/slick.grid.css');


    var formatters = {
        typerenderer: waitingFormatter,
        'slick.text': Slick.Formatters.Text,
        'slick.percent': Slick.Formatters.PercentComplete,
        'slick.percentbar': Slick.Formatters.PercentCompleteBar,
        'slick.yesno': Slick.Formatters.YesNoSelect
    };

    var editors = {
        'slick.text': Slick.Editors.Text,
        'slick.longtext': Slick.Editors.LongText,
        'slick.checkbox': Slick.Editors.Checkbox,
        'slick.date': Slick.Editors.Date,
        'slick.yesno': Slick.Editors.YesNoSelect,
        'slick.percent': Slick.Editors.PercentComplete,
        'slick.integer': Slick.Editors.Integer
    };
    var typeEditors = {
        boolean: Slick.Editors.Checkbox,
        mf: Slick.Editors.TextValue,
        color: Slick.Editors.ColorValue,
    };

    View.prototype = $.extend(true, {}, Default, {

        init: function() {
            if (! this.$dom) {
                this._id = Util.getNextUniqueId();
                this.$dom = $('<div>').attr('id', this._id).css({
                    width: '100%',
                    height: '100%'
                });
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
                if(row.editor === 'auto' && that.module.data) {
                    var type = that.module.data.get(0).getChildSync(row.jpath).type;
                    var editor = typeEditors[type];
                }
                return {
                    id: row.name,
                    name: row.name,
                    field: row.name.trim(),
                    width: +row.width || undefined,
                    minWidth: +row.minWidth || undefined,
                    maxWidth: +row.maxWidth || undefined,
                    resizable: row.resizable.indexOf('yes') > -1 ? true : undefined,
                    selectable: row.selectable.indexOf('yes') > -1 ,
                    focusable: row.focusable.indexOf('yes') > -1,
                    sortable: row.sortable.indexOf('yes') > -1,
                    defaultSortAsc: row.defaultSortAsc.indexOf('yes') > -1,
                    editor: editor || editors[row.editor],
                    formatter: formatters[row.formatter],
                    asyncPostRender: (row.formatter === 'typerenderer') ? tp : undefined,
                }
            });
        },

        getSlickOptions: function() {
            var that = this;
            return {
                editable: that.module.getConfigurationCheckbox('slickCheck', 'editable'),
                enableAddRow: that.module.getConfigurationCheckbox('slickCheck', 'enableAddRow'),
                enableCellNavigation: that.module.getConfigurationCheckbox('slickCheck', 'enableCellNavigation'),
                autoEdit: that.module.getConfigurationCheckbox('slickCheck', 'autoEdit'),
                enableTextSelectionOnCells: that.module.getConfigurationCheckbox('slickCheck', 'enableTextSelectionOnCells'),
                enableColumnReorder: that.module.getConfigurationCheckbox('slickCheck', 'enableColumnReorder'),
                forceFitColumns: that.module.getConfigurationCheckbox('slickCheck', 'forceFitColumns'),
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
                this.module.data = moduleValue;

                this.slick.columns = this.getSlickColumns();
                this.slick.options = this.getSlickOptions();
                this.slick.data = this.getSlickData(moduleValue);

                for(var i=0; i< l; i++) {
                    (function(j) {
                        that.module.model.dataListenChange( that.module.data.get( j ), function() {
                            var item = that.grid.getDataItem(j);
                            item = that.getSlickData(that.module.data, j);
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
                });

                this.grid.onCellChange.subscribe(function(e, args) {
                    var row = args.row;
                    var cell = args.cell;
                    that.module.model.dataSetChild(that.module.data.get(row), that.colConfig[cell].jpath, args.item[that.slick.columns[cell].field]);
                });

                this.grid.onColumnsResized.subscribe(function(e, args) {
                    var cols = that.grid.getColumns();
                    for(var i=0; i<cols.length; i++) {
                        that.module.definition.configuration.groups.cols[0][i].width = cols[i].width;
                    }

                });

                this.grid.onColumnsReordered.subscribe(function(e, args) {
                    var cols = that.grid.getColumns();
                    var conf = that.module.definition.configuration.groups.cols[0];
                    var names = _.pluck(conf, 'name');
                    var ids = _.pluck(cols, 'id');

                    if(names.concat().sort().join() !== ids.concat().sort().join()) {
                        Debug.warn('Something might be wrong, number of columns in grid and in configuration do not match');
                        return;
                    }
                    that.module.definition.configuration.groups.cols[0] = [];
                    for(var i=0; i<cols.length; i++) {
                        var idx = names.indexOf(ids[i]);
                        if(idx > -1) {
                            that.module.definition.configuration.groups.cols[0].push(conf[idx]);
                        }
                    }
                });
            }

        },


        doHighlight: function( i, val ) {

        },

        onResize: function() {
            if(this.grid) {
                this.grid.resizeCanvas();
            }

        }



    });

    function waitingFormatter(value) {
        return "wait...";
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