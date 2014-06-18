define(['modules/default/defaultview', 'src/util/util', 'underscore',
'components/jquery.panzoom/dist/jquery.panzoom',
'components/jquery-mousewheel/jquery.mousewheel'
], function(Default, Util, _) {
  function view() {
    this.selectingArea = false;
    this.imgWidth = [];
    this.imgHeight = [];
  };
  view.prototype = $.extend(true, {}, Default, {

    init: function() {
      Util.loadCss('components/jcrop/css/jquery.Jcrop.css')
      if (! this.dom) {
        this._id = Util.getNextUniqueId();
        this.dom = $(' <div id="' + this._id + '"></div>').css('height', '100%').css('width', '100%');
        this.module.getDomContent().html(this.dom);
      }
    },


    blank: function() {
      this.dom.empty();
    },


    inDom: function() {
      var self = this;
      // self.dom.html('<div class="parent"><div class="panzoom"><img src="http://blog.millermedeiros.com/wp-content/uploads/2010/04/awesome_tiger.svg"></div></div>\
      // <div class="parent"><div class="panzoom"><img class="transparent" src="http://www.colourbox.com/preview/6527480-273411-cute-baby-tiger-cartoon.jpg"></div></div>');
      // 
        
      this.dom.html('');
      this.resolveReady();

      
    },
    
    update:{
      picture: function(val) {
        var self = this;
        console.log('picture update ', val.get());
        this.addImage(val.get(), function() {
          self.panzoomElements = self.dom.find('.panzoom');
          self.panzoomMode();
          self.onResize();
        });
        
      }
    },
    
    addImage: function(val, cb) {
      var self = this;
      console.log('add image');
      var x = $('<div class="parent"><div class="panzoom"><img/></div></div>');
      
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
        maxScale: 10.0,
        minScale: 0.2,
        duration:100
      });
      
      this.panzoomElements.on('panzoompan', function(data, panzoom){
        var panzoomInstances = self.panzoomElements.panzoom("instance");
        for(i=0; i<panzoomInstances.length; i++) {
          if(panzoomInstances[i] !== panzoom) {
            panzoomInstances[i].setMatrix(panzoom.getMatrix());
          }
        }
      });
      this.dom.off('dblclick');
      this.dom.dblclick(function() {
        self.panzoomElements.panzoom("reset");
      });
      
      this.panzoomElements.parent().on('mousewheel.focal', function( e ) {
        e.preventDefault();
        var delta = e.delta || e.originalEvent.wheelDelta;
        var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        self.panzoomElements.panzoom('zoom', zoomOut, {
          increment: 0.1,
          animate: false,
          focal: e
        });
      });
      
      // this.panzoomElements.parent().on('mousewheel.focal', _.debounce(function(e){
      //   e.preventDefault();
      //   self.panzoomElements.panzoom('resetDimensions');
      //   var panzoomInstances = self.panzoomElements.panzoom("instance");
      //   for(i=0; i<panzoomInstances.length; i++) {
      //     console.log('hello');
      //     panzoomInstances[i].setMatrix(panzoomInstances[i].getMatrix(), {
      //       animate: true
      //     });
      //   }
      // }, 500));
      
      // this.panzoomElements.on('mousewheel', function(event) {
      //   event.preventDefault();
      //   zoomCount += event.deltaY;
      //   console.log(event);
      //   console.log(event.deltaX, event.deltaY, event.deltaFactor);
      //   if(zoomCount%2 === 0)
      //     self.panzoomElements.panzoom("zoom", event.deltaY > 0 ? false : true, {
      //       focal: event,
      //       animate: false,
      //       increment: 0.1
      //     });
      // });
    },
    
    selectionMode: function() {
      this.panzoomElements.panzoom("destroy");
      this.jcropApi.enable();
    },

    onResize: function() {
      if(this.panzoomElements) {
        var domimg = this.dom.find('img');
        for(var i=0; i<domimg.length; i++) {
          if(this.imgWidth[i]/this.imgHeight[i] > this.dom.width()/this.dom.height()) {
            domimg[i].width = this.dom.width();
            domimg[i].height = this.imgHeight[i]/this.imgWidth[i] * this.dom.width();
          }
          else {
            domimg[i].height = this.dom.height();
            domimg[i].width = this.imgWidth[i]/this.imgHeight[i] * this.dom.height();
          }
        }
        this.panzoomElements.panzoom('resetDimensions'); 
      }
    },

    getDom: function() {
      return this.dom;
    },
  });

  return view;
});