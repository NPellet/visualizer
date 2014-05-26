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
          '" id="svgedit"></iframe>'
        );

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
        });
      }
      else {
        self._loadSvg();
      }
    },

    inDom: function() {},

    onResize: function() {
      this.dom.height(this.height).width(this.width);
      // $(this.fitToCanvasButton).click();
      if(this.svgCanvas) {
        this.svgCanvas.zoomChanged(window, 'canvas');
      }
          
    },

    blank: function() {
    },

    update: {

      data: function(data) {

      }
    },
    getDom: function() {
      return this.dom;
    },
    
    _loadSvg: function() {
      var svgcode = this.module.getConfiguration('svgcode');
      console.log('load svg code: ', svgcode);
      this.svgCanvas.setSvgString(svgcode);
    },

    _saveSvg: function() {
      var self = this;
      function handleSvgData(data, error) {
        if(error) {
          console.error("Unable to save svg");
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