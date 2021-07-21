'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'src/util/api',
  'src/util/typerenderer',
  'src/util/color',
  'sprintf',
  'lodash',
], function (Default, Util, API, Renderer, Color, sprintf, _) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init: function () {
      var html = '<div></div>';
      if (this.module.getConfigurationCheckbox('append', 'yes')) {
        this.dom = $(html).css({
          height: '100%',
          width: '100%',
          'overflow-x': 'hidden',
          'overflow-y': 'scroll',
        });
      } else {
        this.dom = $(html).css({
          display: 'table',
          'table-layout': 'fixed',
          height: '100%',
          width: '100%',
        });
      }

      this.values = [];
      this.module.getDomContent().html(this.dom);
      this.fillWithVal({
        type: 'html',
        value: this.module.getConfiguration('defaultvalue', ''),
      });
      this.resolveReady();
      this._relsForLoading = ['value'];
    },

    blank: {
      value: function () {
        if (this.module.getConfigurationCheckbox('append', 'yes')) {
          var maxEntries = this.module.getConfiguration('maxEntries');
          var children = this.dom.children();
          var until = children.length - maxEntries;
          for (var i = 0; i < until; i++) {
            children[i].remove();
          }
        } else {
          this.dom.empty();
        }
      },
      color: function () {
        this.module.getDomContent().css('background-color', '#FFF');
      },
    },

    update: {
      color: function (color) {
        this.module.getDomContent().css('background-color', color.get());
      },

      value: function (varValue, varName) {
        if (varValue instanceof DataNumber || varValue.type === 'number') {
          this._lastValueNumber = true;
        }
        var val = this.values.find((value) => value.name === varName);
        if (!val) {
          this.values.push({
            name: varName,
            value: varValue,
          });
          this.values.sort((a, b) => {
            var aIdx = this.module.definition.vars_in.findIndex(
              (varin) => varin.name === a.name,
            );
            var bIdx = this.module.definition.vars_in.findIndex(
              (varin) => varin.name === b.name,
            );
            if (aIdx < bIdx) return -1;
            else return 1;
          });
        } else {
          val.value = varValue;
        }

        this._lastValue = varValue;
        this.renderAll();
      },
    },

    onResize: function () {
      this.renderAll();
      this.refresh();
    },

    renderAll: function () {
      var val = this._lastValue;
      if (!val) return;

      var that = this,
        sprintfVal = this.module.getConfiguration('sprintf'),
        rendererOptions =
          Util.evalOptions(this.module.getConfiguration('rendererOptions')) ||
          {};
      var forceType = this.module.getConfiguration('forceType');
      if (forceType) {
        rendererOptions.forceType = forceType;
      }

      if (sprintfVal) {
        if (!forceType) {
          var prom = [];
          for (var value of that.values) {
            prom.push(this.renderVal(value.value));
          }
          Promise.all(prom).then(function (rendered) {
            var args = [sprintfVal].concat(rendered);
            that.fillWithVal(sprintf.sprintf.apply(null, args), {
              forceType: 'html',
            });
          });
        } else {
          try {
            var args = [sprintfVal];
            args = args.concat(
              that.values.map((v) => DataObject.resurrect(v.value.get())),
            );
            val = sprintf.sprintf.apply(this, args);
            that.fillWithVal(val, rendererOptions);
          } catch (e) {
            that.fillWithVal(val, rendererOptions);
          }
        }
      } else {
        that.fillWithVal(val, rendererOptions);
      }
    },

    _scrollDown: function () {
      var scroll_height = this.dom[0].scrollHeight;
      this.dom.scrollTop(scroll_height);
    },

    renderVal: function (val, options) {
      var $span = $('<span>');
      return Renderer.render($span, val, options)
        .then(function () {
          return $span.html();
        })
        .catch(function () {
          return '[failed]';
        });
    },

    fillWithVal: function (val, rendererOptions) {
      var that = this;
      var valign = this.module.getConfiguration('valign');
      var align = this.module.getConfiguration('align');
      var fontcolor = this.module.getConfiguration('fontcolor');
      var fontsize = this.module.getConfiguration('fontsize');
      var font = this.module.getConfiguration('font');
      var preformatted = this.module.getConfigurationCheckbox(
        'preformatted',
        'pre',
      );
      var selectable = this.module.getConfigurationCheckbox(
        'preformatted',
        'selectable',
      );

      var div;

      if (fontcolor) {
        fontcolor = Color.getColor(fontcolor);
      }

      if (this.module.getConfigurationCheckbox('append', 'yes')) {
        div = $('<div>').css({
          fontFamily: font || 'Arial',
          fontSize: fontsize || '10pt',
          color: fontcolor || '#000000',
          'vertical-align': valign || 'top',
          textAlign: align || 'center',
          width: '100%',
          'white-space': preformatted ? 'pre' : 'normal',
          'word-wrap': 'break-word',
          'user-select': selectable ? 'text' : 'none',
        });
        this.dom.append(div);
      } else {
        div = $('<div />').css({
          fontFamily: font || 'Arial',
          fontSize: fontsize || '10pt',
          color: fontcolor || '#000000',
          display: 'table-cell',
          'vertical-align': valign || 'top',
          textAlign: align || 'center',
          width: '100%',
          height: '100%',
          'white-space': preformatted ? 'pre' : 'normal',
          'word-wrap': 'break-word',
          'user-select': selectable ? 'text' : 'none',
        });
        this.dom.html(div);

        var isEditing;
        if (
          this.module.getConfigurationCheckbox('editable', 'yes') &&
          isEditable(this._lastValue)
        ) {
          div.attr('contenteditable', true);
          div.on(
            'input',
            that.module.getConfiguration('debounce') > 0
              ? _.debounce(
                triggerChange,
                that.module.getConfiguration('debounce'),
              ).bind(that)
              : triggerChange.bind(that),
          );
          div.on('keyup', function (e) {
            if (e.keyCode === 27) {
              // Esc character
              div.blur();
            }
          });
          div.on('click', function () {
            if (isEditing) return;
            isEditing = true;
            div.html(String(val));
            div.focus();
          });

          div.on('blur', function () {
            isEditing = false;
            Renderer.render(div, val, rendererOptions).then(function () {
              that._scrollDown();
            });
          });
        }
      }

      this._scrollDown();

      Renderer.render(div, val, rendererOptions).then(function () {
        that._scrollDown();
      });
    },
  });

  function isEditable(value) {
    return isString(value) || isNumber(value);
  }

  function isString(value) {
    if (!value) return false;
    return value instanceof DataString || value.type === 'string';
  }

  function isNumber(value) {
    if (!value) return false;
    return value instanceof DataNumber || value.type === 'number';
  }

  function triggerChange(e) {
    var replaceValue = e.target.innerText;
    if (this._lastValueNumber) {
      replaceValue = +replaceValue;
    }
    let editSearchRegexp = this.module.getConfiguration('editSearchRegexp');
    let editReplace = this.module.getConfiguration('editReplace') || '';
    if (editSearchRegexp) {
      let searchRegexp = new RegExp(
        editSearchRegexp.replace(/^\/(.*)\/(.*)$/, '$1'),
        editSearchRegexp.replace(/^\/(.*)\/(.*)$/, '$2'),
      );
      replaceValue = replaceValue.replace(searchRegexp, editReplace);
    }
    this._lastValue.setValue(replaceValue, true);
    this.module.model.dataTriggerChange(this._lastValue);
  }

  return View;
});
