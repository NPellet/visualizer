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

                if (that.toHide && that.toHide[conf.variable]) {
                    if ($previousImg) $previousImg.hide();
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
                        if (that.transforms && that.transforms[conf.variable]) {
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
            transform: function (data) {
                this.transforms = this.transforms || {};
                this.transforms[data.name] = data.transform;
                this.doImage(data.name);
            },
            hide: function (data) {
                this.toHide = this.toHide || {};
                var varname;
                if (typeof data === 'string')
                    varname = data;
                else
                    varname = data.name;
                if (this.toHide[varname]) return;
                this.toHide[varname] = true;
                this.doImage(varname);
            },
            show: function (data) {
                this.toHide = this.toHide || {};
                var varname;
                if (typeof data === 'string')
                    varname = data;
                else
                    varname = data.name;

                if (!this.toHide[varname]) return;
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
