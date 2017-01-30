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
    'slickgrid',
    'forms/button',
    'src/util/Form',
    'lib/twigjs/twig',
    'notifyjs',
    'jquery-ui/ui/widgets/dialog'
], function (Util, Debug, _, $, Renderer, Slick, Button, Form, Twig) {
    // On load add the style for the progress notification
    $.notify.addStyle('inprogress', {
        html: `<div><span data-notify-text/>   &nbsp; &nbsp; ${Util.getLoadingAnimation(24, 'black').css('vertical-align', 'middle').wrap('<div/>').parent().html()}</div>`,
        classes: {
            xxx: {
                'font-weight': 'bold',
                padding: '8px 15px 8px 14px',
                'text-shadow': '0 1px 0 rgba(255, 255, 255, 0.5)',
                border: '1px solid #fbeed5',
                'border-radius': '4px',
                'white-space': 'nowrap',
                'padding-left': '25px',
                'background-repeat': 'no-repeat',
                'background-position': '3px 7px',
                color: '#3A87AD',
                'background-color': '#D9EDF7',
                'border-color': '#BCE8F1'
            }
        }
    });

    var exports = {};
    var inProgress = {};
    var $dialog;

    exports.showCode = function (opts) {
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
                    resolve(null);
                    dialog.dialog('destroy');
                }
            };
            options.buttons[opts.buttonLabel] = done;
            var dialog = exports.dialog(div, options);
        });
    };

    exports.form = function (div, inputObject, opts) {
        opts = opts || {};

        if (opts.twig) {
            var template = Twig.twig({
                data: DataObject.resurrect(div)
            });
            var render = template.renderAsync(DataObject.resurrect(opts.twig));
            render.render();
            div = render.html;
        }

        return new Promise(function (resolve) {
            const done = () => {
                var obj = form.getData(true);
                form.unbind();
                resolve(obj);
                dialog.dialog('destroy');
            };

            if (!div.jquery) {
                div = $(div);
            }

            var form = new Form(div);
            if (inputObject) form.setData(inputObject);

            form.onSubmit(done);


            var options = {
                close: function () {
                    form.unbind();
                    resolve(null);
                    dialog.dialog('destroy');
                }
            };
            if (opts.buttonLabel) {
                options.buttons = {
                    [opts.buttonLabel]: done
                };
            }
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
                var val = DataObject.check(dataContext).getChildSync(colDef.jpath);
                Renderer.render(cellNode, val, colDef.rendererOptions);
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
            _ready = addItems(arr);
            allProm = [_ready];
        } else if (fromArray) {
            sources = list.length;
            var allProm = new Array(list.length);
            for (var i = 0; i < list.length; i++) {
                allProm[i] = list[i].promise.then(addItems).catch(function (e) {
                    Debug.error('failed', e);
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
            if (!columns[i].jpath && columns[i].field) {
                columns[i].jpath = [columns[i].field];
            }
        }

        return new Promise(function (resolve) {
            Util.loadCss('components/slickgrid/slick.grid.css').then(function () {
                var $dialog = $('<div>');
                var $slick = $('<div>');
                var $container = $('<div>').css('height', 410);

                Promise.all(allProm).then(() => {
                    var len = data.getLength();
                    if (len === 0) {
                        resolve();
                        $dialog.dialog('close');
                        return;
                    }
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
                        resolve(null);
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
                            if (options.noSelect) return;
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

    exports.showNotification = function () {
        var args = Array.from(arguments);
        args[1] = args[1] || 'error';
        if (args[1] && (typeof args[1] === 'string')) {
            args[1] = {
                className: args[1],
                autoHide: args[1] !== 'error'
            };
        } else if (args[1] && args[1].className === 'error') {
            args[1] = Object.assign({autoHide: false}, args[1]);
        }
        $.notify.apply($.notify, args);
    };

    exports.progress = function (id, text) {
        if (!text) text = id;
        exports.showNotification(text, {
            style: 'inprogress',
            autoHide: false,
            className: 'xxx'
        });
        inProgress[id] = $('.notifyjs-inprogress-xxx').last();
        return id;
    };

    exports.stopProgress = function (id) {
        if (!inProgress[id]) return;
        inProgress[id].trigger('notify-hide');
        delete inProgress[id];
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
