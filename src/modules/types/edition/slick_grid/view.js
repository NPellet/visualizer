'use strict';

require.config({
    paths: {
        // jQuery & jQuery UI

        dragevent:     'components/slickgrid/lib/jquery.event.drag-2.2',
        dropevent:     'components/slickgrid/lib/jquery.event.drop-2.2',

        // SlickGrid
        slickcore:     'components/slickgrid/slick.core',
        slickgrid:     'components/slickgrid/slick.grid',
        slickdataview: 'modules/types/edition/slick_grid/slick.dataview.custom',
        slickgroupitemmetadataprovider: 'modules/types/edition/slick_grid/slick.groupitemmetadataprovider.custom'
    },
    shim: {
        dragevent:     ['jquery'],
        dropevent:     ['jquery'],
        slickcore:     ['jquery-ui', 'components/jquery/jquery-migrate.min'],
        slickgrid:     ['slickcore', 'dragevent', 'dropevent','components/slickgrid/plugins/slick.cellrangedecorator',
            'components/slickgrid/plugins/slick.cellrangeselector' ,
            'components/slickgrid/plugins/slick.cellselectionmodel' ,
            'components/slickgrid/plugins/slick.rowselectionmodel',
            'components/slickgrid/slick.formatters',
            'modules/types/edition/slick_grid/slick.editors.custom'],
        slickdataview: ['slickgrid', 'slickgroupitemmetadataprovider'],
        slickgroupitemmetadataprovider: ['slickgrid']

    }
});


