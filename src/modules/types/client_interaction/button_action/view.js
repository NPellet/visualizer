'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'forms/button',
  'src/util/ui',
  'src/util/typerenderer'
], function ($, Default, Button, ui, Renderer) {
  function View() {}

  let onClick;

  $.extend(true, View.prototype, Default, {
    redrawButton() {
      let contentType = this.module.getConfiguration('contentType');
      var content = this.module.getConfiguration('content');
      switch (contentType) {
        case 'content':
          {
            let label = '';
            let css = '';
            if (this.isToggle) {
              if (this.currentState) {
                label = this.module.getConfiguration('onLabel');
                css = this.module.getConfiguration('cssOn');
              } else {
                label = this.module.getConfiguration('offLabel');
                css = this.module.getConfiguration('cssOff');
              }
            } else {
              label = this.module.getConfiguration('label');
              css = this.module.getConfiguration('css');
            }
            this.button.setTitle(label);
            let rendered = this.button.render();
            if (css) rendered.attr('style', css);

            this.dom.html(rendered);
          }

          break;
        case 'imageUrl':
          {
            let $div = $(`<div><img src="${content}"/></div>`);
            $div.find('img').css({
              width: this.width,
              height: this.height,
              objectFit: 'contain'
            });
            $div.css({
              cursor: 'pointer'
            });
            this.dom.html($div);
            this.dom.css({
              overflow: 'hidden'
            });
            this.updateOpacity($div);
          }
          break;
        case 'svg':
          {
            let $div = $('<div>');
            $div.append(content);
            $div.css('cursor', 'pointer');
            Renderer.render($div, {
              type: 'svg',
              value: content
            });
            this.dom.html($div);
            this.updateOpacity($div);
          }
          break;
        default:
      }
    },

    updateOpacity: function ($div) {
      if (this.isToggle) {
        if (this.currentState) {
          $div.css({
            opacity: 1
          });
        } else {
          $div.css({
            opacity: this.maskOpacity
          });
        }
      }
    },

    onResize: function () {
      let that = this;
      this.maskOpacity = this.module.getConfiguration('maskOpacity');
      this.isToggle = this.module.getConfiguration('toggle') === 'toggle';
      this.isButton = this.module.getConfiguration('contentType') === 'content';

      var label;
      this.dom = $('<div></div>').css({
        width: '100%',
        height: '100%'
      });
      if (this.isToggle) {
        this.currentState = this.module.getConfiguration('startState') === 'on';
      }

      onClick = async function (event, val) {
        let ok = true;
        if (that.module.getConfigurationCheckbox('askConfirm', 'yes')) {
          ok = await ui.confirm(
            that.module.getConfiguration('confirmText'),
            that.module.getConfiguration('okLabel'),
            that.module.getConfiguration('cancelLabel')
          );
        }

        if (!ok) {
          return;
        }
        if (that.isToggle) {
          that.currentState = !that.currentState;
        }
        that.module.controller.onClick(that);
        that.redrawButton();
      };

      if (this.isButton) {
        let content = this.module.getConfiguration('content');
        if (content) {
          this.button = $.parseHTML(content);
        } else {
          this.button = new Button(label, onClick, {
            color: 'Grey',
            disabled: false,
            checkbox: this.isToggle
          });
        }
      } else {
        this.dom.on('click', onClick);
      }

      this.module.getDomContent().html(this.dom);
      this.redrawButton();
      /*
      var buttonType = this.getContentType();
      if (buttonType === 'button') {
        this.dom.html(
          button.render().css({
            position: 'absolute',
            bottom: 3
          })
        );
      } else if (buttonType === 'imageUrl') {
        this.dom.on('click', onClick);
      } else if (buttonType === 'svg') {
        this.dom.on('click', onClick);
      } else if (buttonType === 'content') {
        var $div = $('<div>');
        $div.append(content);
        $div.css('cursor', 'pointer');
        $div.on('click', onClick);
        this.dom.html($div);
      }


      if (buttonType !== 'button') {
        this.$div = $div;
        this.$mask = $(
          '<div style="position: absolute; width:100%; height: 100%; background-color: rgba(255, 255, 255, 0); pointer-events: none"></div>'
        );
        this.dom.prepend(this.$mask);
      }

      if (buttonType === 'toggle' && !content) {
        that.setButtonColor(that.module.getConfiguration('offColor'));
      }

      this.dom.attr('title', that.module.getConfiguration('title'));
      */
      this.resolveReady();
    },

    deactivate: function () {
      var type = this.getContentType();
      switch (type) {
        case 'button':
          this.deactivateButton();
          break;
        default:
          this.deactivateMask();
          break;
      }
    },

    toggle: function () {
      var type = this.getContentType();
      switch (type) {
        case 'button':
          this.toggleButton();
          break;
        default:
          this.toggleMask();
          break;
      }
    },

    activateButton() {
      var $button = this.dom.find('button');
      $button.removeAttr('disabled');
      $button.css({
        cursor: 'pointer',
        pointerEvent: 'auto'
      });
    },

    toggleButton() {
      if (this.dom.find('button').attr('disabled')) {
        this.activateButton();
      } else {
        this.deactivateButton();
      }
    },

    getContentType: function () {
      var contentType = this.module.getConfiguration('contentType');
      if (contentType === 'content') {
        var content = this.module.getConfiguration('content');
        if (!content) return 'button';
      }
      return contentType;
    },

    onActionReceive: {
      activate: function () {
        this.activate();
      },
      deactivate: function () {
        this.deactivate();
      },
      toggle: function () {
        this.toggle();
      }
    }
  });

  return View;
});
