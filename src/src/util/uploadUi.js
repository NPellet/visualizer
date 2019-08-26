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
        r[i].downloadUrl = `${options.docUrl}/${d.name}`;
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
    data = data || [];
    var slickData;
    return cssLoaded.then(function () {
      return new Promise(function (resolve) {
        var slickOptions = {
          editable: true,
          enableAddRow: false,
          enableCellNavigation: true,
          autoEdit: true,
          enableTextSelectionOnCells: true,
          enableColumnReorder: true,
          forceFitColumns: true,
          multiColumnSort: false,
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
            sortable: true
          },
          {
            id: 'contentType',
            name: 'contentType',
            field: 'contentType',
            editor: Slick.Editors.Text,
            sortable: true
          },
          {
            id: 'size',
            name: 'size',
            field: 'size',
            sortable: true
          },
          {
            id: 'toDelete',
            name: 'toDelete',
            field: 'toDelete',
            width: 40,
            editor: Slick.Editors.Checkbox,
            formatter: Slick.Formatters.Checkmark,
            sortable: true
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
        var $deleteAll = $(
          '<input type="checkbox">Select/Unselect Delete</input>'
        );

        $deleteAll.on('change', function () {
          var toSet = !!this.checked;
          data.forEach(function (d) {
            if (
              d.name !== 'view.json' ||
              d.name === 'data.json' ||
              d.name === 'meta.json'
            )
              d.toDelete = toSet;
          });
          grid.invalidateAllRows();
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
            slickData = new Slick.Data.DataView();
            slickData.beginUpdate();
            slickData.setItems(data, 'name');
            slickData.endUpdate();
            grid = new Slick.Grid($slick, slickData, columns, slickOptions);
            setGridEvents(grid, slickData);
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
          if (dragCount === 1) $slick.addClass('drop-over');
        });
        $dialog[0].addEventListener('dragleave', function (e) {
          e.preventDefault();
          e.stopPropagation();
          dragCount--;
          if (!dragCount) $slick.removeClass('drop-over');
        });
        $dialog[0].addEventListener('dragover', function (e) {
          e.preventDefault();
        });

        function addFile(file, name) {
          name = name || '';
          var filePath =
            prefix + (name === '' ? file.name : `${name}/${file.name}`);
          var exists = _.find(slickData.getItems(), function (v) {
            return v.name === filePath;
          });
          if (exists) {
            exists.file = file;
            exists.color = 'orange';
            exists.size = file.size || exists.size;
          } else {
            slickData.addItem({
              name: filePath,
              file: file,
              contentType:
                file.type ||
                mimeTypes.lookup(filePath) ||
                'application/octet-stream',
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
                      prom.push(
                        traverseEntries(fileEntry, `${name}/${fileEntry.name}`)
                      );
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
            grid.invalidateAllRows();
            grid.render();
          });
        });
      });
    });
  }

  function setGridEvents(grid, data) {
    function comparer(val1, val2) {
      if (val1 < val2) {
        return -1;
      } else if (val2 < val1) {
        return 1;
      }
      return 0;
    }

    grid.onSort.subscribe(function (event, args) {
      data.sort(comparer, args.sortAsc, function (item) {
        return item[args.sortCol.field];
      });

      grid.invalidateAllRows();
      grid.render();
    });
  }

  function downloadFormatter(row, cell, value, coldef, dataContext) {
    var name = dataContext.name.replace(/^.*\//, '');
    return `<div style="width:100%; height: 100%;"><a href="${
      dataContext.downloadUrl
    }" download="${name}" class="download-attachment"><i class="centered-icon fa fa-file-download"></i></a></div>`;
  }

  exports.uploadDialog = uploadDialog;
  return exports;
});
