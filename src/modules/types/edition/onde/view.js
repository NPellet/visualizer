'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'jquery',
  'components/onde/src/onde',
  'forms/button',
  'lodash',
  'src/util/debug',
  'src/util/api',
  'src/util/sandbox',
], function (Default, Util, $, onde, Button, _, Debug, API, Sandbox) {
  function View() {
    this._id = Util.getNextUniqueId();
  }

  Util.loadCss('components/onde/src/onde.css');

  $.extend(true, View.prototype, Default, {
    init() {
      const filter = this.module.getConfiguration('onchangeFilter');
      if (filter) {
        const sandbox = new Sandbox();
        sandbox.setContext({ API });
        this.filter = sandbox.run(`(function ondeOnChangeFilter(data, jpath) { try { \n ${filter}\n } catch(_) { console.log(_); } })`, 'ondeOnChangeFilter');
      }
      this.dom = $(`<form id="${this._id}">`).css({
        height: '100%',
        width: '100%',
        textAlign: 'left'
      }).append($('<div class="onde-panel">'));

      if (this.module.getConfigurationCheckbox('hasButton', 'show')) {
        this.dom.append(
          new Button(
            this.module.getConfiguration('button_text'),
            () => {
              this.exportForm();
            },
            { color: 'green' }
          ).render().css({
            marginTop: '10px'
          })
        );
      }

      this.dom.on('submit', (e) => {
        e.preventDefault();
        this.exportForm();
        return false;
      });


      const debouncing = this.module.getConfiguration('debouncing', -1);
      if (debouncing > -1) {
        let cb = () => {
          this.exportForm();
        };
        if (debouncing > 0) {
          cb = _.debounce(cb, debouncing);
        }

        registerCallback(this.dom, cb);
      }

      if (this.filter) {
        registerCallback(this.dom, (e) => {
          this._doFilter(e);
        });
      }

      this.inputVal = null;
    },

    _doFilter(e) {
      var jpathSuccess = true;
      var $target = $(e.target);
      var fieldInfo = $target.data('fieldInfo');
      if (!fieldInfo) {
        fieldInfo = $target.parents('ol').first().data('fieldInfo');
      }
      if (!fieldInfo) {
        jpathSuccess = false;
      }
      var jpath = fieldInfo.jpath.slice().reverse();
      while (jpath.indexOf('$array$') > -1) {
        var $firstOl = $target.parents('ol').first();
        if (!$firstOl.length) break;
        if (!$.contains(this.dom[0], $firstOl[0])) break;
        var idx = $firstOl.children('li').index($target.parents('li.field.array-item')[0]);
        $target = $firstOl;
        jpath[jpath.indexOf('$array$')] = idx;
      }
      jpath = jpath.reverse();
      if (jpath.indexOf('$array$') > -1 || jpath.indexOf(-1) > -1)
        jpathSuccess = false;

      if (jpathSuccess) {
        this.filter(this.form.getData(), jpath);
      } else {
        Debug.warn('Onde: Could not resolve jpath of modified element');
      }
    },

    blank: {
      inputValue() {
        this.inputObj = null;
        this.inputVal = null;
      },
      schema() {
        this.module.controller.inputSchema = {};
      }
    },

    inDom() {
      this.module.getDomContent().html(this.dom);
      this.initForm();
      let varname;
      if (this.module.getConfigurationCheckbox('saveInView', 'yes')) {
        varname = this.module.getConfiguration('varname');
      }

      if (varname) {
        API.createData(varname, JSON.parse(this.module.getConfiguration('data'))).then((data) => {
          data.onChange(() => {
            this.module.definition.configuration.groups.data[0].data[0] = JSON.stringify(data);
          });
          this.resolveReady();
        });
      } else {
        this.resolveReady();
      }
    },

    initForm() {
      this.form = new onde.Onde(this.dom);
      this.renderForm();
      this.form.on('field:delete', () => {
        this.exportForm();
      });
    },

    update: {
      inputValue: function (value) {
        this.inputObj = value;
        this.inputVal = value.get().resurrect();
        this.renderForm();
      },
      schema: function (value) {
        this.module.controller.inputSchema = value.resurrect();
        this.renderForm();
      }
    },

    renderForm() {
      const schema = this.module.controller.getSchema();
      if (!schema) {
        this.dom.find('.form-button').hide();
        return;
      }
      this.dom.find('.form-button').show();
      // We use inputObj rather that inputVal because we want the form
      // to be rendered with the current values, not with the values
      // such as it was when it last came into the module
      const fillWith = this.inputObj ? this.inputObj.get().resurrect() : null;
      this.form.render(schema, fillWith, {});
      if (this.module.getConfigurationCheckbox('hasButton', 'onload')) {
        this.exportForm();
      }
    },

    exportForm() {
      const data = this.form.getData();
      if (!data.errorCount) {
        this._data = data.data;
        this.module.controller.onSubmit(data.data);
      }
    }
  });

  return View;
});

function registerCallback(dom, cb) {
  // The problem with change on text inputs is that it fires when
  // the input is blurred
  // https://developer.mozilla.org/en-US/docs/Web/Events/input
  dom.on('input', cb);
  dom.on('change', '[type="checkbox"]', cb);
  dom.on('change', '[type="radio"]', cb);
}
