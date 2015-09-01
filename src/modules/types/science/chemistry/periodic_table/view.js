'use strict';

define(['modules/default/defaultview', 'lib/twigjs/twig', 'src/util/debug'], function (Default, Twig, Debug) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init: function () {

            this.dom = $('<div class="periodic-table">');

            this.elements = [];
            this.template = Twig.twig({
                data: this.module.getConfiguration('template')
            });
        },
        blank: {
            template: function () {
                this.module.definition.configuration.groups.group[0].template[0] = '';
                this.template = Twig.twig({
                    data: ''
                });
                this.dom.html('');
            }
        },
        inDom: function () {
            this.module.getDomContent().html(this.dom);
            this.resolveReady();
            this.render();
        },
        update: {
            value: function (value, name) {
                /*
                 Convert special DataObjects
                 (twig does some check depending on the filter used
                 and the values need to be native)
                 */

                this.elements = JSON.parse(JSON.stringify(value.resurrect()));
                this.render();
            },
            template: function (value) {
                var tpl = value.get().toString();
                try {
                    this.template = Twig.twig({
                        data: tpl
                    });
                    this.module.definition.configuration.groups.group[0].template[0] = tpl;
                    this.render();
                } catch (e) {
                    Debug.info('Problem with template: ' + e);
                }
            }
        },
        render: function () {
            var that = this;
            this.dom.html('');
            var renderers = [];

            this.dom.append('<div class="indic-p indic-g"></div>');
            for (var i = 1; i < 19; i++) {
                this.dom.append('<div class="indic-g group' + i + '"><p>' + i + '</p></div>');

            }
            for (var i = 1; i < 8; i++) {
                this.dom.append('<div class="indic-p period' + i + '"><p>' + i + '</p></div>');
            }


            for (var i = 0; i < this.elements.length; i++) {
                var $element = $('<div>' + this.template.render({element: this.elements[i]}) + '</div>').data('idx', i);

                $element.addClass('element' +
                ' e' + this.elements[i].Z +
                ' period' + this.elements[i].period +
                ' group' + this.elements[i].group +
                ' block-' + this.elements[i].block +
                ' ' + this.elements[i].serie);

                this.dom.append($element);
            }
            var legend = $('<div class="legend"></div>');
            $('div.e1').after(legend);

            var defaultLegend = $('<div class="default-legend"></div>');
            var elementZoom = $('<div class="element-zoom hidden"></div>');
            var elementDatas = $('<div class="element-datas hidden"><ul><li>data1</li><li>data2</li></ul></div>');
            legend.append(defaultLegend).append(elementZoom).append(elementDatas);

            //default Legend. Better in a twig.
            var innerLegend = $('<div class="inner-legend"></div>');
            defaultLegend.append(innerLegend);
            innerLegend.append('<ul class="color-serie">' +
                '<li class="alkali">Alkali metals</li>' +
                '<li class="alkaline">Alkalin earth metals</li>' +
                '<li class="transition">Transition metals</li>' +
                '<li class="lanthanoid">Lanthanoids</li>' +
                '<li class="actinoid">Actinoids</li>' +
                '<li class="poor">Post-transition metals</li>' +
                '<li class="metalloid">Metalloids</li>' +
                '<li class="nonmetal">Nonmetals</li>' +
                '<li class="halogen">Halogens</li>' +
                '<li class="noble">Noble gases</li>' +
            '</ul>');
            innerLegend.append('<div class="stateOfMatter"><table><tbody>' +
            '<tr><td class="solid">S</td><td>Solid</td></tr>' +
            '<tr><td class="liquid">L</td><td>Liquid</td></tr>' +
            '<tr><td class="gas"">G</td><td>Gas</td></tr>' +
            '<tr><td class="unknown">U</td><td>Unknown</td></tr>' +
            '</tbody></table>' +
            '<dl><dt>Temperature</dt><dd>293.5 K</dd>' +
            '<dt>Pressure</dt><dd>101.325 kPa</dd></dl></div>');

            var isFixed = false;

            $('.element').mouseenter(function () {
                if (isFixed) return;
                renderElement($(this));
            });
            $('.element').click(function () {
                if (isFixed) {
                    $('.el-selected').removeClass('el-selected');
                }
                $(this).addClass('el-selected');
                renderElement($(this));
                isFixed = true;
            });

            $('.element').dblclick(function () {
                $(this).removeClass('el-selected');
                isFixed = false;
            });

            $('.element').mouseleave(function () {
                if (isFixed) return;
                $('.element-zoom').delay(50000).empty();
                defaultLegend.removeClass('hidden');
                elementZoom.addClass('hidden');
                elementDatas.addClass('hidden');
            });
            function renderElement($el) {
                var idx = $el.data('idx');
                var el = that.elements[idx];
                if (!el) return;
                defaultLegend.addClass('hidden');
                elementZoom.removeClass('hidden');
                elementDatas.removeClass('hidden');
                elementZoom.empty();
                elementZoom.append(that.template.render({element: el}));
            }

            var interactZone = ('<div class="interactive-zone"><div id="slider"></div>');
            var legend = $('<div class="legend"></div>');
            $('.legend').after(interactZone);


            var actinid = ('<div class="indic-f period7"><p>89-103</p></div>');
            var lanthanid = ('<div class="indic-f period6"><p>57-71</p></div>');
            $('div.e56').after(lanthanid);
            $('div.e88').after(actinid);
        }


    });

    return View;

});
