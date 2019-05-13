'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'forms/button',
  'src/util/ui',
  'src/util/typerenderer'
], function ($, Default, Button, ui, Renderer) {
  function View() {}

  var onClick;

  $.extend(true, View.prototype, Default, {
    redrawButton() {
      let buttonType = this.module.getConfiguration('toggle');
      var content = this.module.getConfiguration('content');
      switch (buttonType) {
        case 'button':
          break;
        case 'imageUrl':
          var $div = $(`<div><img src="${content}"/></div>`);
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
          break;
        case 'svg':
          var $div = $('<div>');
          $div.append(content);
          $div.css('cursor', 'pointer');
          Renderer.render($div, {
            type: 'svg',
            value: content
          });
          this.dom.html($div);
          break;
        default:
      }
    },

    onResize: function () {
      var that = this;
      this.maskOpacity = this.module.getConfiguration('maskOpacity');
      var label;
      this.dom = $('<div></div>').css({
        width: '100%',
        height: '100%'
      });
      var buttonType = this.module.getConfiguration('toggle');
      if (
        buttonType === 'toggle' &&
        this.module.getConfiguration('startState') === 'off'
      ) {
        label = this.module.getConfiguration('offLabel');
      } else if (
        buttonType === 'toggle' &&
        this.module.getConfiguration('startState') === 'on'
      ) {
        label = this.module.getConfiguration('onLabel');
      } else {
        label = this.module.getConfiguration('label');
      }

      onClick = function (event, val) {
        var prom = Promise.resolve(true);
        if (that.module.getConfigurationCheckbox('askConfirm', 'yes')) {
          prom = ui.confirm(
            that.module.getConfiguration('confirmText'),
            that.module.getConfiguration('okLabel'),
            that.module.getConfiguration('cancelLabel')
          );
        }
        const buttonType = that.module.getConfiguration('toggle');
        prom.then(function (ok) {
          if (!ok) {
            return;
          }
          if (!val && buttonType === 'toggle' && !content) {
            button.setTitle(that.module.getConfiguration('offLabel'));
            that.setButtonColor(that.module.getConfiguration('offColor'));
          } else if (buttonType === 'toggle' && !content) {
            button.setTitle(that.module.getConfiguration('onLabel'));
            that.setButtonColor(that.module.getConfiguration('onColor'));
          }
          that.module.controller.onClick(val);
        });
      };

      var button = new Button(label, onClick, {
        color: 'Grey',
        disabled: false,
        checkbox: this.module.getConfiguration('toggle') !== 'click',
        value: this.module.getConfiguration('startState') === 'on'
      });

      this.module.getDomContent().html(this.dom);

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
      this.button = button;

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
      this.resolveReady();
    },

    activate: function () {
      var contentType = this.getContentType();
      switch (contentType) {
        case 'button':
          this.activateButton();
          break;
        default:
          this.activateMask();
          break;
      }
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

    activateMask() {
      this.$mask.css({
        backgroundColor: 'rgba(255, 255, 255)',
        opacity: 0
      });
      this.dom.off('click', onClick);
      this.dom.on('click', onClick);
      this.$div.css({
        cursor: 'pointer'
      });
    },

    deactivateMask() {
      this.$mask.css({
        backgroundColor: 'rgba(255, 255, 255)',
        opacity: this.maskOpacity
      });
      this.dom.off('click', onClick);
      this.$div.css({
        cursor: 'auto'
      });
    },

    toggleMask() {
      if (this.$mask.css('opacity') == this.maskOpacity) {
        this.activateMask();
      } else {
        this.deactivateMask();
      }
    },

    deactivateButton() {
      var $button = this.dom.find('button');
      $button.attr('disabled', true);
      $button.css({
        cursor: 'auto',
        pointerEvent: 'none'
      });
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

    setButtonColor: function (color) {
      color = `rgba(${color.join(',')})`;
      this.button.setColorCss(color);
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
