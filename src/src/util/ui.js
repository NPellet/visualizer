'use strict';

/**
 * Global ui methods
 * @module src/util/ui
 */

define(['src/util/util', 'src/util/debug', 'lodash', 'jquery', 'src/util/versioning', 'forms/button', 'src/util/couchshare', 'jquery-ui/dialog'], function (Util, Debug, _, $, Versioning, Button, Sharer) {

    var exports = {};

    var $dialog;
    var $notification;
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

    exports.copyview = function() {
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

    exports.copyData = function() {
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

    exports.pasteData = function() {
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

        var div  = exports.dialog(txtarea, {width: '80%'}).append(btn.render());
    };

    exports.pasteView = function() {
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

        var div  = exports.dialog(txtarea, {width: '80%'}).append(btn.render());
    };

    exports.feedback = function(options, shareOptions, dialogOptions) {
        var uniqid = Util.getNextUniqueId();

        var message = $('<span>').attr('id', uniqid + '-message').css('color', 'red');

        var dialog = $('<div>').html('<h2>Do you have a comment on the visualizer ? Did you find a bug ?</h2><p>Put your comment here and we will be notified.<br>A snapshot of you view and data will also be sent to us so feel free to describe exactly what you did and what happened !</p>' +
        '<table><tr><td>Title : </td><td><input type="text" id="' + uniqid + '-title" style="width:500px" /></td></tr><tr><td>Description : </td><td><textarea id="' + uniqid + '-description" rows="12" cols="80"></textarea></td></tr></table>').append(
            new Button('Send', function () {
                var button = this;
                if (!options.disabled) {
                    Sharer.share(shareOptions).done(function (tinyUrl) {
                        var title = $('#' + uniqid + '-title').val();
                        var description = $('#' + uniqid + '-description').val();
                        var json = {
                            title: title,
                            body: description + '\n\nTestcase: ' + tinyUrl + ' ([Original URL](' + document.location.href + '))'
                        };
                        $.ajax({
                            type: 'POST',
                            url: 'http://visualizer.epfl.ch/github/api/issue',
                            contentType: 'application/json',
                            dataType: 'json',
                            data: JSON.stringify(json),
                            success: function (data) {
                                console.log('success', data);
                                message.html('Thank you for your feedback ! You can follow your issue <a target="_blank" href="' + data.description + '">here</a>');
                                button.disable();
                            },
                            error: function (data) {
                                message.html('ERROR');
                                console.log('error', data);
                            }
                        });
                    }).fail(function (data) {
                        message.html('ERROR');
                        console.log('error', data);
                    });
                }
            }, {color: 'blue'}).render()
        ).append(message);
        exports.dialog(dialog, dialogOptions);
    };

    exports.couchShare = function(options, dialogOptions) {
        var uniqid = Util.getNextUniqueId();
        var dialog = $('<div>').html('<h3>Click the share button to make a snapshot of your view and generate a tiny URL</h3><br>').append(
            new Button('Share', function () {
                var button = this;
                if (!options.disabled) {
                    Sharer.share(options).done(function (tinyUrl) {
                        $('#' + uniqid).val(tinyUrl).focus().select();
                        button.disable();
                    }).fail(function () {
                        $('#' + uniqid).val('error');
                    });
                }
            }, {color: 'blue'}).render()
        ).append(
            $('<input type="text" id="' + uniqid + '" />').css('width', '400px')
        );
        exports.dialog(dialog, dialogOptions);
    };

    exports.showNotification = function(message) {
        $notification = $('.ci-visualizer-notification');
        if($notification.length === 0) {
            $('#ci-visualizer').append('<div class="ci-visualizer-notification"></div>');
            $notification = $('.ci-visualizer-notification');
        }
        $notification.show().html(message);
        setTimeout(function() {
            $notification.hide();
        }, 5000);
    };

    return exports;

});
