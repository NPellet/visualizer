'use strict';

define(['modules/default/defaultview', 'bowser', 'src/util/debug'], function (
    Default,
    bowser,
    Debug
) {
    bowser.mobileos =
        bowser.ios ||
        bowser.android ||
        bowser.blackberry ||
        bowser.firefoxos ||
        bowser.webos ||
        false;
    var hasGetUserMedia = !!(
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    );
    var useGetUserMedia = !bowser.mobileos && hasGetUserMedia;

    function View() {}

    $.extend(true, View.prototype, Default, {
        init: function () {
            var that = this;
            var $fileInput = $('<input/>')
                .css('display', 'none')
                .attr({
                    type: 'file',
                    multiple: true
                });
            var capture = this.module.getConfiguration('capture');
            if (capture && capture !== 'none') {
                $fileInput.attr('capture', capture);
                switch (capture) {
                    case 'camera':
                        $fileInput.attr('accept', 'image/*');
                        break;
                    case 'camcorder':
                        $fileInput.attr('accept', 'video/*');
                        break;
                    case 'microphone':
                        $fileInput.attr('accept', 'audio/*');
                        break;
                }
            }

            var textarea = $('<textarea>')
                .css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 0,
                    width: 0,
                    opacity: 0
                })
                .on('paste', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    that.module.controller.open(e.originalEvent.clipboardData);
                });
            var defaultMessage = this.module.getConfiguration('label');
            this.messages = {
                default: defaultMessage,
                drag:
                    this.module.getConfiguration('dragoverlabel') ||
                    defaultMessage,
                hover:
                    this.module.getConfiguration('hoverlabel') || defaultMessage
            };
            this.messageP = $('<div>')
                .css('display', 'inline-block')
                .html(this.messages.default);
            this.dom = $('<div />', {class: 'dragdropzone'})
                .html(this.messageP)
                .on('click mousemove', function () {
                    textarea.focus();
                })
                .mouseout(function () {
                    textarea.blur();
                })
                .append(textarea);

            this.dom.on('click', function (event) {
                event.stopPropagation();
                if (
                    !useGetUserMedia ||
                    !that.module.getConfigurationCheckbox('getusermedia', 'yes')
                )
                    $fileInput.click();
                else {
                    confirm(
                        $(
                            '<video id="video"></video><canvas id="canvas" style="display:none;"></canvas>'
                        )
                    ).then(function (value) {
                        if (!value) return;
                        if (value) {
                            that.module.controller.openPhoto(value);
                        }
                    });
                }
            });

            $fileInput.on('change', function (e) {
                that.module.controller.open(
                    that.module.controller.emulDataTransfer(e)
                );
            });

            $fileInput.on('load', function (e) {});

            this.module.getDomContent().html(this.dom);
        },

        inDom: function () {
            var that = this,
                dom = this.dom.get(0);

            // We use a drag count to circumvent the fact that
            // The dragleave event is fired when entering a child element
            // See http://stackoverflow.com/q/7110353/1247233
            var dragCount = 0;
            dom.addEventListener('mouseenter', function (e) {
                e.stopPropagation();
                e.preventDefault();
                that.messageP.html(that.messages.hover);
                that.dom.addClass('dragdrop-over');
            });

            dom.addEventListener('dragenter', function (e) {
                dragCount++;
                e.stopPropagation();
                e.preventDefault();
                if (dragCount === 1) {
                    that.messageP.html(that.messages.drag);
                    that.dom.addClass('dragdrop-over');
                }
            });

            dom.addEventListener('dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });

            dom.addEventListener('dragleave', function (e) {
                dragCount--;
                e.stopPropagation();
                e.preventDefault();
                if (!dragCount) {
                    that.messageP.html(that.messages.default);
                    that.dom.removeClass('dragdrop-over');
                }
            });

            dom.addEventListener('mouseleave', function (e) {
                e.stopPropagation();
                e.preventDefault();
                that.messageP.html(that.messages.default);
                that.dom.removeClass('dragdrop-over');
            });

            dom.addEventListener('drop', function (e) {
                dragCount = 0;
                e.stopPropagation();
                e.preventDefault();
                that.module.controller.open(e.dataTransfer);
            });

            this.resolveReady();
        },
        onResize: function () {
            var f = this.dom.first('div');
            var p = this.dom.parent().parent();
            f.css('font-size', 26);
            var fsize = 26;
            if (!fsize) {
                return;
            }

            var h = 45;
            if (!this.module.domHeader.is(':visible')) h = 20;
            while (p.height() - h < f.height() && fsize > 2) {
                f.css('font-size', --fsize);
            }
        }
    });

    var stream;
    var $dialog;
    var dialogClosed = true;

    function confirm(message) {
        return new Promise(function (resolve) {
            if (!$dialog) {
                $dialog = $('<div/>');
                $('body').append($dialog);
            }

            var imgData = null;
            $dialog.html(message);

            var streaming = false,
                video = document.querySelector('#video'),
                canvas = document.querySelector('#canvas'),
                width = 320,
                height = 0;

            navigator.getMedia =
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;

            navigator.getMedia(
                {
                    video: true,
                    audio: false
                },
                treatStream,
                function (err) {
                    Debug.error('An error occured! ' + err);
                }
            );

            video.addEventListener(
                'canplay',
                function (ev) {
                    if (!streaming) {
                        height = video.videoHeight / (video.videoWidth / width);
                        video.setAttribute('width', width);
                        video.setAttribute('height', height);
                        canvas.setAttribute('width', width);
                        canvas.setAttribute('height', height);
                        streaming = true;
                    }
                },
                false
            );

            function treatStream(s) {
                stream = s;
                if (dialogClosed) {
                    stopTracks(stream);
                    return;
                }
                if (navigator.mozGetUserMedia) {
                    video.mozSrcObject = stream;
                } else {
                    var vendorURL = window.URL || window.webkitURL;
                    video.src = vendorURL.createObjectURL(stream);
                }
                video.play();
            }

            function takepicture() {
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(video, 0, 0, width, height);
                imgData = canvas.toDataURL('image/png');
                //photo.setAttribute('src', data);
            }

            dialogClosed = false;
            $dialog.dialog({
                modal: true,
                buttons: {
                    Cancel: function () {
                        $(this).dialog('close');
                    },
                    'Take Picture': function () {
                        takepicture();
                        resolve(imgData);
                        $(this).dialog('close');
                    }
                },
                close: function () {
                    if (!stream) {
                        return resolve(false);
                    }
                    stopTracks(stream);
                    return resolve(imgData);
                },
                width: 400
            });
        });
    }

    function stopTracks(stream) {
        if (!stream) return;
        const tracks = stream.getTracks();
        if (tracks) {
            for (let track of tracks) {
                track.stop();
            }
        }
    }

    return View;
});
