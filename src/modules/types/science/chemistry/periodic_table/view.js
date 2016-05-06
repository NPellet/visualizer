'use strict';

define(['modules/default/defaultview', 'lib/twigjs/twig', 'src/util/debug'], function (Default, Twig, Debug) {

    const MIN_TEMPERATURE = 0;
    const MAX_TEMPERATURE = 6000;
    const INITIAL_TEMPERATURE = 293;
    const STEP_TEMPERATURE = 1;

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init() {

            this.dom = $('<div class="periodic-table">');

            this.elements = [];
            this.template = Twig.twig({
                data: this.module.getConfiguration('template')
            });
        },
        blank: {
            template() {
                this.template = Twig.twig({
                    data: ''
                });
                this.dom.empty().unbind();
            },
            hltemplate() {
                this.hltemplate = Twig.twig({
                    data: ''
                });
                this.dom.empty().unbind();
            },
            value() {
                this.dom.empty().unbind();
            }
        },
        inDom() {
            this.module.getDomContent().html(this.dom);
            this.resolveReady();
            this.render();
        },

        createTemplateFromPref(name) {
            var source = name + 'templateSource';
            source = this.module.getConfiguration(source);
            if (source === 'pref') {
                var tpl = this.module.getConfiguration(name + 'template');
                this[name + 'Template'] = Twig.twig({
                    data: tpl
                });
            }
        },

        createTemplateFromVar(name, tpl) {
            var source = name + 'templateSource';
            source = this.module.getConfiguration(source);
            if (source === 'varin') {
                this[name + 'template'] = Twig.twig({
                    data: tpl
                });
            }
        },

        update: {
            value(value) {
                /*
                 Convert special DataObjects
                 (twig does some check depending on the filter used
                 and the values need to be native)
                 */

                this.createTemplateFromPref('', 'pref');
                this.createTemplateFromPref('hl', 'pref');

                this.elements = JSON.parse(JSON.stringify(value.resurrect()));
                this.render();
            },
            template(value) {
                var tpl = value.get().toString();
                try {
                    this.createTemplateFromVar('', tpl);
                    this.render();
                } catch (e) {
                    Debug.info('Problem with template: ' + e);
                }
            },
            hltemplate(value) {
                var tpl = String(value.get());
                try {
                    this.createTemplateFromVar('hl', tpl);
                    this.render();
                } catch (e) {
                    Debug.info('Problem with highlight template: ' + e);
                }
            }
        },

        render() {
            var that = this;
            that.dom.empty().unbind();
            that.dom.append('<div class="indic-p indic-g"></div>');
            for (let i = 1; i < 19; i++) {
                that.dom.append('<div class="indic-g group' + i + '"><p>' + i + '</p></div>');
            }
            for (let i = 1; i < 8; i++) {
                that.dom.append('<div class="indic-p period' + i + '"><p>' + i + '</p></div>');
            }

            for (let i = 0; i < this.elements.length; i++) {
                var $element = $('<div>' + this.template.render({element: this.elements[i]}) + '</div>').data('idx', i);

                $element.addClass('element' +
                    ' e' + this.elements[i].Z +
                    ' period' + this.elements[i].period +
                    ' group' + this.elements[i].group +
                    ' block-' + this.elements[i].block +
                    ' ' + this.elements[i].serie);

                that.dom.append($element);
            }
            var legend = $('<div class="legend"></div>');
            that.dom.find('div.e1').after(legend);

            var defaultLegend = $('<div class="default-legend"></div>');
            var elementZoom = $('<div class="element-zoom hidden"></div>');
            var elementDatas = $('<div class="element-datas hidden"><ul><li>data1</li><li>data2</li></ul></div>');
            legend.append(defaultLegend).append(elementZoom).append(elementDatas);

            //default Legend. Better in a twig.
            var innerLegend = $('<div class="inner-legend"></div>');
            defaultLegend.append(innerLegend);
            innerLegend.append(`<ul class="color-serie">
                <li class="alkali">Alkali metals</li>
                <li class="alkaline">Alkalin earth metals</li>
                <li class="transition">Transition metals</li>
                <li class="lanthanoid">Lanthanoids</li>
                <li class="actinoid">Actinoids</li>
                <li class="poor">Post-transition metals</li>
                <li class="metalloid">Metalloids</li>
                <li class="nonmetal">Nonmetals</li>
                <li class="halogen">Halogens</li>
                <li class="noble">Noble gases</li>
                </ul>`);
            innerLegend.append(`<div class="stateOfMatter"><table><tbody>
                <tr><td class="solid">S</td><td>Solid</td></tr>
                <tr><td class="liquid">L</td><td>Liquid</td></tr>
                <tr><td class="gas"">G</td><td>Gas</td></tr>
                <tr><td class="unknown">U</td><td>Unknown</td></tr>
                </tbody></table>
                <dl><dt>Temperature</dt><dd id="periodicTemperature">${INITIAL_TEMPERATURE} K</dd>
                <dt>Pressure</dt><dd>101.325 kPa</dd></dl></div>`);
            defaultLegend.append(`<input id="periodicTemperatureSlider" type="range" min="${MIN_TEMPERATURE}" max="${MAX_TEMPERATURE}" step="${STEP_TEMPERATURE}" value="${INITIAL_TEMPERATURE}"/>`);

            var isFixed = false;

            var $elements = that.dom.find('.element');

            defaultLegend.on('input', '#periodicTemperatureSlider', event => {
                innerLegend.find('#periodicTemperature').html('' + event.target.value + ' K');
                this.updateElementPhase();
            });


            $elements.mouseenter(function () {
                if (isFixed) return;
                renderElement($(this));
            });
            $elements.click(function () {
                $elements.removeClass('el-selected');
                var $el = $(this);
                $el.addClass('el-selected');
                renderElement($el);
                isFixed = true;
            });

            $elements.dblclick(function () {
                $(this).removeClass('el-selected');
                isFixed = false;
            });

            $elements.mouseleave(function () {
                if (isFixed) return;
                $('.element-zoom').delay(50000).empty().unbind();
                defaultLegend.removeClass('hidden');
                elementZoom.addClass('hidden');
                elementDatas.addClass('hidden');
            });

            that.dom.on('click', '.indic-p', function () {
                // find period to which it belongs
                var p = $(this).attr('class').replace(/^.*(period\d+).*$/, '$1');
                var pN = p.substr(6);
                $elements.removeClass('el-selected');
                var $selected = $elements.filter('.' + p);
                $selected.addClass('el-selected');
                that.module.controller.periodSelected(pN);
                that.elementsSelected($selected);
            });

            that.dom.on('click', '.indic-g', function () {
                // find group to which it belongs
                var g = $(this).attr('class').replace(/^.*(group\d+).*$/, '$1');
                var gN = g.substr(5);
                $elements.removeClass('el-selected');
                var $selected = $elements.filter('.' + g);
                $selected.addClass('el-selected');
                that.module.controller.groupSelected(gN);
                that.elementsSelected($selected);
            });

            function renderElement($el) {
                var idx = $el.data('idx');
                var el = that.elements[idx];
                if (!el) return;
                defaultLegend.addClass('hidden');
                elementZoom.removeClass('hidden');
                elementDatas.removeClass('hidden');
                elementZoom.empty().unbind();
                elementZoom.append(that.hltemplate.render({element: el}));
            }

            var interactZone = ('<div class="interactive-zone"><div id="slider"></div>');
            legend.after(interactZone);


            var actinid = ('<div class="indic-f period7"><p>89-103</p></div>');
            var lanthanid = ('<div class="indic-f period6"><p>57-71</p></div>');
            that.dom.find('div.e56').after(lanthanid);
            that.dom.find('div.e88').after(actinid);
        },

        elementsSelected($el) {
            var sel = $el.map((idx,el) => {
                return $(el).attr('class').replace(/^.*[^a-zA-Z]e(\d+).*$/, '$1');
            }).toArray();
            this.module.controller.elementsSelected(sel);
        },

        updateElementPhase() {
            var $elements = this.dom.find('.element');
            var temperature = this.getTemperature();
            for (let i = 0; i < $elements.length; i++) {
                let $el = $($elements[i]);
                var idx = $el.data('idx');
                if (idx !== undefined) {
                    let el = this.elements[idx];
                    let boiling = +el.boiling;
                    let melting = +el.melting;
                    if (isNaN(boiling) && isNaN(melting)) {
                        $el.removeClass('solid liquid gas');
                        $el.addClass('unknown');
                    } else if (temperature < melting) {
                        $el.removeClass('liquid gas unknown');
                        $el.addClass('solid');
                    } else if (temperature < boiling) {
                        $el.removeClass('solid gas unknown');
                        $el.addClass('liquid');
                    } else {
                        $el.removeClass('liquid solid unknown');
                        $el.addClass('gas');
                    }
                }
            }
        },

        getTemperature() {
            return this.dom.find('#periodicTemperatureSlider')[0].value;
        }


    });

    return View;

});
