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
            this.button.html(label);

            if (css) this.button.attr('style', css);
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
      } else {
        $div.mousedown(() => {
          $div.css({
            opacity: this.maskOpacity
          });
        });
        $div.mouseup(() => {
          $div.css({
            opacity: 1
          });
        });
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
        this.button = $('<button />');
        this.button.click(onClick);
        this.dom.html(this.button);
      } else {
        this.dom.on('click', onClick);
      }

      this.module.getDomContent().html(this.dom);
      this.redrawButton();

      this.resolveReady();
    },

    activate: function () {
      this.currentState = true;
    },

    deactivate: function () {
      this.currentState = false;
    },

    toggle: function () {
      this.currentState = !this.currentState;
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
        this.redrawButton();
      },
      deactivate: function () {
        this.deactivate();
        this.redrawButton();
      },
      toggle: function () {
        this.toggle();
        this.redrawButton();
      }
    }
  });

  return View;
});
