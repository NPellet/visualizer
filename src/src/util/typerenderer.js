'use strict';

define([
  'require',
  'jquery',
  'lodash',
  'moment',
  'numeral',
  'sprintf',
  './util',
  './typerenderer/chart',
  './typerenderer/jcamp',
], function (
  require,
  $,
  _,
  moment,
  numeral,
  sprintf,
  Util,
  chartRenderer,
  jcampRenderer,
) {
  const asyncRequire = Util.require;

  const functions = {};

  functions.barcode = {};
  functions.barcode.init = async function () {
    await asyncRequire('jsbarcode');
  };

  functions.barcode.toscreen = function ($element, val, rootVal, options) {
    var defaultOptions = {
      format: 'CODE128',
    };
    var $img = $('<img>');
    $element.append($img);
    var opts = Object.assign({}, defaultOptions, options);
    if (opts.format.startsWith('CODE')) {
      val = String(val);
    } else {
      val = Number(val);
    }
    $img.JsBarcode(val, opts);
  };

  functions.boolean = {};
  functions.boolean.toscreen = function ($element, value) {
    if (value instanceof DataBoolean) {
      value = value.get();
    }
    if (value) $element.html('<span style="color: green;">&#10004;</span>');
    else $element.html('<span style="color: red;">&#10008;</span>');
  };

  functions.chart = chartRenderer;

  functions.color = {};
  functions.color.toscreen = function ($element, val) {
    var result = `${
      '<div style="background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==); width:100%; height:100%">' +
      '<div style="background-color: '
    }${val}; width: 100%; height:100%; min-height: 1px; padding:0; margin:0"></div></div>`;
    $element.html(result);
  };

  functions.colorbar = {};
  functions.colorbar.toscreen = function ($element, value) {
    var div = $('<div></div>');
    var gradient = 'linear-gradient(to right';

    let total = 0;
    for (let i = 0; i < value.length; total += value[i++][0]);

    var start = 0,
      end,
      color;
    for (let i = 0; i < value.length; i++) {
      end = start + (value[i][0] / total) * 100;
      color = value[i][1];
      gradient += `, ${color} ${start}%, ${color} ${end}%`;
      start = end;
    }
    gradient += ')';

    div
      .css({
        height: '100%',
        width: '100%',
        minHeight: '1px',
      })
      .css('background', gradient);
    $element.html(div);
  };

  let countryData;
  functions.country = {};
  functions.country.init = async function () {
    const css = Util.loadCss('components/flag-icon-css/css/flag-icon.min.css');
    countryData = await asyncRequire('countryData');
    await css;
  };
  functions.country.toscreen = function ($element, val) {
    val = String(val);
    var country;
    if (val.length === 2) {
      val = val.toUpperCase();
      country = countryData.lookup.countries({ alpha2: val })[0];
    } else if (val.length === 3) {
      val = val.toUpperCase();
      country = countryData.lookup.countries({ alpha3: val })[0];
    } else {
      val = val.slice(0, 1).toUpperCase() + val.slice(1, val.length);
      country = countryData.lookup.countries({ name: val })[0];
    }
    if (country) {
      $element.html(
        `<span title="${
          country.name
        }" class="flag-icon flag-icon-${country.alpha2.toLowerCase()}"></span>`,
      );
    } else {
      $element.html(val);
    }
  };

  functions.date = {};
  functions.date.toscreen = function ($element, val) {
    try {
      var d = new Date(val);
      $element.html(d.toLocaleString());
    } catch {
      $element.html('Invalid date');
    }
  };

  functions.downloadlink = {};
  functions.downloadlink.toscreen = function ($element, value, root, options) {
    var title = options && options.title;
    title = title || 'Download resource';

    $element.html(
      `<a download${
        options.filename ? `=${options.filename}` : ''
      } title="${title}" href="${value}">⤵</a>`,
    );
  };

  functions.elecconfig = {};
  functions.elecconfig.toscreen = function ($element, value) {
    if (value) {
      $element.html(value.replace(/([a-z])([0-9]+)/g, '$1<sup>$2</sup>'));
    } else {
      $element.html('');
    }
  };

  functions.ghs = {};
  functions.ghs.toscreen = function ($element, val, root, options = {}) {
    const { height = '100%' } = options;
    const ghs = {};
    for (var i = 1; i <= 9; i++) {
      ghs[i] = require.toUrl(`./typerenderer/svg/${i}.svg`);
    }

    $element.html('');

    if (val) {
      val = val.replace(/^\s+|\s+$/g, '');
      if (!Array.isArray(val)) {
        val = val.split(/[\r\n\t,; ]+/);
      }
      for (let ghsValue of val) {
        ghsValue = String(ghsValue).replace(/[^1-9]/g, '');
        var $img = $('<img>');
        $img.attr({
          src: ghs[ghsValue],
        });
        $img.css({
          height,
        });
        $element.append($img);
      }
    }
  };

  functions.html = {};
  functions.html.toscreen = function ($element, val) {
    $element.html(String(val));
  };

  functions.indicator = {};
  functions.indicator.init = async () => {
    functions.indicator.Color = await asyncRequire('src/util/color');
    var tooltip = $('<div class="ci-tooltip"></div>')
      .css({
        display: 'none',
        opacity: 0,
      })
      .appendTo('#ci-visualizer');
    var current;

    var $modulesGrid = $('#modules-grid');
    $modulesGrid.on('mouseenter', '[data-tooltip]', function (e) {
      current = setTimeout(function () {
        var target = $(e.target);
        var offset = target.offset();
        tooltip
          .css({
            left: offset.left,
            top: offset.top,
            display: 'block',
          })
          .text(target.attr('data-tooltip'));
        tooltip.animate({
          opacity: 1,
        });
      }, 500);
    });

    $modulesGrid.on('mouseleave', '[data-tooltip]', () => {
      clearTimeout(current);
      tooltip.css({
        opacity: 0,
        display: 'none',
      });
    });
  };
  functions.indicator.toscreen = async function ($element, value) {
    if (!Array.isArray(value)) {
      return;
    }
    var html =
      '<table cellpadding="0" cellspacing="0" style="text-align: center; height:100%; width:100%; table-layout: fixed;"><tr>';

    // if the first element of the array is a number ... we need to convert the array.

    // Create a copy of the array
    value = DataObject.resurrect(value);
    value = _.cloneDeep(value);

    if (!isNaN(value[0])) {
      value = value.map(function (value) {
        return { size: value };
      });
    }

    var length = value.length;
    // no color ? we add some ...
    var colors = functions.indicator.Color.getDistinctColors(value.length);
    var totalSize = 0;
    for (let i = 0; i < length; i++) {
      if (!value[i].bgcolor) {
        value[i].bgcolor = functions.indicator.Color.getColor(colors[i]);
      }
      if (!value[i].size && value[i].size !== 0) value[i].size = 10;
      totalSize += value[i].size;
    }

    for (let i = 0; i < length; i++) {
      var element = value[i];
      var span = $('<td></td>').css({
        minHeight: '1px',
        width: `${(100 * element.size) / totalSize}%`,
        border: 'none',
        overflow: 'hidden',
        'max-width': `${(100 * element.size) / totalSize}%`,
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
      });
      if (element.bgcolor) span.css('background-color', element.bgcolor);
      if (element.color) span.css('color', element.color);
      if (element.text) span.append(element.text);
      if (element.class) span.addClass(element.class);
      if (element.icon) span.prepend(`<i class="fa fa-${element.icon}"></i>`);
      if (element.css) span.css(element.css);
      if (element.tooltip) span.attr('data-tooltip', element.tooltip);
      html += span.get(0).outerHTML;
    }
    html += '</tr></table>';
    $element.html(html);
  };

  functions.jcamp = jcampRenderer;

  functions.jme = {};
  functions.jme.toscreen = async function ($element, jme, jmeRoot, options) {
    const Converter = await asyncRequire('lib/chemistry/jme-converter');
    const converted = Converter.toMolfile(String(jme));
    return functions.mol2d.toscreen($element, converted, jmeRoot, options);
  };

  functions.jpath = {};
  functions.jpath.toscreen = function ($element, val) {
    $element.html(val.join('.'));
  };

  functions.latex = {};
  functions.latex.init = async function () {
    const css = Util.loadCss('node_modules/katex/dist/katex.min.css');
    functions.latex.katex = await asyncRequire('katex');
    await css;
  };
  functions.latex.toscreen = function ($element, val, rootVal, options) {
    $element.empty();
    functions.latex.katex.render(String(val), $element[0], options);
  };

  functions.mf = {};
  functions.mf.init = async () => {
    functions.mf.parseToHtml = (await asyncRequire('MFParser')).parseToHtml;
  };
  functions.mf.toscreen = async function ($element, value) {
    if (value) {
      try {
        value = String(value).replace(/([0-9])(-+)/, '$1($2)');

        $element.html(functions.mf.parseToHtml(String(value)));
      } catch {
        $element.html(value.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      }
    } else {
      $element.html('');
    }
  };

  functions.mol2d = {};
  functions.mol2d.toscreen = async function (
    $element,
    molfile,
    molfileRoot,
    options,
  ) {
    const OCL = await asyncRequire(oclUrl);
    const mol = OCL.Molecule.fromMolfile(String(molfile));
    // we will not make rendering of an empty molecule
    if (mol.getAllAtoms() === 0) return '';
    if (mol.getIDCoordinates() === '') {
      mol.inventCoordinates();
    }
    return renderOpenChemLibStructure(true, $element, mol, false, options);
  };
  functions.molfile2d = functions.mol2d;

  functions.mol3d = {};
  functions.mol3d.toscreen = bioPv.bind(functions.pdb, 'mol3d');
  functions.molfile3d = functions.mol3d;

  functions.number = {};
  functions.number.toscreen = function ($element, val, rootVal, options) {
    const number = formatNumber(val, options);
    $element.html(number);
  };

  functions.object = {};
  functions.object.init = async function () {
    functions.object.twig = await asyncRequire('lib/twigjs/twig');
  };
  functions.object.toscreen = function ($element, value, root, options) {
    if (options.twig) {
      const template = functions.object.twig.twig({ data: options.twig });
      const render = template.renderAsync(JSON.parse(JSON.stringify(value)));
      $element.html(render.html);
      render.render();
    } else if (options.toJSON) {
      $element.html(JSON.stringify(value));
    } else {
      $element.html(Object.prototype.toString.call(value));
    }
  };

  functions.oclid = {};
  functions.oclid.init = async () => {
    functions.oclid.OCL = await asyncRequire(oclUrl);
  };
  functions.oclid.toscreen = async ($element, val, root, options) => {
    // not a good idea to check for root.coordinates, it becomes messy with in-place modification
    let coordinates = val.coordinates;
    let oclid = val.value ? val.value : val.idCode ? val.idCode : val;
    if (oclid) oclid = String(oclid);
    if (coordinates) coordinates = String(coordinates);

    if (!coordinates && !val.value) {
      const mol = functions.oclid.OCL.Molecule.fromIDCode(oclid, true);
      coordinates = mol.getIDCoordinates();
      Object.defineProperty(root, 'coordinates', {
        configurable: true,
        enumerable: false,
        value: coordinates,
        writable: true,
      });
    }

    return renderOpenChemLibStructure(
      false,
      $element,
      oclid,
      coordinates,
      options,
    );
  };
  functions.actelionid = functions.oclid;

  functions.openlink = {};
  functions.openlink.toscreen = function ($element, value) {
    $element.html(
      value.replace(
        /^(.*)$/,
        '<a href="$1" target="_blank"><i class="fa fa-external-link-alt"></i></a>',
      ),
    );
  };

  functions.pdb = {};
  functions.pdb.toscreen = bioPv.bind(functions.pdb, 'pdb');

  functions.picture = {};
  functions.picture.toscreen = function (element, val, rootVal, options) {
    var $img = $('<img>');
    $img.attr({
      src: val,
      width: options ? options.width : undefined,
    });
    if (options.css) {
      $img.css(options.css);
    }
    if (options.style) {
      $img.attr('style', options.style);
    }
    element.html($img);
  };
  functions.jpeg = functions.picture;
  functions.jpg = functions.picture;
  functions.gif = functions.picture;
  functions.image = functions.picture;
  functions.png = functions.picture;
  functions.webp = functions.picture;

  functions.qrcode = {};
  functions.qrcode.init = async function () {
    await asyncRequire('components/jquery-qrcode/jquery.qrcode.min');
  };
  functions.qrcode.toscreen = function ($element, val, rootVal, options) {
    options = Object.assign(
      {
        width: 128,
        height: 128,
        text: String(val),
        render: 'table',
      },
      options,
    );
    $element.qrcode(options);
  };

  functions.rxncode = {};
  functions.rxncode.init = async () => {
    functions.rxncode.OCL = await asyncRequire(oclUrl);
    functions.rxncode.RxnRenderer = (
      await asyncRequire('RxnRenderer')
    ).RxnRenderer;
  };
  functions.rxncode.toscreen = async function (
    $element,
    val,
    root,
    options = {},
  ) {
    const { maxWidth = 300, maxHeight = 300 } = options;

    let renderer = new functions.rxncode.RxnRenderer(functions.rxncode.OCL, {
      maxWidth,
      maxHeight,
    });
    let html = renderer.renderRXNCode(DataObject.resurrect(val));
    $element.html(html);
  };

  functions.reaction = {};
  functions.reaction.init = async () => {
    functions.reaction.OCL = await asyncRequire(oclUrl);
    functions.reaction.RxnRenderer = (
      await asyncRequire('RxnRenderer')
    ).RxnRenderer;
  };
  functions.reaction.toscreen = async function (
    $element,
    val,
    root,
    options = {},
  ) {
    const { maxWidth = 300, maxHeight = 300 } = options;

    let renderer = new functions.reaction.RxnRenderer(functions.reaction.OCL, {
      maxWidth,
      maxHeight,
    });
    let html = renderer.render(DataObject.resurrect(val));
    $element.html(html);
  };

  functions.regexp = {};
  functions.regexp.init = async () => {
    functions.regexp.Parser = await asyncRequire('lib/regexper/regexper');
  };
  functions.regexp.toscreen = async function ($element, val) {
    const value = String(val);
    const div = $('<div>').appendTo($element);
    const parser = new functions.regexp.Parser(div.get(0));
    parser.parse(value).invoke('render');
  };

  functions.regex = functions.regexp;

  functions.rxn = {};
  functions.rxn.init = async () => {
    functions.rxn.OCL = await asyncRequire(oclUrl);
    functions.rxn.RxnRenderer = (await asyncRequire('RxnRenderer')).RxnRenderer;
  };
  functions.rxn.toscreen = async function ($element, val, root, options = {}) {
    const { maxWidth = 300, maxHeight = 300 } = options;
    let renderer = new functions.rxn.RxnRenderer(functions.rxn.OCL, {
      maxWidth,
      maxHeight,
    });
    let html = renderer.renderRXN(String(val));
    $element.html(html);
  };

  functions.smiles = {};
  functions.smiles.init = async () => {
    functions.smiles.OCL = await asyncRequire(oclUrl);
  };
  functions.smiles.toscreen = async function ($element, smi, smiRoot, options) {
    const mol = functions.smiles.OCL.Molecule.fromSmiles(String(smi));
    return renderOpenChemLibStructure(true, $element, mol, false, options);
  };

  functions.sparkline = {};
  functions.sparkline.init = async function () {
    await asyncRequire('sparkline');
  };
  functions.sparkline.toscreen = function ($el, val, rootval, options) {
    var defaultOptions = {
      width: options.type === 'discrete' ? 'auto' : '100%',
      height: '100%',
    };
    options = _.defaults(options, defaultOptions);
    $el.sparkline(val, options);
  };

  functions.string = {};
  functions.string.toscreen = function ($element, val, rootVal, options) {
    val = String(val);
    val = val.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (options.search) {
      var search;
      try {
        search = new RegExp(options.search);
      } catch {
        search = options.search;
      }
      val = val.replace(search, options.replace || '');
    }

    if (checkDate(options)) {
      val = toDate(val, options);
    }
    $element.html(val);
  };

  functions.svg = {};
  functions.svg.toscreen = function ($element, val) {
    var dom = $(String(val));
    let width = dom.attr('width');
    let height = dom.attr('height');
    if (width && height) {
      let viewbox = [0, 0, parseInt(width, 10), parseInt(height, 10)];
      dom[0].setAttribute('viewBox', viewbox.join(' '));
    }
    dom.removeAttr('id');
    dom.attr('width', '100%');
    dom.attr('height', '100%');
    dom.css('display', 'block');
    $element.html(dom);
  };

  functions.unit = {};
  functions.unit.init = async function () {
    functions.unit.mathjs = await asyncRequire('mathjs');
  };
  functions.unit.toscreen = async function ($element, val, rootVal, options) {
    if (!val) return;
    let displayValue;
    if (typeof val === 'number') {
      displayValue = formatNumber(val, options);
    } else {
      const stringUnit = val.unit ? String(val.unit) : '';
      let unit = functions.unit.mathjs.unit(stringUnit);
      unit.value = Number(val.SI);

      if (options.format) {
        const str = unit.toString();
        const [number, ...unitParts] = str.split(/\s+/);
        displayValue = `${formatNumber(number, options)} ${unitParts.join(
          ' ',
        )}`;
      } else {
        let number;
        if (options.unit) {
          unit = unit.to(options.unit);
          number = unit.toNumber(options.unit);
        } else {
          number = stringUnit ? unit.toNumber(stringUnit) : unit.value;
        }
        displayValue = `${formatNumber(number, options)} ${
          options.hideUnit ? '' : unit.formatUnits()
        }`;
      }
    }

    $element.html(displayValue);
  };

  functions.valueunits = {};
  functions.valueunits.toscreen = async function (
    $element,
    val,
    rootVal,
    options,
  ) {
    if (!val) return;
    let displayValue;
    if (typeof val === 'number') {
      displayValue = formatNumber(val, options);
    } else {
      displayValue = formatNumber(val.value, options);
      if (val.units && !options.hideUnits) {
        displayValue += ` ${val.units}`;
      }
    }

    $element.html(displayValue);
  };

  const oclUrl = 'openchemlib';
  const defaultOpenChemLibStructureOptions = {
    suppressChiralText: true,
    suppressESR: true,
    suppressCIPParity: true,
    noStereoProblem: true,
  };

  async function renderOpenChemLibStructure(
    isMol,
    $element,
    idcode,
    coordinates,
    options,
  ) {
    const OCL = await asyncRequire(oclUrl);
    options = $.extend({}, defaultOpenChemLibStructureOptions, options);

    if (options.useCanvas) {
      if (isMol) {
        let mol = idcode;
        idcode = mol.getIDCode();
        coordinates = mol.getIDCoordinates();
      }
      const id = Util.getNextUniqueId();
      let h = Math.max(100, $element.height());
      let w = $element.width() > 50 ? $element.width() : 200;
      let can = $('<canvas>', { id });
      let canEl = can.get(0);
      canEl.height = h - 5;
      canEl.width = w;
      $element.html(can);
      OCL.StructureView.drawStructure(
        id,
        String(idcode),
        String(coordinates),
        options,
      );
    } else {
      let mol = idcode;
      if (!isMol) {
        mol = OCL.Molecule.fromIDCode(idcode, coordinates);
      }
      $element.html(
        mol.toSVG(
          options.width || $element.width(),
          options.height || $element.height() - 5,
          null,
          options,
        ),
      );
    }
  }

  async function bioPv(type, element, val, valRoot, options) {
    options = options || {};
    const pv = await asyncRequire('lib/bio-pv/bio-pv.min');
    var div = $('<div style="width:100%; height:100%" />');
    element.html(div);
    var mol;
    if (type === 'pdb') {
      mol = pv.io.pdb(val, { loadAllModels: true });
    } else if (type === 'mol3d') {
      mol = pv.io.sdf(val);
    }
    var viewer = pv.Viewer(div.get(0), {
      width: 0.99 * element.width(),
      height: Math.max(250, element.height() * 0.99),
      quality: 'medium',
    });
    viewer.addListener('viewerReady', function () {
      options.mode = viewer[options.mode] ? options.mode : 'cartoon';
      var id = Util.getNextUniqueId();
      if (type === 'pdb') {
        viewer.clear();
        mol.forEach(function (structure) {
          if (options.mode === 'cartoon') {
            var ligand = structure.select({
              rnames: ['RVP', 'SAH'],
            });
            viewer.ballsAndSticks(`ligand-${id}`, ligand);
          }
          viewer[options.mode](id, structure);
          viewer.autoZoom();
        });
      } else if (type === 'mol3d') {
        viewer.ballsAndSticks(id, mol);
      }
      viewer.fitTo(mol);
      element.on('remove', remove);
      function remove() {
        viewer.destroy();
        element.off('remove');
      }
    });
  }

  functions.gradient = {};
  functions.gradient.init = async function () {
    functions.gradient.colorbar = await asyncRequire('src/util/colorbar');
  };
  functions.gradient.toscreen = function ($element, value, root, options) {
    var defaultColorBar = {
      domain: [0, 1],
      stopType: 'values',
    };
    var colorBar = Object.assign({}, defaultColorBar, value, options);
    colorBar.stops = colorBar.stops || colorBar.color;
    colorBar.stopPositions = colorBar.stopPositions || colorBar.x;
    colorBar.width = $element.width();
    colorBar.height = $element.height();

    $element.html('');
    functions.gradient.colorbar.renderSvg($element[0], colorBar);
  };

  function checkDate(options) {
    return (
      Object.hasOwn(options, 'dateFormat') ||
      Object.hasOwn(options, 'dateFromNow') ||
      Object.hasOwn(options, 'dateCalendar')
    );
  }

  function toDate(value, options) {
    if (options.dateFormat) {
      return moment(value).format(options.dateFormat);
    } else if (options.dateFromNow) {
      return moment(value).fromNow();
    } else if (options.dateCalendar) {
      return moment(value).calendar();
    }
  }

  function formatNumber(val, options) {
    var number = Number(val);
    if (
      (val === undefined || val === null || isNaN(number)) &&
      Object.hasOwn(options, 'hideUndefined')
    ) {
      return '';
    } else if (number === 0 && Object.hasOwn(options, 'hideZero')) {
      return '';
    } else if (isNaN(number)) {
      return 'NaN';
    } else if (Object.hasOwn(options, 'duration')) {
      return moment.duration(number).as(options.duration);
    } else if (Object.hasOwn(options, 'durationS')) {
      return moment.duration(number * 1000).as(options.durationS);
    } else if (Object.hasOwn(options, 'toPrecision')) {
      return number.toPrecision(options.toPrecision);
    } else if (Object.hasOwn(options, 'toExponential')) {
      return number.toExponential(options.toExponential);
    } else if (Object.hasOwn(options, 'toFixed')) {
      return number.toFixed(options.toFixed);
    } else if (Object.hasOwn(options, 'numeral')) {
      return numeral(number).format(options.numeral);
    } else if (Object.hasOwn(options, 'sprintf')) {
      return sprintf.sprintf(options.sprintf, number);
    } else if (checkDate(options)) {
      return toDate(number, options);
    }
    return number;
  }

  const typeInit = new Map();
  const renderingMap = new WeakMap();

  async function _render($element, object, options) {
    if (object == undefined) {
      $element.html('');
      return;
    }
    let value = await object.get(true);
    let type;
    if (options && options.forceType) {
      if (value && value.value && value.type) {
        value = value.value;
      }
      type = options.forceType.toLowerCase();
    } else {
      type = object.getType().toLowerCase();
    }
    if (!functions[type]) {
      Util.warnOnce(
        `no-typerenderer-${type}`,
        `No renderer found for type ${type}`,
      );
      $element.html(String(value));
      return;
    }

    options = $.extend(options, object._options);
    if (options.backgroundColor) {
      $element.css('background-color', options.backgroundColor);
    }
    let init = typeInit.get(type);
    if (!init) {
      if (typeof functions[type].init === 'function') {
        init = functions[type].init();
      } else {
        init = true;
      }
      typeInit.set(type, init);
    }

    await init;
    return functions[type].toscreen($element, value, object, options);
  }

  async function _renderAsString(object, options) {
    if (object == undefined) {
      return '';
    }
    let value = object.get ? await object.get(true) : object;
    let type;
    if (options && options.forceType) {
      if (value && value.value && value.type) {
        value = value.value;
      }
      type = options.forceType.toLowerCase();
    } else {
      type = object.getType ? object.getType().toLowerCase() : typeof object;
    }

    switch (type) {
      case 'smiles':
      case 'color':
      case 'mf':
      case 'boolean':
        return value;
      case 'png':
      case 'gif':
      case 'jpg':
      case 'jpeg':
      case 'image':
      case 'webp':
        return type;
    }

    if (!functions[type]) {
      Util.warnOnce(
        `no-typerenderer-${type}`,
        `No renderer found for type ${type}`,
      );
      return value;
    }

    options = $.extend(options, object._options);
    let init = typeInit.get(type);
    if (!init) {
      if (typeof functions[type].init === 'function') {
        init = functions[type].init();
      } else {
        init = true;
      }
      typeInit.set(type, init);
    }

    await init;

    let renderedValue = '';
    const $element = {
      html: (value) => (renderedValue = value),
    };

    await functions[type].toscreen($element, value, object, options);

    return renderedValue;
  }

  return {
    renderAsString(object, options = {}) {
      return _renderAsString(object, options);
    },
    render(element, object, jpath, options = {}) {
      if (typeof jpath === 'object' && !Array.isArray(jpath)) {
        options = jpath;
        jpath = null;
      }
      var renderingPromise;
      if (renderingMap.has(element)) {
        renderingPromise = renderingMap.get(element);
      } else {
        renderingPromise = Promise.resolve();
      }
      var $element = $(element);
      object = DataObject.check(object, true);
      var callback = () => {
        if (jpath) {
          return object.getChild(jpath).then(function (child) {
            return _render($element, child, options);
          });
        } else {
          return _render($element, object, options);
        }
      };

      renderingPromise = renderingPromise.then(callback, callback);
      renderingMap.set(element, renderingPromise);
      return renderingPromise;
    },
    addType(name, renderer) {
      functions[name.toLowerCase()] = renderer;
    },

    getRendererComboOptions() {
      return Object.keys(functions)
        .sort()
        .map((k) => ({ key: k, title: k }));
    },

    getList() {
      return Object.keys(functions).sort();
    },

    hasType(name) {
      return !!functions[name.toLowerCase()];
    },
  };
});
