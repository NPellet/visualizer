'use strict';

define([
    'require',
    'jquery',
    'lodash',
    'moment',
    'numeral',
    'sprintf',
    './api',
    './util',
    './typerenderer/chart'
], function (require, $, _, moment, numeral, sprintf, API, Util, chartRenderer) {

    var functions = {};
    var countryData;

    functions.country = {};
    functions.country.init = function () {
        var prom = [];
        prom.push(Util.loadCss('components/flag-icon-css/css/flag-icon.min.css'));
        prom.push(new Promise(function (resolve) {
            require(['browserified/country-data/index.js'], resolve);
        }));

        return Promise.all(prom).then(data => {
            countryData = data[1];
        });
    };
    functions.country.toscreen = function ($element, val, rootVal, options) {
        val = String(val);
        var country;
        if (val.length === 2) {
            val = val.toUpperCase();
            country = countryData.lookup.countries({alpha2: val})[0];
        } else if (val.length === 3) {
            val = val.toUpperCase();
            country = countryData.lookup.countries({alpha3: val})[0];
        } else {
            val = val.slice(0, 1).toUpperCase() + val.slice(1, val.length);
            country = countryData.lookup.countries({name: val})[0];
        }
        if (country) {
            $element.html(`<span title="${country.name}" class="flag-icon flag-icon-${country.alpha2.toLowerCase()}"></span>`);
        } else {
            $element.html(val);
        }
    };

    functions.qrcode = {};
    functions.qrcode.init = function () {
        return new Promise(function (resolve) {
            require(['components/qrcode.js/qrcode'], resolve);
        });
    };
    functions.qrcode.toscreen = function ($element, val, rootVal, options) {
        var l = Math.min($element.width(), $element.height());
        var defaultOptions = {
            width: l,
            height: l,
            text: String(val)
        };

        new window.QRCode($element[0], Object.assign(defaultOptions, options));
    };

    functions.barcode = {};
    functions.barcode.init = function () {
        return new Promise(function (resolve) {
            require(['jsbarcode'], resolve);
        });
    };

    functions.barcode.toscreen = function ($element, val, rootVal, options) {
        var defaultOptions = {
            format: 'CODE128'
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

    functions.sparkline = {};
    functions.sparkline.init = function () {
        return new Promise(function (resolve) {
            require(['sparkline'], resolve);
        });
    };
    functions.sparkline.toscreen = function ($el, val, rootval, options) {
        var defaultOptions = {
            width: (options.type === 'discrete' ? 'auto' : '100%'),
            height: '100%'
        };
        options = _.defaults(options, defaultOptions);
        $el.sparkline(val, options);
    };

    functions.string = {};
    functions.string.toscreen = function ($element, val, rootVal, options) {
        val = String(val);
        val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (checkDate(options)) {
            val = toDate(val, options);
        }
        $element.html(val);
    };

    functions.html = {};
    functions.html.toscreen = function ($element, val) {
        $element.html(String(val));
    };

    functions.date = {};
    functions.date.toscreen = function ($element, val) {
        try {
            var d = new Date(val);
            $element.html(d.toLocaleString());
        } catch (e) {
            $element.html('Invalid date');
        }
    };

    functions.color = {};
    functions.color.toscreen = function ($element, val) {
        var result = '<div style="background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==); width:100%; height:100%">' +
            '<div style="background-color: ' + val + '; width: 100%; height:100%; padding:0; margin:0">&nbsp;</div></div>';
        $element.html(result);
    };

    function checkDate(options) {
        return options.hasOwnProperty('dateFormat')
            || options.hasOwnProperty('dateFromNow')
            || options.hasOwnProperty('dateCalendar');
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

    functions.number = {};
    functions.number.toscreen = function ($element, val, rootVal, options) {
        var number = Number(val);
        if (isNaN(number)) {
            number = 'NaN';
        } else if (options.hasOwnProperty('toPrecision')) {
            number = number.toPrecision(options.toPrecision);
        } else if (options.hasOwnProperty('toFixed')) {
            number = number.toFixed(options.toFixed);
        } else if (options.hasOwnProperty('numeral')) {
            number = numeral(number).format(options.numeral);
        } else if (options.hasOwnProperty('sprintf')) {
            number = sprintf.sprintf(options.sprintf, number);
        } else if (checkDate(options)) {
            number = toDate(number, options);
        }
        $element.html(number);
    };

    functions.picture = {};
    functions.picture.toscreen = function (element, val, rootVal, options) {
        var $img = $('<img>');
        $img.attr({
            src: val,
            width: options ? options.width : undefined
        });
        if (options.css) {
            $img.css(options.css);
        }
        element.html($img);
    };

    functions.gif = functions.picture;
    functions.jpeg = functions.picture;
    functions.jpg = functions.picture;
    functions.png = functions.picture;
    functions.webp = functions.picture;
    functions.image = functions.picture;

    functions.svg = {};
    functions.svg.toscreen = function ($element, val) {
        var dom = $(String(val));
        var viewbox = [0, 0, parseInt(dom.attr('width')), parseInt(dom.attr('height'))];
        dom[0].setAttribute('viewBox', viewbox.join(' '));
        dom.removeAttr('id');
        dom.attr('width', '100%');
        dom.attr('height', '100%');
        dom.css('display', 'block');
        $element.html(dom);
    };

    functions.doi = {};
    functions.doi.toscreen = function ($element, value) {
        return $element.html(value.replace(/^(.*)$/, '<a target="_blank" href="http://dx.doi.org/$1"><img src="bin/logo/doi.png" /></a>'));
    };

    var OCL = 'openchemlib/openchemlib-viewer';
    var defaultOpenChemLibStructureOptions = {
        suppressChiralText: true,
        suppressESR: true,
        suppressCIPParity: true,
        noStereoProblem: true
    };

    function renderOpenChemLibStructure($element, idcode, coordinates, options) {
        return new Promise(function (resolve) {
            options = $.extend({}, defaultOpenChemLibStructureOptions, options);
            require([OCL], function (ACT) {
                var id = Util.getNextUniqueId();
                var h = Math.max(100, $element.height()), w = $element.width();
                var can = $('<canvas>', {id: id});
                var canEl = can.get(0);
                canEl.height = h - 3;
                canEl.width = w;
                $element.html(can);
                ACT.StructureView.drawStructure(id, String(idcode), String(coordinates), options);
                resolve();
            });
        });
    }

    functions.jme = {};
    functions.jme.toscreen = function ($element, jme, jmeRoot, options) {
        return new Promise(function (resolve) {
            require(['lib/chemistry/jme-converter'], function (Converter) {
                var converted = Converter.toMolfile(String(jme));
                resolve(functions.mol2d.toscreen($element, converted, jmeRoot, options));
            });
        });
    };

    functions.smiles = {};
    functions.smiles.toscreen = function ($element, smi, smiRoot, options) {
        return new Promise(function (resolve) {
            require([OCL], function (ACT) {
                var mol = ACT.Molecule.fromSmiles(String(smi));
                resolve(renderOpenChemLibStructure($element, mol.getIDCode(), mol.getIDCoordinates(), options));
            });
        });
    };

    functions.oclid = {};
    functions.oclid.toscreen = function ($element, val, root, options) {
        return new Promise(function (resolve) {
            require([OCL], function (ACT) {
                if (!root.coordinates) {
                    var value = String(root.value);
                    var mol = ACT.Molecule.fromIDCode(String(value), true);
                    Object.defineProperty(root, 'coordinates', {
                        configurable: true,
                        enumerable: false,
                        value: mol.getIDCoordinates(),
                        writable: true
                    });
                }
                resolve(renderOpenChemLibStructure($element, String(root.value), String(root.coordinates), options));
            });
        });
    };
    functions.actelionid = functions.oclid;

    functions.mol2d = {};
    functions.mol2d.toscreen = function ($element, molfile, molfileRoot, options) {
        return new Promise(function (resolve) {
            require([OCL], function (ACT) {
                var mol = ACT.Molecule.fromMolfile(String(molfile));
                resolve(renderOpenChemLibStructure($element, mol.getIDCode(), mol.getIDCoordinates(), options));
            });
        });
    };

    functions.molfile2d = functions.mol2d;

    functions.mf = {};
    functions.mf.toscreen = function ($element, value) {
        if (value) {
            $element.html(value.replace(/\[([0-9]+)/g, '[<sup>$1</sup>').replace(/([a-zA-Z)])([0-9]+)/g, '$1<sub>$2</sub>').replace(/\(([0-9+-]+)\)/g, '<sup>$1</sup>'));
        } else {
            $element.html('');
        }

    };

    function bioPv(type, element, val, valRoot, options) {
        options = options || {};
        return new Promise(function (resolve) {
            require(['lib/bio-pv/bio-pv.min'], function (pv) {
                var div = $('<div style="width:100%; height:100%" />');
                element.html(div);
                var mol;
                if (type === 'pdb') {
                    mol = pv.io.pdb(val, {loadAllModels: true});
                } else if (type === 'mol3d') {
                    mol = pv.io.sdf(val);
                }
                var viewer = pv.Viewer(div.get(0), {
                    width: 0.99 * element.width(),
                    height: Math.max(250, element.height() * 0.99),
                    quality: 'medium'
                });
                viewer.addListener('viewerReady', function () {
                    options.mode = viewer[options.mode] ? options.mode : 'cartoon';
                    var id = Util.getNextUniqueId();
                    if (type === 'pdb') {
                        viewer.clear();
                        mol.forEach(function (structure) {
                            if (options.mode === 'cartoon') {
                                var ligand = structure.select({rnames: ['RVP', 'SAH']});
                                viewer.ballsAndSticks('ligand-' + id, ligand);
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
                resolve();
            });
        });
    }

    functions.pdb = {};
    functions.pdb.toscreen = bioPv.bind(functions.pdb, 'pdb');

    functions.mol3d = {};
    functions.mol3d.toscreen = bioPv.bind(functions.pdb, 'mol3d');

    functions.molfile3d = functions.mol3d;

    functions.downloadlink = {};
    functions.downloadlink.toscreen = function ($element, value) {
        $element.html(value.replace(/^(.*)$/, '<a download href="$1">⤵</a>'));
    };

    functions.openlink = {};
    functions.openlink.toscreen = function ($element, value) {
        $element.html(value.replace(/^(.*)$/, '<a href="$1" target="_blank"><i class="fa fa-external-link"></i></a>'));
    };

    functions.boolean = {};
    functions.boolean.toscreen = function ($element, value) {
        if (value)
            $element.html('<span style="color: green;">&#10004;</span>');
        else
            $element.html('<span style="color: red;">&#10008;</span>');
    };

    functions.colorbar = {};
    functions.colorbar.toscreen = function ($element, value) {

        var div = $('<div>&nbsp;</div>');
        var gradient = 'linear-gradient(to right';

        var total = 0, i = 0, l = value.length;
        for (; i < l; total += value[i++][0]);

        var start = 0, end, color;
        for (i = 0; i < l; i++) {
            end = start + value[i][0] / total * 100;
            color = value[i][1];
            gradient += ', ' + color + ' ' + start + '%, ' + color + ' ' + end + '%';
            start = end;
        }
        gradient += ')';

        div.css({
            height: '100%',
            width: '100%'
        })/*.css('background','-webkit-'+gradient).css('background','-moz-'+gradient)*/.css('background', gradient);
        $element.html(div);
    };

    functions.indicator = {};
    functions.indicator.init = function () {

        var tooltip = $('<div class="ci-tooltip"></div>').css({
            display: 'none',
            opacity: 0
        }).appendTo('#ci-visualizer');
        var current;

        var $modulesGrid = $('#modules-grid');
        $modulesGrid.on('mouseenter', '[data-tooltip]', function (e) {
            current = setTimeout(function () {
                var target = $(e.target);
                var offset = target.offset();
                tooltip.css({
                    left: offset.left,
                    top: offset.top,
                    display: 'block'
                }).text(target.attr('data-tooltip'));
                tooltip.animate({
                    opacity: 1
                });
            }, 500);
        });

        $modulesGrid.on('mouseleave', '[data-tooltip]', function (e) {
            clearTimeout(current);
            tooltip.css({
                opacity: 0,
                display: 'none'
            });
        });

    };
    functions.indicator.toscreen = function ($element, value) {
        return new Promise(function (resolve) {
            require(['src/util/color'], function (Color) {
                if (!Array.isArray(value)) {
                    return resolve();
                }
                var html = '<table cellpadding="0" cellspacing="0" style="text-align: center; height:100%; width:100%; table-layout: fixed;"><tr>';

                // if the first element of the array is a number ... we need to convert the array.

                // Create a copy of the array
                value = DataObject.resurrect(value);
                value = _.cloneDeep(value);

                if (!isNaN(value[0])) {
                    value = value.map(function (value) {
                        return {'size': value};
                    });
                }

                var length = value.length;
                // no color ? we add some ...
                var colors = Color.getDistinctColors(value.length);
                var totalSize = 0;
                for (var i = 0; i < length; i++) {
                    if (!value[i].bgcolor) value[i].bgcolor = Color.getColor(colors[i]);
                    if (!value[i].size && value[i].size !== 0) value[i].size = 10;
                    totalSize += value[i].size;
                }


                for (var i = 0; i < length; i++) {
                    var element = value[i];
                    var span = $('<td>&nbsp;</td>').css({
                        'width': (100 * element.size / totalSize) + '%',
                        'border': 'none',
                        overflow: 'hidden',
                        'max-width': (100 * element.size / totalSize) + '%',
                        'white-space': 'nowrap',
                        'text-overflow': 'ellipsis'
                    });
                    if (element.bgcolor)
                        span.css('background-color', element.bgcolor);
                    if (element.color)
                        span.css('color', element.color);
                    if (element.text)
                        span.append(element.text);
                    if (element.class)
                        span.addClass(element.class);
                    if (element.icon)
                        span.prepend('<i class="fa fa-' + element.icon + '"></i>');
                    if (element.css)
                        span.css(element.css);
                    if (element.tooltip)
                        span.attr('data-tooltip', element.tooltip);
                    html += span.get(0).outerHTML;
                }
                html += '</tr></table>';
                $element.html(html);
                resolve();
            });
        });
    };

    functions.regexp = {};
    functions.regexp.toscreen = function ($element, val) {
        var value = String(val);
        return new Promise(function (resolve) {
            require(['lib/regexper/regexper'], function (Parser) {
                var div = $('<div>').appendTo($element);
                var parser = new Parser(div.get(0));
                parser.parse(value).invoke('render');
                resolve();
            });
        });
    };

    functions.regex = functions.regexp;

    functions.object = {};
    functions.object.init = function () {
        return new Promise(resolve => {
            require(['lib/twigjs/twig'], function (twig) {
                functions.object.twig = twig;
                resolve();
            });
        });
    };
    functions.object.toscreen = function ($element, value, root, options) {
        if (options.twig) {
            const template = functions.object.twig.twig({data: options.twig});
            const render = template.renderAsync(value);
            $element.html(render.html);
            render.render();
        } else {
            $element.html(Object.prototype.toString.call(value));
        }
    };

    functions.chart = chartRenderer;

    //TODO replace with a Map when more browsers are supported
    var typeInit = {};

    function _render($element, object, options) {
        if (object == undefined) {
            $element.html('');
            return Promise.resolve();
        }

        return Promise.resolve(object.get(true)).then(function (value) {
            var type = object.getType().toLowerCase();
            if (!functions[type]) {
                Util.warnOnce('no-typerenderer-' + type, 'No renderer found for type ' + type);
                $element.html(String(value));
                return;
            }

            options = $.extend(options, object._options);
            if (options.backgroundColor) {
                $element.css('background-color', options.backgroundColor);
            }
            var init = typeInit[type];
            if (!init) {
                if (typeof functions[type].init === 'function') {
                    init = Promise.resolve(functions[type].init());
                } else {
                    init = Promise.resolve();
                }
                typeInit[type] = init;
            }

            return init.then(function () {
                return functions[type].toscreen($element, value, object, options);
            });
        });
    }

    return {
        render: function (element, object, jpath, options) {
            if (typeof jpath === 'object' && !Array.isArray(jpath)) {
                options = jpath;
                jpath = null;
            }
            var $element = $(element);
            object = DataObject.check(object, true);
            if (jpath) {
                return object.getChild(jpath).then(function (child) {
                    return _render($element, child, options);
                });
            } else {
                return _render($element, object, options);
            }
        },
        addType: function (name, renderer) {
            functions[name] = renderer;
        }
    };

});
