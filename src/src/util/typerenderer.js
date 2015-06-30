'use strict';

define(['require', 'jquery', 'lodash', 'src/util/api', 'src/util/util'], function (require, $, _, API, Util) {
    Util.loadCss('components/font-awesome/css/font-awesome.min.css');

    var functions = {};

    //functions.mathjax = {};
    //
    //functions.mathjax.init = function() {
    //    return new Promise(function(resolve, reject) {
    //        require(['mathjax'], resolve);
    //    });
    //};
    //
    //functions.mathjax.toscreen = function($el, val, rootval, options) {
    //    var div;
    //    if(val instanceof Array) {
    //        div = MathJax.HTML.Element(
    //            'div',
    //            val
    //        );
    //    }
    //    else {
    //        div = val;
    //    }
    //
    //    $el.html(val);
    //
    //    MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
    //};

    functions.sparkline = {};
    functions.sparkline.init = function () {
        return new Promise(function (resolve, reject) {
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
    functions.string.toscreen = function (element, val) {
        val = String(val);
        val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        element.html(val);
    };

    functions.html = {};
    functions.html.toscreen = function (element, val) {
        element.html(String(val));
    };

    functions.date = {};
    functions.date.toscreen = function (element, val) {
        try {
            var d = new Date(val);
            element.html(d.toLocaleString());
        } catch (e) {
            element.html('Invalid date');
        }
    };

    functions.color = {};
    functions.color.toscreen = function (element, val) {
        var result = '<div style="background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==); width:100%; height:100%">' +
            '<div style="background-color: ' + val + '; width: 100%; height:100%; padding:0; margin:0">&nbsp;</div></div>';
        element.html(result);
    };

    functions.number = {};
    functions.number.toscreen = function (element, val, rootVal, options) {
        var number = Number(val);
        if (isNaN(number)) {
            number = 'NaN';
        } else if (options.hasOwnProperty('toPrecision')) {
            number = number.toPrecision(options.toPrecision);
        } else if (options.hasOwnProperty('toFixed')) {
            number = number.toFixed(options.toFixed);
        }
        element.html(number);
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

    functions.svg = {};
    functions.svg.toscreen = function (element, val) {
        var dom = $(String(val));
        var viewbox = [0, 0, parseInt(dom.attr('width')), parseInt(dom.attr('height'))];
        dom[0].setAttribute('viewBox', viewbox.join(' '));
        dom.removeAttr('id');
        dom.attr('width', '100%');
        dom.attr('height', '100%');
        dom.css('display', 'block');
        element.html(dom);
    };

    functions.doi = {};
    functions.doi.toscreen = function (element, value) {
        return element.html(value.replace(/^(.*)$/, '<a target="_blank" href="http://dx.doi.org/$1"><img src="bin/logo/doi.png" /></a>'));
    };

    var OCL = 'openchemlib/openchemlib-viewer';
    var defaultOpenChemLibStructureOptions = {
        suppressChiralText: true,
        suppressESR: true,
        suppressCIPParity: true,
        noStereoProblem: true
    };

    function renderOpenChemLibStructure(element, idcode, coordinates, options) {
        return new Promise(function (resolve) {
            options = $.extend({}, defaultOpenChemLibStructureOptions, options);
            require([OCL], function (ACT) {
                var id = Util.getNextUniqueId();
                var h = Math.max(150, element.height()), w = element.width();
                var can = $('<canvas>', {id: id});
                var canEl = can.get(0);
                canEl.height = h;
                canEl.width = w;
                element.html(can);
                ACT.StructureView.drawStructure(id, idcode, coordinates, options);
                resolve();
            });
        });
    }

    functions.jme = {};
    functions.jme.toscreen = function (element, jme, jmeRoot, options) {
        return new Promise(function (resolve) {
            require(['lib/chemistry/jme-converter'], function (Converter) {
                var converted = Converter.toMolfile(jme);
                var molfile = {
                    type: 'mol2d',
                    value: converted
                };
                resolve(functions.mol2d.toscreen(element, converted, jmeRoot, options));
            });
        });
    };

    functions.smiles = {};
    functions.smiles.toscreen = function (element, smi, smiRoot, options) {
        return new Promise(function (resolve) {
            require([OCL], function (ACT) {
                var mol = ACT.Molecule.fromSmiles(String(smi));
                resolve(renderOpenChemLibStructure(element, mol.getIDCode(), mol.getIDCoordinates(), options));
            });
        });
    };

    functions.actelionid = {};
    functions.actelionid.toscreen = function (element, val, root, options) {
        return new Promise(function (resolve) {
            require([OCL], function (ACT) {
                if (!root.coordinates) {
                    var value = String(root.value);
                    var mol = ACT.Molecule.fromIDCode(value, true);
                    Object.defineProperty(root, 'coordinates', {
                        configurable: true,
                        enumerable: false,
                        value: mol.getIDCoordinates(),
                        writable: true
                    });
                }
                resolve(renderOpenChemLibStructure(element, String(root.value), String(root.coordinates), options));
            });
        });
    };

    functions.mol2d = {};
    functions.mol2d.toscreen = function (element, molfile, molfileRoot, options) {
        return new Promise(function (resolve) {
            require([OCL], function (ACT) {
                var mol = ACT.Molecule.fromMolfile(molfile);
                resolve(renderOpenChemLibStructure(element, mol.getIDCode(), mol.getIDCoordinates(), options));
            });
        });
    };

    functions.molfile2d = functions.mol2d;

    functions.mf = {};
    functions.mf.toscreen = function (element, value) {
        element.html(value.replace(/\[([0-9]+)/g, '[<sup>$1</sup>').replace(/([a-zA-Z)])([0-9]+)/g, '$1<sub>$2</sub>').replace(/\(([0-9+-]+)\)/g, '<sup>$1</sup>'));
    };

    function bioPv(type, element, val) {
        return new Promise(function (resolve) {
            require(['lib/bio-pv/bio-pv.min'], function (pv) {
                var div = $('<div style="width:99%; height:99%" />');
                element.html(div);
                var mol;
                if (type === 'pdb') {
                    mol = pv.io.pdb(val);
                } else if (type === 'mol3d') {
                    mol = pv.io.sdf(val);
                }
                var viewer = pv.Viewer(div.get(0), {
                    width: element.width(),
                    height: Math.max(250, element.height()),
                    quality: 'medium'
                });
                viewer.addListener('viewerReady', function () {
                    var id = Util.getNextUniqueId();
                    if (type === 'pdb') {
                        var ligand = mol.select({rnames: ['RVP', 'SAH']});
                        viewer.ballsAndSticks('ligand-' + id, ligand);
                        viewer.cartoon(id, mol);
                    } else if (type === 'mol3d') {
                        viewer.ballsAndSticks(id, mol);
                    }
                    viewer.fitTo(mol);
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
    functions.downloadlink.toscreen = function (element, value) {
        element.html(value.replace(/^(.*)$/, '<a href="$1">⤵</a>'));
    };

    functions.openlink = {};
    functions.openlink.toscreen = function ($element, value) {
        $element.html(value.replace(/^(.*)$/, '<a href="$1" target="_blank"><i class="fa fa-external-link"></i></a>'));
    };

    functions.boolean = {};
    functions.boolean.toscreen = function (element, value) {
        if (value)
            element.html('<span style="color: green;">&#10004;</span>');
        else
            element.html('<span style="color: red;">&#10008;</span>');
    };

    functions.colorbar = {};
    functions.colorbar.toscreen = function (element, value) {

        var div = $('<div>&nbsp;</div>');
        var gradient = 'linear-gradient(to right';

        var total = 0, i = 0, l = value.length;
        for (i = 0; i < l; total += value[i++][0])

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
        element.html(div);
    };

    functions.indicator = {};
    functions.indicator.init = function () {

        var tooltip = $('<div class="ci-tooltip"></div>').css({
            display: 'none',
            opacity: 0
        }).appendTo('#ci-visualizer');
        var current;

        $('#modules-grid').on('mouseenter', '[data-tooltip]', function (e) {

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

        $('#modules-grid').on('mouseleave', '[data-tooltip]', function (e) {
            clearTimeout(current);
            tooltip.css({
                opacity: 0,
                display: 'none'
            });
        });

    };
    functions.indicator.toscreen = function (htmlElement, value) {
        return new Promise(function (resolve) {
            require(['src/util/color'], function (Color) {
                if (!Array.isArray(value)) {
                    return resolve();
                }
                var html = '<table cellpadding="0" cellspacing="0" style="text-align: center; height:100%; width:100%"><tr>';

                // if the first element of the array is a number ... we need to convert the array.
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
                        'border': 'none'
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
                htmlElement.html(html);
                resolve();
            });
        });
    };

    functions.regexp = {};
    functions.regexp.toscreen = function (element, val) {
        var value = String(val);
        return new Promise(function (resolve) {
            require(['lib/regexper/regexper'], function (Parser) {
                var div = $('<div>').appendTo(element);
                var parser = new Parser(div.get(0));
                parser.parse(value).invoke('render');
                resolve();
            });
        });
    };

    functions.regex = functions.regexp;

    //TODO replace with a Map when more browsers are supported
    var typeInit = {};

    function _render(element, object, options) {
        if (object == undefined) {
            element.html('');
            return Promise.resolve();
        }

        return Promise.resolve(object.get(true)).then(function (value) {
            var type = object.getType().toLowerCase();
            if (!functions[type]) {
                Util.warnOnce('no-typerenderer-' + type, 'No renderer found for type ' + type);
                element.html(String(value));
                return;
            }

            options = $.extend(options, object._options);

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
                return functions[type].toscreen(element, value, object, options);
            });
        });
    }

    return {
        render: function (element, object, jpath, options) {
            if (typeof jpath === 'object' && !Array.isArray(jpath)) {
                options = jpath;
                jpath = null;
            }
            element = $(element);
            object = DataObject.check(object, true);
            if (jpath) {
                return object.getChild(jpath).then(function (child) {
                    return _render(element, child, options);
                });
            } else {
                return _render(element, object, options);
            }
        },
        addType: function (name, renderer) {
            functions[name] = renderer;
        }
    };

});
