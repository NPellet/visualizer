define(['modules/default/defaultview', 'src/util/util', 'underscore',
    'components/jquery.panzoom/dist/jquery.panzoom',
    'components/jquery-mousewheel/jquery.mousewheel'
], function(Default, Util, _) {

    var MAX_IMAGE_SIZE = 10000;
    function view() {
        this.selectingArea = false;
        this.imgWidth = [];
        this.imgHeight = [];
    };
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
            // self.dom.html('<div class="parent"><div class="panzoom"><img src="http://blog.millermedeiros.com/wp-content/uploads/2010/04/awesome_tiger.svg"></div></div>\
            // <div class="parent"><div class="panzoom"><img class="transparent" src="http://www.colourbox.com/preview/6527480-273411-cute-baby-tiger-cartoon.jpg"></div></div>');
            //

            this.resolveReady();


        },

        update:{
            picture: function(val, varname) {
                var self = this;
                this.clearImages();
                this.addImage(val.get(), varname, function() {
                    self.panzoomElements = self.dom.find('.panzoom');
                    self.panzoomMode();
                    self.onResize();
                    self.reorderImages();
                });

            }
        },

        clearImages: function() {
            this.imgWidth = [];
            this.imgHeight = [];
            if(this.panzoomElements) {
                this.panzoomElements.panzoom("destroy");
                this.dom.html('');
            }
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
            var self = this;
            var zoomCount = 0;

            this.panzoomElements.panzoom({
                increment: 0.1,
                maxScale: 100.0,
                minScale: 0.000001,
                duration:0
            });

            var $img = this.panzoomElements.find('img');
            $img.off('click.panzoomModule');
            $img.on('click.panzoomModule', function(data) {
                // You can get image the clicked pixel here
                //console.log('clicked pixel', data.offsetX*self.imgWidth[0]/this.width);
                var offsetX, offsetY;
                if(data.offsetX) {
                    offsetX = data.offsetX;
                    offsetY = data.offsetY;
                }
                else {
                    offsetX = data.pageX - $(this).offset().left;
                    offsetY = data.pageY - $(this).offset().top;
                }
                var clickPixel = {
                    x: Math.floor(offsetX*self.imgWidth[0]/this.width),
                    y: Math.floor(offsetY*self.imgHeight[0]/this.height)
                };
                console.log('clickedPixel', clickPixel);
                self.module.controller.clickedPixel(clickPixel);
            });

            this.panzoomElements.off('panzoompan');
            this.panzoomElements.on('panzoompan', function(data, panzoom){
                var panzoomInstances = self.panzoomElements.panzoom("instance");
                for(var i=0; i<panzoomInstances.length; i++) {
                    if(panzoomInstances[i] !== panzoom) {
                        panzoomInstances[i].setMatrix(panzoom.getMatrix());
                    }
                }
            });
            this.dom.off('dblclick');
            this.dom.dblclick(function() {
                self.panzoomElements.panzoom("reset");
            });
            this.panzoomElements.parent().off('mousewheel.focal');
            this.panzoomElements.parent().first().on('mousewheel.focal', function( e ) {
                e.preventDefault();
                var increment = 1;
                var baseIncrement = 0.2;
                if(self.panzoomElements.length > 0) {
                    var zoomMagnitude = $(self.panzoomElements[0]).panzoom('getMatrix')[0];
                    increment = baseIncrement * zoomMagnitude;
                }
                var delta = e.delta || e.originalEvent.wheelDelta;
                var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                self.panzoomElements.panzoom('zoom', zoomOut, {
                    increment: increment,
                    animate: false,
                    focal: e
                });
            });
        },

        onResize: function() {
            var self = this;
            if(this.panzoomElements) {
                var domimg = this.dom.find('img');
                var factor = 1;
                for(var i=0; i<domimg.length; i++) {
                    if(this.imgWidth[i]/this.imgHeight[i] > this.dom.width()/this.dom.height()) {
                        //factor = computeFactor(self.imgWidth[i], this.dom.width());
                        domimg[i].width = this.dom.width() * factor;
                        domimg[i].height = this.imgHeight[i]/this.imgWidth[i] * this.dom.width() * factor;
                    }
                    else {
                        //factor = computeFactor(self.imgHeight[i], this.dom.height());
                        domimg[i].height = this.dom.height() * factor;
                        domimg[i].width = this.imgWidth[i]/this.imgHeight[i] * this.dom.height() * factor;
                        // domimg[i].width = 'auto';
                    }
                    this.dom.find('.parent').width(this.dom.parent().width()).height(this.dom.parent().height());
                }
                this.panzoomElements.panzoom('resetDimensions');
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