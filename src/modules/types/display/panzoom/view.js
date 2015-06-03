'use strict';

define([
    'src/util/api',
    'src/util/debug',
    'modules/default/defaultview',
    'src/util/util',
    'lodash',
    'bowser',
    'components/jquery.panzoom/dist/jquery.panzoom',
    'components/jquery-mousewheel/jquery.mousewheel'
], function (API, Debug, Default, Util, _, bowser) {

    var currentPromise = Promise.resolve();

    function View() {
    }

    $.extend(true, View.prototype, Default, {

        init: function () {
            if (!this.dom) {
                this._id = Util.getNextUniqueId();
                this.dom = $(' <div id="' + this._id + '"></div>').css('height', '100%').css('width', '100%');
                this.module.getDomContent().html(this.dom);
            }
            this.images = [];
            this.state = 'done';
        },

        blank: {
            picture: function () {
                //this.clearImages();
            }
        },

        inDom: function () {
            this.resolveReady();
        },

        update: {
            picture: function (value, varname) {
                var that = this;
                return that.doImage(varname, value);
            },
            svg: function(value, varname) {
                var val = value.get();
                return this.doImage(varname, new DataString('data:image/svg+xml;utf8,' + val));
                var x = '<path\n     style="fill:#pin-primary-color;fill-opacity:0.98823529"\n     d="M 46.977003,126.64334 C 46.693972,125.95584 40.813862,120.20567 36.603071,114.98067 11.655836,81.858372 -16.158365,51.082905 16.319943,13.682837 30.700637,-0.21083367 48.43303,-1.0034227 66.662563,5.4726973 117.9922,35.174601 80.828906,83.627914 56.427079,115.48067 l -9.450076,11.16267 z M 62.417383,75.872046 C 96.654166,51.387445 70.185413,4.2391813 32.569429,19.913013 21.585178,25.769872 16.134954,35.960547 15.944071,47.980664 c -0.524495,11.693153 5.685418,21.471037 15.526227,27.460808 7.055481,3.840074 10.157178,4.533661 18.145697,4.057654 5.177622,-0.308516 8.161127,-1.153847 12.801388,-3.62708 z"\n     id="path4127"\n     sodipodi:nodetypes="ccccccccccsc" />\n  <path\n     sodipodi:type="arc"\n     style="fill:#pin-primary-color;fill-opacity:0.98823529;fill-rule:nonzero;stroke:none"\n     id="path4129"\n     sodipodi:cx="52.363636"\n     sodipodi:cy="49.05526"\n     sodipodi:rx="51.222816"\n     sodipodi:ry="41.754009"\n     d="m 41.682107,89.891342 a 51.222816,41.754009 0 1 1 1.276617,0.208091"\n     sodipodi:start="1.7808687"\n     sodipodi:end="8.0386371"\n     sodipodi:open="true"\n     transform="matrix(0.87829487,0,0,1.0519028,0.55474126,-6.9952658)" />\n  <path\n     sodipodi:type="arc"\n     style="opacity:0.34016395;fill:#000000;fill-opacity:0;fill-rule:nonzero;stroke:none"\n     id="path4131"\n     sodipodi:cx="49.05526"\n     sodipodi:cy="48.59893"\n     sodipodi:rx="26.010695"\n     sodipodi:ry="20.991087"\n     d="m 43.631232,69.128546 a 26.010695,20.991087 0 1 1 0.64826,0.104614"\n     sodipodi:start="1.7808687"\n     sodipodi:end="8.0386371"\n     sodipodi:open="true"\n     transform="translate(0.64534523,0)" />\n  <path\n     sodipodi:type="arc"\n     style="fill:#000080;fill-opacity:0;fill-rule:nonzero;stroke:none"\n     id="path4135"\n     sodipodi:cx="35.365417"\n     sodipodi:cy="102.78788"\n     sodipodi:rx="16.655972"\n     sodipodi:ry="11.750445"\n     d="m 31.892136,114.28 a 16.655972,11.750445 0 1 1 0.415114,0.0586"\n     sodipodi:start="1.7808687"\n     sodipodi:end="8.0386371"\n     sodipodi:open="true"\n     transform="translate(0.64534523,0)" />\n  <path\n     sodipodi:type="arc"\n     style="fill:#pin-secondary-color;fill-opacity:1;fill-rule:nonzero;stroke:none"\n     id="path4149"\n     sodipodi:cx="52.705883"\n     sodipodi:cy="52.021389"\n     sodipodi:rx="34.452763"\n     sodipodi:ry="33.540108"\n     d="m 45.521425,84.824145 a 34.452763,33.540108 0 1 1 0.85866,0.167155"\n     sodipodi:start="1.7808687"\n     sodipodi:end="8.0386371"\n     sodipodi:open="true"\n     transform="matrix(0.97020484,0,0,1.0272058,-4.0587829,-5.7503824)" />\n  <path\n     sodipodi:type="arc"\n     style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none"\n     id="path4184"\n     sodipodi:cx="64.211853"\n     sodipodi:cy="68.789574"\n     sodipodi:rx="34.203297"\n     sodipodi:ry="36.623341"\n     d="m 57.079416,104.60778 a 34.203297,36.623341 0 1 1 0.852443,0.18252"\n     sodipodi:start="1.7808687"\n     sodipodi:end="8.0386371"\n     sodipodi:open="true"\n     transform="matrix(0.64629924,0,0,0.61681122,5.1261236,4.9013803)" />'
            }
        },

        clearImages: function () {
            if (!this.images) {
                this.images = [];
                return;
            }
            for (var i = 0; i < this.images.length; i++) {
                this.images[i].$panzoomEl.panzoom('destroy');
            }
            this.dom.html('');
            this.images = [];
        },

        doImage: function (varname, value) {
            var that = this;
            currentPromise = currentPromise.then(function () {
                return that.addImage(varname, value);
            }).then(function () {
                that.panzoomMode(varname);
                that.onResize();
                that.reorderImages();
            }, function () {
                Debug.warn('panzoom: image failed to load');
            });
        },

        reorderImages: function () {
            for (var i = 0; i < this.images.length; i++) {
                this.images[i].$panzoomEl.css('z-index', parseInt(this.images[i].conf.order) || i);
            }
        },

        addImage: function (varname, variable) {
            var that = this;

            return new Promise(function (resolve, reject) {
                if (variable === undefined) {
                    variable = API.getData(varname);
                }
                // find the corresponding configuration line
                var conf = _.find(that.module.getConfiguration('img'), function (c) {
                    return c.variable === varname;
                });

                if (!conf) {
                    conf = that._getDefaultConf(varname);
                }

                // Find if image already exists
                var x = that.dom.find('#' + that.getImageDomId(varname));
                // If it does destroy
                x.find('.panzoom').panzoom('destroy');
                var $img;
                if (x.length === 0) {
                    x = that.newImageDom(varname);
                    $img = x.find('img');
                } else {
                    var $previousImg = x.find('img');
                    $img = $('<img/>');
                    x.find('.panzoom').append($img);
                }

                var foundImg = false;
                var image = _.find(that.images, function (img) {
                    return img.name === varname;
                });
                if (image) foundImg = true;
                image = image || {};

                if(that.toHide && that.toHide[conf.variable]) {
                    $previousImg && $previousImg.hide();
                    return resolve();
                }
                $img
                    .css('opacity', conf.opacity)
                    .addClass(conf.rendering)
                    .attr('src', variable.get())
                    .on('load', function () {
                        image.name = conf.variable;
                        image.$panzoomEl = x.find('.panzoom');
                        image.$img = $img;
                        image.$parent = x.find('.parent');
                        image.width = this.width;
                        image.height = this.height;
                        image.conf = conf;
                        that.dom.append(x);
                        if (!foundImg) {
                            that.images.push(image);
                        }
                        if ($previousImg) $previousImg.remove();
                        if(that.transforms && that.transforms[conf.variable]) {
                            $img.css('transform', that.transforms[conf.variable]);
                        }
                        resolve();
                    })
                    .on('error', function () {
                        if ($previousImg) $previousImg.remove();
                        reject();
                    });
            });
        },

        newImageDom: function (varname) {
            return $('<div class="parent" id="' + this.getImageDomId(varname) + '"><div class="panzoom"><img/></div></div>');
        },

        getImageDomId: function (varname) {
            return 'ci-panzoom-image-' + varname;
        },

        panzoomMode: function (varname) {
            var that = this;
            var start = 0;
            var l = this.images.length;
            if (varname) {
                var idx = _.findIndex(that.images, function (img) {
                    return img.name === varname;
                });
                start = (idx === -1 ? undefined : idx);
                l = idx + 1;
            }
            for (var i = start; i < l; i++) {
                that.images[i].$panzoomEl.panzoom({
                    increment: 0.1,
                    maxScale: 100.0,
                    minScale: 0.000001,
                    duration: 0,
                    startTransform: 'none',
                    onEnd: function () {
                        // Set the pointer to cursor only if
                        if (that.state === 'pan') {
                            $(this).css('cursor', 'pointer');
                        }
                    }
                }).css('cursor', 'pointer');
                if (that.lastTransform) {
                    var instance = that.images[i].$panzoomEl.panzoom('instance');
                    instance.setMatrix(that.lastTransform);
                }
                that.images[i].$panzoomEl.off('panzoompan');
                that.images[i].$panzoomEl.on('panzoompan', function (data, panzoom) {

                    that.lastTransform = panzoom.getMatrix();

                    for (var j = 0; j < that.images.length; j++) {
                        if (that.state === 'done') {
                            that.images[j].$panzoomEl.css('cursor', 'move');
                            that.state = 'pan';
                        }
                        var panzoomInstance = that.images[j].$panzoomEl.panzoom('instance');

                        if (panzoomInstance !== panzoom) {
                            panzoomInstance.setMatrix(that.lastTransform);

                        }
                    }
                });
            }


            that.dom.off('mousewheel.focal');
            that.dom.on('mousewheel.focal', function (e) {
                e.preventDefault();
                var increment = 1;
                var baseIncrement = 0.2;
                if (that.images.length > 0) {
                    var zoomMagnitude = that.images[0].$panzoomEl.panzoom('getMatrix')[0];
                    increment = baseIncrement * zoomMagnitude;
                }
                var delta = e.delta || e.originalEvent.wheelDelta;
                var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                that.images[0].$panzoomEl.panzoom('zoom', zoomOut, {
                    increment: increment,
                    animate: false,
                    focal: e
                });
                that.lastTransform = that.images[0].$panzoomEl.panzoom('getMatrix');
                for (var j = 1; j < that.images.length; j++) {
                    var instance = that.images[j].$panzoomEl.panzoom('instance');
                    instance.setMatrix(that.lastTransform);
                }

                that.rerender();
            });

            function getPixels(e, allPixels, pixel) {
                for (var i = 0; i < that.images.length; i++) {
                    var rect = that.images[i].$img[0].getBoundingClientRect();
                    var p = {
                        x: Math.floor((e.pageX - rect.left) * that.images[i].width / rect.width),
                        y: Math.floor((e.pageY - rect.top) * that.images[i].height / rect.height)
                    };

                    if (p.x >= 0 && p.x < that.images[i].width && p.y >= 0 && p.y < that.images[i].height) {
                        if (i === 0) {
                            pixel.x = p.x;
                            pixel.y = p.y;
                        }

                        allPixels[that.images[i].name] = p;
                    }
                }
            }

            that.dom.off('click.panzoom');
            that.dom.on('click.panzoom', function (e) {
                // Don't generate event if we are panning
                if (that.state === 'pan') {
                    that.state = 'done';
                    return;
                }
                that.state = 'done';


                $(this).css('cursor', 'pointer');
                var allClickedPixels = {};
                var clickedPixel = {};
                getPixels(e, allClickedPixels, clickedPixel);
                if (!_.isEmpty(clickedPixel)) {
                    that.module.controller.clickedPixel(clickedPixel);
                }
                if (!_.isEmpty(allClickedPixels)) {
                    that.module.controller.allClickedPixels(allClickedPixels);
                }
            });

            that.dom.off('mousemove.panzoom');
            that.dom.on('mousemove.panzoom', function (e) {
                if (that.state === 'pan') {
                    return;
                }
                var allHoverPixels = {};
                var hoverPixel = {};
                getPixels(e, allHoverPixels, hoverPixel);
                if (!_.isEmpty(hoverPixel) && !_.isEqual(DataObject.resurrect(that.lastHoverPixel), hoverPixel)) {
                    that.module.controller.hoverPixel(hoverPixel);
                    that.lastHoverPixel = hoverPixel;
                }
                if (!_.isEmpty(allHoverPixels) && !_.isEqual(DataObject.resurrect(that.lastAllHoverPixels), allHoverPixels)) {
                    that.module.controller.allHoverPixels(allHoverPixels);
                    that.lastAllHoverPixels = allHoverPixels;
                }
            });


            this.dom.off('dblclick');
            this.dom.dblclick(function () {
                for (var i = 0; i < that.images.length; i++) {
                    that.images[i].$panzoomEl.panzoom('reset');
                    if (i === 0) {
                        that.lastTransform = that.images[i].$panzoomEl.panzoom('getMatrix');
                    }
                }
            });

        },

        rerender: _.debounce(function () {
            for (var j = 0; j < this.images.length; j++) {
                // Trick to get crisp images with chrome
                // Since it does'n implement crisp-edges image rendering
                // But pixelated rendering instead
                console.log(this.images[j]);
                if (this.images[j].conf.rerender && this.images[j].conf.rerender.indexOf('yes') > -1 || (this.images[j].conf.rendering === 'crisp-edges' && bowser.chrome))
                    this.doImage(this.images[j].name);
            }
        }, 300),

        chromeCrisp: _.debounce(function () {
            for (var j = 0; j < this.images.length; j++) {
                if (this.images[j].conf.rendering === 'crisp-edges')
                    this.doImage(this.images[j].name);
            }
        }, 300),

        onResize: function () {
            if (!this.images) return;

            for (var i = 0; i < this.images.length; i++) {
                var scalingMethod = this.images[i].conf.scaling;
                var domimg = this.images[i].$img[0];
                var factor = 1;
                if (scalingMethod === 'max') {
                    if (this.images[i].width / this.images[i].height > this.dom.width() / this.dom.height()) {
                        //factor = computeFactor(this.imgWidth[i], this.dom.width());
                        domimg.width = this.dom.width() * factor;
                        domimg.height = this.images[i].height / this.images[i].width * this.dom.width() * factor;
                    } else {
                        //factor = computeFactor(this.imgHeight[i], this.dom.height());
                        domimg.height = this.dom.height() * factor;
                        domimg.width = this.images[i].width / this.images[i].height * this.dom.height() * factor;
                    }
                }
                this.images[i].$parent.width(this.dom.parent().width()).height(this.dom.parent().height());
                this.images[i].$panzoomEl.panzoom('resetDimensions');
            }
        },

        getDom: function () {
            return this.dom;
        },

        onActionReceive: {
            transform: function(data) {
                this.transforms  = this.transforms || {};
                this.transforms[data.name] = data.transform;
                this.doImage(data.name);
            },
            hide: function(data) {
                this.toHide = this.toHide || {};
                var varname;
                if(typeof data === 'string')
                    varname = data;
                else
                    varname = data.name;
                if(this.toHide[varname]) return;
                this.toHide[varname] = true;
                this.doImage(varname);
            },
            show: function(data) {
                this.toHide = this.toHide || {};
                var varname;
                if(typeof data === 'string')
                    varname = data;
                else
                    varname = data.name;

                if(!this.toHide[varname]) return;
                this.toHide[varname] = false;
                this.doImage(varname);
            }
        },

        _buildConfFromVarsIn: function () {
            var that = this;
            var i = 1;
            return _.map(this.module.definition.vars_in, function (v) {
                return that._getDefaultConf(v.name, i++);
            });
        },

        _getDefaultConf: function (varname, zIndex) {
            zIndex = zIndex || 1;
            return {
                variable: varname,
                opacity: 0.5,
                'z-index': zIndex,
                rendering: 'Normal',
                scaling: 'max'
            };
        }
    });

    // Unused for now but don't erase
    function applyTransform(v, t) {
        var r = new Array(2);
        r[0] = v[0] * (+t[0]) + v[1] * (+t[1]) + (+t[4]);
        r[1] = v[0] * (+t[2]) + v[1] * (+t[3]) + (+t[5]);
        return r;
    }

    return View;

});
