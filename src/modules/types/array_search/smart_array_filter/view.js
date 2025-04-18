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
      this._fontSize = this.module.getConfiguration('fontSize');

      this._div = $('<div>')
        .css({
          width: '100%',
          fontSize: `${this._fontSize}px`,
        })
        .appendTo(this.module.getDomContent());

      this._input = $('<input type="text" />')
        .css({
          padding: '0px 0px',
          margin: '0',
          display: 'inline-block',
          fontSize: `${this._fontSize}px`,
        })
        .attr('placeholder', this.module.getConfiguration('placeholder', ''))
        .appendTo(this._div);

      if (!this._query) {
        this._query = this.module.getConfiguration('initialValue');
      }
      this._input.val(this._query);

      var debounce = this.module.getConfiguration('debounce');

      this._input.on(
        'keyup',
        _.debounce(() => {
          var value = this._input.val();
          this.onQuery(value);
        }, debounce),
      );

      this._div.append('&nbsp;<i class="fa fa-search"></i>');

      this.resizeInput();

      this.resolveReady();
    },
    onQuery: function (query) {
      if (query === this._query) return;
      this._query = query;

      const queryFilter = this.module.getConfiguration('queryFilter');
      this._fontSize = queryFilter;
      if (queryFilter) {
        // eslint-disable-next-line no-new-func
        const filter = new Function('query', queryFilter);
        query = filter(query);
      }
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
