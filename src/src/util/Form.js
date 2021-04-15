'use strict';

const dataTransform = {
  exponential10: {
    forward: function (input) {
      return Math.pow(10, input);
    },
    backward: function (input) {
      return Math.log10(input);
    },
  },
};

const defaultOptions = {
  keepFormValueIfDataUndefined: true, // if true keep inputs for which the jpath is not found as they are
  // if false will set the input to a default value (default value depends on type of input)
};

define(['jquery', 'lodash', 'src/util/debug'], function ($, _, Debug) {
  class Form {
    constructor(dom, options) {
      this.options = Object.assign({}, defaultOptions, options);
      this.dom = $(dom);
      this.bind();
      this.changeCb = null;
      this.submitCb = null;
    }

    // maps each dom input elements to a plain object
    // object props: name, value, type, dom (input's DOM element object), transform
    // Values are transformed
    get() {
      if (!this.dom) return;
      const inputs = this.dom.find('input,textarea,select');
      let radios = [];
      const out = inputs
        .map(function () {
          const { name, value, type } = this;
          return {
            name,
            value,
            type,
            transform: getTransform(this, 'forward'),
            dom: this,
          };
        })
        .toArray()
        .filter((o) => {
          if (!o.name) return false;
          // Radio buttons need special treatment
          if (o.type === 'radio') {
            radios.push(o);
            return false;
          }
          return true;
        });

      const groupedRadios = _.groupBy(radios, (radio) => radio.name);
      for (let name in groupedRadios) {
        const radios = groupedRadios[name].filter((radio) => radio.name);
        const radio = radios.find((radio) => radio.dom.checked);
        if (radio) {
          out.push(radio);
        } else if (radios.length) {
          out.push(radios[0]);
        }
      }

      out.forEach((o) => {
        switch (o.type) {
          case 'number':
          case 'range':
            if (o.value !== '' && o.value !== undefined) {
              o.value = Number(o.value);
            } else {
              o.value = undefined;
            }
            o.value = o.transform(o.value);
            break;
          case 'checkbox':
            o.value = o.dom.checked;
            break;
          default:
            o.value = o.transform(o.value);
            break;
        }
      });

      return out;
    }

    // Returns a DataObject with the form data
    // if merge is true it edits the previous data object
    getData(merge) {
      var f = this.get();
      var obj;
      if (merge && this.data) {
        obj = this.data;
      } else {
        obj = new DataObject();
      }
      for (let i = 0; i < f.length; i++) {
        const jpath = f[i].name.split('.').map((el) => {
          if (el.match(/^\d+$/)) {
            return Number.parseInt(el, 10);
          }
          return el;
        });
        if (f[i].type === 'radio' && !f[i].dom.checked) continue;
        obj.setChildSync(jpath, f[i].value);
      }
      return obj.resurrect();
    }

    // Set the data and modify the form accordingly, overriding pre-existing values
    // Parts of the form for which the corresponding data is undefined can optionally set
    setData(data) {
      if (!data) return;
      data = DataObject.check(data, true);
      const changedNames = new Set();
      var form = this.get();
      for (let i = 0; i < form.length; i++) {
        const jpath = form[i].name.split('.');
        var fillWith = data.getChildSync(jpath);
        const changed = this._setElement(form[i].dom, fillWith);
        if (changed) changedNames.add(form[i].name);
      }
      this.data = data;
      // Return set of changed names
      return Array.from(changedNames);
    }

    clear() {
      this.setData({});
    }

    // Fill the given dom element with the given value
    // Transforms values back
    _setElement(el, value) {
      if (value == null) {
        if (this.options.keepFormValueIfDataUndefined) {
          return false;
        } else {
          value = getDefaultByType(el.type);
        }
      }
      var transform = getTransform(el, 'backward');
      switch (el.type) {
        case 'checkbox':
          el.checked = DataObject.resurrect(value);
          break;

        case 'radio':
          var name = el.name;
          this.dom.find(`input[name="${name}"]`).each(function () {
            this.checked = false;
          });
          this.dom
            .find(`input[name="${name}"][value="${transform(value)}"]`)
            .each(function () {
              this.checked = true;
            });
          break;
        case 'select-one':
          if (transform(value) == undefined) return;
        // fallthrough
        default:
          el.value = transform(value);
          break;
      }
      return true;
    }

    onChange(cb) {
      this.changeCb = cb;
    }

    onSubmit(cb) {
      this.submitCb = cb;
    }

    unbind() {
      this.dom.off('input', 'input,textarea', onChange(this));
      this.dom.off('submit', onSubmit(this));
      this.dom.off('change', 'input,select', onChange(this));
    }

    bind() {
      this.dom.on('input', 'input,textarea', onChange(this));
      this.dom.on('submit', onSubmit(this));
      this.dom.on('change', 'input,select', onChange(this));
    }
  }

  function onChange(ctx) {
    return function (e) {
      if (ctx.changeCb) ctx.changeCb(e);
    };
  }

  function onSubmit(ctx) {
    return function (e) {
      e.preventDefault();
      if (ctx.submitCb) ctx.submitCb(e);
    };
  }

  function getTransform(dom, type) {
    if (type !== 'forward' && type !== 'backward')
      throw new TypeError('Type should be "forward" or "backward"');
    const transform = dom.getAttribute('data-transform');
    let transformFn;
    if (transform) {
      if (!dataTransform[transform]) {
        Debug.warn(
          `util/Form: invalid attribute value for data-transform: ${transform} (transform not found)`,
        );
      } else {
        transformFn = dataTransform[transform][type];
      }
    }
    return transformFn || identity;
  }

  function identity(input) {
    return DataObject.resurrect(input);
  }

  function getDefaultByType(type) {
    switch (type) {
      case 'checkbox':
        return false;
      case 'radio':
        return false;
      default:
        return '';
    }
  }

  return Form;
});
