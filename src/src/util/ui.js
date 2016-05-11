'use strict';

/**
 * Global ui methods
 * @module src/util/ui
 */

define([
    'src/util/util',
    'src/util/debug',
    'lodash',
    'jquery',
    'src/util/typerenderer',
    'src/util/versioning',
    'slickgrid',
    'forms/button',
    'src/util/couchshare',
    'jquery-ui/dialog'
], function (Util, Debug, _, $, Renderer, Versioning, Slick, Button, Sharer) {

    var exports = {};


    var $dialog;

    exports.showCode = function(opts) {
        var opts = Object.assign({
            mode: 'json',
            content: '',
            width: 800,
            height: 600
        }, opts);
        require(['ace/ace'], function (ace) {
            var id = Util.getNextUniqueId(true);
            exports.dialog($(`<div style="width: 100%; height: 100%;" id="${id}"></div>`), opts);
            var editor = ace.edit(id);
            var mode = './mode/' + opts.mode;
            editor.getSession().setMode(mode);
            editor.setValue(opts.content, -1);
        });
    };

    exports.enterValue = function (opts) {
        opts = opts || {};
        const defaultOptions = {
            description: '',
            label: 'Enter a value',
            buttonLabel: 'Submit',
            validationMessage: 'What you entered is not valid',
            value: ''
        };

        opts = Object.assign({}, defaultOptions, opts);

        return new Promise(function (resolve) {

            var div = $(`<div>${opts.description}<div>${opts.label}: </div></div>`);
            var input = $(`<input type="text" value="${opts.value}"/>`).appendTo(div.find('div')).on('keypress', evt => {
                if (evt.keyCode === 13) done();
            });
            const done = () => {
                var value = input.val();
                if (opts.validation && typeof opts.validation === 'function') {
                    if (!opts.validation(value)) {
                        exports.showNotification(opts.validationMessage, 'error');
                        return;
                    }
                }
                resolve(value);
                dialog.dialog('destroy');
            };
            var options = {
                buttons: {},
                close: function () {
                    resolve();
                    dialog.dialog('destroy');
                }
            };
            options.buttons[opts.buttonLabel] = done;
            var dialog = exports.dialog(div, options);
        });
    };

    exports.choose = function (list, options) {
        options = options || {};
        options = _.defaults(options, {
            slick: {}
        });

        var readyToAddItems;

        // Slick Rendering
        function waitFormatter() {
            return '...';
        }

        function typeRenderer(cellNode, row, dataContext, colDef) {
            if (cellNode) {
                Renderer.render(cellNode, dataContext[colDef.field], colDef.rendererOptions);
            }
        }

        var _ready = new Promise(resolve => {
            readyToAddItems = resolve;
        });

        // Display
        function updateHeader() {
            $header.html(`
                <table><tr><td>
                ${sources ? (sources + ' sources left') : 'Sources loaded.' + (failedSources ? (' (' + failedSources + ' failed)') : '')}
                </td>
                <td id="abc">
                </td></tr>
                `);
            var animCell = $($header.find('td')[1]);
            animCell.append(Util.getLoadingAnimation(16, 'blue'));

            if (!sources) {
                animCell.remove();
            }
        }


        function addItems(arr) {
            return _ready.then(function (slick) {
                slick.data.beginUpdate();
                for (var i = 0; i < arr.length; i++) {
                    slick.data.addItem(arr[i]);
                }
                slick.data.endUpdate();
                slick.grid.invalidateAllRows();
                slick.grid.render();
                slick.grid.resizeCanvas();
                sources--;
                updateHeader();
            });
        }

        // Default values
        var slickDefaultOptions = {
            editable: true,
            enableAddRow: false,
            enableTextSelectionOnCells: true,
            forceFitColumns: true,
            explicitInitialization: true,
            rowHeight: 20,
            enableAsyncPostRender: true
        };

        var slickDefaultColumn = {
            formatter: waitFormatter,
            asyncPostRender: typeRenderer
        };

        var grid, data, lastClickedId, buttons, arr, columns, sources, failedSources = 0, $header;
        var fromArray = Array.isArray(list);

        if (!options.asynchronous) {
            allProm = [];
            if (fromArray) {
                arr = list;
            } else {
                var keys = Object.keys(list);
                arr = new Array(keys.length);
                for (var i = 0; i < arr.length; i++) {
                    arr[i] = {
                        key: keys[i],
                        description: list[keys[i]]
                    };
                }
            }
            addItems(arr);
        } else if (fromArray) {
            sources = list.length;
            var allProm = new Array(list.length);
            for (var i = 0; i < list.length; i++) {
                allProm[i] = list[i].promise.then(addItems).catch(function (e) {
                    sources--;
                    failedSources++;
                    updateHeader();
                });
            }
        } else {
            throw new Error('Invalid arguments');
        }

        var slickOptions = _.defaults(options.slick, slickDefaultOptions);

        if (options.columns) {
            columns = options.columns;
        } else {
            columns = [
                {
                    id: 'key',
                    name: 'key',
                    field: 'key'
                },
                {
                    id: 'description',
                    name: 'description',
                    field: 'description'
                }
            ];
        }

        for (var i = 0; i < columns.length; i++) {
            columns[i] = _.defaults(columns[i], slickDefaultColumn);
        }

        return new Promise(function (resolve, reject) {
            Util.loadCss('components/slickgrid/slick.grid.css').then(function () {
                var $dialog = $('<div>');
                var $slick = $('<div>');
                var $container = $('<div>').css('height', 410);

                Promise.all(allProm).then(() => {
                    var len = data.getLength();
                    if (len === 1 && options.autoSelect) {
                        var id = data.mapRowsToIds([0])[0];
                        resolve(id);
                        $dialog.dialog('close');
                    }
                });

                if (options.noConfirmation) {
                    buttons = {};
                } else {
                    buttons = {
                        Cancel: function () {
                            $(this).dialog('close');
                        },
                        Select: function () {
                            resolve(lastClickedId);
                            $(this).dialog('close');
                        }
                    };
                }

                exports.dialog($dialog, {
                    noWrap: true,
                    buttons: buttons,
                    close: function () {
                        resolve();
                    },
                    resize: function () {
                        grid.resizeCanvas();
                    },
                    open: function () {
                        var that = this;
                        $container.addClass('flex-main-container');
                        $slick.addClass('flex-1');
                        $header = $('<div>');
                        $container.append($header);
                        $container.append($slick);
                        $dialog.append($container);
                        data = new Slick.Data.DataView();
                        data.setItems([], options.idField || 'key');
                        grid = new Slick.Grid($slick, data, columns, slickOptions);
                        grid.setSelectionModel(new Slick.RowSelectionModel());
                        grid.onClick.subscribe(function (e, args) {
                            // Get id
                            lastClickedId = data.mapRowsToIds([args.row])[0];
                            if (options.noConfirmation) {
                                resolve(lastClickedId);
                                $(that).dialog('close');
                            }
                        });
                        grid.init();
                        readyToAddItems({
                            data,
                            grid
                        });
                        updateHeader();
                    },
                    closeOnEscape: false,
                    width: 700,
                    height: 500
                });
            });
        }).then(function (result) {
            if (options.returnRow) {
                return data.getItemById(result);
            } else if (options.returnColumn) {
                return data.getItemById(result)[options.returnColumn];
            } else {
                return result;
            }
        });

    };

    exports.confirm = function (html, okLabel, cancelLabel) {
        if (_.isUndefined(okLabel)) okLabel = 'Ok';
        if (_.isUndefined(cancelLabel)) cancelLabel = 'Cancel';
        return new Promise(function (resolve) {
            if (!$dialog) {
                $dialog = $('<div/>');
                $('body').append($dialog);
            }
            if (html) {
                $dialog.html(html);
            }

            var options = {
                modal: true,
                buttons: {},
                close: function () {
                    resolve(false);
                },
                width: 400
            };

            if (okLabel !== null && okLabel !== '') options.buttons[okLabel] = function () {
                resolve(true);
                $(this).dialog('close');
            };

            if (cancelLabel !== null && cancelLabel !== '') options.buttons[cancelLabel] = function () {
                resolve(false);
                $(this).dialog('close');
            };

            $dialog.dialog(options);
        });
    };

    var defaultDialogOptions = {
        appendTo: '#ci-visualizer',
        modal: true,
        autoDestroy: true,
        autoPosition: false,
        noHeader: false,
        noWrap: false
    };
    exports.dialog = function (div, options) {
        if (typeof div === 'object' && !div.jquery) {
            options = div;
            div = null;
        }
        options = $.extend({}, defaultDialogOptions, options);
        var $dialog;
        if (options.noWrap) {
            $dialog = $(div || '<div>');
        } else {
            $dialog = $('<div>').html(div || '');
        }
        if (options.autoDestroy && !options.close) {
            options.close = function () {
                $(this).dialog('destroy');
            };
        }
        if (options.autoPosition) {
            options.position = {
                my: 'top+50',
                at: 'center top',
                of: '#ci-visualizer'
            };
        }
        $dialog.dialog(options);
        if (options.noHeader) {
            $dialog.prev().remove();
        }
        return $dialog;
    };

    exports.copyToClipboard = function (str) {
        var strlen = str.length;
        var txtarea = $('<textarea/>').text(str).css({
            width: 0,
            height: 0,
            position: 'fixed'
        });

        $('body').append(txtarea);

        var txtdom = txtarea.get(0);

        txtdom.selectionStart = 0;
        txtdom.selectionEnd = strlen;
        txtdom.focus();

        var success = document.execCommand('copy');
        if (success) exports.showNotification('Copy success', 'success');
        else exports.showNotification('Copy failure', 'error');
        txtarea.remove();
    };

    exports.copyview = function () {
        var str = Versioning.getViewJSON('  ');
        var strlen = str.length;
        var txtarea = $('<textarea/>').text(str).css({
            width: '100%',
            height: '95%'
        });
        exports.dialog(txtarea, {
            width: '80%',
            height: $('#ci-visualizer').height() * 0.7
        });

        var txtdom = txtarea.get(0);

        txtdom.selectionStart = 0;
        txtdom.selectionEnd = strlen;
        txtdom.focus();
    };

    exports.copyData = function () {
        var str = Versioning.getDataJSON('  ');
        var strlen = str.length;
        var txtarea = $('<textarea/>').text(str).css({
            width: '100%',
            height: '200px'
        });
        exports.dialog(txtarea, {width: '80%'});
        var txtdom = txtarea.get(0);

        txtdom.selectionStart = 0;
        txtdom.selectionEnd = strlen;
        txtdom.focus();
    };

    exports.pasteData = function () {
        var txtarea = $('<textarea></textarea>').css({
                width: '100%',
                height: '200px'
            }),
            val, keys,
            btn = new Button('Paste', function () {

                try {
                    val = JSON.parse(txtarea.val());
                    keys = Object.keys(val);
                    for (var i = 0, ii = keys.length; i < ii; i++) {
                        if (keys[i].charAt(0) === '_')
                            delete val[keys[i]];
                    }
                    Versioning.setDataJSON(val);
                } catch (_) {
                    // do nothing
                }

                div.dialog('close');
            });

        var div = exports.dialog(txtarea, {width: '80%'}).append(btn.render());
    };

    exports.pasteView = function () {
        var txtarea = $('<textarea></textarea>').css({
                width: '100%',
                height: '200px'
            }),
            val, keys,
            btn = new Button('Paste', function () {

                try {
                    val = JSON.parse(txtarea.val());
                    keys = Object.keys(val);
                    for (var i = 0, ii = keys.length; i < ii; i++) {
                        if (keys[i].charAt(0) === '_')
                            delete val[keys[i]];
                    }
                    Versioning.setViewJSON(val);
                } catch (_) {
                    // do nothing
                }

                div.dialog('close');
            });

        var div = exports.dialog(txtarea, {width: '80%'}).append(btn.render());
    };

    exports.feedback = function (options, shareOptions) {
        options = options || {};
        shareOptions = shareOptions || {};
        shareOptions = _.defaults(shareOptions, {
            couchUrl: 'http://visualizer.epfl.ch',
            database: 'x',
            tinyUrl: 'http://visualizer.epfl.ch/tiny'
        });

        if (!options.disabled) {
            Sharer.share(shareOptions).then(function (tinyUrl) {
                var description = '\n\nTestcase: ' + tinyUrl + ' ([Original URL](' + document.location.href + '))';
                var url = 'https://github.com/NPellet/visualizer/issues/new?body=' + encodeURIComponent(description);
                var win = window.open(url, '_blank');
                win.focus();
            }).catch(error => {
                exports.showNotification('Error with Feedback, maybe pop-up was blocked', 'error');
            });
        }
    };

    exports.couchShare = function (options, dialogOptions) {
        var uniqid = Util.getNextUniqueId();
        var dialog = $('<div>').html('<h3>Click the share button to make a snapshot of your view and generate a tiny URL</h3><br>').append(
            new Button('Share', function () {
                var that = this;
                if (!options.disabled) {
                    Sharer.share(options).then(function (tinyUrl) {
                        $('#' + uniqid).val(tinyUrl).focus().select();
                        that.disable();
                    }, function () {
                        $('#' + uniqid).val('error');
                    });
                }
            }, {color: 'blue'}).render()
        ).append(
            $('<input type="text" id="' + uniqid + '" />').css('width', '400px')
        );
        exports.dialog(dialog, dialogOptions);
    };

    exports.showNotification = function () {
        var args = arguments;
        if (args[1] && (typeof args[1] === 'string')) {
            args[1] = {
                className: args[1],
                autoHide: args[1] !== 'error'
            };
        } else if (args[1] && args[1].className === 'error') {
            args[1] = Object.assign({autoHide: false}, args[1]);
        }
        require(['notifyjs'], function () {
            $.notify.apply($.notify, args);
        });
    };

    exports.getSafeElement = function (el) {
        return exports.makeElementSafe('<' + el + '>');
    };

    exports.makeElementSafe = function (el) {
        return $(el).css({
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            border: 'none'
        });
    };

    return exports;

});
