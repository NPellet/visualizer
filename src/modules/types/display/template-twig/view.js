'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'lib/twigjs/twig',
  'src/util/debug',
  'src/util/api',
  'lodash',
  'src/util/Form',
  'src/util/util',
], function ($, Default, Twig, Debug, API, _, Form, Util) {
  function View() {}

  function cleanTemplate(templateText, module) {
    const shouldRemoveLeadingSpaces = module.getConfigurationCheckbox(
      'templateOptions',
      'removeTemplateLeadingSpaces',
    );
    if (!shouldRemoveLeadingSpaces) {
      return templateText;
    }
    return templateText
      .split('\n')
      .map((line) => {
        // trim everything separator based on regex
        return line.replace(/^\s+/, '');
      })
      .join('\n');
  }

  $.extend(true, View.prototype, Default, {
    init() {
      this._changedJpaths = new Set();
      var configTemplate = this.module.getConfiguration('template');
      this.hasTemplate = new Promise((resolve) => {
        this._resolveTemplate = resolve;
      });
      if (configTemplate) {
        this._resolveTemplate();
      }
      this.dom = $('<div>').css({
        height: '100%',
        width: '100%',
        'user-select': this.module.getConfigurationCheckbox('selectable', 'yes')
          ? 'text'
          : 'none',
      });

      var debouncing = this.module.getConfiguration('debouncing');
      let submitChange;
      if (debouncing) {
        submitChange = _.debounce(this.submitChange, debouncing).bind(this);
      } else {
        submitChange = this.submitChange.bind(this);
      }

      var submit = this.submit.bind(this);

      if (this.form) this.form.unbind();
      this.form = new Form(this.dom, {
        keepFormValueIfDataUndefined: this.module.getConfigurationCheckbox(
          'formOptions',
          'keepFormValueIfDataUndefined',
        ),
      });

      this.form.onChange(submitChange);
      this.form.onSubmit(submit);

      this._values = new DataObject();

      if (!this.renderPromise) {
        this.renderPromise = Promise.resolve();
      }

      this.renderPromise.then(() => {
        const templateText = this.module.getConfiguration('template');

        this.template = Twig.twig({
          data: cleanTemplate(templateText, this.module),
        });
      });
    },
    inDom() {
      this.module.getDomContent().html(this.dom);
      this.resolveReady();
      this.rerender();
    },

    rerender() {
      this.render(() => {
        this.resetForm();
      });
    },

    clearForm() {
      this.form.clear();
    },

    exportToHTML() {
      API.domToHTML(this.dom[0]).then((html) => {
        API.copyHTMLToClipboard(html);
      });
    },

    setForm(data) {
      this.form.setData(data);
    },

    resetForm() {
      this.form.setData(this.currentForm);
    },

    setStyle() {
      var style = this.styleObject;
      if (!style) return;
      if (!Array.isArray(style)) {
        style = [style];
      }

      for (let i = 0; i < style.length; i++) {
        let selector;
        if (style[i].input) {
          selector = `input[name="${style[i].input}"],textarea[name="${style[i].input}"],select[name="${style[i].input}"]`;
        } else {
          selector = style[i].selector;
        }
        var $el = this.dom.find(selector);
        if (style[i].attributes) {
          $el.attr(style[i].attributes);
        }
        if (style[i].style) {
          $el.css(style[i].style);
        }
      }
    },

    getForm() {
      return (this.currentForm = this.form.getData(false));
    },

    submitChange(event, noChange) {
      event = event || { target: {} };
      const toSend = {
        data: this.getForm(),
      };

      if (this._lastChanged) {
        toSend.previousData = this._lastChanged;
      }
      this._lastChanged = toSend.data;
      toSend.jpath = event.target.name && event.target.name.split('.');
      if (event.target.name) {
        this._changedJpaths.add(event.target.name);
      }

      this.module.controller.onFormChanged(toSend, noChange);
      return null;
    },

    submit() {
      const toSend = {
        data: this.getForm(),
        jpaths: Array.from(this._changedJpaths).map((j) => j.split('.')),
      };

      this._changedJpaths.clear();
      if (this._lastSubmit) {
        toSend.previousData = this._lastSubmit;
      }
      this._lastSubmit = toSend.data;
      this.module.controller.onFormSubmitted(toSend);
    },
    blank: {
      value() {
        this.renderPromise = this.renderPromise
          .then(() => {
            this.dom.hide();
            this.getForm();
          })
          .catch(() => {
            Debug.warn('Error');
          });
        return null;
      },
      tpl() {
        this.renderPromise = this.renderPromise.then(() => {
          this.dom.hide();
          this.getForm();
          this.template = Twig.twig({
            data: '',
          });
        });
        return null;
      },
      form: Util.noop,
      style: Util.noop,
    },
    update: {
      value(value, name) {
        /*
                 Convert special DataObjects
                 (twig does some check depending on the filter used
                 and the values need to be native)
                 */
        this._values[name] = DataObject.resurrect(value.get());

        this.rerender();

        if (
          this.module.getConfigurationCheckbox(
            'formOptions',
            'rerenderIfValueChanges',
          )
        ) {
          this.render(() => this.fillForm(true));
        }
      },
      tpl(value) {
        var tpl = value.get().toString();
        return this.renderPromise
          .then(() => {
            this.template = Twig.twig({
              data: cleanTemplate(tpl, this.module),
            });
            this.rerender();
            return null;
          })
          .then(() => this._resolveTemplate())
          .catch((error) => {
            Debug.info(`Problem with template: ${error}`);
          })
          .then(() => this.submitChange());
      },

      async form(value, name) {
        this.formName = name;
        this.formObject = value;
        // fill form should execute when the template exists
        // It doesn't make sense otherwise
        this.hasTemplate.then(() => {
          this.fillForm(true);
          if (
            this.module.getConfigurationCheckbox(
              'formOptions',
              'rerenderIfFormValueChanges',
            )
          ) {
            this.rerender();
          }
        });
      },

      style(value) {
        this.styleObject = value.resurrect();
        this.rerender();
      },
    },

    onActionReceive: {
      clearForm(submitChange) {
        this.clearForm();
        if (submitChange) {
          this.submitChange();
        }
      },
      setForm(options) {
        if (!options.data) {
          throw new Error(
            'setForm invalid arguments. Must be object with data property.',
          );
        }
        this.setForm(options.data);
        if (options.submitChange) {
          this.submitChange();
        }
      },
    },

    fillForm(noChange) {
      const changed = this.form.setData(this.formObject);
      for (const c of changed) this._changedJpaths.add(c);
      this.submitChange(null, noChange);
    },

    render(cb) {
      var that = this;
      this.renderPromise = this.renderPromise
        .then(() => {
          if (this.formName) {
            this._values[this.formName] = this.formObject;
          }
          var render = this.template.renderAsync(this._values);

          this.dom.html(render.html);
          const renderProm = render.render().then(function () {
            if (cb) cb();
            that.setStyle();
            that.module.controller.onRendered(that.dom.html());
          });

          this.dom.show();
          return renderProm;
        })
        .catch((error) => {
          Debug.warn('Error rendering twig template', error);
        });
      return this.renderPromise;
    },
  });

  return View;
});
