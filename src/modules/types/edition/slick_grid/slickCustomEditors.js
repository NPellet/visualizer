'use strict';

/** *
 * Contains basic SlickGrid editors.
 * @module Editors
 * @namespace Slick
 */

define([
  'lodash',
  'src/util/util',
  'src/util/ui',
  'src/data/structures',
  'components/spectrum/spectrum',
  'jquery',
  'jquery-ui/ui/widgets/datepicker',
], function (_, Util, UI, structures) {
  Util.loadCss('./components/spectrum/spectrum.css');
  (function ($) {
    var typeEditors = {};

    for (var key in structures) {
      if (typeof structures[key] === 'string') {
        typeEditors[key] = typeEditors[structures[key]];
      }
    }

    typeEditors.string = TextValueEditor;
    typeEditors.number = NumberValueEditor;
    typeEditors.boolean = BooleanValueEditor;
    typeEditors.color = ColorEditor;
    typeEditors.date = DateEditor;
    typeEditors.longtext = LongTextEditor;
    typeEditors.select = SelectEditor;
    typeEditors.unit = UnitEditor;
    typeEditors.valueunits = ValueUnitsEditor;
    typeEditors.jpath = JPathEditorFactory();

    // register namespace
    $.extend(true, window, {
      Slick: {
        CustomEditors: {
          TextValue: TextValueEditor,
          JPath: JPathEditorFactory(),
          JPathFactory: JPathEditorFactory,
          NumberValue: NumberValueEditor,
          BooleanValue: BooleanValueEditor,
          ColorValue: ColorEditor,
          Text: TextValueEditor,
          Date: DateEditor,
          LongText: LongTextEditor,
          SimpleLongText: SimpleLongTextEditor,
          Select: SelectEditor,
          Unit: UnitEditor,
        },
        typeEditors,
      },
    });

    function DateEditor(args) {
      this.args = args;
      var $input;
      var defaultValue;
      var calendarOpen = false;

      this.init = function () {
        $input = $('<INPUT type="text" class="editor-text" />');
        $input.appendTo(args.container);
        $input.focus().select();
        $input.datepicker({
          showOn: 'button',
          buttonImageOnly: true,
          buttonImage: require.toUrl(
            'components/slickgrid/images/calendar.gif',
          ),
          beforeShow: function () {
            calendarOpen = true;
          },
          onClose: function () {
            calendarOpen = false;
          },
        });
        $input.width($input.width() - 18);
      };

      this.destroy = function () {
        $.datepicker.dpDiv.stop(true, true);
        $input.datepicker('hide');
        $input.datepicker('destroy');
        $input.remove();
      };

      this.show = function () {
        if (calendarOpen) {
          $.datepicker.dpDiv.stop(true, true).show();
        }
      };

      this.hide = function () {
        if (calendarOpen) {
          $.datepicker.dpDiv.stop(true, true).hide();
        }
      };

      this.position = function (position) {
        if (!calendarOpen) {
          return;
        }
        $.datepicker.dpDiv
          .css('top', position.top + 30)
          .css('left', position.left);
      };

      this.focus = function () {
        $input.focus();
      };

      this.loadValue = function (item) {
        DataObject.check(item, true);
        defaultValue = item.getChildSync(args.column.jpath);
        if (defaultValue) {
          defaultValue = defaultValue.value || '01/01/2000';
        } else {
          defaultValue = '01/01/2000';
        }
        $input.val(defaultValue);
        $input[0].defaultValue = defaultValue;
        $input.select();
      };

      this.serializeValue = function () {
        return $input.val();
      };

      this.applyValue = function (item, state) {
        defaultApplyValue.call(this, item, state, this.args.column.dataType);
      };

      this.isValueChanged = function () {
        return (
          !($input.val() == '' && defaultValue == null) &&
          $input.val() != defaultValue
        );
      };

      this.validate = function () {
        return {
          valid: true,
          msg: null,
        };
      };

      this.init();
    }

    function ColorEditor(args) {
      this.args = args;
      var defaultValue;
      this.init = function () {
        var that = this;
        this.$input = $('<input type="text">');
        var box = args.container.getBoundingClientRect();
        this.$div = $('<div>').css({
          position: 'fixed',
          left: box.left,
          top: box.top,
        });
        $('body').append(this.$div);
        this.$input
          .appendTo(this.$div)
          .bind('keydown.nav', function (e) {
            if (
              e.keyCode === $.ui.keyCode.LEFT ||
              e.keyCode === $.ui.keyCode.RIGHT
            ) {
              e.stopImmediatePropagation();
            }
          })
          .focus()
          .select();
        this.$input.spectrum({
          color:
            args.item &&
            args.item.getChildSync &&
            args.item.getChildSync(args.column.jpath)
              ? args.item.getChildSync(args.column.jpath).get()
              : undefined,
          appendTo: 'body',
          showInitial: true,
          showInput: true,
          clickoutFiresChange: false,
          showAlpha: true,
          showPalette: true,
          showSelectionPalette: true,
          palette: [
            [
              'rgba(152,  0,  0, 1)',
              'rgba(255,  0,  0, 1)',
              'rgba(255,  153,  0, 1)',
              'rgba(255,  255,  0, 1)',
              'rgba(0,  255,  0, 1)',
              'rgba(0,  255,  255, 1)',
              'rgba(74,  134,  232, 1)',
              'rgba(0,  0,  255, 1)',
              'rgba(153,  0,  255, 1)',
              'rgba(255,  0,  255, 1)',
            ],
            [
              'rgba(230,  184,  175, 1)',
              'rgba(244,  204,  204, 1)',
              'rgba(252,  229,  205, 1)',
              'rgba(255,  242,  204, 1)',
              'rgba(217,  234,  211, 1)',
              'rgba(208,  224,  227, 1)',
              'rgba(201,  218,  248, 1)',
              'rgba(207,  226,  243, 1)',
              'rgba(217,  210,  233, 1)',
              'rgba(234,  209,  220, 1)',
            ],
            [
              'rgba(221,  126,  107, 1)',
              'rgba(234,  153,  153, 1)',
              'rgba(249,  203,  156, 1)',
              'rgba(255,  229,  153, 1)',
              'rgba(182,  215,  168, 1)',
              'rgba(162,  196,  201, 1)',
              'rgba(164,  194,  244, 1)',
              'rgba(159,  197,  232, 1)',
              'rgba(180,  167,  214, 1)',
              'rgba(213,  166,  189, 1)',
            ],
            [
              'rgba(204,  65,  37, 1)',
              'rgba(224,  102,  102, 1)',
              'rgba(246,  178,  107, 1)',
              'rgba(255,  217,  102, 1)',
              'rgba(147,  196,  125, 1)',
              'rgba(118,  165,  175, 1)',
              'rgba(109,  158,  235, 1)',
              'rgba(111,  168,  220, 1)',
              'rgba(142,  124,  195, 1)',
              'rgba(194,  123,  160, 1)',
            ],
            [
              'rgba(166,  28,  0, 1)',
              'rgba(204,  0,  0, 1)',
              'rgba(230,  145,  56, 1)',
              'rgba(241,  194,  50, 1)',
              'rgba(106,  168,  79, 1)',
              'rgba(69,  129,  142, 1)',
              'rgba(60,  120,  216, 1)',
              'rgba(61,  133,  198, 1)',
              'rgba(103,  78,  167, 1)',
              'rgba(166,  77,  121, 1)',
            ],
            [
              'rgba(133,  32,  12, 1)',
              'rgba(153,  0,  0, 1)',
              'rgba(180,  95,  6, 1)',
              'rgba(191,  144,  0, 1)',
              'rgba(56,  118,  29, 1)',
              'rgba(19,  79,  92, 1)',
              'rgba(17,  85,  204, 1)',
              'rgba(11,  83,  148, 1)',
              'rgba(53,  28,  117, 1)',
              'rgba(116,  27,  71, 1)',
            ],
            [
              'rgba(91,  15,  0, 1)',
              'rgba(102,  0,  0, 1)',
              'rgba(120,  63,  4, 1)',
              'rgba(127,  96,  0, 1)',
              'rgba(39,  78,  19, 1)',
              'rgba(12,  52,  61, 1)',
              'rgba(28,  69,  135, 1)',
              'rgba(7,  55,  99, 1)',
              'rgba(32,  18,  77, 1)',
              'rgba(76,  17,  48, 1)',
            ],
          ],
          preferredFormat: 'rgba',
          change: function (color) {
            that.color = color;
            that.changed = true;
            args.commitChanges('next');
          },
          move: function (color) {},
          show: function () {},
          hide: function () {
            if (!that.changed) {
              args.cancelChanges();
            }
          },
          localStorageKey: 'visualizer-spectrum',
        });

        this.$input
          .next()
          .first()
          .click();
      };

      this.destroy = function () {
        var d = this.$input.data();
        this.$input.spectrum('destroy');
        this.$div.remove();
        // this.$input.remove();
      };

      this.focus = function () {
        this.$input.focus();
      };

      this.getValue = function () {
        this.$input.val();
      };

      this.setValue = function (val) {
        this.$input.val(val);
      };

      this.loadValue = function (item) {
        DataObject.check(item, true);
        defaultValue = item.getChildSync(args.column.jpath);
        if (defaultValue) {
          defaultValue = String(defaultValue.get()) || '#000000';
        } else {
          defaultValue = '#000000';
        }
        this.$input.val(defaultValue);
        this.$input.spectrum('set', defaultValue);
        this.$input[0].defaultValue = defaultValue;
        this.$input.select();
      };

      this.serializeValue = function () {
        if (this.color) {
          return this.color.toRgbString();
        }
        return this.$input.val();
      };

      this.applyValue = function (item, state) {
        defaultApplyValue.call(this, item, state, this.args.column.dataType);
      };

      this.isValueChanged = function () {
        return (
          !(this.$input.val() == '' && defaultValue == null) &&
          this.$input.val() != defaultValue
        );
      };

      this.validate = function () {
        if (args.column.validator) {
          var validationResults = args.column.validator(this.$input.val());
          if (!validationResults.valid) {
            return validationResults;
          }
        }

        return {
          valid: true,
          msg: null,
        };
      };

      this.init();
    }

    function TextValueEditor(args, options) {
      this.args = args;
      this.initOptions = options;
      this.init = defaultInit;
      this.destroy = defaultDestroy;
      this.focus = defaultFocus;
      this.getValue = defaultGetValue;
      this.setValue = defaultSetValue;
      this.loadValue = defaultLoadValue;
      this.serializeValue = defaultSerializeValue;
      this.isValueChanged = defaultIsValueChanged;
      this.validate = defaultValidate;

      this.applyValue = function (item, state) {
        defaultApplyValue.call(this, item, state, this.args.column.dataType);
      };

      this.init();
    }

    function JPathEditorFactory(inspectData) {
      let editing = false;

      function jPathInit() {
        const that = this;
        function commitChanges(next) {
          if (next) {
            if (that.args.commitChanges) {
              that.args.commitChanges('next');
            }
          } else {
            if (that.args.commitChanges) {
              that.args.commitChanges('none');
            }
          }
        }
        const $wrapper = $('<div style="position: relative;" />');
        this.initOptions = this.initOptions || {};
        var editorOptions = getEditorOptions(
          this.args.column.colDef.editorOptions,
        );
        this.$input = $(
          '<input type="text" class="editor-text" style="width: 100%" class=""/>',
        );
        if (editorOptions.choices) {
          this.$input.attr('list', 'choices');
        }
        this.$input.appendTo($wrapper);
        if (inspectData) {
          const $link = $(
            '<a style="position: absolute; top: 0; right: 0;" class="icon-clickable select-jpath""><i class="centered-icon fa fa-tree"></i></a>',
          );
          $link.appendTo($wrapper);
          // eslint-disable-next-line
          $link.on('mousedown', async function(e) {
            editing = true;
            const jpath = await UI.selectJpath(inspectData);
            editing = false;
            if (jpath === null) {
              commitChanges();
            } else {
              that.$input.val(Util.jpathToString(jpath));
              commitChanges(true);
            }
          });
        }

        $wrapper
          .appendTo(this.args.container)
          .bind('keydown.nav', function (e) {
            if (
              e.keyCode === $.ui.keyCode.LEFT ||
              e.keyCode === $.ui.keyCode.RIGHT
            ) {
              e.stopImmediatePropagation();
            }
          })
          .focus()
          .select();

        this.$input.focusout(function () {
          if (!editing) {
            commitChanges(
              that.args.grid.module &&
                !that.args.grid.module.view.slick.options.autoEdit,
            );
          }
        });
      }
      function JPathEditor(args) {
        this.args = args;
        this.init = jPathInit;
        this.destroy = defaultDestroy;
        this.focus = defaultFocus;
        this.getValue = numberGetValue;
        this.setValue = defaultSetValue;
        this.loadValue = jPathLoadValue;
        this.serializeValue = jPathSerializeValue;
        this.isValueChanged = defaultIsValueChanged;
        this.validate = defaultValidate;
        this.applyValue = function (item, state) {
          defaultApplyValue.call(this, item, state, this.args.column.dataType);
        };

        this.init();
      }

      return JPathEditor;
    }

    function NumberValueEditor(args) {
      this.args = args;
      this.init = defaultInit;
      this.destroy = defaultDestroy;
      this.focus = defaultFocus;
      this.getValue = numberGetValue;
      this.setValue = defaultSetValue;
      this.loadValue = defaultLoadValue;
      this.serializeValue = defaultSerializeValue;
      this.isValueChanged = defaultIsValueChanged;
      this.validate = defaultValidate;
      this.applyValue = function (item, state) {
        numberApplyValue.call(this, item, state, this.args.column.dataType);
      };

      this.init();
    }

    function BooleanValueEditor(args) {
      this.args = args;
      this.init = booleanInit;
      this.destroy = defaultDestroy;
      this.focus = defaultFocus;
      this.getValue = numberGetValue;
      this.setValue = defaultSetValue;
      this.loadValue = booleanLoadValue;
      this.serializeValue = booleanSerializeValue;
      this.isValueChanged = booleanIsValueChanged;
      this.validate = defaultValidate;

      this.applyValue = function (item, state) {
        booleanApplyValue.call(this, item, state, this.args.column.dataType);
      };
      this.init();
    }
    function UnitEditor(args, options) {
      this.args = args;
      this.initOptions = options;
      this.init = defaultInit;
      this.destroy = defaultDestroy;
      this.focus = defaultFocus;
      this.getValue = defaultGetValue;
      this.setValue = defaultSetValue;
      this.loadValue = function (item) {
        DataObject.check(item, true);
        const value = item.getChildSync(this.args.column.jpath);
        this.item = value;
        this.defaultValue = '';
        if (value) {
          const unitStr = String(value.unit);
          let unit = UnitEditor.mathjs.unit(unitStr);
          unit.value = Number(value.SI);
          this.defaultValue = unitStr ? `${unit.toNumber(unitStr)}` : value.SI;
        }
        this.$input.val(this.defaultValue);
        this.$input[0].defaultValue = this.defaultValue;
        this.$input.select();
      };
      this.serializeValue = function () {
        let val = this.$input.val();
        if (!val) return undefined;
        try {
          const editorOptions = getEditorOptions(
            this.args.column.colDef.editorOptions,
          );
          const valNumber = +val;
          if (!Number.isNaN(valNumber)) {
            if (this.item && this.item.unit) {
              val = `${val} ${this.item.unit}`;
            } else if (editorOptions.base !== undefined) {
              val = `${val} ${editorOptions.base}`;
            }
          }
          const unit = UnitEditor.mathjs.unit(UnitEditor.mathjs.eval(val));
          if (editorOptions.base) {
            const baseUnit = UnitEditor.mathjs.unit(editorOptions.base);
            if (!baseUnit.equalBase(unit)) {
              throw new Error(
                `${unit.formatUnits()} is not the same base as ${
                  editorOptions.base
                }`,
              );
            }
          }
          return {
            unit: unit.formatUnits(),
            SI: unit.value,
          };
        } catch (e) {
          UI.showNotification(e.message, 'warning');
          return null;
        }
      };
      this.isValueChanged = () => {
        return this.serializeValue() !== null;
      };
      this.validate = defaultValidate;
      this.applyValue = function (item, state) {
        defaultApplyValue.call(this, item, state, this.args.column.dataType);
      };
      this.init();
    }

    UnitEditor.load = async function () {
      const mathjs = await Util.require('mathjs');
      UnitEditor.mathjs = mathjs;
    };

    function ValueUnitsEditor(args, options) {
      this.args = args;
      this.initOptions = options;
      this.init = defaultInit;
      this.destroy = defaultDestroy;
      this.focus = defaultFocus;
      this.getValue = defaultGetValue;
      this.setValue = defaultSetValue;
      this.loadValue = (item) => {
        DataObject.check(item, true);
        const value = item.getChildSync(this.args.column.jpath);
        this.item = value;
        this.defaultValue = '';
        if (value) {
          this.defaultValue =
            String(value.value) + (value.units && ` ${value.units}`);
        }
        this.$input.val(this.defaultValue);
        this.$input[0].defaultValue = this.defaultValue;
        this.$input.select();
      };
      this.serializeValue = () => {
        let val = this.$input.val();
        if (!val) return undefined;
        try {
          const editorOptions = getEditorOptions(
            this.args.column.colDef.editorOptions,
          );
          const valNumber = +val;
          if (!Number.isNaN(valNumber)) {
            if (this.item && this.item.units) {
              val = `${val} ${this.item.units}`;
            } else if (editorOptions.base !== undefined) {
              val = `${val} ${editorOptions.base}`;
            }
          }
          const { stringValue, units } = val.match(
            /(?<stringValue>[0-9.-]+[eE]?[0-9.-]*)(?<units>.*)/,
            '$1',
          ).groups;
          return {
            value: Number(stringValue),
            units: units.trim(),
          };
        } catch (e) {
          UI.showNotification(e.message, 'warning');
          return null;
        }
      };
      this.isValueChanged = () => {
        return this.serializeValue() !== null;
      };
      this.validate = defaultValidate;
      this.applyValue = function (item, state) {
        defaultApplyValue.call(this, item, state, this.args.column.dataType);
      };
      this.init();
    }

    ValueUnitsEditor.load = async function () {
      const mathjs = await Util.require('mathjs');
      ValueUnitsEditor.mathjs = mathjs;
    };
  })(jQuery);

  // ======== DEFAULT EDITOR FUNCTIONS ===============
  function defaultValidate() {
    if (this.args.column.validator) {
      var validationResults = this.args.column.validator(this.serializeValue());
      if (!validationResults.valid) {
        return validationResults;
      }
    }

    return {
      valid: true,
      msg: null,
    };
  }

  function defaultIsValueChanged() {
    return (
      !(this.$input.val() == '' && this.defaultValue == null) &&
      this.$input.val() != this.defaultValue
    );
  }

  function defaultApplyValue(item, state, type) {
    var newState;
    DataObject.check(item, true);
    if (type) {
      newState = {
        type: type,
        value: state,
      };
    } else {
      newState = state;
    }
    if (this.args.grid.module.model) {
      this.args.grid.module.model.dataSetChildSync(
        item,
        this.args.column.jpath,
        newState,
      );
    } else {
      item.setChildSync(this.args.column.jpath, newState);
    }
  }

  function defaultSerializeValue() {
    return this.$input.val();
  }

  function jPathSerializeValue() {
    let val = this.$input.val();
    if (!val) val = 'element';
    if (!val.startsWith('element.') && val !== 'element') {
      val = `element.${val}`;
    }
    return Util.jpathToArray(val);
  }

  function defaultLoadValue(item) {
    DataObject.check(item, true);
    this.defaultValue = item.getChildSync(this.args.column.jpath);
    this.defaultValue = this.defaultValue ? this.defaultValue.get() || '' : '';
    this.$input.val(this.defaultValue);
    this.$input[0].defaultValue = this.defaultValue;
    this.$input.select();
  }

  function jPathLoadValue(item) {
    DataObject.check(item, true);
    this.defaultValue = item.getChildSync(this.args.column.jpath);
    this.defaultValue = this.defaultValue ? this.defaultValue.get() || '' : '';
    const val = this.defaultValue || [];
    const str = val.join('.');
    this.$input.val(str);
    this.$input[0].defaultValue = this.defaultValue;
    this.$input.select();
  }

  function defaultSetValue(val) {
    this.$input.val(val);
  }

  function defaultGetValue() {
    return this.$input.val();
  }

  function defaultInit() {
    var that = this;
    this.initOptions = this.initOptions || {};
    var editorOptions = getEditorOptions(this.args.column.colDef.editorOptions);
    if (this.initOptions.textarea) {
      $('<div>').appendTo(this.args.container);
      this.$input = $(
        '<textarea  class="editor-text" rows="10" cols="60" style="z-index:10000; position: relative;"/>',
      );
    } else {
      this.$input = $('<input type="text" class="editor-text" />');
      if (editorOptions.choices) {
        this.$input.attr('list', 'choices');
      }
    }
    this.$input
      .appendTo(this.args.container)
      .after(
        `<datalist id="choices">${getSelectOptions(
          editorOptions.choices,
        )}</datalist>`,
      )
      .bind('keydown.nav', function (e) {
        if (
          e.keyCode === $.ui.keyCode.LEFT ||
          e.keyCode === $.ui.keyCode.RIGHT
        ) {
          e.stopImmediatePropagation();
        }
      })
      .focus()
      .select()
      .focusout(function () {
        if (
          that.args.grid.module &&
          !that.args.grid.module.view.slick.options.autoEdit
        ) {
          if (that.args.commitChanges) {
            that.args.commitChanges('next');
          }
        } else {
          if (that.args.commitChanges) {
            that.args.commitChanges('none');
          }
        }
      });
  }

  function defaultDestroy() {
    this.$input.remove();
  }

  function defaultFocus() {
    this.$input.focus().select();
  }

  // =========== DATA NUMBER ===============
  function numberGetValue() {
    return +this.$input.val();
  }

  function numberApplyValue(item, state, type) {
    state = +state;
    return defaultApplyValue.call(
      this,
      item,
      _.isNaN(state) ? 'NaN' : state,
      type,
    );
  }

  // =========== DATA BOOLEAN ==============
  function booleanInit() {
    var that = this;
    this.$input = $(
      '<input type="checkbox" value="true" class="editor-checkbox" hideFocus>',
    );
    this.$input.appendTo(this.args.container);
    this.$input.focus();
    this.$input.change(function () {
      that.args.commitChanges('next');
    });
  }

  function booleanLoadValue(item) {
    DataObject.check(item, true);
    this.defaultValue = item.getChildSync(this.args.column.jpath);
    if (this.defaultValue) {
      var val = (this.defaultValue = this.defaultValue.get());
    }
    if (val) {
      if (val instanceof DataBoolean && !val.get()) {
        this.$input.removeAttr('checked');
      } else {
        this.$input.attr('checked', 'checked');
      }
    } else {
      this.$input.removeAttr('checked');
    }
  }

  function booleanSerializeValue() {
    return !!this.$input[0].checked;
  }

  function booleanIsValueChanged() {
    return this.serializeValue() !== this.defaultValue;
  }

  function booleanApplyValue(item, state, type) {
    state = state === 'false' ? false : !!state;
    defaultApplyValue.call(this, item, state, type);
  }

  // ========== LONG TEXT ===================
  function longTextInit() {
    var that = this;
    this.$container = $('body');

    this.$wrapper = $(
      '<DIV style="z-index:10000; position:absolute;background:white; padding:5px;border:3px solid gray; -moz-border-radius:10px; border-radius:10px;"/>',
    ).appendTo(this.$container);

    this.$input = $(
      '<textarea hidefocus rows=5 style="backround:white; width:250px; height:80px;border:0; outline:0">',
    ).appendTo(this.$wrapper);

    $(
      '<div style="text-align:right"><button>Save</button><button>Cancel</button></div>',
    ).appendTo(this.$wrapper);

    this.$wrapper.find('button:first').bind('click', this.save);
    this.$wrapper.find('button:last').bind('click', this.cancel);
    this.$input.bind('keydown', function (e) {
      if (e.which == $.ui.keyCode.ENTER && e.ctrlKey) {
        that.save();
      } else if (e.which == $.ui.keyCode.ESCAPE) {
        e.preventDefault();
        that.cancel();
      } else if (e.which == $.ui.keyCode.TAB && e.shiftKey) {
        e.preventDefault();
        that.args.grid.navigatePrev();
      } else if (e.which == $.ui.keyCode.TAB) {
        e.preventDefault();
        that.args.grid.navigateNext();
      }
    });

    this.position(this.args.position);
    // this.$input.hide();
    this.$input
      .focus()
      .select()
      .focusout(function () {
        // Shouldn't do this if auto-edit
        if (!that.args.grid.module.view.slick.options.autoEdit)
          that.args.commitChanges('next');
      });
  }

  function defaultSave() {
    this.args.commitChanges();
  }

  function defaultCancel() {
    this.$input.val(this.defaultValue);
    this.args.cancelChanges();
  }

  function detachedHide() {
    this.$wrapper.hide();
  }

  function detachedShow() {
    this.$wrapper.show();
  }

  function detachedPosition(position) {
    this.$wrapper.css('top', position.top - 5).css('left', position.left - 5);
  }

  function detachedDestroy() {
    this.$wrapper.remove();
  }

  function longTextFocus() {
    this.$wrapper.show();
    this.position(this.args.position);
    this.$input.focus();
  }

  function LongTextEditor(args) {
    this.args = args;
    this.init = longTextInit;
    this.destroy = detachedDestroy;
    this.focus = longTextFocus;
    this.getValue = defaultGetValue;
    this.setValue = defaultSetValue;
    this.loadValue = defaultLoadValue;
    this.serializeValue = defaultSerializeValue;
    this.applyValue = function (item, state) {
      defaultApplyValue.call(this, item, state, this.args.column.dataType);
    };
    this.isValueChanged = defaultIsValueChanged;
    this.validate = defaultValidate;
    this.hide = detachedHide;
    this.show = detachedShow;
    this.position = detachedPosition;
    this.save = defaultSave.bind(this);
    this.cancel = defaultCancel.bind(this);
    this.init();
  }

  function SimpleLongTextEditor(args) {
    this.args = args;
    this.initOptions = {
      textarea: true,
    };
    this.init = defaultInit;
    this.destroy = defaultDestroy;
    this.focus = defaultFocus;
    this.getValue = defaultGetValue;
    this.setValue = defaultSetValue;
    this.loadValue = defaultLoadValue;
    this.serializeValue = defaultSerializeValue;
    this.isValueChanged = defaultIsValueChanged;
    this.validate = defaultValidate;

    this.applyValue = function (item, state) {
      defaultApplyValue.call(this, item, state, this.args.column.dataType);
    };

    this.init();
  }

  // ========== SELECT ===================
  function selectInit() {
    var options = this.args.column.editorOptions;
    var editorOptions = getEditorOptions(options);
    var $wrapper = $(this.args.container);
    this.initOptions = this.initOptions || {};

    this.$input = $(
      `<select>${getSelectOptions(editorOptions.choices)}</select>`,
    );

    this.$input
      .appendTo($wrapper)
      .focus()
      .on('change', () => {
        this.args.commitChanges('next');
      })
      .on('blur', () => {
        this.args.cancelChanges();
      })
      .focusout(() => {
        // Shouldn't do this if auto-edit
        if (!this.args.grid.module.view.slick.options.autoEdit)
          this.args.commitChanges('next');
        else this.args.commitChanges('none');
      });
  }

  function SelectEditor(args, options) {
    this.args = args;
    this.initOptions = options;
    this.init = selectInit;
    this.destroy = defaultDestroy;
    this.focus = defaultFocus;
    this.getValue = defaultGetValue;
    this.setValue = defaultSetValue;
    this.loadValue = defaultLoadValue;
    this.serializeValue = defaultSerializeValue;
    this.isValueChanged = defaultIsValueChanged;
    this.validate = defaultValidate;
    this.applyValue = function (item, state) {
      defaultApplyValue.call(this, item, state, this.args.column.dataType);
    };

    this.init();
  }

  function getSelectOptions(choices) {
    let obj = {};
    if (!choices) {
      return [];
    } else if (typeof choices !== 'string') {
      obj = choices;
    } else {
      choices.split(';').forEach((o) => {
        const [key, value] = o.split(':');
        obj[key] = value || key;
      });
    }
    return [...Object.entries(obj)]
      .map(([key, value]) => `<option value="${key}">${value}</option>`)
      .join('');
  }

  function getEditorOptions(editorOptions) {
    const options = Util.evalOptions(editorOptions);
    if (editorOptions && options === undefined) {
      return {
        choices: editorOptions,
      };
    }
    return options || {};
  }
});
