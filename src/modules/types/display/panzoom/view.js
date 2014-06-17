define(['modules/default/defaultview', 'src/util/util', 'underscore',
'components/jquery.panzoom/dist/jquery.panzoom',
'components/jcrop/js/jquery.Jcrop',
'components/jquery-mousewheel/jquery.mousewheel'
], function(Default, Util, _) {
  function view() {
    this.selectingArea = false;
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
      self.dom.html('<div class="parent"><div class="panzoom"><img src="http://blog.millermedeiros.com/wp-content/uploads/2010/04/awesome_tiger.svg"></div></div>\
      <div class="parent"><div class="panzoom"><img class="transparent" src="http://www.colourbox.com/preview/6527480-273411-cute-baby-tiger-cartoon.jpg"></div></div>');
      
        
      
      var selectArea = '<button class="select-area">Select Area</button>';
      var zoomIn = '<button class="zoom-in">Zoom In</button>';
      var zoomOut = '<button class="zoom-out">Zoom Out</button>';
      var zoomRange = '<input type="range" class="zoom-range">';
      var reset = '<button class="reset">Reset</button>'
        
      self.dom.append('<div class="buttons"></div>');
        
      this.panzoomElements = this.dom.find('.panzoom');
      this.panzoomMode();
      
      // this.dom.find('.select-area').off('click');
      // this.dom.find('.select-area').on('click', _.once(function() {
      //   self.dom.find('img').first().Jcrop({
      //     trueSize: [900, 900]
      //   }, function() {
      //     self.jcropApi = this;
      //   });
      // }));
      // 
      // this.dom.find('.select-area').on('click', function() {
      //   self.selectingArea = !self.selectingArea;
      // });
      // 
      // this.dom.find('.select-area').on('click', function() {
      //   if(self.selectingArea) {
      //     self.selectionMode();
      //   }
      //   else {
      //     self.panzoomMode();
      //   }
      // });
      
    },
    
    panzoomMode: function() {
      var self = this;
      var zoomCount = 0;
      if(this.jcropApi) {
        this.jcropApi.disable();
      }
      
      this.panzoomElements.panzoom({
        // $zoomIn: this.dom.find(".zoom-in"),
        // $zoomOut: this.dom.find(".zoom-out"),
        // $zoomRange: this.dom.find(".zoom-range"),
        // $reset: this.dom.find(".reset"),
        increment: 0.1,
        maxScale: 10.0,
        minScale: 0.2,
        duration:100
      });
      
      this.panzoomElements.on('panzoomchange', function(data, panzoom) {
        // console.log('panzoom changed ', data);
        console.log('panzoom matrix', panzoom.getMatrix());
      });
      
      this.panzoomElements.on('panzoompan', function(data, panzoom){
        var panzoomInstances = self.panzoomElements.panzoom("instance");
        for(i=0; i<panzoomInstances.length; i++) {
          console.log('hhh matrix', panzoom.getMatrix());
          if(panzoomInstances[i] !== panzoom) {
            panzoomInstances[i].setMatrix(panzoom.getMatrix());
          }
        }
        console.log('pan el length', self.panzoomElements.length);
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
      
      // this.panzoomElements.on('mousewheel', function(event) {
      //   event.preventDefault();
      //   zoomCount += event.deltaY;
      //   console.log(event);
      //   console.log(event.deltaX, event.deltaY, event.deltaFactor);
      //   if(zoomCount%3 === 0)
      //     self.panzoomElements.panzoom("zoom", event.deltaY > 0 ? true : false, {middle: true});
      // });
    },
    
    selectionMode: function() {
      this.panzoomElements.panzoom("destroy");
      this.jcropApi.enable();
    },

    onResize: function() {
			this.dom.find('img').width(this.dom.width()).height(this.dom.height());
      this.panzoomElements.panzoom('resetDimensions');
    },


    update: {
      'image':function(data) {

      }
    },

    getDom: function() {
      return this.dom;
    },
  });

  return view;
});