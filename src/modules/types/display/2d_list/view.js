'use strict';

define(['modules/default/defaultview', 'src/util/typerenderer', 'src/util/api'], function (Default, Renderer, API) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {

        init: function () {
            var html = [];
            html.push('<div class="ci-displaylist-list-2d"></div>');
            this.dom = $(html.join(''));
            this.module.getDomContent().html(this.dom);

        },
        blank: {
            list: function () {
                API.killHighlight(this.module.getId());
                this.dom.empty();
            }
        },
        inDom: function () {
            var self = this;
            this.dom.on('mouseenter mouseleave click', 'td', function (e) {
                var tdIndex = $(this).index();
                var trIndex = $(this).parent().index();
                var cols = self.module.getConfiguration('colnumber', 4) || 4;
                var elementId = trIndex * cols + tdIndex;
                var value = self.list.get()[elementId];
                if (e.type === 'mouseenter') {
                    self.module.controller.setVarFromEvent('onHover', 'cell', 'list', [elementId]);
                    API.highlight(value, 1);
                }
                else if (e.type === 'mouseleave') {
                    API.highlight(value, 0);
                }
                else if (e.type === 'click') {
                    self.module.controller.setVarFromEvent('onClick', 'cell', 'list', [elementId]);
                    self.module.controller.sendActionFromEvent('onClick', 'cell', value);
                }
            });
            this.resolveReady();
        },

        update: {

            list: function (moduleValue) {

                var cfg = this.module.getConfiguration.bind(this.module),
                    cols = cfg('colnumber', 4) || 4,
                    val = moduleValue.get(),
                    table = $('<table cellpadding="3" cellspacing="0">').css('text-align', 'center');

                this.dom.html(table);

                this.list = val;

                var height = cfg('height');

                var css = {
                    width: Math.round(100 / cols) + '%',
                    height: cfg('height', 0) + 'px'
                };

                var current, colId;

                for (var i = 0; i < val.length; i++) {
                    colId = i % cols;

                    if (colId === 0) {
                        current = $('<tr>').appendTo(table);
                    }

                    this.renderElement(current, i, css, cfg('colorjpath', false), cfg('valjpath', ''));
                }

            }
        },

        renderElement: function (dom, index, css, colorJpath, valJpath) {

            var self = this;
            var td = $('<td>').css(css).appendTo(dom);

            this.list.getChild([index]).then(function (element) {
                if (colorJpath) {
                    element.getChild(colorJpath).then(function (val) {
                        td.css('background-color', val.get());
                    });
                }

                Renderer.render(td, element, valJpath);

                API.listenHighlight(element, function (onOff, key) {
                    if (onOff) {
                        td.css('border-color', 'black');
                    } else {
                        td.css('border-color', '');
                    }
                }, false, self.module.getId());
            });

        }
    });

    return View;

});
