define(['src/util/api', 'modules/default/defaultview', 'src/util/util', 'lodash',
    'components/jquery.panzoom/dist/jquery.panzoom',
    'components/jquery-mousewheel/jquery.mousewheel'
], function(API, Default, Util, _) {

    var MAX_IMAGE_SIZE = 10000;
    function view() {
        this.selectingArea = false;
        this.imgWidth = [];
        this.imgHeight = [];
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
                //this.addImage(val.get(), varname, function() {
                //    self.panzoomElements = self.dom.find('.panzoom');
                //    self.panzoomMode();
                //    self.onResize();
                //    self.reorderImages();
                //});

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

            // Filter conf for valid data
            var conf = this.module.getConfiguration('img');
            conf = _.filter(conf, function(c) {
                var v = API.getData(c.variable);
                if(v !== undefined) {
                    variables[c.variable] = v;
                    var op = parseFloat(c.opacity);
                    if(op && op >=0 && op <=1) {
                        return true;
                    }
                }
                return false;
            });

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

        addImage: function(val, varname, cb) {
            var self = this;
            var x = self.dom.find('#'+varname);
            if(x.length === 0) {
                x = $('<div class="parent" id="' + varname + '"><div class="panzoom"><img/></div></div>');
            }

            var imgconf = self.module.getConfiguration('img');
            imgconf = _.find(imgconf, function(c) {
                if(c.variable === varname) {
                    var op = parseFloat(c.opacity);
                    if(op && op >=0 && op <=1) {
                        return true;
                    }
                }
                return false;
            });

            x.find('img').addClass(imgconf.rendering);

            if(imgconf && imgconf.opacity) {
                x.find('img').css('opacity', parseFloat(imgconf.opacity));
            }
            // x.find('img')
            x.find('img').attr('src', val).load(function() {
                self.imgWidth.push(this.width);   // Note: $(this).width() will not
                self.imgHeight.push(this.height); // work for in memory images.
                self.dom.append(x);
                cb();
            });
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

                that.images[i].$panzoomEl.on('panzoompan', function(data, panzoom){
                    for(var j=0; j<that.images.length; j++) {
                        var panzoomInstance = that.images[j].$panzoomEl.panzoom("instance");
                        if(panzoomInstance !== panzoom) {
                            panzoomInstance.setMatrix(panzoom.getMatrix());
                        }
                    }
                });

                (function(i) {
                    that.images[i].$panzoomEl.parent().off('mousewheel.focal');
                    that.images[i].$panzoomEl.parent().on('mousewheel.focal', function( e ) {
                        e.preventDefault();
                        var increment = 1;
                        var baseIncrement = 0.2;
                        if(that.images.length > 0) {
                            var zoomMagnitude = that.images[i].$panzoomEl.panzoom('getMatrix')[0];
                            increment = baseIncrement * zoomMagnitude;
                        }
                        var delta = e.delta || e.originalEvent.wheelDelta;
                        var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                        for(var j=0 ;j<that.images.length; j++) {
                            that.images[j].$panzoomEl.panzoom('zoom', zoomOut, {
                                increment: increment,
                                animate: false,
                                focal: e
                            });
                        }
                    });
                })(i);

                //var $img = images[i].$img;
                //$img.off('click.panzoomModule');
                //$img.on('click.panzoomModule', function(data) {
                //    // You can get image the clicked pixel here
                //    //console.log('clicked pixel', data.offsetX*self.imgWidth[0]/this.width);
                //    var offsetX, offsetY;
                //    if(data.offsetX) {
                //        offsetX = data.offsetX;
                //        offsetY = data.offsetY;
                //    }
                //    else {
                //        offsetX = (data.clientX - $(this).offset().left)/$(self.panzoomElements[0]).panzoom('getMatrix')[0];
                //        offsetY = (data.clientY - $(this).offset().top)/$(self.panzoomElements[0]).panzoom('getMatrix')[3];
                //    }
                //    var clickPixel = {
                //        x: Math.floor(offsetX*self.imgWidth[0]/this.width),
                //        y: Math.floor(offsetY*self.imgHeight[0]/this.height)
                //    };
                //    console.log('clickedPixel', clickPixel);
                //    self.module.controller.clickedPixel(clickPixel);
                //});
            }
            if(that.images.length > 0) {




                that.dom.on('click', function(e) {
                    var allClickedPixels = {};
                    for(var i=0; i<that.images.length; i++) {
                        var rect = that.images[i].$img[0].getBoundingClientRect();
                        var clickedPixel = {
                            x: Math.floor((e.pageX-rect.left)*that.images[i].width/rect.width),
                            y: Math.floor((e.pageY-rect.top)*that.images[i].height/rect.height)
                        };

                        if(clickedPixel.x >= 0 && clickedPixel.x < that.images[i].width && clickedPixel.y >= 0 && clickedPixel.y < that.images[i].height) {
                            if(i===0)
                                that.module.controller.clickedPixel(clickedPixel);
                            allClickedPixels[that.images[i].name] = clickedPixel;
                        }
                    }
                    if(Object.keys(allClickedPixels).length > 0) {
                        that.module.controller.allClickedPixels(allClickedPixels);
                    }
                });

                that.images[0].$img.on('click', function(e) {
                    console.log('img coord', e.pageX - $(e.currentTarget).offset().left);
                });
            }

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
                var domimg = this.images[i].$img[0];
                var factor = 1;
                    if(this.images[i].height/this.images[i].width > this.dom.width()/this.dom.height()) {
                        //factor = computeFactor(this.imgWidth[i], this.dom.width());
                        domimg.width = this.dom.width() * factor;
                        domimg.height = this.images[i].height/this.images[i].width * this.dom.width() * factor;
                    }
                    else {
                        //factor = computeFactor(this.imgHeight[i], this.dom.height());
                        domimg.height = this.dom.height() * factor;
                        domimg.width = this.images[i].width/this.images[i].height * this.dom.height() * factor;
                    }
                    this.images[i].$parent.width(this.dom.parent().width()).height(this.dom.parent().height());
                    this.images[i].$panzoomEl.panzoom('resetDimensions');
            }
        },

        getDom: function() {
            return this.dom;
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