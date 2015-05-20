'use strict';

define([
    'modules/default/defaultview',
    'src/util/domdeferred',
    'src/util/api',
    'src/util/typerenderer',
    'src/util/color'
], function (Default,
             DomDeferred,
             API,
             Renderer,
             Color) {

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
                this.values[varName] = varValue;
                this.renderAll(varValue);
            }
        },

        renderAll: function (val) {

            var view = this,
                sprintfVal = this.module.getConfiguration('sprintf'),
                sprintfOrder = this.module.getConfiguration('sprintfOrder');

            if (sprintfVal && sprintfVal != '') {

                try {
                    require(['components/sprintf/dist/sprintf.min'], function () {

                        var args = [sprintfVal];
                        for (var i in view.values) {
                            args.push(view.values[i]);
                        }

                        val = sprintf.apply(this, args);

                        view.fillWithVal(val);
                    });

                } catch (e) {

                    view.fillWithVal(val);

                }

            } else {
                view.fillWithVal(val);
            }
        },

        _scrollDown: function () {
            var scroll_height = this.dom[0].scrollHeight;
            this.dom.scrollTop(scroll_height);
        },

        fillWithVal: function (val) {

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
            }

            this._scrollDown();

            var self = this;
            Renderer.render(div, val).then(function () {
                self._scrollDown();
            });

            DomDeferred.notify(div);
        }

    });

    return View;

});
