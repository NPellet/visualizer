requirejs.config({
    paths: {
        svgsanitize: "lib/svg-edit-2.7/sanitize"
    },
    shim: {
        "svgsanitize": ["lib/svg-edit-2.7/svgedit", 'lib/svg-edit-2.7/browser', 'lib/svg-edit-2.7/svgutils'],
        "lib/svg-edit-2.7/svgutils": ['lib/svg-edit-2.7/browser', 'lib/svg-edit-2.7/svgtransformlist', 'lib/svg-edit-2.7/units'],
        "lib/svg-edit-2.7/svgtransformlist": ['lib/svg-edit-2.7/browser'],
    }
});

define(['require',
'underscore',
'modules/default/defaultview',
'src/util/typerenderer',
'src/util/util',
'src/util/datatraversing',
'lib/svg-edit-2.7/embedapi'
,'svgsanitize'
], 



function(require, _, Default, Renderer, UTIL) {
    var saveSvgThrottled = _.throttle(function() {
        var args = arguments;
        function saveAndTrigger(data) {
            args[0].module.definition.configuration.groups.group[0].svgcode = [data];
            args[0].module.controller.onChange(data);
        }
        function handleSvgData(data, error) {
            if(error) {
                console.error("Unable to get svg from iframe");
                return;
            }
            saveAndTrigger(data);
        }
        
        
        if(args[0]._configCheckBox('editable', 'isEditable')) {
            setTimeout(function() {
                args[0].svgCanvas.getSvgString()(handleSvgData)
            }, 0);
        }
        else {
            var svgcode = args[0].dom.clone();
            var viewbox = svgcode[0].getAttribute('viewBox').split(' ');
            svgcode.attr('width', viewbox[2]).attr('height', viewbox[3]).removeAttr('viewBox');
            svgcode = svgcode.wrap('<p/>').parent().html();
            saveAndTrigger(svgcode);
        }
    }, 1000);
    
    
    var animationTags = ['animate', 'set', 'animateMotion', 'animateColor', 'animateTransform'];
    var defaultAnimAttributes =  {
        begin: 'indefinite',
        options: {
            clearOnEnd: true,
            persistOnEnd: false
        }
    };
    
    var animationAttr = ['dur', 'fill', 'repeatCount', 'repeatDur', 'restart', 'attributeType',
    'calcMode', 'additive', 'accumulate'];
    
    var animationReserved = ['options', 'tag', 'attributes'];
    
    var animStyleAccepted = ['display'];
    
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
            var self = this;
        

            console.log('svg editor init')
          
            if(this._configCheckBox('editable', 'isEditable')) {
                if(this.dom) this.dom.remove();
                this.svgCanvas = null;
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
                    frame.contentWindow.svgedit.options = {};
                    
                    // frame.contentWindow.svgedit.options.sanitize = self._configCheckBox('sanitize', 'doSanitize');
                    //console.log(self.svgEditor);
 
                    // What to do when the canvas changes
                    self.svgCanvas.bind('changed', function() {
                        console.log(arguments);
                        console.log('svgCanvas changed');
                        self.svgEditor.showSaveWarning = false;
                        self._saveSvg();
                    });
                    self._loadSvg();
                    self.iframeLoaded.resolve();
                    self.resolveReady();
                    self.onResize();
                    console.log('resolve ready');
                });
            }
            else {
			
                var def = Renderer.toScreen({
                    type: 'svg',
                    value: self.module.getConfiguration('svgcode')
                }, this.module );
                def.always( function( val ) {
                    self.dom = val || $('<svg></svg>');
                    console.log('rendered', self.dom);
                    self.module.getDomContent().html(self.dom);
                    // if(self._configCheckBox('sanitize', 'doSanitize')) {
                    //     svgedit.sanitize.sanitizeSvg(self.dom[0]);
                    // }
                    self.resolveReady();
                });   
            } 
        },

        inDom: function() {
            console.log('in dom');
        },

        onResize: function() {
            console.log('on resize');
            if(this._configCheckBox('editable', 'isEditable') && this.dom) {
                console.log('on resize apply');
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
      
            function addAnimation($svgEl, anim) {
                var count = 0;
                if(!anim.attributes) return;
                var id = $svgEl.attr('id');
                anim.tag = anim.tag || 'animate';
                if(animationTags.indexOf(anim.tag) === -1) return;
                if(!(anim.attributes instanceof Array)) {
                    anim.attributes = [anim.attributes];
                }
                anim = _.defaults(anim, defaultAnimAttributes);
                var thisDefault = {};
                for(k in anim) {
                    if(animationReserved.indexOf(k) === -1) thisDefault[k] = _.clone(anim[k]);
                }
                
                for(var i=0; i<anim.attributes.length; i++) {
                    var animation = document.createElementNS('http://www.w3.org/2000/svg', anim.tag);
                    anim.attributes[i] = _.defaults(anim.attributes[i], thisDefault);
                    // rememberAnim(anim,id)
                    // memorizeAnim(anim, id);
                    
                    for(var attribute in anim.attributes[i]) {
                        animation.setAttributeNS(null, attribute, anim.attributes[i][attribute]);
                    }
                    $svgEl.append(animation);
                    
                    (function(){
                        var ii = i;
                        var aanim = animation;
                        aanim.addEventListener('endEvent', function() {
                            if(anim.options.clearOnEnd) {
                                $(aanim).remove();
                                self._saveSvg();
                            }
                            else {
                                console.log('not clear on end')
                            }
                            if(anim.options.persistOnEnd) {
                                $svgEl.attr(this.getAttribute('attributeName'), this.getAttribute('to'));
                            }
                        });
                        aanim.addEventListener('repeatEvent', function() {
                            // nothing to do...
                        });
                        aanim.addEventListener('beginEvent', function() {
                            // nothing to do...
                        });
                        aanim.beginElement();
                    })();
                        
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
        
                if($svgEl.length === 0) {
                    console.warn('The svg element to modify was not found', key);
                    continue;
                }
                if(data[key].innerVal) {
                    $svgEl.html(data[key].innerVal);
                }
        
                // 4 cases here
                // 1) Simple change of attributes
                //   attributes: {}
                // 2) Simple animation
                //   animation: {attributes: {}}
                // 3) For convenience, you can animate attributes specified outside
                //  attributes: {}, animation: {}
                // 4) In case you do both, they are considered separately
                //  attributes: {}, animation: { attributes: {}}
        
        
                function removeStyleProperties($svgEl, attributes) {
                    // We don't use jquery .css() because we want
                    // to override style properties defined in stylesheet
                    $svgEl.each(function() {
                        // remove the style property if it has the same name
                        for(var attribute in data[key].attributes) {
                            this.style.removeProperty(attribute); 
                        }
                    });
                }
        
                function addAnimations($svgEl, animation) {
                    // First, remove all animations
                    // $svgEl.find(animationTags.join(',')).remove();
                    if(animation instanceof Array) {
                        for(var i=0; i<animation.length; i++) {
                            addAnimation($svgEl, animation[i]);
                        }
                    }
                    else {
                        addAnimation($svgEl, animation);
                    }
                }
                // Case 1)
                if(data[key].attributes && !data[key].animation) {
                    $svgEl.attr(data[key].attributes);
                    $svgEl.each(function() {
                       // svgedit.sanitize.sanitizeSvg(this, true);
                    });
                    removeStyleProperties($svgEl, data[key].attributes);
                }
        
                // Case 2)
                else if(data[key].animation && !data[key].attributes) {
                    addAnimations($svgEl, data[key].animation)
                }
        
                // Case 3)
                else if(data[key].attributes && data[key].animation && !data[key].animation.attributes) {
                    console.log('case 3');
                    data[key].animation.attributes = [];
            
            
                    for(var k in data[key].attributes) {
                        var a = {};
                        a.attributeName = k;
                        a.to = data[key].attributes[k];
                        data[key].animation.attributes.push(a);
                    }
            
                    delete data[key].attributes;
            
                    addAnimations($svgEl, data[key].animation);
                }
        
                // Case 4)
                else if(data[key].attributes && data[key].animation && data[key].animation.attributes) {
                    $svgEl.attr(data[key].attributes);
                    removeStyleProperties($svgEl, data[key].attributes);
                    addAnimations($svgEl, data[key].animation);
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
            saveSvgThrottled(this);
              },
    
        _configCheckBox: function(config, option) {
            return this.module.getConfiguration(config) && _.find(this.module.getConfiguration(config), function(val){
                return val === option;
            });
        }
    });

    return view;
});