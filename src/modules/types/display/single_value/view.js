'use strict';

define(['modules/default/defaultview', 'src/util/datatraversing', 'src/util/domdeferred', 'src/util/api', 'src/util/typerenderer'], function (Default, Traversing, DomDeferred, API, Renderer) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {

        init: function () {
            var html = '<div></div>';
            if(this.module.getConfigurationCheckbox('append', 'yes')) {
                this.dom = $(html).css({
                   height: '100%',
                    width: '100%',
                    'overflow-x': 'hidden',
                    'overflow-y': 'scroll'
                });
            }
            else {
                this.dom = $(html).css({
                    display: 'table',
                    'table-layout': 'fixed',
                    height: '100%',
                    width: '100%'
                });
            }


            this.values = {};
            this.module.getDomContent().html(this.dom);
            this.fillWithVal(this.module.getConfiguration('defaultvalue'));
            this.resolveReady();
            this._relsForLoading = ['value'];
        },

        blank: {
            value: function () {
                if(this.module.getConfigurationCheckbox('append', 'yes')) {
                    var maxEntries = this.module.getConfiguration('maxEntries');
                    var children = this.dom.children();
                    var until = children.length-maxEntries;
                    for(var i=0; i<until; i++) {
                        children[i].remove();
                    }
                }
                else {
                    this.dom.empty();
                }
            }
        },

        update: {
            color: function (color) {
                if (color === undefined) {
                    return;
                }

                this.module.getDomContent().css('background-color', color.get());
            },

            value: function (varValue, varName) {
                if (varValue == undefined) {
                    this.fillWithVal(this.module.getConfiguration('defaultvalue') || '');
                } else {
                    this.render(varValue, varName);
                }
            }
        },

        render: function (varValue, varName) {
            var self = this;

            var def = Renderer.toScreen(varValue, this.module);
            def.always(function (val) {
                self.values[ varName ] = val;
                self.renderAll(val, def);
            });
        },

        renderAll: function (val, def) {

            var view = this,
                sprintfVal = this.module.getConfiguration('sprintf'),
                sprintfOrder = this.module.getConfiguration('sprintfOrder');

            if (sprintfVal && sprintfVal != '') {

                try {
                    require([ 'components/sprintf/dist/sprintf.min' ], function () {

                        var args = [ sprintfVal ];
                        for (var i in view.values) {
                            args.push(view.values[ i ]);
                        }

                        val = sprintf.apply(this, args);

                        view.fillWithVal(val, def);
                    });

                } catch (e) {

                    view.fillWithVal(val, def);

                }

            } else {
                view.fillWithVal(val, def);
            }
        },

        _scrollDown: function() {
            var scroll_height = this.dom[0].scrollHeight;
            this.dom.scrollTop(scroll_height);
        },

        fillWithVal: function (val, def) {

            var valign = this.module.getConfiguration('valign'),
                align = this.module.getConfiguration('align'),
                fontcolor = this.module.getConfiguration('fontcolor'),
                fontsize = this.module.getConfiguration('fontsize'),
                font = this.module.getConfiguration('font');
            var
                preformatted = this.module.getConfigurationCheckbox('preformatted', 'pre'),
                selectable = this.module.getConfigurationCheckbox('preformatted', 'selectable');

            var valstr = val != undefined ? val.toString() : '';

            var div;

            if(this.module.getConfigurationCheckbox('append','yes')) {
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
                }).html(valstr);
                this.dom.append(div);
            }
            else {
                div = $('<div />').css({
                    fontFamily: font || 'Arial',
                    fontSize: fontsize || '10pt',
                    color: fontcolor || '#000000',
                    display: 'table-cell',
                    'vertical-align': valign || 'top',
                    textAlign: align || 'center',
                    width:  '100%',
                    height: '100%',
                    'white-space': preformatted ? 'pre' : 'normal',
                    'word-wrap': 'break-word',
                    'user-select': selectable ? 'text' : 'none'
                }).html(valstr);
                this.dom.html(div);
            }

            this._scrollDown();


            if (def && def.build) {
                def.build();
                this._scrollDown();
            }

            DomDeferred.notify(div);
        }

    });

    return View;

});