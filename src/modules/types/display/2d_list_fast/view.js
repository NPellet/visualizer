'use strict';

define(['modules/default/defaultview', 'src/util/typerenderer', 'src/util/api'], function (Default, Renderer, API) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {

        init: function () {
            this.dom = $('<div class="ci-displaylist-list-2d-fast"></div>');
            this.module.getDomContent().html(this.dom);
        },

        blank: {
            list: function () {
                this.list = null;
                API.killHighlight(this.module.getId());
                this.dom.empty();
            },
            showList: function () {
                this.showList = null;
            }
        },

        inDom: function () {
            var self = this;
            this.dom.on('mouseenter mouseleave click', '> div', function (e) {
                var elementId = $(this).index();
                var value = self.list.get()[elementId];
                if (e.type === 'mouseenter') {
                    self.module.controller.setVarFromEvent('onHover', 'cell', 'list', [elementId]);
                    API.highlight(value, 1);
                } else if (e.type === 'mouseleave') {
                    API.highlight(value, 0);
                } else if (e.type === 'click') {
                    self.module.controller.setVarFromEvent('onClick', 'cell', 'list', [elementId]);
                    self.module.controller.sendActionFromEvent('onClick', 'cell', value);
                }
            });
            this.resolveReady();
        },

        update: {
            list: function (moduleValue) {
                var cfg = this.module.getConfiguration.bind(this.module);
                var cols = (100 / (cfg('colnumber', 4) || 4)) + '%';
                var val = moduleValue.get();

                this.dataReady = new Array(val.length);
                this.dataDivs = new Array(val.length);

                this.list = val;

                var colorJpath = cfg('colorjpath', false),
                    valJpath = cfg('valjpath', ''),
                    dimensions = {
                        width: cols
                    };
                var height = cfg('height');
                if (height) {
                    dimensions.height = height + 'px';
                }

                for (var i = 0; i < val.length; i++) {
                    var data = this.renderElement(this.list.getChildSync([i]), dimensions, colorJpath, valJpath);
                    this.dataReady[i] = data[0];
                    this.dataDivs[i] = data[1];
                }

                this.updateVisibility();
            },

            showList: function (value) {
                this.showList = value.get();
                this.updateVisibility();
            }
        },

        updateVisibility: function () {
            if (!this.showList || !this.list)
                return;

            var that = this;

            Promise.all(this.dataReady).then(function () {
                var value = that.showList;
                for (var i = 0; i < value.length; i++) {
                    if (value[i]) {
                        that.dataDivs[i].show();
                    } else {
                        that.dataDivs[i].hide();
                    }
                }
            });
        },

        renderElement: function (element, dimensions, colorJpath, valJpath) {
            var td = $('<div>').css(dimensions).appendTo(this.dom);

            if (colorJpath) {
                element.getChild(colorJpath, true).then(function (val) {
                    td.css('background-color', val.get());
                });
            }

            API.listenHighlight(element, function (onOff) {
                if (onOff) {
                    td.css('border-color', 'black');
                } else {
                    td.css('border-color', '');
                }
            }, false, this.module.getId());

            return [Renderer.render(td, element, valJpath), td];
        }

    });

    return View;

});
