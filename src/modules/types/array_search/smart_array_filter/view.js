'use strict';

define(['jquery', 'modules/default/defaultview', 'lodash'], function (
  $,
  Default,
  _,
) {
  function View() {
    this._query = null;
    this._data = null;
    this._originalData = null;
  }

  $.extend(true, View.prototype, Default, {
    inDom: function () {
      this.module.getDomContent().empty();
      var fontSize = (this._fontSize = this.module.getConfiguration(
        'fontSize',
      ));

      var div = (this._div = $('<div>')
        .css({
          width: '100%',
          fontSize: `${fontSize}px`,
        })
        .appendTo(this.module.getDomContent()));

      var input = (this._input = $('<input type="text" />')
        .css({
          padding: '0px 0px',
          margin: '0',
          display: 'inline-block',
          fontSize: `${fontSize}px`,
        })
        .attr('placeholder', this.module.getConfiguration('placeholder', ''))
        .appendTo(div));

      if (!this._query) {
        this._query = this.module.getConfiguration('initialValue');
      }
      input.val(this._query);

      var debounce = this.module.getConfiguration('debounce');

      input.on(
        'keyup',
        _.debounce(() => {
          var value = input.val();
          this.onQuery(value);
        }, debounce),
      );

      div.append('&nbsp;<i class="fa fa-search"></i>');

      this.resizeInput();

      this.resolveReady();
    },
    onQuery: function (query) {
      if (query === this._query) return;
      this._query = query;
      this.module.controller.onQuery(query);
    },
    blank: {
      input: function () {
        this._data = null;
        this._originalData = null;
      },
    },
    update: {
      input: function (value) {
        this._data = value;
        this._originalData = value.slice();
        this.module.controller.onQuery(this._query || '');
      },
    },
    onActionReceive: {
      clearQuery: function () {
        this._input.val('');
        this.onQuery('');
      },
      setQuery: function (value) {
        value = String(value);
        this._input.val(value);
        this.onQuery(value);
      },
      appendQuery: function (value) {
        value = String(value);
        if (this._query && value) {
          value = `${this._query} ${value}`;
        }
        this._input.val(value);
        this.onQuery(value);
      },
    },
    resizeInput: function () {
      var width = this._div.width();
      this._input.css('width', width - this._fontSize * 2);
    },
    onResize: function () {
      this.resizeInput();
    },
  });

  return View;
});
