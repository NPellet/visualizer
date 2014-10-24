define(['modules/default/defaultview', 'bowser'], function (Default, bowser) {
    bowser.mobileos = bowser.ios || bowser.android || bowser.blackberry || bowser.firefoxos || bowser.webos || false;
    var hasGetUserMedia = !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    var useGetUserMedia = !bowser.mobileos && hasGetUserMedia;
    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {

        init: function () {

            var self = this;
            var $fileInput = $('<input/>').css('display', 'none').attr({
                type: 'file'
            });
            var capture = this.module.getConfiguration('capture');
            if(capture && capture !== 'none') {
                $fileInput.attr('capture', capture);
                switch(capture) {
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

            var textarea = $("<textarea>").css({
                position: "absolute",
                top: 0,
                left: 0,
                height: 0,
                width: 0,
                opacity: 0
            }).on("paste", function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.module.controller.open(e.originalEvent.clipboardData);
            });
            var defaultMessage = this.module.getConfiguration('label');
            this.messages = {
                'default': defaultMessage,
                drag: this.module.getConfiguration('dragoverlabel') || defaultMessage,
                hover: this.module.getConfiguration('hoverlabel') || defaultMessage
            };
            this.messageP = $('<div>').css('display', 'inline-block').html(this.messages.default);
            this.dom = $('<div />', { class: 'dragdropzone' }).html(this.messageP).on("click mousemove", function () {
                textarea.focus();
            }).mouseout(function () {
                textarea.blur();
            }).append(textarea);


            this.dom.on('click', function(event) {
                event.stopPropagation();
                if(!useGetUserMedia) $fileInput.click();
                else {
                    confirm($('<video id="video"></video><button id="startbutton">Take photo</button><canvas id="canvas"></canvas>')).then(function(value) {
                        if(value) {
                            self.module.controller.openPhoto(value);
                        }
                    });
                }
            });

            $fileInput.on('change', function(e) {
                self.module.controller.open(self.module.controller.emulDataTransfer(e));
            });

            $fileInput.on('load', function(e) {
                debugger;
            });

            this.module.getDomContent().html(this.dom);
        },

        inDom: function () {

            var self = this,
                dom = this.dom.get(0);

            dom.addEventListener('mouseenter', function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.messageP.html(self.messages.hover);
                self.dom.addClass('dragdrop-over');
            });

            dom.addEventListener('dragenter', function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.messageP.html(self.messages.drag);
                self.dom.addClass('dragdrop-over');
            });

            dom.addEventListener('dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });

            dom.addEventListener('dragleave', function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.messageP.html(self.messages.default);
                self.dom.removeClass('dragdrop-over');
            });

            dom.addEventListener('mouseleave', function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.messageP.html(self.messages.default);
                self.dom.removeClass('dragdrop-over');
            });

            dom.addEventListener('drop', function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.module.controller.open(e.dataTransfer);
            });

            this.resolveReady();
        },
        onResize: function() {

            var f = this.dom.first('div');
            var p = this.dom.parent().parent();
            f.css('font-size', 26);
            var fsize = 26;
            if(!fsize) {
                return;
            }
            while(p.height() - 40 < f.height() && fsize > 2) {
                f.css('font-size', --fsize);
            }

        }
    });


    var stream;
    var $dialog;
    function confirm(message) {
        return new Promise(function(resolve){
            if(!$dialog) {
                $dialog = $('<div/>');
                $('body').append($dialog);
            }

            var imgData = null;
            $dialog.html(message);


            var streaming = false,
                video        = document.querySelector('#video'),
                canvas       = document.querySelector('#canvas'),
                startbutton  = document.querySelector('#startbutton'),
                width = 320,
                height = 0;


                navigator.getMedia = ( navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia);

                navigator.getMedia(
                    {
                        video: true,
                        audio: false
                    }, treatStream,
                    function(err) {
                        console.error("An error occured! " + err);
                    }
                );



            video.addEventListener('canplay', function(ev){
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth/width);
                    video.setAttribute('width', width);
                    video.setAttribute('height', height);
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    streaming = true;
                }
            }, false);

            function treatStream(s) {
                stream = s;
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

            startbutton.addEventListener('click', function(ev){
                takepicture();
                ev.preventDefault();
            }, false);


            $dialog.dialog({
                modal: true,
                buttons: {
                    Cancel: function() {
                        $(this).dialog('close');
                    },
                    Ok: function() {
                        resolve(imgData);
                        $(this).dialog('close');
                    }
                },
                close: function() {
                    stream.stop();
                    return resolve(imgData);
                },
                width: 400
            });
        });
    }

    return View;
});

