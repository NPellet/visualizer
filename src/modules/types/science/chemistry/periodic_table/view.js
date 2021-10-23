'use strict';

define([
  'modules/default/defaultview',
  'lib/twigjs/twig',
  'src/util/debug',
  'src/util/colorbar',
  'src/util/color',
  'components/papa-parse/papaparse.min',
  'src/util/api',
  'lodash',
  'src/util/urldata'
], function (Default, Twig, Debug, Colorbar, Color, Papa, API, _, urlData) {
  const MIN_TEMPERATURE = 0;
  const MAX_TEMPERATURE = 6000;
  const INITIAL_TEMPERATURE = 293;
  const STEP_TEMPERATURE = 1;

  const series = [
    'alkali',
    'alkaline',
    'transition',
    'lanthanoid',
    'actinoid',
    'poor',
    'metalloid',
    'nonmetal',
    'halogen',
    'noble'
  ];

  function View() {}

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
        this._activateHighlights();
        this.resolveReady();
        this.render();
      });
    },

    createTemplateFromPref(name) {
      var source = `${name}templateSource`;
      source = this.module.getConfiguration(source);
      if (source === 'pref') {
        var tpl = this.module.getConfiguration(`${name}template`);
        this[`${name}template`] = Twig.twig({
          data: tpl
        });
      } else {
        this[`${name}template`] = Twig.twig({
          data: ''
        });
      }
    },

    createTemplateFromVar(name, tpl) {
      var source = `${name}templateSource`;
      source = this.module.getConfiguration(source);
      if (source === 'varin') {
        this[`${name}template`] = Twig.twig({
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
        this.getElements(value).then(() => {
          this._activateHighlights();
          this.render();
        });
      },
      template(value) {
        var tpl = value.get().toString();
        try {
          this.createTemplateFromVar('', tpl);
          this.render();
        } catch (e) {
          Debug.info(`Problem with template: ${e}`);
        }
      },
      hltemplate(value) {
        var tpl = String(value.get());
        try {
          this.createTemplateFromVar('hl', tpl);
          this.render();
        } catch (e) {
          Debug.info(`Problem with highlight template: ${e}`);
        }
      }
    },

    getElements(value) {
      return Promise.resolve().then(() => {
        var source = this.module.getConfiguration('elementsSource');
        var toParse = this.module.getConfiguration('elementsCode');
        var sourceUrl = this.module.getConfiguration('elementsUrl');

        if (source === 'varin' && value) {
          this.setElements(value);
        } else if (source === 'pref') {
          this.parseElements(toParse);
        } else if (source === 'url') {
          return urlData.get(sourceUrl, 1800).then((res) => {
            this.parseElements(res);
          });
        }
      });
    },

    setElements(value) {
      var elements = value.filter((el) => {
        return String(el.label) === 'atom';
      });

      if (this.module.getConfigurationCheckbox('useHighlights', 'yes')) {
        for (var i = 0; i < elements.length; i++) {
          elements[i]._highlight = elements[i].name;
        }
      }

      this.metadata = value.filter((el) => {
        return String(el.label) !== 'atom';
      });

      var varName = this.module.getConfiguration('varName');
      if (
        varName &&
        this.module.getConfiguration('elementsSource') !== 'varin'
      ) {
        API.createData(varName, value);
      }

      this.dataElements = DataObject.check(elements, true);
      this.elements = JSON.parse(
        JSON.stringify(DataObject.resurrect(elements))
      );
    },

    parseElements(toParse) {
      var obj;
      if (typeof toParse === 'string') {
        try {
          obj = JSON.parse(toParse);
          if (!Array.isArray(obj)) {
            throw new Error();
          }
        } catch (error) {
          try {
            obj = Papa.parse(toParse, {
              delimiter: '\t',
              header: true,
              dynamicTyping: true
            });
            obj = obj.data;
          } catch (error2) {
            Debug.error('Could not parse elements');
            return;
          }
        }
      } else {
        obj = toParse;
      }

      this.setElements(obj);
    },

    render() {
      var that = this;
      that.dom.empty().unbind();
      that.dom.append('<div class="indic-p indic-g"></div>');
      for (let i = 1; i < 19; i++) {
        that.dom.append(`<div class="indic-g group${i}"><p>${i}</p></div>`);
      }
      for (let i = 1; i < 8; i++) {
        that.dom.append(`<div class="indic-p period${i}"><p>${i}</p></div>`);
      }

      for (let i = 0; i < this.elements.length; i++) {
        var $element = $(
          `<div>${this.template.render({ element: this.elements[i] })}</div>`
        ).data('idx', i);

        $element.addClass(
          `${'element e'}${this.elements[i].Z} period${
            this.elements[i].period
          } group${this.elements[i].group} block-${this.elements[i].block} ${
            this.elements[i].serie
          }`
        );

        that.dom.append($element);
      }
      var legend = $('<div class="legend"></div>');
      that.dom.find('div.e1').after(legend);

      that.defaultLegend = $('<div class="default-legend"></div>');
      var elementZoom = $('<div class="element-zoom hidden"></div>');
      var elementDatas = $('<div class="element-datas hidden"></div>');
      legend
        .append(that.defaultLegend)
        .append(elementZoom)
        .append(elementDatas);

      // default Legend. Better in a twig.
      that.innerLegend = $('<div class="inner-legend"></div>');
      that.defaultLegend.append(that.innerLegend);
      that.colorSerie = $(`<ul class="color-serie hidden">
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
      that.innerLegend.append(that.colorSerie);

      var $elements = (that.$elements = that.dom.find('.element'));

      that.innerLegend.append('<div class="stateOfMatter"></div>');
      that.stateOfMatter = that.innerLegend.find('.stateOfMatter');

      if (that.foreground.mode === 'state') {
        that.stateOfMatter.append(`<table><tbody>
                <tr><td class="solid">S</td><td>Solid</td><td class="liquid">L</td><td>Liquid</td></tr>
                <tr><td class="gas"">G</td><td>Gas</td><td class="unknown">U</td><td>Unknown</td></tr>
                </tbody></table>`);
        that.stateOfMatter.append(
          '<dl class="periodic-value-list"><dt>Pressure</dt><dd>101.325 kPa</dd></dl></div>'
        );
      }

      if (that.foreground.mode === 'state') {
        that.defaultLegend.append(
          `<div class="periodicSlider" id="foregroundSlider"><input type="range" min="${MIN_TEMPERATURE}" max="${MAX_TEMPERATURE}" step="${STEP_TEMPERATURE}" value="${INITIAL_TEMPERATURE}"/></div>`
        );
        that.innerLegend
          .find('dl')
          .append(
            `<dt>Temperature</dt><dd id="foregroundVal">${INITIAL_TEMPERATURE} K</dd>`
          );
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

      this.innerLegend.on('click', 'ul.color-serie li', (event) => {
        that.unselectElements(event, $elements);
        var classes = $(event.target)
          .attr('class')
          .split(' ');
        var found = series.find((s) => {
          return classes.some((c) => c === s);
        });

        if (!found) return;
        $elements.filter(`.${found}`).toggleClass('el-selected');
        that.elementsSelected();
        event.stopPropagation();
      });

      that.defaultLegend.on('input', '#foregroundSlider>input', (event) => {
        if (that.foreground.mode === 'state') {
          this.updateElementPhase(event.target.value);
          that.innerLegend
            .find('#foregroundVal')
            .html(`${event.target.value} K`);
        } else {
          this.updateColors('foreground', event.target.value);
          that.innerLegend
            .find('#foregroundVal')
            .html(`${event.target.value} ${this.foreground.unit}`);
        }
      });

      that.defaultLegend.on('input', '#backgroundSlider>input', (event) => {
        this.updateColors('background', event.target.value);
        that.innerLegend
          .find('#backgroundVal')
          .html(`${event.target.value} ${this.background.unit}`);
      });

      var showDefaultLegend = _.debounce(() => {
        $('.element-zoom')
          .delay(50000)
          .empty()
          .unbind();
        that.defaultLegend.removeClass('hidden');
        if (this.module.getConfigurationCheckbox('display', 'families')) {
          that.colorSerie.removeClass('hidden');
        }
        elementZoom.addClass('hidden');
        elementDatas.addClass('hidden');
      }, 150);

      showDefaultLegend();

      $elements.mouseenter(function () {
        var $el = $(this);
        var Z = that.getZ($el);
        that._doHighlight(Z, true);
        that.module.controller.elementHovered(Z);
        if (isFixed) return;
        showDefaultLegend.cancel();
        renderElement($el);
      });

      $elements.mouseleave(function () {
        var $el = $(this);
        var Z = that.getZ($el);
        that._doHighlight(Z, false);
        if (isFixed) return;
        showDefaultLegend();
      });

      $elements.click(function (event) {
        that.unselectElements(event, $elements);
        var $el = $(this);
        $el.toggleClass('el-selected');
        that.elementSelected($el);
        renderElement($el);
        that.elementsSelected();
        isFixed = true;
        event.stopPropagation();
      });

      $elements.dblclick(function () {
        var $el = $(this);
        $el.removeClass('el-selected');
        isFixed = false;
      });

      that.dom.on('click', '.indic-p', function (event) {
        // find period to which it belongs
        var p = $(this)
          .attr('class')
          .replace(/^.*(period\d+).*$/, '$1');
        var pN = p.substr(6);
        that.unselectElements(event, $elements);
        var $selected = $elements.filter(`.${p}`);
        $selected.toggleClass('el-selected');
        that.module.controller.periodSelected(pN);
        that.elementsSelected();
        event.stopPropagation();
      });

      that.module.getDomContent().on('click', function () {
        isFixed = false;
        showDefaultLegend();
        $elements.removeClass('el-selected');
        that.module.controller.elementsSelected(that.elements.map((el) => el.Z));
      });

      that.dom.on('click', '.indic-g', function (event) {
        // find group to which it belongs
        var g = $(this)
          .attr('class')
          .replace(/^.*(group\d+).*$/, '$1');
        var gN = g.substr(5);
        that.unselectElements(event, $elements);
        var $selected = $elements.filter(`.${g}`);
        $selected.toggleClass('el-selected');
        that.module.controller.groupSelected(gN);
        that.elementsSelected();
        event.stopPropagation();
      });

      function renderElement($el) {
        var idx = $el.data('idx');
        var el = that.elements[idx];
        if (!el) return;
        that.defaultLegend.addClass('hidden');
        elementZoom.removeClass('hidden');
        elementDatas.removeClass('hidden');
        elementZoom.empty().unbind();
        elementZoom.append(that.hltemplate.render({ element: el }));
      }

      var interactZone =
        '<div class="interactive-zone"><div id="slider"></div>';
      legend.after(interactZone);

      var actinid = '<div class="indic-f period7"><p>89-103</p></div>';
      var lanthanid = '<div class="indic-f period6"><p>57-71</p></div>';
      that.dom.find('div.e56').after(lanthanid);
      that.dom.find('div.e88').after(actinid);

      // By default all elements selected
      that.module.controller.elementsSelected(that.elements.map((el) => el.Z));
    },

    _getOptions(type) {
      var cfg = this.module.getConfiguration;
      var r = {};
      [
        'Min',
        'Max',
        'Val',
        'MinColor',
        'MaxColor',
        'NeutralColor',
        'NoValueColor',
        'FixedColor',
        'Step',
        'Label',
        'Unit',
        'Mode',
        'Jpath'
      ].forEach((val) => {
        var prop = val.toLowerCase();
        r[prop] = cfg(`${type}${val}`);
        if (val.match(/color/i)) {
          r[prop] = Color.array2rgba(r[prop]);
        }
      });
      [['ShowSlider', 'yes']].forEach((val) => {
        r[val[0].toLowerCase()] = this.module.getConfigurationCheckbox(
          `${type}${val[0]}`,
          val[1]
        );
      });
      return r;
    },

    _getGradientFunction(type, value) {
      var width = this.defaultLegend.width(),
        height = 51;
      var options = {
        stops: [
          this[type].mincolor,
          this[type].neutralcolor,
          this[type].maxcolor
        ],
        stopPositions: [this[type].min, value, this[type].max],
        domain: [this[type].min, this[type].max],
        stopType: 'values',
        width,
        height,
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
        this.defaultLegend.append(
          `<div class="periodicSlider" id="${type}Slider"><input type="range" min="${
            this[type].min
          }" max="${this[type].max}" step="${this[type].step}" value="${
            this[type].val
          }"/><div class="periodicGradient"></div></div>`
        );
      }
      this.innerLegend
        .find('dl')
        .append(
          `<dt>${this[type].label}</dt><dd id="${type}Val">${this[type].val} ${
            this[type].unit
          }</dd>`
        );
    },

    unselectElements(event, $el) {
      if (!event.ctrlKey && !event.metaKey) {
        $el.removeClass('el-selected');
      }
    },

    elementSelected($el) {
      this.module.controller.elementSelected(this.getZ($el));
    },

    elementsSelected() {
      var sel = this.dom
        .find('.el-selected')
        .map((idx, el) => {
          return this.getZ($(el));
        })
        .toArray();
      this.module.controller.elementsSelected(sel);
    },

    onActionReceive: {
      select(val) {
        var elements = this.dom.find('.element').toArray();
        this._selectElements(elements, val);
      },

      setSelected(val) {
        var $elements = this.dom.find('.element');
        this.unselectElements({}, $elements);
        this._selectElements($elements.toArray(), val);
      }
    },

    // helper function for selecting elements with actions
    _selectElements(elements, val) {
      if (Array.isArray(val)) {
        const finder = (element) => element.Z === val[num];
        for (var num = 0; num < val.length; num++) {
          var z = this.elements.findIndex(finder);
          if (z >= 0) {
            $(elements[z]).addClass('el-selected');
          }
        }
      } else if (typeof val === 'function') {
        for (var elm = 0; elm < this.elements.length; elm++) {
          if (val(this.elements[elm])) {
            $(elements[elm]).addClass('el-selected');
          }
        }
      }

      this.elementsSelected();
    },

    getZ($el) {
      return $el.attr('class').replace(/^.*[^a-zA-Z]e(\d+).*$/, '$1');
    },

    updateColors(type, val) {
      var fn = this._getGradientFunction(type, val);
      var $elements = this.dom.find('.element');
      for (let i = 0; i < $elements.length; i++) {
        let $el = $($elements[i]);
        var idx = $el.data('idx');
        var elVal = Number(
          this.dataElements.getChildSync([idx].concat(this[type].jpath))
        );
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
    },

    _activateHighlights: function () {
      var that = this;
      var hl = _(that.elements)
        .map('_highlight')
        .flatten()
        .filter((val) => !_.isUndefined(val))
        .value();

      that._highlighted = [];

      API.killHighlight(that.module.getId());

      for (let i = 0; i < hl.length; i++) {
        API.listenHighlight(
          { _highlight: hl[i] },
          function (onOff, key, killerId, senderId) {
            // Ignore if sent my the module itself
            if (senderId === that.module.getId()) return;
            if (!Array.isArray(key)) {
              key = [key];
            }
            if (onOff) {
              that._highlighted = _(that._highlighted)
                .push(key)
                .flatten()
                .uniq()
                .value();
            } else {
              that._highlighted = _.filter(that._highlighted, function (val) {
                return key.indexOf(val) === -1;
              });
            }
            that._drawHighlight();
          },
          false,
          that.module.getId()
        );
      }
    },

    _doHighlight(Z, state) {
      if (!this.elements) return;
      var el = this.elements.find((el) => el.Z == Z);
      if (el) {
        API.highlightId(el.name, state, this.module.getId());
      }
    },

    _drawHighlight() {
      // find first
      if (!this.elements || !this.$elements) return;
      var el = this.elements.filter((el) => {
        return this._highlighted.indexOf(el._highlight) > -1;
      });

      // Clear previous highlights
      this._unhighlightElements();
      el.forEach((el) => {
        this._highlightElement(el.Z);
      });
    },

    _unhighlightElements() {
      this.$elements.css({
        border: '',
        transform: 'scale(1)',
        zIndex: 0
      });
    },

    _highlightElement(Z) {
      var $el = this.$elements.filter(`.e${Z}`);
      $el.css({
        border: 'solid 2px red',
        transform: 'scale(1.1)',
        zIndex: 1
      });
    }
  });

  return View;
});
