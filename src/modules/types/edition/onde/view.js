'use strict';

define(['modules/default/defaultview', 'src/util/util', 'jquery', 'components/onde/src/onde', 'forms/button', 'lodash', 'src/util/debug'], function (Default, Util, $, onde, Button, _, Debug) {

    function View() {
        this._id = Util.getNextUniqueId();
    }

    Util.loadCss('components/onde/src/onde.css');

    $.extend(true, View.prototype, Default, {
        init: function () {
            var that = this;
            var filter = this.module.getConfiguration('onchangeFilter');
            if (filter) {
                eval('that.filter = function(data, jpath) { try { \n ' + filter + '\n } catch(_) { console.log(_); } }');
            }
            this.dom = $('<form id="' + this._id + '">').css({
                height: '100%',
                width: '100%',
                textAlign: 'left'
            }).append($('<div class="onde-panel">'));

            if (this.module.getConfigurationCheckbox('hasButton', 'show')) {
                this.dom.append(new Button(this.module.getConfiguration('button_text'), function () {
                    that.exportForm();
                }, {color: 'green'}).render().css({
                        marginTop: '10px'
                    }));
            }

            this.dom.on('submit', function (e) {
                e.preventDefault();
                that.exportForm();
                return false;
            });


            var debouncing = this.module.getConfiguration('debouncing', -1);
            if (debouncing > -1) {
                var cb = function (e) {
                    if (e.type === 'change' && (e.target.type === 'text' || e.target.type === 'textarea')) return;
                    that.exportForm();
                };
                if (debouncing > 0) {
                    cb = _.debounce(cb, debouncing);
                }
                this.dom.on('keyup change', cb);
            }

            if (that.filter) {
                this.dom.on('keyup change', function (e) {
                    if (e.type === 'change' && (e.target.type === 'text' || e.target.type === 'textarea')) return;
                    that._doFilter(e);
                });
            }

            this.inputVal = {};

        },

        _doFilter: function (e) {
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
            inputValue: function () {
                this.inputObj = null;
                this.inputVal = null;
            },
            schema: function () {
                this.module.controller.inputSchema = {};
            }
        },
        inDom: function () {
            this.module.getDomContent().html(this.dom);
            this.initForm();
            this.resolveReady();
        },
        initForm: function () {
            var that = this;
            this.form = new onde.Onde(this.dom);
            this.renderForm();
            this.form.on('field:delete', function (node) {
                that.exportForm();
            });
        },
        update: {
            inputValue: function (value) {
                this.inputObj = value;
                this.inputVal = value.get().resurrect();
                this.renderForm();
            },
            schema: function (value) {
                this.module.controller.inputSchema = value;
                this.renderForm();
            }
        },
        renderForm: function () {
            var schema = this.module.controller.getSchema();
            this.form.render(schema, this.inputVal, {});
            if (this.module.getConfigurationCheckbox('hasButton', 'onload')) {
                this.exportForm();
            }
        },
        exportForm: function () {
            var data = this.form.getData();
            this.inputVal = data.data;
            if (!data.errorCount) {
                this._data = data.data;
                this.module.controller.onSubmit(data.data);
            }
        }
    });

    return View;

});
