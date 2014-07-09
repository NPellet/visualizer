define(['require',
'underscore',
'modules/default/defaultview',
'src/util/typerenderer',
'src/util/util',
'src/util/datatraversing',
'svgedit'
], 



  function(require, _, Default, Renderer, UTIL, EditSvg) {
    
    // Utility function
    var rulesForCssText = function (styleContent) {
        styleContent = '#dummydummydummy { ' + styleContent + '}';
        var doc = document.implementation.createHTMLDocument(""),
            styleElement = document.createElement("style");
    
        styleElement.textContent = styleContent;
        // the style will only be parsed once it is added to a document
        doc.body.appendChild(styleElement);
        var result = {};
        var style = styleElement.sheet.cssRules[0].style;
        for(var i=0; i<style.length; i++) {
            result[style[i]] = style[style[i]];
        }
        return result;
    };
    
    var rulesToCss = function(rules) {
        var result = [];
        for(var el in rules) {
            result.push(el+':' + rules[el]);
        }
        return result.join(';') + ';';
    }
    
	  var animationTags = ['animate', 'set', 'animateMotion', 'animateColor', 'animateTransform'];
    var defaultAnimAttributes =  {
      begin: 'indefinite'
    };
    
    var animMemory = {};
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
        self.modifySvg(data); 
      }
    },
    
    modifySvg: function(data) {
      var self = this;
      function memorizeAnim(anim, id) {
        if(!id || !anim.attributes || !anim.attributes.to || !anim.attributes.attributeName) return;
        animMemory[id] = animMemory[id] || {};
        animMemory[id][anim.attributes.attributeName] = animMemory[id][anim.attributes.attributeName] || {};
        animMemory[id][anim.attributes.attributeName].to = anim.attributes.to
      }
      
      function rememberAnim(anim, id) {
        if(!anim.attributes || anim.attributes.from || !id) return;
        if(!animMemory[id] || !animMemory[id][anim.attributes.attributeName] || !animMemory[id][anim.attributes.attributeName].to) return;
        anim.attributes.from = animMemory[id][anim.attributes.attributeName].to;
      }
      
      function addAnimation(anim, $svgEl) {
        if(!anim.attributes) return;
        var id = $svgEl.attr('id');
        if(_.some(animationTags, function(val) {
          return val === anim.tag;
        })) {
          console.log('animation ', anim.tag);
          var animation = document.createElementNS('http://www.w3.org/2000/svg', anim.tag);
          anim.attributes = _.defaults(anim.attributes, defaultAnimAttributes);
          // rememberAnim(anim,id)
          // memorizeAnim(anim, id);
          for(var attribute in anim.attributes) {
            animation.setAttributeNS(null, attribute, anim.attributes[attribute]);
          }
          
          $svgEl[0].appendChild(animation);
            animation.addEventListener('endEvent', function() {
              $(animation).remove();
              if(anim.persist) {
                $svgEl.attr(anim.attributes.attributeName, anim.attributes.to);
              }
            });
            animation.addEventListener('repeatEvent', function() {
              // nothing to do...
            });
            animation.addEventListener('beginEvent', function() {
              // nothing to do...
            });
            animation.beginElement();
          
        }
      }
      // console.log('modify svg', data);
      var svgcontent;
      if(this._configCheckBox('editable', 'isEditable')) {
        svgcontent= $(self.iframeDoc).find('#svgcontent');
      }
      else {
        svgcontent = self.dom;
      }
      
      self.module._data = [];
      for(var key in data) {
        if(data[key].info) {
          self.module._data = data[key].info;
        }
        
        var $svgEl;
        $svgEl = svgcontent.find(key);
        if($svgEl.length === 0) {
          $svgEl = svgcontent.find('#'+key);
        }
        else {
          console.log('lo');
        }
        
        if($svgEl.length === 0) {
          console.warn('The svg element to modify was not found');
          continue;
        }
        if(data[key].innerVal) {
          $svgEl.html(data[key].innerVal);
          
        }
        if(data[key].attributes) {
          $svgEl.attr(data[key].attributes);
          
          // We don't use jquery .css() because we want
          // to override style properties defined in stylesheet
          $svgEl.each(function() {
            for(var attribute in data[key].attributes) {
             this.style.removeProperty(attribute); 
            }
          });
        }
        
        if(data[key].animation) {
          // First, remove all animations
          // $svgEl.find(animationTags.join(',')).remove();
          if(data[key].animation instanceof Array) {
            for(var i=0; i<data[key].animation.length; i++) {
              addAnimation(data[key].animation[i], $svgEl);
            }
          }
          else {
            addAnimation(data[key].animation, $svgEl);
          }
        }
        (function($svgEl, key){
          if(data[key].info) {
            $svgEl.off('mouseover').on('mouseover', function() {
              self.module.controller.onHover(data[key].info || {});
            })
            .off('click').on('click', function() {
              self.module.controller.onClick(data[key].info || {});
            });
          } 
        })($svgEl, key);
        
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
    }
  });

  return view;
});