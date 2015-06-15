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
    'slickgrid'
], function (Util, Debug, ui, _, $, Slick) {
    function attachmentsFromCouch(data) {
        var r = [];
        for (var key in data) {
            r.push({
                name: key,
                contentType: data[key].content_type
            });
        }
        return r;
    }

    var modes = {
        couchdb: attachmentsFromCouch,
        couch: attachmentsFromCouch
    };


    var exports = {};
    var cssLoaded = Promise.all([
        Util.loadCss(require.toUrl('components/slickgrid/slick.grid.css')),
        Util.loadCss(require.toUrl('src/util/uploadUi.css'))
    ]);

    var prefix = 'upload/';

    function uploadDialog(data, mode) {
        if (data && mode && modes[mode]) {
            data = modes[mode](data);
        }
        data = data || [];
        return cssLoaded
            .then(function () {
                return new Promise(function (resolve) {
                    var slickOptions = {
                        editable: true,
                        enableAddRow: false,
                        enableCellNavigation: true,
                        autoEdit: false,
                        enableTextSelectionOnCells: true,
                        enableColumnReorder: true,
                        forceFitColumns: true,
                        multiColumnSort: true,
                        asyncEditorLoading: true,
                        asyncEditorLoadDelay: 30,
                        enableAsyncPostRender: true,
                        asyncPostRenderDelay: 0
                    };

                    var columns = [{
                        id: 'name',
                        name: 'name',
                        field: 'name',
                        editor: Slick.Editors.Text,
                        sortable: true
                    }, {
                        id: 'contentType',
                        name: 'contentType',
                        field: 'contentType',
                        editor: Slick.Editors.Text
                    }, {
                        id: 'toDelete',
                        name: 'toDelete',
                        field: 'toDelete',
                        editor: Slick.Editors.Checkbox,
                        formatter: Slick.Formatters.Checkmark
                    }];
                    var $dialog = $('<div class="upload-ui">');
                    var $slick = $('<div class="dropzone">');
                    var grid;

                    ui.dialog($dialog, {
                        buttons: {
                            Cancel: function () {
                                $(this).dialog('close');
                            },
                            Upload: function () {
                                var toUpload = _(data).filter(function (v) {
                                    return v.file;
                                }).each(function(v) {
                                    //if(v.contentType) v.file.type = v.contentType;
                                    //v.file.name = v.name;
                                }).value();
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
                            //$('body').append($slick);
                            grid = new Slick.Grid($slick, data, columns, slickOptions);
                        },
                        closeOnEscape: false,
                        width: 700,
                        height: 500
                    });
                    var dragCount = 0;
                    $dialog[0].addEventListener('dragenter', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        dragCount++;
                        if (dragCount === 1)
                            $dialog.addClass('drop-over');
                    });
                    $dialog[0].addEventListener('dragleave', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        dragCount--;
                        if (!dragCount)
                            $dialog.removeClass('drop-over');

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
                                contentType: file.type,
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

    exports.uploadDialog = uploadDialog;
    exports.dummy = function() {
        var formData = new FormData();

        formData.append("_rev", "10-ba0805576b13ae9f877c15b0b82f62d0");


        var content = '<a id="a"><b id="b">hey!</b></a>'; // the body of the new file...
        var blob = new Blob([content], { type: "text/xml"});

        formData.append("_attachments", blob, 'web.html');

        $.ajax({
            url: "http://127.0.0.1/localcouch/cheminfo/132bdb90c42b9daea9d5b6d658003339",
            type: "POST",
            data: formData,
            processData: false,  // tell jQuery not to process the data
            contentType: false   // tell jQuery not to set contentType
        });
    };
    return exports;
});
