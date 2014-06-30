define(['require',
'underscore',
'modules/default/defaultview',
'src/util/typerenderer',
'src/util/util',
'src/util/datatraversing',
'svgedit'
], 



  function(require, _, Default, Renderer, UTIL, EditSvg) {
	
    function view() {
      var self = this;
      this.svgCanvas = null;
      this.iframeLoaded=$.Deferred();
      this.iframeLoaded.done(function() {
        self.svgCanvas.zoomChanged(window, 'canvas');
      });
    };
    view.prototype = $.extend(true, {}, Default, {
      
      init: function() {
        console.log('init');
        var self = this;
        

        console.log('svg editor init')
          
        if(this._configCheckBox('editable', 'isEditable')) {
          this.dom = $('<iframe src="lib/svg-edit-2.7/svg-editor.html?extensions=ext-xdomain-messaging.js' +
          window.location.href.replace(/\?(.*)$/, '&$1') + // Append arguments to this file onto the iframe
          '"></iframe>');
            
          this.module.getDomContent().html(this.dom);
            
          this.dom.bind('load', function () {
            var doc,
            frame = self.dom[0];
            // document.getElementById('svgedit');
            self.svgCanvas = new EmbeddedSVGEdit(frame);
            // Hide main button, as we will be controlling new, load, save, etc. from the host document
            self.iframeDoc = frame.contentDocument || frame.contentWindow.document;
            self.svgEditor = frame.contentWindow.svgEditor;
            console.log(self.svgEditor);
 
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
			
          var def = Renderer.toScreen({
            type: 'svg',
            value: self.module.getConfiguration('svgcode')
          }, this.module );
          def.always( function( val ) {
            self.dom = val;
            self.module.getDomContent().html(self.dom);
            self.resolveReady();
          });   
        } 
      },

    inDom: function() {
      console.log('in dom');
    },

    onResize: function() {
      console.log('on resize');
      if(this._configCheckBox('editable', 'isEditable')) {
        this.dom.height(this.height).width(this.width);
        if(this.svgCanvas) {
          this.svgCanvas.zoomChanged(window, 'canvas');
        } 
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
      var svgcontent;
      if(this._configCheckBox('editable', 'isEditable')) {
        svgcontent= $(self.iframeDoc).find('#svgcontent');
      }
      else {
        svgcontent = self.dom.find()
      }
      
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
      
      function saveAndTrigger(data) {
        self.module.definition.configuration.groups.group[0].svgcode = [data];
        self.module.controller.onChange(data);
      }
      function handleSvgData(data, error) {
        if(error) {
          console.error("Unable to get svg from iframe");
          return;
        }
        saveAndTrigger(data);
      }
      if(this._configCheckBox('editable', 'isEditable')) {
        setTimeout(function() {
          self.svgCanvas.getSvgString()(handleSvgData)
        }, 0);
      }
      else {
        var svgcode = self.dom.clone();
        var viewbox = svgcode[0].getAttribute('viewBox').split(' ');
        svgcode.attr('width', viewbox[2]).attr('height', viewbox[3]).removeAttr('viewBox');
        svgcode = svgcode.wrap('<p/>').parent().html();
        saveAndTrigger(svgcode);
      }
      
      // setTimeout(function() {
      //   var svgcode = $(self.iframeDoc).find('#svgcontent').wrap('<p/>').parent().html();
      //   $(self.iframeDoc).find('#svgcontent').unwrap()
      //   saveAndTrigger(svgcode);
      // }, 0);
        
    },
    
    _configCheckBox: function(config, option) {
      return this.module.getConfiguration(config) && _.find(this.module.getConfiguration(config), function(val){
        return val === option;
      });
    },
  });

  return view;
});