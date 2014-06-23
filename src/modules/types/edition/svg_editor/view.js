define(['require',
'modules/default/defaultview',
'src/util/util',
'src/util/datatraversing',
'svgedit'
], 



  function(require,Default, UTIL, EditSvg) {
	
    function view() {
      var self = this;
      this.svgCanvas = null;
      this.iframeLoaded=$.Deferred();
      this.iframeLoaded.done(function() {
        self.svgCanvas.zoomChanged(window, 'canvas');
      });
      this.firstLoad = true;
    };
    view.prototype = $.extend(true, {}, Default, {
      
      init: function() {
        console.log('init');
        var self = this;
        var doLoad = false;
        if(this.firstLoad) {
          doLoad = true;
          this.firstLoad = false;
        }
        
        if(doLoad) {
          console.log('svg editor init')
          this.dom = $('<iframe src="lib/svg-edit-2.7/svg-editor.html?extensions=ext-xdomain-messaging.js' +
          window.location.href.replace(/\?(.*)$/, '&$1') + // Append arguments to this file onto the iframe
          '" id="svgedit"></iframe>');

        this.module.getDomContent().html(this.dom);
            
        this.dom.bind('load', function () {
          var doc, mainButton,
          frame = document.getElementById('svgedit');
          self.svgCanvas = new EmbeddedSVGEdit(frame);
          // Hide main button, as we will be controlling new, load, save, etc. from the host document
          self.iframeDoc = frame.contentDocument || frame.contentWindow.document;
          self.svgEditor = frame.contentWindow.svgEditor;
          console.log(self.svgEditor);
          self.mainButton = self.iframeDoc.getElementById('main_button');
          self.fitToCanvasButton = self.iframeDoc.getElementById('fit_to_canvas');
 
          // What to do when the canvas changes
          self.svgCanvas.bind('changed', function() {
            console.log('svgCanvas changed');
            self.svgEditor.showSaveWarning = false;
            self._saveSvg();
          });
          self._loadSvg();
          self.iframeLoaded.resolve();
          self.resolveReady();
          console.log('resolve ready');
        });
      }
      else {
        self._loadSvg();
      }
    },

    inDom: function() {
      console.log('in dom');
    },

    onResize: function() {
      console.log('on resize');
      this.dom.height(this.height).width(this.width);
      // $(this.fitToCanvasButton).click();
      if(this.svgCanvas) {
        this.svgCanvas.zoomChanged(window, 'canvas');
      }
          
    },

    blank: function() {
      console.log('blank');
    },

    update: {

      svgModifier: function(data) {
        var self = this;
        console.log('svg modifier update')
        setTimeout(function() {
          self.modifySvg(data);
        }, 0);
        
      }
    },
    
    modifySvg: function(data) {
      var self = this;
      console.log('modify svg', data);
      var svgcontent= $(self.iframeDoc).find('#svgcontent');
      self.module._data = [];
      for(var key in data) {
        if(data[key].info) {
          self.module._data = data[key].info;
        }
        var contentElement = svgcontent.find('#'+key);
        if(data[key].value) {
          contentElement.html(data[key].value);
        }
        if(data[key].attributes) {
          contentElement.attr(data[key].attributes);
        }
        contentElement.off('mouseover').on('mouseover', function() {
          console.log('mouse over svg element', data[key].info  || {});
          self.module.controller.onHover(data[key].info || {});
        })
        .off('click').on('click', function() {
          console.log('click over svg element')
        })
        .off('mousedown').on('mousedown', function() {
          console.log('mousedown on svg element');
        });
        
      }
      self._saveSvg();
    },
    
    getDom: function() {
      return this.dom;
    },
    
    _loadSvg: function() {
      var svgcode = this.module.getConfiguration('svgcode');
      // console.log('load svg code: ', svgcode);
      this.svgCanvas.setSvgString(svgcode);
      this.module.controller.onChange(svgcode);
    },

    _saveSvg: function() {
      var self = this;
      function handleSvgData(data, error) {
        if(error) {
          console.error("Unable to get svg from iframe");
          return;
        }
        self.module.definition.configuration.groups.group[0].svgcode = [data];
        self.module.controller.onChange(data);
      }
      self.svgCanvas.getSvgString()(handleSvgData);
        
    }
  });

  return view;
});