define(['require', 'modules/default/defaultview', 'src/util/debug', 'lodash', 'src/util/util', 'src/util/api', 'src/util/typerenderer', 'slickgrid', 'slickdataview'], function(require, Default, Debug, _, Util, API, Renderer) {
    function View() {}
    var cssPromises = [];
    cssPromises.push(Util.loadCss('./components/slickgrid/slick.grid.css'));
    var cssLoaded = Promise.all(cssPromises);


    var formatters = {
        typerenderer: waitingFormatter,
        'slick.text': Slick.Formatters.Text,
        'slick.percent': Slick.Formatters.PercentComplete,
        'slick.percentbar': Slick.Formatters.PercentCompleteBar,
        'slick.yesno': Slick.Formatters.YesNoSelect
    };

    var typeEditors = {
        boolean: Slick.Editors.Checkbox,
        mf: Slick.Editors.TextValue,
        color: Slick.Editors.ColorValue,
        string: Slick.Editors.TextValue,
        number: Slick.Editors.TextValue,
        DataString: Slick.Editors.SpecialNativeObject,
        DataNumber: Slick.Editors.DataNumberEditor,
        DataBoolean: Slick.Editors.DataBooleanEditor
    };

    View.prototype = $.extend(true, {}, Default, {

        init: function() {
            if (! this.$dom) {
                this._id = Util.getNextUniqueId();
                this.$dom = $('<div>').attr('id', this._id).css({
                    width: '100%',
                    height: '100%'
                });

                this.$rowHelp = $('<div>').attr('class', 'rowHelp');
                this.module.getDomContent().html(this.$rowHelp);
                this.module.getDomContent().append(this.$dom);
            }


            this.slick = {};
            this.colConfig = this.module.getConfiguration('cols');
            this.idPropertyName = 'sgid';
            this.resolveReady();
        },


        getSlickColumns: function() {
            var that = this;
            var tp = $.proxy(typeRenderer, this);
            var slickCols = this.colConfig.map(function(row) {
                var editor, type;
                if(row.editor === 'auto' && that.module.data) {
                    if(!that.module.data.length) {
                        editor = Slick.Editors.SpecialNativeObject;
                        Debug.warn('Slick grid: using editor based on type when the input variable is empty. Cannot determine type');
                    }
                    else {
                        var obj = that.module.data.get(0).getChildSync(row.jpath);
                        if(obj instanceof DataString) {
                            editor = Slick.Editors.SpecialNativeObject;
                        }
                        else if(obj instanceof DataNumber) {
                            editor = Slick.Editors.DataNumberEditor
                        }
                        else if(obj instanceof DataBoolean) {
                            editor = Slick.Editors.DataBooleanEditor
                        }
                        else {
                            type = that.module.data.get(0).getChildSync(row.jpath).type;
                            editor = typeEditors[type];
                        }
                    }
                }
                else {
                    editor = typeEditors[row.editor];
                    type = row.editor;
                }
                return {
                    id: row.name,
                    name: row.name,
                    field: row.name,
                    width: +row.width || undefined,
                    minWidth: +row.minWidth || undefined,
                    maxWidth: +row.maxWidth || undefined,
                    resizable: row.resizable.indexOf('yes') > -1 ? true : undefined,
                    selectable: row.selectable.indexOf('yes') > -1 ,
                    focusable: row.focusable.indexOf('yes') > -1,
                    sortable: row.sortable.indexOf('yes') > -1,
                    defaultSortAsc: row.defaultSortAsc.indexOf('yes') > -1,
                    editor: editor,
                    formatter: formatters[row.formatter],
                    asyncPostRender: (row.formatter === 'typerenderer') ? tp : undefined,
                    jpath: row.jpath,
                    dataType: type
                }
            });
            if(this.module.getConfigurationCheckbox('slickCheck', 'rowDelete')) {
                slickCols.unshift({
                    id: 'rowDeletion',
                    width: 30,
                    field: 'rowDeletion',
                    selectable: false,
                    resizable: false,
                    focusable: false,
                    sortable: false,
                    formatter: binFormatter
                });
            }
            return slickCols;
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
                multiColumnSort: that.module.getConfigurationCheckbox('slickCheck', 'multiColumnSort'),
                asyncEditorLoading: true,
                enableAsyncPostRender: true,
                asyncPostRenderDelay: 0,
                defaultColumnWidth: that.module.getConfiguration('slick.defaultColumnWidth') || 80,
                dataItemColumnValueExtractor: function(item, coldef) {
                    return item;
                },
                rowHeight: that.module.getConfiguration('slick.rowHeight')
            };
        },


        inDom: function(){




        },

        update: {

            list: function( moduleValue ) {
                var that =  this;
                this.module.data = moduleValue;

                this.slick.columns = this.getSlickColumns();
                this.slick.options = this.getSlickOptions();
                this.incrementalId = 0;
                this.generateUniqIds();





                cssLoaded
                    .then(function() {
                        return that.cssLoaded;
                    })
                    .then(function() {

                        that.slick.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
                        that.slick.data = new Slick.Data.DataView({
                            groupItemMetadataProvider: that.slick.groupItemMetadataProvider
                        });

                        that.slick.data.setModule(that.module);
                        that.$dom = $('#'+that._id);
                        that.grid = new Slick.Grid("#"+that._id, that.slick.data, that.slick.columns, that.slick.options);
                        that.grid.registerPlugin(that.slick.groupItemMetadataProvider);



                        if(that.module.getConfiguration('slick.selectionModel') === 'row') {
                            that.grid.setSelectionModel(new Slick.RowSelectionModel());
                        }
                        else {
                            that.grid.setSelectionModel(new Slick.CellSelectionModel());
                        }

                        that._activateHighlights();


                        that.grid.module = that.module;


                        // listen to group expansion...
                        if(that.module.getConfigurationCheckbox('slickCheck', 'oneUncollapsed')) {
                            that.slick.groupItemMetadataProvider.onGroupExpanded.subscribe(function(e, args) {
                                this.getData().collapseAllGroups(args.item.level);
                                this.getData().expandGroup(args.item.groupingKey);
                                //console.log('expanded', e, args);
                            });
                        }

                        // wire up model events to drive the grid
                        that.slick.data.onRowCountChanged.subscribe(function (e, args) {
                            that.grid.updateRowCount();
                            that.grid.render();
                        });

                        that.slick.data.onRowsChanged.subscribe(function (e, args) {
                            that.grid.invalidateRows(args.rows);
                            that.grid.render();
                        });


                        that.grid.onAddNewRow.subscribe(function (e, args) {
                            that.module.model.dataTriggerChange(that.module.data);
                            //var item = args.item;
                            //var jpath = args.column.jpath.slice();
                            //jpath.unshift(that.module.data.length);
                            //that.module.model.dataSetChild(that.module.data, jpath, item).then(function() {
                            //    var row = that.module.data.length - 1;
                            //    that.grid.updateRowCount();
                            //    that.grid.invalidateRow(row);
                            //    that.grid.render();
                            //    that.module.controller.onRowNew(row);
                            //    that._resetDeleteRowListeners();
                            //});

                        });

                        that.grid.onViewportChanged.subscribe(function() {
                            // onViewportChange is not really working properly, so we hack by having a settimeout
                            // Acceptable since it is unlikely that someone click the delete button only 300 ms after
                            // the viewport has changed...
                            setTimeout(function() {

                                that.lastViewport = that.grid.getViewport();
                                //console.log('viewport changed', that.lastViewport);
                                that._resetDeleteRowListeners();
                            }, 300);
                            that.lastViewport = that.grid.getViewport();
                            if(that.module.getConfigurationCheckbox('slickCheck', 'rowNumbering')) {
                                that.$rowHelp.html((that.lastViewport.bottom - 2).toString() + '/' + that.grid.getDataLength());
                                that.$rowHelp.fadeIn();
                                clearTimeout(that.lastRowHelp);
                                that.lastRowHelp = setTimeout(function() {
                                    that.$rowHelp.fadeOut();
                                }, 1000);
                            }
                        });


                        that.grid.onMouseEnter.subscribe(function(e) {
                            var itemInfo = that._getItemInfoFromEvent(e);
                            if(!itemInfo) return;


                            var hl = itemInfo.item._highlight;
                            if(hl) {
                                API.highlightId(hl,1);
                                lastHighlight = hl;
                            }
                            that.module.controller.onHover(itemInfo.idx, itemInfo.item);

                        });

                        that.grid.onMouseLeave.subscribe(function(e) {
                            var itemInfo = that._getItemInfoFromEvent(e);
                            if(!itemInfo) return;
                            var hl = itemInfo.item._highlight;
                            if(hl) {
                                API.highlightId(hl,0);
                            }
                            else if(lastHighlight) {
                                API.highlightId(lastHighlight,0);
                            }

                        });

                        that.grid.onClick.subscribe(function(e,args) {
                            var columns = that.grid.getColumns();
                            var itemInfo = that._getItemInfoFromRow(args.row);
                            if(itemInfo) {
                                if(columns[args.cell] && columns[args.cell].id !== 'rowDeletion') {
                                    that.module.controller.onClick(itemInfo.idx, itemInfo.item);
                                }
                            }
                        });

                        that.grid.onColumnsResized.subscribe(function() {
                            var cols = that.grid.getColumns();
                            for(var i=0; i<cols.length; i++) {
                                that.module.definition.configuration.groups.cols[0][i].width = cols[i].width;
                            }
                            if(that.module.getConfigurationCheckbox('slickCheck', 'resizeRerender')) {
                                that.grid.invalidate();
                            }
                        });

                        that.grid.onCellChange.subscribe(function (e, args) {
                            var itemInfo = that._getItemInfoFromRow(args.row);
                            if(itemInfo) {
                                that.module.controller.onRowChange(itemInfo.idx, itemInfo.item);
                            }

                        });

                        that.grid.onActiveCellChanged.subscribe(function(e, args) {
                            that.lastActiveCell = args.cell;
                            that.lastActiveRow = args.row;

                            //console.log('active row changed', args.row);
                        });

                        that.grid.onColumnsReordered.subscribe(function() {
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

                        //var sortjpath;
                        //function comparer(a, b) {
                        //    var x = a.get(sortjpath), y = b.get(sortjpath);
                        //    return (x == y ? 0 : (x > y ? 1 : -1));
                        //}
                        //
                        //that.grid.onSort.subscribe(function (e, args) {
                        //    if(!args.multiColumnSort) {
                        //        sortjpath = args.sortCol.jpath;
                        //        // using native sort with comparer
                        //        // can be very slow in IE with huge datasets
                        //        that.slick.data.sort(comparer, args.sortAsc);
                        //    }
                        //    else {
                        //        var cols = args.sortCols;
                        //        that.slick.data.sort(function (dataRow1, dataRow2) {
                        //            for (var i = 0, l = cols.length; i < l; i++) {
                        //                var jpath = cols[i].sortCol.jpath;
                        //                var sign = cols[i].sortAsc ? 1 : -1;
                        //                var value1 = dataRow1.get(jpath), value2 = dataRow2.get(jpath);
                        //                var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                        //                if (result != 0) {
                        //                    return result;
                        //                }
                        //            }
                        //            return 0;
                        //        });
                        //    }
                        //    grid.invalidate();
                        //    grid.render();
                        //
                        //});

                        that.slick.data.beginUpdate();
                        var ids = _.pluck(that.slick.columns, 'id');

                        var groupings = _.chain(that.module.getConfiguration('groupings'))
                            .filter(function(val) {
                                if (val && val.groupName && val.getter) return true;
                                return false;
                            })
                            .map(function(val) {
                                return {
                                    getter: val.getter,
                                    formatter: function(g) {
                                        return val.groupName + ': ' + g.value + "  <span style='color:green'>(" + g.count + " items)</span>";
                                    },
                                    aggregateCollapsed: false,
                                    lazyTotalsCalculation: true
                                }
                            }).value();

                        if(groupings.length) that.slick.data.setGrouping(groupings);

                        that.slick.data.setItems(that.module.data, that.idPropertyName);
                        that.slick.data.endUpdate();

                        // get back state before last update
                        if(that.lastViewport) {
                            //console.log('last viewport', that.lastViewport);
                            that.grid.scrollRowToTop(that.lastViewport.top);
                        }
                        if(!_.isUndefined(that.lastActiveRow)) {
                            //console.log('resetting last active row', that.lastActiveRow)
                                that.grid.setActiveCell(that.lastActiveRow, that.lastActiveCell);
                        }

                        that.grid.render();
                        that._resetDeleteRowListeners();
                    });
            }

        },

        blank: {
            list: function() {
                this.$dom.html('');
            }
        },

        _resetDeleteRowListeners: function() {
            var that = this;
            var $rb = that.$rb = $('#'+that._id).find('a.recycle-bin');
            $rb.off('click');
            $rb.on('click', function(e) {
                var columns = that.grid.getColumns();
                var args = that._checkCellFromEvent(e);
                that.lastViewport = that.grid.getViewport();
                if(columns[args.cell] && columns[args.cell].id === 'rowDeletion') {
                    //console.log('row:', args.row);
                    // delete the row...
                    var itemInfo = that._getItemInfoFromRow(args.row);
                    that.module.data.splice(itemInfo.idx, 1);
                    that.module.data.triggerChange();
                }

            });
        },

        _checkCellFromEvent: function(e) {
            var cell = this.grid.getCellFromEvent(e);
            if(cell.row >= this.module.data.length) {
                return null;
            }
            return cell;
        },

        _getItemInfoFromEvent: function(e) {
            var that = this;
            var cell = this.grid.getCellFromEvent(e);
            if(!cell) return null;
            var id = that.slick.data.mapRowsToIds([cell.row])[0];
            if(!id) return null;
            return {
                id: id,
                idx: that.slick.data.getIdxById(id),
                item: that.slick.data.getItemById(id)
            };
        },

        _getItemInfoFromRow: function(row) {
            var that = this;
            if(_.isUndefined(row)) return null;
            var id = that.slick.data.mapRowsToIds([row])[0];
            if(!id) return null;
            return {
                id: id,
                idx: that.slick.data.getIdxById(id),
                item: that.slick.data.getItemById(id)
            };
        },

        _drawHighlight: function(key) {
            this.grid.setCellCssStyles(key, this.cellStyles[key]);
        },

        _undrawHighlight: function(key) {
            this.grid.removeCellCssStyles(key);
        },


        _activateHighlights: function() {
            var that = this;
            var hl = _(this.module.data).pluck('_highlight').uniq().value();
            var cols = this.grid.getColumns();
            var base = {};
            for(var i=0; i<cols.length; i++) {
                base[cols[i].id] = 'highlighted-cell';
            }

            var r = {};
            for(var j=0; j<this.module.data.length; j++) {
                var h= this.module.data[j]._highlight;
                if(!h) continue;
                if(!r[h]) r[h] = {};

                r[h][j.toString()] = base;
            }

            this.cellStyles = r;


            API.killHighlight(this.module.getId());

            for(i=0; i<hl.length; i++) {
                (function(i) {
                    API.listenHighlight({_highlight: hl[i]}, function(onOff, key) {
                        if(onOff) {
                            that._drawHighlight(key);
                        }
                        else {
                            that._undrawHighlight(key);
                        }
                    });
                })(i);
            }
        },

        onResize: function() {
            if(this.grid) {
                this.grid.resizeCanvas();
            }
            this.$rowHelp.css( {
                bottom: 0
            })
        },

        getNextIncrementalId: function() {
            return this.incrementalId++;
        },

        generateUniqIds: function() {
            if(!this.module.data) return;
            for(var i=0; i<this.module.data.length; i++) {
                this.module.data[i][this.idPropertyName] = 'id_' + this.incrementalId;
                this.incrementalId++;
            }
        },

        onActionReceive: {
            hoverRow: function(row) {
                // row can be the row itself or the array's index
                var item;
                if(_.isNumber(row) || row instanceof DataNumber) {
                    item = this.module.data[row];
                }
                else {
                    item = row;
                }

                if(item && item[this.idPropertyName]) {
                    var gridRow = this.slick.data.mapIdsToRows([item[this.idPropertyName]])[0];
                    var dataIdx = this.slick.data.getIdxById(item[this.idPropertyName]);
                    this.module.controller.onHover(dataIdx, item);
                    this.grid.scrollRowToTop(gridRow);
                }
            },

            selectRow: function(row) {
                var item;
                if(_.isNumber(row) || row instanceof DataNumber) {
                    item = this.module.data[row];
                }
                else {
                    item = row;
                }

                if(item && item[this.idPropertyName]) {
                    var gridRow = this.slick.data.mapIdsToRows([item[this.idPropertyName]])[0];
                    var dataIdx = this.slick.data.getIdxById(item[this.idPropertyName]);
                    this.module.controller.onClick(dataIdx, item);
                    this.grid.scrollRowToTop(gridRow);
                    this.grid.setActiveCell(gridRow, 0);
                }
            }
        }
    });

    function waitingFormatter() {
        return "...";
    }

    function binFormatter() {
        return '<div style="width:100%; height: 100%; display: table-cell"><a class="recycle-bin"></a></div>';
    }

    function requiredFieldValidator(value) {
        if (value == null || value == undefined || !value.length) {
            return {valid: false, msg: "This is a required field"};
        } else {
            return {valid: true, msg: null};
        }
    }

    function typeRenderer(cellNode, row, dataContext, colDef) {
        if(dataContext.__group) return;
        this.module.data.traceSync([row]);
        var def = Renderer.toScreen(dataContext, this.module, {}, colDef.jpath);
        def.always(function(value) {
            $(cellNode).html(value);
            if(def.build) {
                def.build();
            }
        });
    }

    var lastHighlight = '';
    return View;

});