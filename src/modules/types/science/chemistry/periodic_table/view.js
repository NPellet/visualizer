'use strict';

define(['modules/default/defaultview', 'lib/twigjs/twig', 'src/util/debug', 'src/util/colorbar', 'src/util/color', 'components/papa-parse/papaparse.min', 'superagent'], function (Default, Twig, Debug, Colorbar, Color, Papa, superagent) {

    const MIN_TEMPERATURE = 0;
    const MAX_TEMPERATURE = 6000;
    const INITIAL_TEMPERATURE = 293;
    const STEP_TEMPERATURE = 1;

    const series = ['alkali', 'alkaline', 'transition', 'lanthanoid', 'actinoid', 'poor', 'metalloid', 'nonmetal', 'halogen', 'noble'];

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init() {

            this.dom = $('<div class="periodic-table">');

            this.elements = [];

            // Set background and foreground color models
            this.foreground = this._getOptions('foreground');
            this.background = this._getOptions('background');

            this.createTemplateFromPref('', 'pref');
            this.createTemplateFromPref('hl', 'pref');

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
            this.getElements().then(() => {
                this.resolveReady();
                this.render();
            });
        },

        createTemplateFromPref(name) {
            var source = name + 'templateSource';
            source = this.module.getConfiguration(source);
            if (source === 'pref') {
                var tpl = this.module.getConfiguration(name + 'template');
                this[name + 'template'] = Twig.twig({
                    data: tpl
                });
            } else {
                this[name + 'template'] = Twig.twig({
                    data: ''
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
                this.getElements(value).then(() => this.render());
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

        getElements(value) {
            return Promise.resolve().then(() => {
                var source = this.module.getConfiguration('elementsSource');
                var toParse = this.module.getConfiguration('elementsCode');
                var sourceUrl = this.module.getConfiguration('elementsUrl');

                if (source === 'varin' && value) {
                    this.dataElements = value;
                    this.elements = JSON.parse(JSON.stringify(value.resurrect()));
                } else if (source === 'pref') {
                    this.parseElements(toParse);
                } else if (source === 'url') {
                    return superagent.get(sourceUrl).then(res => {
                        this.parseElements(res.text);
                    });
                }
            });
        },

        parseElements(toParse) {
            var obj;
            if (typeof toParse === 'string') {
                try {
                    obj = JSON.parse(toParse);
                    if (!Array.isArray(obj)) {
                        throw new Error();
                    }
                } catch (e) {
                    try {
                        obj = Papa.parse(toParse,
                            {
                                delimiter: '\t',
                                header: true
                            }
                        );
                        obj = obj.data.slice(1);
                    } catch (e) {
                        console.error('Could not parse elements');
                        return;
                    }
                }
            } else {
                obj = toParse;
            }
            this.dataElements = DataObject.check(obj, true);
            this.elements = JSON.parse(JSON.stringify(DataObject.resurrect(obj)));
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

            that.defaultLegend = $('<div class="default-legend"></div>');
            var elementZoom = $('<div class="element-zoom hidden"></div>');
            var elementDatas = $('<div class="element-datas hidden"><ul><li>data1</li><li>data2</li></ul></div>');
            legend.append(that.defaultLegend).append(elementZoom).append(elementDatas);

            //default Legend. Better in a twig.
            that.innerLegend = $('<div class="inner-legend"></div>');
            that.defaultLegend.append(that.innerLegend);
            that.innerLegend.append(`<ul class="color-serie">
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
            that.innerLegend.append(`<div class="stateOfMatter"><table><tbody>
                <tr><td class="solid">S</td><td>Solid</td><td class="liquid">L</td><td>Liquid</td></tr>
                <tr><td class="gas"">G</td><td>Gas</td><td class="unknown">U</td><td>Unknown</td></tr>
                </tbody></table>
                <dl class="periodic-value-list"><dt>Pressure</dt><dd>101.325 kPa</dd></dl></div>`);


            var $elements = that.dom.find('.element');

            if (that.foreground.mode === 'state') {
                that.defaultLegend.append(`<div class="periodicSlider" id="foregroundSlider"><input type="range" min="${MIN_TEMPERATURE}" max="${MAX_TEMPERATURE}" step="${STEP_TEMPERATURE}" value="${INITIAL_TEMPERATURE}"/></div>`);
                that.innerLegend.find('dl').append(`<dt>Temperature</dt><dd id="foregroundVal">${INITIAL_TEMPERATURE} K</dd>`);
                this.updateElementPhase(INITIAL_TEMPERATURE);
            } else if (that.foreground.mode === 'custom') {
                that._addSlider('foreground');
                that.updateColors('foreground', that.foreground.val);
            } else if (that.foreground.mode === 'fixed') {
                $elements.css('color', that.foreground.fixedcolor);
            }

            if (that.background.mode === 'custom') {
                that._addSlider('background');
                that.updateColors('background', that.background.val);
            } else if (that.background.mode === 'fixed') {
                $elements.css('background-color', that.background.fixedcolor);
            }

            var isFixed = false;

            this.innerLegend.on('click', 'ul.color-serie li', event => {
                that.unselectElements(event, $elements);
                var classes = $(event.target).attr('class').split(' ');
                var found = series.find(s => {
                    return classes.some(c => c === s);
                });

                if (!found) return;
                $elements.filter('.' + found).addClass('el-selected');
                that.elementsSelected();
            });

            that.defaultLegend.on('input', '#foregroundSlider>input', event => {
                console.log('foreground slider');
                if (that.foreground.mode === 'state') {
                    this.updateElementPhase(event.target.value);
                    that.innerLegend.find('#foregroundVal').html('' + event.target.value + ' K');
                } else {
                    this.updateColors('foreground', event.target.value);
                    that.innerLegend.find('#foregroundVal').html('' + event.target.value + this.foreground.unit);
                }
            });

            that.defaultLegend.on('input', '#backgroundSlider>input', event => {
                this.updateColors('background', event.target.value);
                that.innerLegend.find('#backgroundVal').html('' + event.target.value + this.foreground.unit);
            });

            $elements.mouseenter(function () {
                if (isFixed) return;
                renderElement($(this));
            });
            $elements.click(function (event) {
                that.unselectElements(event, $elements);
                var $el = $(this);
                $el.addClass('el-selected');
                renderElement($el);
                that.elementsSelected();
                isFixed = true;
            });

            $elements.dblclick(function () {
                $(this).removeClass('el-selected');
                isFixed = false;
            });

            $elements.mouseleave(function () {
                if (isFixed) return;
                $('.element-zoom').delay(50000).empty().unbind();
                that.defaultLegend.removeClass('hidden');
                elementZoom.addClass('hidden');
                elementDatas.addClass('hidden');
            });

            that.dom.on('click', '.indic-p', function (event) {
                // find period to which it belongs
                var p = $(this).attr('class').replace(/^.*(period\d+).*$/, '$1');
                var pN = p.substr(6);
                that.unselectElements(event, $elements);
                var $selected = $elements.filter('.' + p);
                $selected.addClass('el-selected');
                that.module.controller.periodSelected(pN);
                that.elementsSelected();
            });

            that.dom.on('click', '.indic-g', function (event) {
                // find group to which it belongs
                var g = $(this).attr('class').replace(/^.*(group\d+).*$/, '$1');
                var gN = g.substr(5);
                that.unselectElements(event, $elements);
                var $selected = $elements.filter('.' + g);
                $selected.addClass('el-selected');
                that.module.controller.groupSelected(gN);
                that.elementsSelected();
            });

            function renderElement($el) {
                var idx = $el.data('idx');
                var el = that.elements[idx];
                if (!el) return;
                that.defaultLegend.addClass('hidden');
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

        _getOptions(type) {
            var cfg = this.module.getConfiguration.bind(this.module);
            var r = {};
            ['Min', 'Max', 'Val', 'MinColor', 'MaxColor', 'NeutralColor', 'NoValueColor', 'FixedColor', 'Step', 'Label', 'Unit', 'Mode', 'Jpath'].forEach(val => {
                var prop = val.toLowerCase();
                r[prop] = cfg(`${type}${val}`);
                if (val.match(/color/i)) {
                    r[prop] = Color.array2rgba(r[prop]);
                }
            });
            [['ShowSlider', 'yes']].forEach(val => {
                r[val[0].toLowerCase()] = this.module.getConfigurationCheckbox(`${type}${val[0]}`, val[1]);
            });
            return r;
        },

        _getGradientFunction(type, value) {
            var width = this.defaultLegend.width() - 30, height = 21;
            var options = {
                stops: [this[type].mincolor, this[type].neutralcolor, this[type].maxcolor],
                stopPositions: [this[type].min, value, this[type].max],
                domain: [this[type].min, this[type].max],
                stopType: 'values',
                width, height,
                returnMode: 'svg',
                axis: {
                    orientation: 'top'
                }
            };
            options.axis.tickValues = options.stopPositions;
            var $div = this.defaultLegend.find(`#${type}Slider .periodicGradient`);
            $div.empty();
            if ($div[0]) {
                Colorbar.renderSvg($div[0], options);
            }
            return Colorbar.getColorScale(options);
        },

        _addSlider(type) {
            if (this[type].showslider) {
                this.defaultLegend.append(`<div class="periodicSlider" id="${type}Slider"><input type="range" min="${this[type].min}" max="${this[type].max}" step="${this[type].step}" value="${this[type].val}"/><div class="periodicGradient"></div></div>`);
            }
            this.innerLegend.find('dl').append(`<dt>${this[type].label}</dt><dd id="${type}Val">${this[type].val} ${this[type].unit}</dd>`);
        },

        unselectElements(event, $el) {
            if (!event.ctrlKey && !event.metaKey) {
                $el.removeClass('el-selected');
            }
        },

        elementsSelected() {
            var sel = this.dom.find('.el-selected').map((idx, el) => {
                return $(el).attr('class').replace(/^.*[^a-zA-Z]e(\d+).*$/, '$1');
            }).toArray();
            this.module.controller.elementsSelected(sel);
        },

        updateColors(type, val) {
            var fn = this._getGradientFunction(type, val);
            var $elements = this.dom.find('.element');
            for (let i = 0; i < $elements.length; i++) {
                let $el = $($elements[i]);
                var idx = $el.data('idx');
                var elVal = Number(this.dataElements.getChildSync([idx].concat(this[type].jpath)));
                if (isNaN(elVal)) {
                    var c = {
                        rgba: this[type].novaluecolor
                    };
                } else {
                    c = fn(elVal);
                    c.rgba = Color.array2rgba(Color.hex2rgb(c.color).concat(c.opacity));
                }

                if (type === 'foreground') {
                    $el.css({
                        color: c.rgba
                    });
                } else {
                    $el.css({
                        backgroundColor: c.rgba
                    });
                }
            }
        },

        updateElementPhase(temperature) {
            var $elements = this.dom.find('.element');
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
        }


    });

    return View;

});
