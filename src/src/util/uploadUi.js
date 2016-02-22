'use strict';

/**
 * Global ui methods
 * @module src/util/ui
 */

define([
    'src/util/util',
    'src/util/debug',
    'src/util/ui',
    'lodash',
    'jquery',
    'slickgrid',
    'mime-types'
], function (Util, Debug, ui, _, $, Slick, mimeTypes) {
    function attachmentsFromCouch(data, options) {
        var r = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            r[i] = {
                name: d.name,
                contentType: d.content_type,
                size: d.length,
                toDelete: false
            };
            if (options.docUrl) {
                r[i].downloadUrl = options.docUrl + '/' + (d.name);
            }
        }
        return r;
    }

    var modes = {
        couchdb: attachmentsFromCouch,
        couch: attachmentsFromCouch
    };


    var exports = {};
    var cssLoaded = Promise.all([
        Util.loadCss('components/slickgrid/slick.grid.css'),
        Util.loadCss('src/util/uploadUi.css')
    ]);

    var prefix = 'upload/';

    function uploadDialog(data, options) {
        var mode = options.mode;
        if (data && mode && modes[mode]) {
            data = modes[mode](data, options);
        }
        var slickData = new Slick.Data.DataView();
        data = data || [];
        slickData.setItems(data, 'name');
        return cssLoaded
            .then(function () {
                return new Promise(function (resolve) {
                    var slickOptions = {
                        editable: true,
                        enableAddRow: false,
                        enableCellNavigation: true,
                        autoEdit: true,
                        enableTextSelectionOnCells: true,
                        enableColumnReorder: true,
                        forceFitColumns: true,
                        multiColumnSort: true,
                        asyncEditorLoading: true,
                        asyncEditorLoadDelay: 30,
                        enableAsyncPostRender: true,
                        asyncPostRenderDelay: 0,
                        rowHeight: 20
                    };

                    var columns = [
                        {
                            id: 'name',
                            name: 'name',
                            field: 'name',
                            sortable: false
                        },
                        {
                            id: 'contentType',
                            name: 'contentType',
                            field: 'contentType',
                            editor: Slick.Editors.Text,
                            sortable: false
                        },
                        {
                            id: 'size',
                            name: 'size',
                            field: 'size',
                            sortable: false
                        },
                        {
                            id: 'toDelete',
                            name: 'toDelete',
                            field: 'toDelete',
                            width: 40,
                            editor: Slick.Editors.Checkbox,
                            formatter: Slick.Formatters.Checkmark
                        }

                    ];

                    if (data[0] && data[0].downloadUrl) {
                        columns.push({
                            id: '__download_attachment__',
                            name: 'Download',
                            field: '__download_attachment__',
                            sortable: false,
                            width: 30,
                            formatter: downloadFormatter
                        });
                    }
                    var $dialog = $('<div class="upload-ui">');
                    var $slick = $('<div class="dropzone">');
                    var $deleteAll = $('<input type="checkbox">Select/Unselect Delete</input>');

                    $deleteAll.on('change', function () {
                        var toSet = !!this.checked;
                        data.forEach(function (d) {
                            if (d.name !== 'view.json' || d.name === 'data.json' || d.name === 'meta.json') d.toDelete = toSet;
                        });
                        grid.invalidate();
                        grid.render();
                    });
                    var grid;

                    ui.dialog($dialog, {
                        buttons: {
                            Cancel: function () {
                                $(this).dialog('close');
                            },
                            Upload: function () {
                                var toUpload = _.filter(data, function (v) {
                                    return v.file || v.toDelete;
                                });
                                resolve(toUpload);
                                $(this).dialog('close');
                            }
                        },
                        close: function () {
                            resolve(false);
                        },
                        resize: function () {
                            grid.resizeCanvas();
                        },
                        open: function () {
                            $dialog.append($slick);
                            $dialog.append($deleteAll);
                            grid = new Slick.Grid($slick, data, columns, slickOptions);
                        },
                        closeOnEscape: true,
                        width: 700,
                        height: 500
                    });


                    var dragCount = 0;
                    $dialog[0].addEventListener('dragenter', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        dragCount++;
                        if (dragCount === 1)
                            $slick.addClass('drop-over');
                    });
                    $dialog[0].addEventListener('dragleave', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        dragCount--;
                        if (!dragCount)
                            $slick.removeClass('drop-over');

                    });
                    $dialog[0].addEventListener('dragover', function (e) {
                        e.preventDefault();
                    });

                    function addFile(file, name) {
                        name = name || '';
                        var filePath = prefix + (name === '' ? file.name : name + '/' + file.name);
                        var exists = _.find(data, function (v) {
                            return v.name === filePath;
                        });
                        if (exists) {
                            exists.file = file;
                            exists.color = 'orange';
                        } else {
                            data.push({
                                name: filePath,
                                file: file,
                                contentType: file.type || mimeTypes.lookup(filePath) || 'application/octet-stream',
                                size: file.size || 0,
                                toDelete: false,
                                color: 'green'
                            });
                        }
                    }

                    function doFile(entry, name) {
                        return new Promise(function (resolve) {
                            entry.file(function (file) {
                                addFile(file, name);
                                resolve(file);
                            });
                        });
                    }

                    function traverseEntries(entry, name) {
                        name = name || '';
                        if (entry.isDirectory) {
                            return Promise.resolve().then(function () {
                                var dirReader = entry.createReader();
                                return new Promise(function (resolve, reject) {
                                    dirReader.readEntries(function (fileEntries) {
                                        var prom = [];
                                        for (var i = 0; i < fileEntries.length; i++) {
                                            var fileEntry = fileEntries[i];
                                            if (fileEntry.isFile) {
                                                prom.push(doFile(fileEntry, name));
                                            } else if (fileEntry.isDirectory) {
                                                prom.push(traverseEntries(fileEntry, name + '/' + fileEntry.name));
                                            }
                                        }
                                        return resolve(Promise.all(prom));
                                    });
                                });
                            });
                        } else {
                            return doFile(entry);
                        }

                    }


                    // Get file data on drop
                    $dialog[0].addEventListener('drop', function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        dragCount = 0;
                        $dialog.removeClass('drop-over');
                        var prom = [];
                        for (var i = 0; i < e.dataTransfer.items.length; i++) {
                            var entry = e.dataTransfer.items[i].webkitGetAsEntry();
                            prom.push(traverseEntries(entry, entry.name));
                        }
                        Promise.all(prom).then(function () {
                            grid.updateRowCount();
                            grid.render();
                            grid.autosizeColumns();
                        });
                    });
                });
            });
    }

    function downloadFormatter(row, cell, value, coldef, dataContext) {
        var name = dataContext.name.replace(/^.*\//, '');
        return `<div style="width:100%; height: 100%;"><a href="${dataContext.downloadUrl}" download="${name}" class="download-attachment"><i class="centered-icon fa fa-download"></i></a></div>`;
    }

    exports.uploadDialog = uploadDialog;
    return exports;
});
