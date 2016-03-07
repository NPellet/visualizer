'use strict';

define([
    'modules/default/defaultview',
    'src/util/util',
    'src/util/api',
    'src/util/typerenderer',
    'src/util/color',
    'sprintf'
], function (Default,
             Util,
             API,
             Renderer,
             Color,
             sprintf) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {

        init: function () {
            var html = '<div></div>';
            if (this.module.getConfigurationCheckbox('append', 'yes')) {
                this.dom = $(html).css({
                    height: '100%',
                    width: '100%',
                    'overflow-x': 'hidden',
                    'overflow-y': 'scroll'
                });
            } else {
                this.dom = $(html).css({
                    display: 'table',
                    'table-layout': 'fixed',
                    height: '100%',
                    width: '100%'
                });
            }

            this.values = {};
            this.module.getDomContent().html(this.dom);
            this.fillWithVal({
                type: 'html',
                value: this.module.getConfiguration('defaultvalue', '')
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
            }
        },

        update: {
            color: function (color) {
                this.module.getDomContent().css('background-color', color.get());
            },

            value: function (varValue, varName) {
                if (varValue instanceof DataObject || varValue.type === 'number') {
                    this._lastValueNumber = true;
                }
                this.values[varName] = varValue;
                this._lastValue = varValue;
                this.renderAll();
            }
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
                rendererOptions = Util.evalOptions(this.module.getConfiguration('rendererOptions')) || {};
            var forceType = this.module.getConfiguration('forceType');
            if(forceType) {
                rendererOptions.forceType = forceType;
            }

            if (sprintfVal) {
                if (Object.keys(rendererOptions).length > 0) {
                    debugger;
                    var prom = [];
                    for (var i in that.values) {
                        prom.push(this.renderVal(that.values[i], rendererOptions));
                    }
                    Promise.all(prom).then(function (rendered) {
                        var args = [sprintfVal].concat(rendered);
                        that.fillWithVal(sprintf.sprintf.apply(null, args));
                    });
                } else {
                    try {
                        var args = [sprintfVal];
                        for (var i in that.values) {
                            args.push(that.values[i]);
                        }
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
            var preformatted = this.module.getConfigurationCheckbox('preformatted', 'pre');
            var selectable = this.module.getConfigurationCheckbox('preformatted', 'selectable');

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
                    'user-select': selectable ? 'text' : 'none'
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
                    'user-select': selectable ? 'text' : 'none'
                });
                this.dom.html(div);
                if (this.module.getConfigurationCheckbox('editable', 'yes') && isEditable(this._lastValue)) {
                    div.attr('contenteditable', true);
                    div.on('input', function (e) {

                        var replaceValue = e.target.innerHTML.replace(/<[^>]*>/g, '');
                        if (that._lastValueNumber) {
                            replaceValue = +replaceValue;
                        }

                        that._lastValue.setValue(replaceValue, true);
                        that.module.model.dataTriggerChange(that._lastValue);
                    });
                }
            }

            this._scrollDown();

            var that = this;
            Renderer.render(div, val, rendererOptions).then(function () {
                that._scrollDown();
            });
        }

    });

    function isEditable(value) {
        return isString(value) || isNumber(value);
    }

    function isString(value) {
        if (!value) return false;
        return (value instanceof DataString) || value.type === 'string';
    }

    function isNumber(value) {
        if (!value) return false;
        return (value instanceof DataNumber) || value.type === 'number';
    }

    return View;

});
