'use strict';

define(['modules/default/defaultview', 'src/util/ui'], function (Default, UI) {
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

      this.canDropOrPaste =
        this.module.getConfigurationCheckbox('inputOptions', 'allowDrop') ||
        this.module.getConfigurationCheckbox('inputOptions', 'allowPaste');

      var textarea = $('<textarea>').css({
        position: 'absolute',
        top: 0,
        left: 0,
        height: 0,
        width: 0,
        opacity: 0
      });

      var defaultMessage = this.module.getConfiguration('label');
      this.messages = {
        default: defaultMessage,
        drag: this.module.getConfiguration('dragoverlabel') || defaultMessage,
        hover: this.module.getConfiguration('hoverlabel'),
        fileSelect: this.module.getConfiguration('fileSelectLabel')
      };

      this.$messages = $('<div class="flex-container">');
      this.messageP = $('<div>')
        .css('display', 'inline-block')
        .css('font-size', this.module.getConfiguration('labelFontSize'))
        .html(this.messages.default);

      this.dom = $('<div />', {
        class: this.canDropOrPaste
          ? 'content-zone dragdropzone'
          : 'content-zone'
      })
        .html(this.$messages)
        .on('click mousemove', function () {
          textarea.focus();
        })
        .mouseout(function () {
          textarea.blur();
        })
        .append(textarea);

      if (this.module.getConfigurationCheckbox('inputOptions', 'allowPaste')) {
        textarea.on('paste', function (e) {
          e.preventDefault();
          e.stopPropagation();
          that.module.controller.open(e.originalEvent.clipboardData);
        });
      }

      if (this.canDropOrPaste) {
        this.$messages.append(this.messageP);
      }
      if (
        this.module.getConfigurationCheckbox(
          'inputOptions',
          'allowFileInput'
        ) &&
        this.module.getConfigurationCheckbox(
          'inputOptions',
          'showFileInputButton'
        )
      ) {
        const $fileDialogButton = $(
          `<button type="button" class="form-button blue"><i class="fa fa-file fa-lg"/>&nbsp; &nbsp; ${
            this.messages.fileSelect
          }</button>`
        );
        this.$messages.append($fileDialogButton);
        $fileDialogButton.on('click', function (event) {
          event.stopPropagation();
          $fileInput.click();
        });
      }

      if (
        this.module.getConfigurationCheckbox('inputOptions', 'allowFileInput')
      ) {
        this.dom.on('click', function (event) {
          event.stopPropagation();
          $fileInput.click();
        });
      }

      if (this.module.getConfigurationCheckbox('inputOptions', 'allowCamera')) {
        const $cameraDialogButton = $(
          '<button type="button" class="form-button red"><i class="fa fa-camera fa-lg"/>&nbsp; &nbsp; Take picture</button>'
        );
        this.$messages.append($cameraDialogButton);
        $cameraDialogButton.on('click', function (event) {
          event.stopPropagation();
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
        });
      }

      $fileInput.on('change', function (e) {
        that.module.controller.open(that.module.controller.emulDataTransfer(e));
      });

      $fileInput.on('load', function (event) {});

      this.module.getDomContent().html(this.dom);
    },

    inDom: function () {
      var that = this,
        dom = this.dom.get(0);

      // We use a drag count to circumvent the fact that
      // The dragleave event is fired when entering a child element
      // See http://stackoverflow.com/q/7110353/1247233
      var dragCount = 0;

      if (this.module.getConfigurationCheckbox('inputOptions', 'allowDrop')) {
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

        dom.addEventListener('drop', function (e) {
          dragCount = 0;
          e.stopPropagation();
          e.preventDefault();
          that.dom.removeClass('dragdrop-over');
          that.messageP.html(that.messages.default);
          that.module.controller.open(e.dataTransfer);
        });
      }

      if (this.module.getConfigurationCheckbox('inputOptions', 'allowPaste')) {
        dom.addEventListener('mouseleave', function (e) {
          e.stopPropagation();
          e.preventDefault();
          that.messageP.html(that.messages.default);
          that.dom.removeClass('dragdrop-over');
        });

        dom.addEventListener('mouseenter', function (e) {
          e.stopPropagation();
          e.preventDefault();
          that.messageP.html(that.messages.hover);
          that.dom.addClass('dragdrop-over');
        });
      }

      this.resolveReady();
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
          UI.showNotification(err.message);
          $dialog.dialog('close');
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
        // photo.setAttribute('src', data);
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
