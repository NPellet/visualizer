define(['src/util/api', 'src/util/debug', 'modules/default/defaultview', 'src/util/util', 'lodash',
    'components/jquery.panzoom/dist/jquery.panzoom',
    'components/jquery-mousewheel/jquery.mousewheel'
], function(API, Debug, Default, Util, _) {

    var MAX_IMAGE_SIZE = 10000;
    function view() {

    }
    view.prototype = $.extend(true, {}, Default, {

        init: function() {
            if (! this.dom) {
                this._id = Util.getNextUniqueId();
                this.dom = $(' <div id="' + this._id + '"></div>').css('height', '100%').css('width', '100%');
                this.module.getDomContent().html(this.dom);
            }
        },


        blank: {
            picture: function() {
                this.dom.empty();
            }
        },

        inDom: function() {
            this.resolveReady();
        },

        update:{
            picture: function() {
                var that = this;
                this.clearImages();
                this.addImages().then(function() {
                    that.panzoomMode();
                    that.onResize();
                    that.reorderImages();
                });
            }
        },

        clearImages: function() {
            if(!this.images) {
                this.images = [];
                return;
            }
            for(var i=0; i<this.images.length; i++) {
                this.images[i].$panzoomEl.panzoom("destroy");
            }
            this.dom.html('');
            this.images = [];
        },

        reorderImages: function() {

            var vars_in = _.map(this.module.definition.vars_in, function(v){
                return v.name;
            });


            var order = _.map(this.module.getConfiguration('img'), function(c) {
                return parseInt(c.order);
            });
            for(var i=0; i<vars_in.length; i++) {
                this.dom.find('#'+vars_in[i]).css('z-index', (order[i] || vars_in.length-i))
            }
        },

        addImages: function() {
            var that = this;
            var prom;
            var variables = {};

            function filterConf(c) {
                var v = API.getData(c.variable);
                if(v !== undefined) {
                    variables[c.variable] = v;
                    var op = parseFloat(c.opacity);
                    if(op && op >=0 && op <=1) {
                        return true;
                    }
                }
                Debug.warn('Panzoom: ignoring invalid configuration line');
                return false;
            }

            // Filter conf for valid data
            var conf = this.module.getConfiguration('img');
            conf = _.filter(conf, filterConf);

            if(conf.length === 0) {
                conf = this._buildConfFromVarsIn();
                conf = _.filter(conf, filterConf);
            }
            else {

            }


            prom = _.map(conf, function(c) {
                return new Promise(function(resolve, reject) {
                    var image = {};
                    that.images.push(image);
                    var x = $('<div class="parent" id="' + c.variable + '"><div class="panzoom"><img/></div></div>');
                    var $img = x.find('img');
                    $img
                        .css('opacity', c.opacity)
                        .addClass(c.rendering)
                        .attr('src', variables[c.variable].get())
                        .load(function(){
                            image.name = c.variable;
                            image.$panzoomEl = x.find('.panzoom');
                            image.$img = x.find('img');
                            image.$parent = x.find('.parent');
                            image.width = this.width;
                            image.height = this.height;
                            image.conf = c;
                            that.dom.append(x);
                            resolve();
                        });
                });
            });
            return Promise.all(prom);
        },

        panzoomMode: function() {
            var that = this;

            for(var i=0; i<this.images.length; i++) {
                that.images[i].$panzoomEl.panzoom({
                    increment: 0.1,
                    maxScale: 100.0,
                    minScale: 0.000001,
                    duration:0
                });

                that.images[i].$panzoomEl.css('transform-origin', '0px 0px 0px');

                that.images[i].$panzoomEl.on('panzoompan', function(data, panzoom){
                    for(var j=0; j<that.images.length; j++) {
                        var panzoomInstance = that.images[j].$panzoomEl.panzoom("instance");
                        if(panzoomInstance !== panzoom) {
                            panzoomInstance.setMatrix(panzoom.getMatrix());
                        }
                    }
                });

            }
            if(that.images.length > 0) {
                that.images[0].$panzoomEl.parent().off('mousewheel.focal');
                that.images[0].$panzoomEl.parent().on('mousewheel.focal', function( e ) {
                    e.preventDefault();
                    var increment = 1;
                    var baseIncrement = 0.2;
                    if(that.images.length > 0) {
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
                    var mat = that.images[0].$panzoomEl.panzoom('getMatrix');
                    for(var j=1 ;j<that.images.length; j++) {
                        var instance = that.images[j].$panzoomEl.panzoom('instance');
                        instance.setMatrix(mat);
                    }
                });
            }

            that.dom.off('click.panzoom');
            that.dom.on('click.panzoom', function (e) {
                var allClickedPixels = {};
                for (var i = 0; i < that.images.length; i++) {
                    var rect = that.images[i].$img[0].getBoundingClientRect();
                    var clickedPixel = {
                        x: Math.floor((e.pageX - rect.left) * that.images[i].width / rect.width),
                        y: Math.floor((e.pageY - rect.top) * that.images[i].height / rect.height)
                    };

                    if (clickedPixel.x >= 0 && clickedPixel.x < that.images[i].width && clickedPixel.y >= 0 && clickedPixel.y < that.images[i].height) {
                        if (i === 0)
                            that.module.controller.clickedPixel(clickedPixel);
                        allClickedPixels[that.images[i].name] = clickedPixel;
                    }
                }
                if (Object.keys(allClickedPixels).length > 0) {
                    that.module.controller.allClickedPixels(allClickedPixels);
                }
            });

            this.dom.off('dblclick');
            this.dom.dblclick(function() {
                for(var i=0; i<that.images.length; i++) {
                    that.images[i].$panzoomEl.panzoom("reset");
                }
            });

        },

        onResize: function() {
            if(!this.images) return;

            for(var i=0; i<this.images.length; i++) {
                var scalingMethod = this.images[i].conf.scaling;
                var domimg = this.images[i].$img[0];
                var factor = 1;
                if(scalingMethod === 'max') {
                    if(this.images[i].width/this.images[i].height > this.dom.width()/this.dom.height()) {
                        //factor = computeFactor(this.imgWidth[i], this.dom.width());
                        domimg.width = this.dom.width() * factor;
                        domimg.height = this.images[i].height/this.images[i].width * this.dom.width() * factor;
                    }
                    else {
                        //factor = computeFactor(this.imgHeight[i], this.dom.height());
                        domimg.height = this.dom.height() * factor;
                        domimg.width = this.images[i].width/this.images[i].height * this.dom.height() * factor;
                    }

                }
                this.images[i].$parent.width(this.dom.parent().width()).height(this.dom.parent().height());
                this.images[i].$panzoomEl.panzoom('resetDimensions');
            }
        },

        getDom: function() {
            return this.dom;
        },

        _buildConfFromVarsIn: function() {
            var i=1;
            return _.map(this.module.definition.vars_in, function(v){
                return {
                    variable: v.name,
                    opacity: 0.5,
                    'z-index': i++,
                    rendering: 'Normal',
                    scaling: 'max'
                }
            });
        }
    });

    function computeFactor(imageWidth, viewport) {
        var factor = viewport/imageWidth;
        if(factor < 10) {
            factor = imageWidth*10/viewport;
        }
        else {
            factor = 1;
        }
        if(imageWidth * factor > MAX_IMAGE_SIZE) {
            factor = Math.max(MAX_IMAGE_SIZE / imageWidth, 1);
        }
        return factor;
    }

    return view;
});