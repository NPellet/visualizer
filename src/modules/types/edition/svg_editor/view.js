'use strict';
/*global EmbeddedSVGEdit*/
require.config({
    paths: {
        svgsanitize: 'lib/svg-edit-2.7/sanitize'
    },
    shim: {
        'svgsanitize': ['lib/svg-edit-2.7/svgedit', 'lib/svg-edit-2.7/browser', 'lib/svg-edit-2.7/svgutils'],
        'lib/svg-edit-2.7/svgutils': ['lib/svg-edit-2.7/browser', 'lib/svg-edit-2.7/svgtransformlist', 'lib/svg-edit-2.7/units'],
        'lib/svg-edit-2.7/svgtransformlist': ['lib/svg-edit-2.7/browser']
    }
});

define([
    'require',
    'src/util/api',
    'lodash',
    'modules/default/defaultview',
    'src/util/typerenderer',
    'src/util/util',
    'src/util/datatraversing',
    'lib/svg-edit-2.7/embedapi',
    'svgsanitize'
], function (require, API, _, Default, Renderer) {
    var saveSvgThrottled = _.throttle(function () {
        var args = arguments;

        function saveAndTrigger(data) {
            args[0].module.definition.configuration.groups.group[0].svgcode = [data];
            args[0].module.controller.onChange(data);
        }

        function handleSvgData(data, error) {
            if (error) {
                console.error('Unable to get svg from iframe');
                return;
            }
            saveAndTrigger(data);
        }


        if (args[0]._configCheckBox('editable', 'isEditable')) {
            setTimeout(function () {
                args[0].svgCanvas.getSvgString()(handleSvgData);
            }, 0);
        } else {
            var svgcode = args[0].dom.clone();
            var viewbox = svgcode[0].getAttribute('viewBox').split(' ');
            svgcode.attr('width', viewbox[2]).attr('height', viewbox[3]).removeAttr('viewBox');
            svgcode = svgcode.wrap('<p/>').parent().html();
            saveAndTrigger(svgcode);
        }
    }, 1000);

    var animationTags = ['animate', 'set', 'animateMotion', 'animateColor', 'animateTransform'];
    var defaultAnimAttributes = {
        begin: 'indefinite',
        options: {
            clearOnEnd: false,
            persistOnEnd: false,
            clearAnimationTagsOnEnd: false,
            clearAnimationTagsBeforeBegin: false
        }
    };

    //var animationAttr = ['dur', 'fill', 'repeatCount', 'repeatDur', 'restart', 'attributeType', 'calcMode', 'additive', 'accumulate'];

    var animationReserved = ['options', 'tag', 'attributes'];
    var mouseEventNames = ['click', 'dblclick', 'mouseenter', 'mouseleave'];
    var animMemory = {};
    var highlightCount = {};
    var blockHighlight = {};

    function View() {
        var self = this;
        this.svgCanvas = null;
        this.iframeLoaded = $.Deferred();
        this.iframeLoaded.done(function () {
            self.svgCanvas.zoomChanged(window, 'canvas');
        });
    }

    $.extend(true, View.prototype, Default, {
        init: function () {
            var self = this;

            if (this._configCheckBox('editable', 'isEditable')) {
                if (this.dom) this.dom.remove();
                this.svgCanvas = null;
                this.dom = $('<iframe src="lib/svg-edit-2.7/svg-editor.html?extensions=ext-xdomain-messaging.js' +
                    window.location.href.replace(/\?(.*)$/, '&$1') + // Append arguments to this file onto the iframe
                    '"></iframe>');

                this.module.getDomContent().html(this.dom);

                this.dom.bind('load', function () {
                    var frame = self.dom[0];
                    // document.getElementById('svgedit');
                    self.svgCanvas = new EmbeddedSVGEdit(frame);
                    // Hide main button, as we will be controlling new, load, save, etc. from the host document
                    self.iframeDoc = frame.contentDocument || frame.contentWindow.document;
                    self.svgEditor = frame.contentWindow.svgEditor;
                    frame.contentWindow.svgedit.options = {};

                    // frame.contentWindow.svgedit.options.sanitize = self._configCheckBox('sanitize', 'doSanitize');

                    // What to do when the canvas changes
                    self.svgCanvas.bind('changed', function () {
                        self.svgEditor.showSaveWarning = false;
                        self._saveSvg();
                    });
                    self._loadSvg();
                    self.iframeLoaded.resolve();
                    self.resolveReady();
                    self.onResize();
                });
            } else {
                var domContent = self.module.getDomContent();
                Renderer.render(domContent, {
                    type: 'svg',
                    value: self.module.getConfiguration('svgcode')
                }).catch(function () {
                    domContent.html('<svg></svg>');
                }).then(function () {
                    self.dom = domContent.find('svg');
                    self.resolveReady();
                });
            }
        },

        onResize: function () {
            if (this._configCheckBox('editable', 'isEditable') && this.dom) {
                this.dom.height(this.height).width(this.width);
                if (this.svgCanvas) {
                    this.svgCanvas.zoomChanged(window, 'canvas');
                }
            }
        },

        update: {
            svgModifier: function (data) {
                var self = this;
                // var clone = [];

                // Avoid potential problems when separete elements of this array share the same reference to an object
                // for(var i=0; i<data.length; i++) {
                //     clone.push(_.cloneDeep(data[i]));
                // }
                self.modifySvgFromArray(data, true);
            }
        },

        addAnimation: function ($svgEl, anim) {
            var self = this;
            var $allAnimations = $([]);
            if (!anim.attributes) return;
            var id = $svgEl.attr('id');
            anim.tag = anim.tag || 'animate';
            if (animationTags.indexOf(anim.tag) === -1) return;
            if (!Array.isArray(anim.attributes)) {
                anim.attributes = [anim.attributes];
            }
            anim = _.defaults(anim, defaultAnimAttributes);
            var highlightId = self.getHighlightId($svgEl);

            var thisDefault = {};
            for (var k in anim) {
                if (animationReserved.indexOf(k) === -1) thisDefault[k] = _.cloneDeep(anim[k]);
            }
            for (var i = 0; i < anim.attributes.length; i++) {
                anim.attributes[i] = _.defaults(anim.attributes[i], thisDefault);
                // rememberAnim(anim,id)
                // memorizeAnim(anim, id);


                $svgEl.each(function () {
                    var animation = document.createElementNS('http://www.w3.org/2000/svg', anim.tag);
                    for (var attribute in anim.attributes[i]) {
                        var attrValue = anim.attributes[i][attribute];
                        attrValue = (typeof attrValue === 'function') ? attrValue.call() : attrValue;
                        animation.setAttributeNS(null, attribute, attrValue);
                    }
                    $(this).append(animation);
                });


                // get the animations we just appended
                var $animations = $svgEl.children(':last-child');
                $allAnimations = $allAnimations.add($animations);
            }

            $allAnimations.each(function () {
                this.addEventListener('endEvent', function () {
                    blockHighlight[highlightId] = false;
                    // Persist works only for <animate/>
                    if (anim.options.persistOnEnd) {
                        if (anim.tag === 'animate') {
                            $svgEl.attr(this.getAttribute('attributeName'), this.getAttribute('to'));
                        } else {
                            console.warn('Could not persist animation');
                        }
                    }

                    if (anim.options.clearAnimationTags) {
                        self.$getAnimationTags($svgEl).remove();
                    }

                    if (anim.options.clearOnEnd) {
                        var el = this;
                        var timeout = anim.options.clearOnEnd.timeout || 0;
                        setTimeout(function () {
                            $(el).remove();
                            self._saveSvg();
                        }, timeout);
                    } else {
                        // Don't clear anything
                    }
                });
                this.addEventListener('repeatEvent', function () {
                    // nothing to do...
                });
                this.addEventListener('beginEvent', function () {
                    if (anim.options.clearAnimationTagsBeforeBegin) {
                        self.$getAnimationTags($svgEl).not($allAnimations).remove();
                        highlightCount[highlightId] = 0;
                        blockHighlight[highlightId] = true;
                    }
                });
                if (this.getAttribute('begin') === 'indefinite')
                    this.beginElement();
            });
        },

        addAnimations: function ($svgEl, animation) {
            // First, remove all animations
            // $svgEl.find(animationTags.join(',')).remove();
            if (Array.isArray(animation)) {
                for (var i = 0; i < animation.length; i++) {
                    this.addAnimation($svgEl, animation[i]);
                }
            } else {
                this.addAnimation($svgEl, animation);
            }
        },

        setAttributesOneByOne: function ($svgEl, attributes) {
            for (var key in attributes) {
                if (typeof attributes[key] === 'function') {
                    $svgEl.each(function () {
                        this.setAttribute(key, attributes[key].call());
                    });
                } else {
                    $svgEl.attr(key, attributes[key]);
                }
            }
        },

        removeStyleProperties: function ($svgEl, attributes) {
            // We don't use jquery .css() because we want
            // to override style properties defined in stylesheet
            $svgEl.each(function () {
                // remove the style property if it has the same name
                for (var attribute in attributes) {
                    this.style.removeProperty(attribute);
                }
            });
        },

        modifySvgFromArray: function (arr, isPrimaryCall) {
            var self = this;

            // Convert to array if necessary
            if (!Array.isArray(arr)) {
                arr = [arr];
            }
            // if(isPrimaryCall) {
            //     this._clearEventCallbacks(arr);
            // }


            if (this._configCheckBox('editable', 'isEditable')) {
                this.$svgcontent = $(self.iframeDoc).find('#svgcontent');
            } else {
                this.$svgcontent = self.dom;
            }

            self.module._data = [];
            for (var i = 0; i < arr.length; i++) {
                this.modifySvgFromObject(arr[i], isPrimaryCall);
            }
            self._saveSvg();
        },

        modifySvgFromObject: function (obj, isPrimaryCall) {
            var self = this;
            var selector = obj.selector;
            if (!selector) return;

            var doHighlight = (typeof obj._highlight === 'string');


            if (obj.info) {
                self.module._data = obj.info;
            }

            var $svgEl;
            var $svgcontent = this.$svgcontent;
            $svgEl = $svgcontent.find(selector);
            if ($svgEl.length === 0) {
                $svgEl = $svgcontent.find('#' + selector);
            }

            if ($svgEl.length === 0) {
                console.warn('The svg element to modify was not found', selector);
                return;
            }
            if (obj.innerVal) {
                $svgEl.html(obj.innerVal);
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

            if (obj.attributes && !obj.animation) {
                // Case 1)
                if (_.any(obj.attributes, function (attribute) {
                        return typeof attribute === 'function';
                    })) {
                    this.setAttributesOneByOne($svgEl, obj.attributes);
                } else {
                    // Use straightforward solution
                    $svgEl.attr(obj.attributes);
                }
                $svgEl.each(function () {
                    // svgedit.sanitize.sanitizeSvg(this, true);
                });
                self.removeStyleProperties($svgEl, obj.attributes);
            } else if (obj.animation && !obj.attributes) {
                // Case 2)
                self.addAnimations($svgEl, obj.animation);
            } else if (obj.attributes && obj.animation && !obj.animation.attributes) {
                // Case 3)
                obj.animation.attributes = [];

                for (var k in obj.attributes) {
                    var a = {};
                    a.attributeName = k;
                    a.to = obj.attributes[k];
                    obj.animation.attributes.push(a);
                }

                delete obj.attributes;
                self.addAnimations($svgEl, obj.animation);
            } else if (obj.attributes && obj.animation && obj.animation.attributes) {
                // Case 4)
                $svgEl.attr(obj.attributes);
                self.removeStyleProperties($svgEl, obj.attributes);
                self.addAnimations($svgEl, obj.animation);
            }

            // We don't set callback on secondary calls
            if (!isPrimaryCall)
                return;

            function onMouseEnter() {

                /*      if( self.dataTimeout) { window.clearInterval( self.dataTimeout); }
                 self.dataTimeout = window.setInterval( function( ) { console.log( obj.info ); obj.info.triggerChange(); } , 100 );
                 */
                $(this).css('cursor', 'pointer');
                self.module.controller.onHover(obj.info || {});

            }

            function onMouseLeave() {
                // self.module.controller.onLeave(obj.info || {});
                $(this).css('cursor', 'default');
            }

            function onMouseClick() {
                self.module.controller.onClick(obj.info || {});
            }

            // Listen to highlights
            if (doHighlight) {
                var killId = self.getHighlightId($svgEl);
                API.killHighlight(killId);
                API.listenHighlight({_highlight: obj._highlight}, cb, false, killId);
                highlightCount[killId] = highlightCount[killId] || 0;
            }

            function cb(onOff) {
                if (blockHighlight[killId]) {
                    return;
                }
                var animation = {};
                animation.tag = 'animateTransform';
                animation.options = {
                    clearOnEnd: false,
                    persistOnEnd: false
                };
                animation.attributes = {
                    attributeName: 'transform',
                    type: 'scale',
                    from: '1.0',
                    dur: '0.2s',
                    additive: 'sum',
                    accumulate: 'sum',
                    fill: 'freeze'
                };
                if (onOff && highlightCount[killId] === 0) {
                    animation.options.clearAnimationTags = false;
                    animation.attributes.to = '1.25';
                    highlightCount[killId]++;
                } else if (!onOff && highlightCount[killId] === 1) {
                    animation.options.clearAnimationTags = false;
                    animation.attributes.to = '0.8';
                    highlightCount[killId]--;
                }
                self.addAnimation($svgEl, animation);
            }

            // Set mouse event callbacks
            (function ($svgEl) {
                // We override the previous varout callback unconditionally
                $svgEl.off('mouseenter.svgeditor.varout')
                    .off('mouseleave.svgeditor.varout')
                    .off('click.svgeditor.varout');

                if (obj.info) {
                    $svgEl.on('mouseenter.svgeditor.varout', onMouseEnter)
                        .on('mouseleave.svgeditor.varout', onMouseLeave)
                        .on('click.svgeditor.varout', onMouseClick);
                }
                //     var events  = $._data($svgEl[k], 'events');
                //     var isVaroutCallbackSet =  events.click && _.some(events.click, function(clickEvent) {
                //         return clickEvent.namespace === 'svgeditor.varout';
                //     };


                for (var j = 0; j < mouseEventNames.length; j++) {
                    if (obj.hasOwnProperty(mouseEventNames[j])) {
                        (function (eventName) {
                            //var namespacedEventName = eventName + '.svgeditor.svgmodifier';
                            $svgEl.off(eventName);
                            $svgEl.on(eventName, function () {
                                if (!obj[eventName].selector) {
                                    obj[eventName].selector = obj.selector;
                                }
                                self.modifySvgFromArray(obj[eventName], true);
                            });
                        })(mouseEventNames[j]);
                    }
                }
            })($svgEl);
        },

        getHighlightId: function ($svgEl) {
            $svgEl.map(function () {
                return this.getAttribute('id');
            }).toArray().join(',');
        },

        _clearEventCallbacks: function (svgModifier) {
            // This is a bit brutal, since we potentially clear callbacks that we did not set...
            for (var i = 0; i < svgModifier.length; i++) {
                if (svgModifier.selector) {
                    for (var j = 0; j < mouseEventNames.length; j++) {
                        $(svgModifier.selector).off(mouseEventNames[j] + '.svgeditor.svgmodifier');
                    }
                }
            }
        },


        getDom: function () {
            return this.dom;
        },

        _loadSvg: function () {
            var svgcode = this.module.getConfiguration('svgcode');
            this.svgCanvas.setSvgString(svgcode);
            this.module.controller.onChange(svgcode);
        },

        _saveSvg: function () {
            saveSvgThrottled(this);
        },

        _configCheckBox: function (config, option) {
            return this.module.getConfiguration(config) && _.find(this.module.getConfiguration(config), function (val) {
                    return val === option;
                });
        },

        memorizeAnim: function (anim, id) {
            if (!id || !anim.attributes || !anim.attributes.to || !anim.attributes.attributeName) return;
            animMemory[id] = animMemory[id] || {};
            animMemory[id][anim.attributes.attributeName] = animMemory[id][anim.attributes.attributeName] || {};
            animMemory[id][anim.attributes.attributeName].to = anim.attributes.to;
        },

        rememberAnim: function (anim, id) {
            if (!anim.attributes || anim.attributes.from || !id) return;
            if (!animMemory[id] || !animMemory[id][anim.attributes.attributeName] || !animMemory[id][anim.attributes.attributeName].to) return;
            anim.attributes.from = animMemory[id][anim.attributes.attributeName].to;
        },

        $getAnimationTags: function ($el) {
            var $retEl;
            for (var i = 0; i < animationTags.length; i++) {
                if (i === 0) $retEl = $el.find(animationTags[i]);
                else $retEl = $retEl.add($el.find(animationTags[i]));
            }
            return $retEl;
        }
    });

    return View;

});
