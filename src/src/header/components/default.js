'use strict';

define(['jquery', 'src/util/util'], function ($, Util) {
  function Header() {
  }

  Header.prototype.init = function (options) {
    this.options = options;
    this._open = false;
    this.makeDom();
    this.initImpl();
  };

  Header.prototype.initImpl = Util.noop;

  Header.prototype.makeDom = function () {
    var that = this;
    this._dom = document.createElement('li');
    this.$_dom = $(this._dom);
    this.$_dom.text(this.options.label || this.options.title || '');
    this.$_dom.bind('click', function () {
      that.onClick();
    });
  };

  Header.prototype.getDom = function () {
    return this.$_dom;
  };

  Header.prototype.onClick = function () {
    this._open = !this._open;
    this._onClick();
  };

  Header.prototype._onClick = Util.noop;

  Header.prototype.setStyleOpen = function (opened) {
    this.$_dom[opened ? 'addClass' : 'removeClass']('opened');
  };

  Header.prototype.open = function () {
    this.$_elToOpen.addClass('header-button-list ci-visualizer-text');

    // Verify that the element has been added to the dom
    if (this.$_elToOpen.parents('body').length === 0) {
      $('body').append(this.$_elToOpen);
    }

    this.$_elToOpen.show();

    var w = this.$_elToOpen.outerWidth(true),
      h = this.$_dom.outerHeight(true),
      pos = this.$_dom.position(),
      fullW = $('#header').outerWidth(true),
      newLeft, newTop;

    if (pos.left + w >= fullW) {
      newLeft = fullW - w;
    } else {
      newLeft = pos.left;
    }
    newTop = h + pos.top - 1;

    this.$_elToOpen.css({
      top: newTop,
      left: newLeft
    });
  };

  Header.prototype.close = function () {
    if (this.$_elToOpen)
      this.$_elToOpen.hide();
  };

  return Header;
});
