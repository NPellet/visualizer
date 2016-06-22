'use strict';

define(['jquery', 'src/main/datas'], function ($) {
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
                return {name, value, type, dom: this};
            }).toArray().filter(o => {
                if (!o.name) return false;
                return (o.type !== 'radio' || o.dom.checked);
            });

            out.forEach(o => {
                switch (o.type) {
                    case 'number':
                    case 'range':
                        o.value = +o.value;
                        break;
                    case 'checkbox':
                        o.value = o.dom.checked;
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
                    el.value = value;
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
