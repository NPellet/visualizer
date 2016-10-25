'use strict';

const dataTransform = {
    exponential10: {
        forward: function (input) {
            return Math.pow(10, input);
        },
        backward: function (input) {
            return Math.log10(input);
        }
    }
};

define(['jquery', 'src/util/debug'], function ($, Debug) {
    class Form {
        constructor(dom) {
            this.dom = $(dom);
            this.bind();
            this.changeCb = null;
            this.submitCb = null;
        }

        get() {
            if (!this.dom) return;
            var inputs = this.dom.find('input,textarea,select');
            var out = inputs.map(function () {
                const {name, value, type} = this;
                return {
                    name,
                    value,
                    type,
                    transform: getTransform(this, 'forward'),
                    dom: this};
            }).toArray().filter(o => {
                if (!o.name) return false;
                return (o.type !== 'radio' || o.dom.checked);
            });

            out.forEach(o => {
                switch (o.type) {
                    case 'number':
                    case 'range':
                        o.value = o.transform(+o.value);
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

        set(form) {
            if (!form || !this.dom) return;
            for (let i = 0; i < form.length; i++) {
                var $el = this.dom.find(`input[name="${form[i].name}"]`);
                var el = $el[0];
                if (!el) continue;
                this._setElement(el, form[i].value);
            }
        }

        getData(merge) {
            var f = this.get();
            var obj;
            if (merge && this.data) {
                obj = this.data;
            } else {
                obj = new DataObject();
            }

            for (let i = 0; i < f.length; i++) {
                obj.setChildSync(f[i].name.split('.'), f[i].value);
            }

            return obj.resurrect();
        }

        setData(data) {
            if (!data) return;
            data = DataObject.check(data, true);
            var form = this.get();
            for (let i = 0; i < form.length; i++) {
                var fillWith = data.getChildSync(form[i].name.split('.'));
                fillWith = fillWith || null;
                this._setElement(form[i].dom, fillWith);
            }
            this.data = data;
        }

        _setElement(el, value) {
            if (value === null) return;
            var transform = getTransform(el, 'backward');
            switch (el.type) {
                case 'checkbox':
                    el.checked = value;
                    break;

                case 'radio':
                    var name = el.name;
                    this.dom.find(`input[name="${name}"]`).each(function () {
                        this.checked = false;
                    });
                    this.dom.find(`input[value="${value}"]`).each(function () {
                        this.checked = true;
                    });
                    break;
                default:
                    // $(el).attr('value', value);
                    el.value = transform(value);
                    break;
            }
        }

        onChange(cb) {
            this.changeCb = cb;
        }

        onSubmit(cb) {
            this.submitCb = cb;
        }

        unbind() {
            this.dom.off('input', 'input,textarea', onChange(this));
            this.dom.off('submit', 'form', onSubmit(this));
            this.dom.off('change', 'input,select', onChange(this));
        }

        bind() {
            this.dom.on('input', 'input,textarea', onChange(this));
            this.dom.on('submit', 'form', onSubmit(this));
            this.dom.on('change', 'input,select', onChange(this));
        }
    }


    function onChange(ctx) {
        return function (e) {
            if (ctx.changeCb) ctx.changeCb();
        };
    }

    function onSubmit(ctx) {
        return function (e) {
            e.preventDefault();
            if (ctx.submitCb) ctx.submitCb();
        };
    }


    return Form;
});

function getTransform(dom, type) {
    if (type !== 'forward' && type !== 'backward') throw new TypeError('Type should be "forward" or "backward"');
    var transform = dom.getAttribute('data-transform');
    var transformFn;
    if (transform) {
        if (!dataTransform[transform]) {
            Debug.warn(`util/Form: invalid attribute value for data-transform: ${transform} (transform not found)`);
        } else {
            transformFn = dataTransform[transform][type];
        }
    }
    return transformFn || identity;
}

function identity(input) {
    return input;
}
