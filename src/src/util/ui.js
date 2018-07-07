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
    'forms/button',
    'src/util/Form',
    'lib/twigjs/twig',
    'notifyjs',
    'jquery-ui/ui/widgets/dialog'
], function (Util, Debug, _, $, Renderer, Button, Form, Twig) {
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
            editor.getSession().setOption('useWorker', false);
            editor.getSession().setMode(mode);
            editor.setValue(opts.content, -1);
        });
    };

    exports.enterValue = function (opts) {
        const defaultOptions = {
            description: '',
            label: 'Enter a value',
            buttonLabel: 'Submit',
            validationMessage: 'What you entered is not valid',
            value: '',
            validation: () => true
        };

        opts = Object.assign({}, defaultOptions, opts);

        return new Promise(function (resolve) {

            var div = $(`<div>${opts.description}<div>${opts.label}: </div></div>`);
            var input = $(`<input type="text" value="${opts.value}"/>`).appendTo(div.find('div')).on('keypress', evt => {
                if (evt.keyCode === 13) done();
            });
            const done = () => {
                var value = input.val();
                if (!opts.validation(value)) {
                    exports.showNotification(opts.validationMessage, 'error');
                    return;
                }
                resolve(value);
                dialog.dialog('destroy');
            };

            const dialogOptions = Object.assign({}, opts.dialog, {
                buttons: {
                    [opts.buttonLabel]: done
                },
                close: function () {
                    resolve(null);
                    dialog.dialog('destroy');
                }
            });
            var dialog = exports.dialog(div, dialogOptions);
        });
    };

    exports.form = function (div, inputObject, opts) {
        opts = Object.assign({}, opts);

        if (opts.twig) {
            var template = Twig.twig({
                data: DataObject.resurrect(div)
            });
            var render = template.renderAsync(DataObject.resurrect(opts.twig));
            render.render();
            div = render.html;
        }

        return new Promise(function (resolve) {
            const done = (name) => {
                var obj = form.getData(true);
                obj._clickedButton = name;
                form.unbind();
                resolve(obj);
                dialog.dialog('destroy');
            };

            if (!div.jquery) {
                div = $(div);
            }

            var form = new Form(div);
            if (inputObject) form.setData(inputObject);

            form.onSubmit((event) => {
                done(event.target.name);
            });

            const dialogOptions = Object.assign({buttons: {}}, opts.dialog, {
                close: function () {
                    form.unbind();
                    resolve(null);
                    dialog.dialog('destroy');
                }
            });

            if (opts.buttonLabels) {
                for (let i = 0; i < opts.buttonLabels.length; i++) {
                    const button = opts.buttonLabels[i];
                    if (typeof button === 'string') {
                        dialogOptions.buttons[button] = () => done(button);
                    } else {
                        dialogOptions.buttons[button.label] = () => done(button.key);
                    }
                }
            }
            var dialog = exports.dialog(div, dialogOptions);
        });
    };

    exports.chooseSearch = async function (list, options) {
        let _resolve;
        const promise = new Promise(function (resolve) {
            _resolve = resolve;
        });
        options = Object.assign({}, {
            title: 'Choose',
            width: 500,
            template: (element) => element.text || element.id,
            id: (el) => el.id,
            text: (el) => el.text,
            groupBy: null
        }, options);

        let searchList = list.map(el => ({
            original: el,
            text: options.text(el),
            id: options.id(el)
        }));

        if (options.groupBy) {
            const grouped = _.groupBy(searchList, (el) => options.groupBy(el.original));
            const keys = Object.keys(grouped);
            searchList = keys.map(key => ({
                id: `group-${key}`,
                text: key,
                children: grouped[key]
            }));
        }

        await Util.require('select2');
        await Util.loadCss('components/select2/dist/css/select2.css');

        var $select2 = '<div><div style="height:50px"></div> <select>';
        var selectWidth = options.width;

        var ww = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var wh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        $select2 += '</select></div>';
        $select2 = $($select2);

        $select2 = $select2.css({
            position: 'fixed',
            'justify-content': 'center',
            top: 0,
            left: 0,
            width: ww,
            height: wh,
            paddingLeft: Math.floor(ww / 2 - selectWidth / 2),
            paddingTop: 50,
            margin: 0,
            'box-sizing': 'border-box',
            opacity: 0.7,
            backgroundColor: '#262b33'
        })
            .appendTo('body')
            .find('select')
            .addClass('js-example-basic-single').css({
                width: selectWidth,
                zIndex: 5000
            });

        $select2.select2({
            placeholder: options.title,
            data: searchList,
            templateResult: options.template
        }).select2('open').val(null).trigger('change');

        var selecting;
        $select2.on('select2:selecting', function (e) {
            selecting = true;
        });
        $select2.on('select2:select', function (e) {
            $select2.select2('destroy');
            $select2.parent().remove();
            _resolve(e.params.data.original);
        });

        $select2.on('select2:close', function (e) {
            if (!selecting) {
                $select2.select2('destroy');
                $select2.parent().remove();
                _resolve(null);
            }
        });
        return promise;
    };

    exports.choose = async function (list, options) {
        const Slick = await Util.require('slickgrid');
        options = Object.assign({slick: {}}, options);
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

        var grid, data, lastClickedId, buttons, arr, columns, sources,
            failedSources = 0,
            $header;
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
            for (let i = 0; i < list.length; i++) {
                //eslint-disable-next-line no-loop-func
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
                    data.sort(function (a, b) {
                        if (a.order === undefined || b.order === undefined) {
                            return 0;
                        } else {
                            return a.order - b.order;
                        }
                    });
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

                const defaultDialogOptions = {
                    width: 700,
                    height: 500
                };

                const dialogOptions = Object.assign({}, defaultDialogOptions, options.dialog, {
                    noWrap: true,
                    closeOnEscape: false,
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
                    }
                });

                exports.dialog($dialog, dialogOptions);
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

    exports.confirm = function (html, okLabel, cancelLabel, dialogOptions) {
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

            dialogOptions = Object.assign({
                modal: true,
                width: 400
            }, dialogOptions, {
                close: function () {
                    resolve(false);
                },
                buttons: {}
            });


            if (okLabel !== null && okLabel !== '') dialogOptions.buttons[okLabel] = function () {
                resolve(true);
                $(this).dialog('close');
            };

            if (cancelLabel !== null && cancelLabel !== '') dialogOptions.buttons[cancelLabel] = function () {
                resolve(false);
                $(this).dialog('close');
            };

            $dialog.dialog(dialogOptions);
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
