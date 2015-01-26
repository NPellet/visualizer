'use strict';

define(['require', 'jquery', 'src/util/api', 'src/util/util', 'src/util/datatraversing'], function (require, $, API, Util, Traversing) {

    Util.loadCss('components/font-awesome/css/font-awesome.min.css');

    var functions = {};

    functions.string = {};
    functions.string.toscreen = function (def, val) {
        val = String(val);
        while (true) {
            val = val.replace('<', '&lt;').replace('>', '&gt;');
            if (val.indexOf('<') === -1 && val.indexOf('>') === -1) {
                break;
            }
        }
        def.resolve(val);
    };

    functions.date = {};
    functions.date.toscreen = function (def, val) {
        try {
            var d = new Date(val);
            def.resolve(d.toLocaleString());
        }
        catch (e) {
            def.resolve('Invalid date');
        }
    };

    functions.color = {};
    functions.color.toscreen = function (def, val) {

        var $bg = $('<div><div/></div>');
        $bg.children().css({
            backgroundColor: val,
            width: '100%',
            height: '100%',
            padding: 0,
            margin: 0
        });
        def.resolve($bg.html());
    };

    functions.html = {};
    functions.html.toscreen = function (def, val) {
        def.resolve(String(val));
    };

    functions.matrix = {};
    functions.matrix.toscreen = function (def, val) {
        def.resolve(val);
    };

    functions.number = {};
    functions.number.toscreen = function (def, val) {
        def.reject(val.valueOf());
    };

    functions.chemical = {};
    functions.chemical.toscreen = function (def, val) {
        val.getChild(['iupac', '0', 'value']).then(def.resolve, def.reject);
    };

    functions.picture = {};
    functions.picture.toscreen = function (def, val) {
        def.reject('<img src="' + val + '" />');
    };

    functions.svg = {};
    functions.svg.toscreen = function (def, val) {
        var dom = $(val);
        var viewbox = [0, 0, parseInt(dom.attr('width')), parseInt(dom.attr('height'))];
        dom[0].setAttribute('viewBox', viewbox.join(' '));
        dom.removeAttr('id');
        dom.attr('width', '100%');
        dom.attr('height', '100%');
        def.resolve(dom);
    };

    functions.gif = functions.picture;
    functions.jpeg = functions.picture;
    functions.jpg = functions.picture;
    functions.png = functions.picture;

    functions.doi = {};
    functions.doi.toscreen = function (def, value) {
        return def.resolve(value.replace(/^(.*)$/, '<a target="_blank" href="http://dx.doi.org/$1"><img src="bin/logo/doi.png" /></a>'));
    };

    var actelionCDN = 'http://www.lactame.com/lib/actelion/3.0.0-alpha3/actelion-3.0.0-alpha3.js';
    var defaultActelionStructureOptions = {
        suppressChiralText: true,
        suppressESR: true,
        suppressCIPParity: true
    };

    function renderActelionStructure(idcode, coordinates, options, def) {
        options = $.extend({}, defaultActelionStructureOptions, options);
        require([actelionCDN], function (ACT) {
            var id = Util.getNextUniqueId();
            var div = '<div id="' + id + '" style="width:100%; height:100%" />';
            def.build = function () {
                var div = $('#' + id);
                var h = Math.max(150, div.height()), w = div.width();
                var id2 = Util.getNextUniqueId();
                var can = $('<canvas>', {id: id2});
                var canEl = can.get(0);
                canEl.height = h;
                canEl.width = w;
                div.html(can);
                ACT.StructureView.drawStructure(id2, idcode, coordinates, options);
            };
            def.resolve(div);
        });
    }

    functions.jme = {};
    functions.jme.toscreen = function (def, jme, jmeRoot, options, highlights, box) {
        require(['lib/chemistry/jme-converter'], function (Converter) {
            var converted = Converter.toMolfile(jme);
            var molfile = {
                type: 'mol2d',
                value: converted
            };
            functions.mol2d.toscreen(def, converted, molfile, options, highlights, box);
        });
    };

    functions.smiles = {};
    functions.smiles.toscreen = function (def, val, root, options, highlights, box) {
        require([actelionCDN], function (ACT) {
            var mol = ACT.Molecule.fromSmiles(String(val));
            renderActelionStructure(mol.getIDCode(), mol.getIDCoordinates(), options, def);
        });
    };

    functions.actelionID = {};
    functions.actelionID.toscreen = function (def, val, root, options, highlights, box) {
        require([actelionCDN], function (ACT) {
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
            renderActelionStructure(String(root.value), String(root.coordinates), options, def);
        });
    };

    functions.mol2d = {};
    functions.mol2d.toscreen = function (def, molfileChild, molfile, options, highlights, box) {
        require([actelionCDN], function (ACT) {
            var mol = ACT.Molecule.fromMolfile(molfileChild);
            renderActelionStructure(mol.getIDCode(), mol.getIDCoordinates(), options, def);
        });
    };

    functions.molfile2D = functions.mol2d;

    functions.jcamp = {};
    functions.jcamp.hexToRgb = function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    functions.id = 0;
    functions.cache = [];

    functions.jcamp.toscreen = function (def, valueChild, value, args, highlights, box) {

        require(['lib/plot/plot', 'components/jcampconverter/src/jcampconverter'], function (Graph, Converter) {

            var dom = $("<div />").css({width: 200, height: 200});
            var graph = new Graph(dom.get(0), {
                    closeRight: false,
                    closeTop: false,
                    zoomMode: ''
                }, {
                    bottom: [
                        {
                            unitModification: false,
                            primaryGrid: false,
                            nbTicksPrimary: 5,
                            nbTicksSecondary: 2,
                            secondaryGrid: false,
                            axisDataSpacing: {min: 0, max: 0}
                        }
                    ],

                    left: [
                        {
                            ticklabelratio: 1,
                            primaryGrid: true,
                            nbTicksSecondary: 4,
                            secondaryGrid: false,
                            //scientificTicks: true,
                            nbTicksPrimary: 2,
                            forcedMin: 0,
                            axisDataSpacing: {min: 0, max: 0}
                        }
                    ]
                }
            );
            graph.resize(200, 200);
            value = Converter.convert(value.value);
            var serie = graph.newSerie('serie', {lineToZero: true});
            serie.autoAxis();
            serie.setData(value.spectra[0].data[0]);
            def.resolve(graph._dom);
            graph.redraw();
            graph.drawSeries();
        });


    };

    functions.mf = {};
    functions.mf.toscreen = function (def, value) {

        return def.reject(value.replace(/\[([0-9]+)/g, "[<sup>$1</sup>").replace(/([a-zA-Z)])([0-9]+)/g, "$1<sub>$2</sub>").replace(/\(([0-9+-]+)\)/g, "<sup>$1</sup>"));
    };


    functions.pdb = {};
    functions.pdb.toscreen = function (def, value) {
        return def.resolve(value);
    };

    functions.cif = {};
    functions.cif.toscreen = function (def, value) {
        return def.resolve(value);
    };

    functions.downloadLink = {};
    functions.downloadLink.toscreen = function (def, value) {
        return def.resolve(value.replace(/^(.*)$/, '<a href="$1">⤵</a>'));
    };

    functions.boolean = {};
    functions.boolean.toscreen = function (def, value) {
        if (value)
            def.resolve('<span style="color: green;">&#10004;</span>');
        else
            def.resolve('<span style="color: red;">&#10008;</span>');
    };

    functions.colorBar = {};
    functions.colorBar.toscreen = function (def, value) {

        var div = $('<div>');
        var gradient = "linear-gradient(to right";

        var total = 0, i = 0, l = value.length;
        for (i = 0; i < l; total += value[i++][0]);

        var start = 0, end, color;
        for (i = 0; i < l; i++) {
            end = start + value[i][0] / total * 100;
            color = value[i][1];
            gradient += ", " + color + " " + start + "%, " + color + " " + end + "%";
            start = end;
        }
        gradient += ")";

        div.css({
            height: "100%",
            width: "100%"
        })/*.css("background","-webkit-"+gradient).css("background","-moz-"+gradient)*/.css("background", gradient);
        def.resolve(div.get(0));
    };

    functions.indicator = {};
    functions.indicator.init = function () {

        var tooltip = $('<div class="ci-tooltip"></div>').css({
            display: "none",
            opacity: 0
        }).appendTo("#ci-visualizer");
        var current;

        $('#modules-grid').on('mouseenter', '[data-tooltip]', function (e) {

            current = setTimeout(function () {
                var target = $(e.target);
                var offset = target.offset();
                tooltip.css({
                    left: offset.left,
                    top: offset.top,
                    display: "block"
                }).text(target.attr("data-tooltip"));
                tooltip.animate({
                    opacity: 1
                });
            }, 500);
        });

        $('#modules-grid').on('mouseleave', '[data-tooltip]', function (e) {
            clearTimeout(current);
            tooltip.css({
                opacity: 0,
                display: "none"
            });
        });

    };
    functions.indicator.toscreen = function (def, value) {
        require(["src/util/color"], function (Color) {
            if (!Array.isArray(value))
                def.reject('');
            var html = '<table cellpadding="0" cellspacing="0" style="text-align: center; height:100%; width:100%"><tr>';

            // if the first element of the array is a number ... we need to convert the array.
            if (!isNaN(value[0])) {
                value = value.map(function (value) {
                    return {"size": value};
                })
            }

            var length = value.length;
            // no color ? we add some ...
            var colors = Color.getDistinctColors(value.length);
            var totalSize = 0;
            for (var i = 0; i < length; i++) {
                if (!value[i].bgcolor) value[i].bgcolor = colors[i];
                if (!value[i].size && value[i].size !== 0) value[i].size = 10;
                totalSize += value[i].size;
            }

            for (var i = 0; i < length; i++) {
                if (!value[i].bgcolor) value[i].bgcolor = colors[i];
                if (!value[i].size && value[i].size !== 0) value[i].size = 10;
                totalSize += value[i].size;
            }


            for (var i = 0; i < length; i++) {
                var element = value[i];
                var span = $('<td>').css({
                    "width": (100 * element.size / totalSize) + "%",
                    "border": "none"
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
                    span.attr("data-tooltip", element.tooltip);
                html += span.get(0).outerHTML;
            }
            html += '</tr></table>';
            def.resolve(html);
        })

    };


    functions.styledValue = {};
    functions.styledValue.toscreen = function (def, value, valueRoot, args, highlights, box, jpath) {

        var div = $('<div>');
        div.css(value.css);

        functions.toScreen(value.value, box, args, jpath).always(function (subvalue) {
            div.append(subvalue);
            def.resolve(div.get(0));
        });

    };

    function _valueToScreen(deferred, data, box, args, jpath) {
        var type = Traversing.getType(data),
            highlights = Traversing.getHighlights(data);

        args = $.extend(args, Traversing.getOptions(data));

        if (!functions[type]) {
            return deferred.resolve('');
        }

        var rootData = data;
        data = Traversing.get(data);

        if (!functions[type].ready && functions[type].init) {
            functions[type].init();
            functions[type].ready = true;
        }

        functions[type].toscreen(deferred, data, rootData, args, highlights, box, jpath);
    }

    return {
        toScreen: function (element, box, opts, jpath) {
            var deferred = $.Deferred();
            element = DataObject.check(element, true);
            if (!jpath) {
                _valueToScreen(deferred, element, box, opts, jpath);
                return deferred;
            }

            element.getChild(jpath).then(function (element) {
                _valueToScreen(deferred, element, box, opts, jpath);
            }, function () {
                deferred.reject();
            });

            return deferred;
        },
        addType: function (name, renderer) {
            functions[name] = renderer;
        }
    };

});
