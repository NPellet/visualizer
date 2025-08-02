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
      val = val.slice(0, 1).toUpperCase() + val.slice(1);
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
    const {
      title = 'Download resource',
      className = 'fa fa-download',
      filename = '',
    } = options;

    $element.html(
      `<a class="${className}"${
        filename ? ` download="${filename}"` : ''
      } title="${title}" target="_blank" href="${value}"></a>`,
    );
  };

  functions.zenodo = {};
  functions.zenodo.toscreen = function ($element, url, root, options) {
    const { title, size = 20 } = options;

    const svg = `<svg preserveAspectRatio="xMidYMid meet" 
    style="width:${size}px; height:${size}px;"
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51 51">
      <path
        fill="#2f6fa7"
        d="m 28.324,20.044 c -0.043,-0.106 -0.084,-0.214 -0.131,-0.32 -0.707,-1.602 -1.656,-2.997 -2.848,-4.19 -1.188,-1.187 -2.582,-2.125 -4.184,-2.805 -1.605,-0.678 -3.309,-1.02 -5.104,-1.02 -1.85,0 -3.564,0.342 -5.137,1.02 -1.467,0.628 -2.764,1.488 -3.91,2.552 V 14.84 c 0,-1.557 -1.262,-2.822 -2.82,-2.822 h -19.775 c -1.557,0 -2.82,1.265 -2.82,2.822 0,1.559 1.264,2.82 2.82,2.82 h 15.541 l -18.23,24.546 c -0.362,0.487 -0.557,1.077 -0.557,1.682 v 1.841 c 0,1.558 1.264,2.822 2.822,2.822 H 5.038 c 1.488,0 2.705,-1.153 2.812,-2.614 0.932,0.743 1.967,1.364 3.109,1.848 1.605,0.684 3.299,1.021 5.102,1.021 2.723,0 5.15,-0.726 7.287,-2.187 1.727,-1.176 3.092,-2.639 4.084,-4.389 0.832799,-1.472094 1.418284,-2.633352 1.221889,-3.729182 -0.173003,-0.965318 -0.694914,-1.946419 -2.326865,-2.378358 -0.58,0 -1.376024,0.17454 -1.833024,0.49254 -0.463,0.316 -0.793,0.744 -0.982,1.275 l -0.453,0.93 c -0.631,1.365 -1.566,2.443 -2.809,3.244 -1.238,0.803 -2.633,1.201 -4.188,1.201 -1.023,0 -2.004,-0.191 -2.955,-0.579 -0.941,-0.39 -1.758,-0.935 -2.439,-1.64 C 9.986,40.343 9.441,39.526 9.027,38.603 8.617,37.679 8.41,36.71 8.41,35.687 v -2.476 h 17.715 c 0,0 1.517774,-0.15466 2.183375,-0.770672 0.958496,-0.887085 0.864622,-2.15038 0.864622,-2.15038 0,0 -0.04354,-5.066834 -0.338376,-7.578154 C 28.729048,21.812563 28.324,20.044 28.324,20.044 Z M -11.767,42.91 2.991,23.036 C 2.913,23.623 2.87,24.22 2.87,24.827 v 10.86 c 0,1.799 0.35,3.498 1.059,5.104 0.328,0.752 0.719,1.458 1.156,2.119 -0.016,0 -0.031,-10e-4 -0.047,-10e-4 H -11.767 Z M 23.71,27.667 H 8.409 v -2.841 c 0,-1.015 0.189,-1.99 0.58,-2.912 0.391,-0.922 0.936,-1.74 1.645,-2.444 0.697,-0.703 1.516,-1.249 2.438,-1.641 0.922,-0.388 1.92,-0.581 2.99,-0.581 1.02,0 2.002,0.193 2.949,0.581 0.949,0.393 1.764,0.938 2.441,1.641 0.682,0.704 1.225,1.521 1.641,2.444 0.414,0.922 0.617,1.896 0.617,2.912 z"
        transform="translate(20.35 -4.735)"
        class="colorfff svgShape"
      ></path>
    </svg>
`;

    $element.html(
      `<a title="${title || url}" target="_blank" href="${url}"
   >
      ${svg}
   </a>`,
    );
  };

  functions.orcid = {};
  functions.orcid.toscreen = function ($element, value, root, options) {
    const { title, size = 20 } = options;

    value = value.replace(/^.*\//, '');
    if (value.startsWith('/')) {
      value = value.slice(1);
    }

    const url = `https://orcid.org/${value}`;
    const svg = `<svg preserveAspectRatio="xMidYMid meet" 
    style="width:${size}px; height:${size}px;"
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<style type="text/css">
	.st0{fill:#A6CE39;}
	.st1{fill:#FFFFFF;}
</style>
<path class="st0" d="M256,128c0,70.7-57.3,128-128,128C57.3,256,0,198.7,0,128C0,57.3,57.3,0,128,0C198.7,0,256,57.3,256,128z"/>
<g>
	<path class="st1" d="M86.3,186.2H70.9V79.1h15.4v48.4V186.2z"/>
	<path class="st1" d="M108.9,79.1h41.6c39.6,0,57,28.3,57,53.6c0,27.5-21.5,53.6-56.8,53.6h-41.8V79.1z M124.3,172.4h24.5
		c34.9,0,42.9-26.5,42.9-39.7c0-21.5-13.7-39.7-43.7-39.7h-23.7V172.4z"/>
	<path class="st1" d="M88.7,56.8c0,5.5-4.5,10.1-10.1,10.1c-5.6,0-10.1-4.6-10.1-10.1c0-5.6,4.5-10.1,10.1-10.1
		C84.2,46.7,88.7,51.3,88.7,56.8z"/>
</g>
</svg>`;

    $element.html(
      `<a title="${title || value}" target="_blank" href="${url}"
   >
      ${svg}
   </a>`,
    );
  };

  functions.doi = {};
  functions.doi.toscreen = function ($element, value, root, options) {
    const { title, size = 20 } = options;

    value = value.replace(/^.*doi.org\//, '');
    if (value.startsWith('/')) {
      value = value.slice(1);
    }

    const url = `https://doi.org/${value}`;
    const svg = `<svg preserveAspectRatio="xMidYMid meet" 
    style="width:${size}px; height:${size}px;"
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130">
<circle style="fill:#fcb425" cx="65" cy="65" r="64"/>
<path style="fill:#231f20" d="m 49.819127,84.559148 -11.854304,0 0,-4.825665 c -1.203594,1.510894 -4.035515,3.051053 -5.264716,3.742483 -2.151101,1.203585 -5.072066,1.987225 -7.812161,1.987225 -4.430246,0 -8.373925,-1.399539 -11.831057,-4.446924 -4.1229464,-3.636389 -6.0602455,-9.19576 -6.0602455,-15.188113 0,-6.094791 2.1126913,-10.960381 6.3380645,-14.59676 3.354695,-2.893745 7.457089,-5.209795 11.810505,-5.209795 2.535231,0 5.661807,0.227363 7.889738,1.302913 1.280414,0.614601 3.572628,2.060721 4.929872,3.469179 l 0,-25.420177 11.854304,0 z m -12.1199,-18.692584 c 0,-2.253538 -0.618258,-4.951555 -2.205973,-6.513663 -1.587724,-1.587724 -4.474153,-2.996182 -6.727691,-2.996182 -2.509615,0 -4.834476,1.825511 -6.447807,3.720535 -1.306031,1.536501 -1.959041,3.905269 -1.959041,5.877114 0,1.971835 0.740815,4.165004 2.046836,5.701505 1.587714,1.895025 3.297985,3.193739 5.833216,3.193739 2.279145,0 4.989965,-0.956662 6.552083,-2.51877 1.587714,-1.562108 2.908377,-4.185134 2.908377,-6.464278 z"/>
<path style="fill:#fff" d="m 105.42764,25.617918 c -1.97184,0 -3.64919,0.69142 -5.03204,2.074271 -1.357247,1.357245 -2.035864,3.021779 -2.035864,4.993633 0,1.971835 0.678617,3.649193 2.035864,5.032034 1.38285,1.382861 3.0602,2.074281 5.03204,2.074281 1.99744,0 3.67479,-0.678627 5.03203,-2.035861 1.38285,-1.382861 2.07428,-3.073012 2.07428,-5.070454 0,-1.971854 -0.69143,-3.636388 -2.07428,-4.993633 -1.38285,-1.382851 -3.0602,-2.074271 -5.03203,-2.074271 z M 74.219383,45.507921 c -7.323992,0 -12.970625,2.283009 -16.939921,6.848949 -3.277876,3.782438 -4.916803,8.118252 -4.916803,13.008406 0,5.430481 1.626124,10.009834 4.878383,13.738236 3.943689,4.538918 9.475093,6.808622 16.59421,6.808622 7.093512,0 12.612122,-2.269704 16.555801,-6.808622 3.252259,-3.728402 4.878393,-8.1993 4.878393,-13.413648 0,-5.160323 -1.638938,-9.604602 -4.916803,-13.332994 -4.020509,-4.56594 -9.398263,-6.848949 -16.13326,-6.848949 z m 24.908603,1.386686 0,37.634676 12.599304,0 0,-37.634676 -12.599304,0 z M 73.835252,56.975981 c 2.304752,0 4.263793,0.852337 5.877124,2.554426 1.638928,1.675076 2.458402,3.727881 2.458402,6.159457 0,2.458578 -0.806671,4.538022 -2.419992,6.240111 -1.613331,1.675086 -3.585175,2.514099 -5.915534,2.514099 -2.612051,0 -4.737546,-1.027366 -6.376474,-3.080682 -1.331637,-1.648053 -1.997451,-3.539154 -1.997451,-5.673528 0,-2.107362 0.665814,-3.985138 1.997451,-5.633201 1.638928,-2.053316 3.764423,-3.080682 6.376474,-3.080682 z"/>
</svg>`;
    $element.html(
      `<a title="${title || value}" target="_blank" href="${url}"
   >
      ${svg}
   </a>`,
    );
  };

  functions.elecconfig = {};
  functions.elecconfig.toscreen = function ($element, value) {
    if (value) {
      $element.html(value.replaceAll(/([a-z])([0-9]+)/g, '$1<sup>$2</sup>'));
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
      val = val.replaceAll(/^\s+|\s+$/g, '');
      if (!Array.isArray(val)) {
        val = val.split(/[\r\n\t,; ]+/);
      }
      for (let ghsValue of val) {
        ghsValue = String(ghsValue).replaceAll(/[^1-9]/g, '');
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
      if (value[i].size === 0 && value[i].size > 0) value[i].size = 10;
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
    const { parseToHtml } = await asyncRequire('MFParser');
    functions.mf.parseToHtml = parseToHtml;
  };
  functions.mf.toscreen = async function ($element, value) {
    if (value) {
      try {
        value = String(value).replace(/([0-9])(-+)/, '$1($2)');

        $element.html(functions.mf.parseToHtml(String(value)));
      } catch {
        $element.html(value.replaceAll('<', '&lt;').replaceAll('>', '&gt;'));
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
  functions.object.toscreen = function ($element, value, root, options = {}) {
    const { twig, twigVariableName, toJSON } = options;

    if (twig) {
      const template = functions.object.twig.twig({ data: twig });
      value = JSON.parse(JSON.stringify(value));
      if (twigVariableName) {
        value[twigVariableName] = value;
      }
      const render = template.renderAsync(value);
      $element.html(render.html);
      render.render();
    } else if (toJSON) {
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
    let oclid = val.value || val.idCode || val;
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
  functions.openlink.toscreen = function ($element, value, rootVal, options) {
    const { title = 'Open link', className = 'fa fa-external-link-alt' } =
      options;

    $element.html(
      `<a class="${className}"
               title="${title}" target="_blank" href="${value}"></a>`,
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
    const { RxnRenderer } = await asyncRequire('RxnRenderer');
    functions.rxncode.RxnRenderer = RxnRenderer;
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
    const { RxnRenderer } = await asyncRequire('RxnRenderer');
    functions.reaction.RxnRenderer = RxnRenderer;
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
    const { RxnRenderer } = await asyncRequire('RxnRenderer');
    functions.rxn.RxnRenderer = RxnRenderer;
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
    val = val.replaceAll('<', '&lt;').replaceAll('>', '&gt;');

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
      let viewbox = [
        0,
        0,
        Number.parseInt(width, 10),
        Number.parseInt(height, 10),
      ];
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
        for (const structure of mol) {
          if (options.mode === 'cartoon') {
            var ligand = structure.select({
              rnames: ['RVP', 'SAH'],
            });
            viewer.ballsAndSticks(`ligand-${id}`, ligand);
          }
          viewer[options.mode](id, structure);
          viewer.autoZoom();
        }
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
