'use strict';

/* global EmbeddedSVGEdit*/
require.config({
  paths: {
    svgsanitize: 'lib/svg-edit/sanitize'
  },
  shim: {
    svgsanitize: [
      'lib/svg-edit/svgedit',
      'lib/svg-edit/browser',
      'lib/svg-edit/svgutils'
    ],
    'lib/svg-edit/svgutils': [
      'lib/svg-edit/browser',
      'lib/svg-edit/svgtransformlist',
      'lib/svg-edit/units'
    ],
    'lib/svg-edit/svgtransformlist': ['lib/svg-edit/browser']
  }
});

define([
  'require',
  'src/util/api',
  'lodash',
  'modules/default/defaultview',
  'src/util/debug',
  'src/util/typerenderer',
  'src/util/util',
  'src/util/datatraversing',
  'lib/svg-edit/embedapi',
  'svgsanitize'
], function (require, API, _, Default, Debug, Renderer) {
  var saveSvgThrottled = _.throttle(function () {
    var args = arguments;

    function saveAndTrigger(data) {
      if (args[0].module.getConfigurationCheckbox('saveSvg', 'yes')) {
        args[0].module.definition.configuration.groups.group[0].svgcode = [data];
      }
      args[0].module.controller.onChange(data);
    }

    function handleSvgData(data, error) {
      if (error) {
        Debug.error('Unable to get svg from iframe');
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
      svgcode
        .attr('width', viewbox[2])
        .attr('height', viewbox[3])
        .removeAttr('viewBox');
      svgcode = svgcode
        .wrap('<p/>')
        .parent()
        .html();
      saveAndTrigger(svgcode);
    }
  }, 1000);

  var animationTags = [
    'animate',
    'set',
    'animateMotion',
    'animateColor',
    'animateTransform'
  ];
  var defaultAnimAttributes = {
    begin: 'indefinite',
    options: {
      clearOnEnd: false,
      persistOnEnd: false,
      clearAnimationTagsOnEnd: false,
      clearAnimationTagsBeforeBegin: false
    }
  };

  var animationReserved = ['options', 'tag', 'attributes'];
  var mouseEventNames = ['click', 'dblclick', 'mouseenter', 'mouseleave'];
  var animMemory = {};
  var highlightCount = {};
  var blockHighlight = {};

  function View() {
    var that = this;
    this.svgCanvas = null;
    this.iframeLoaded = $.Deferred();
    this.iframeLoaded.done(function () {
      that.svgCanvas.zoomChanged(window, 'canvas');
    });
  }

  $.extend(true, View.prototype, Default, {
    _renderSvg: function (svgCode) {
      var that = this;
      if (svgCode) {
        svgCode = String(svgCode.get());
      } else {
        svgCode = that.module.getConfiguration('svgcode');
      }
      if (!svgCode) return Promise.resolve();

      return new Promise((resolve) => {
        if (this._configCheckBox('editable', 'isEditable')) {
          if (this.dom) this.dom.remove();
          this.svgCanvas = null;
          this.dom = $(
            `<iframe src="lib/svg-edit/svg-editor.html?extensions=ext-xdomain-messaging.js${
              window.location.href.replace(/\?(.*)$/, '&$1') // Append arguments to this file onto the iframe
            }"></iframe>`
          );

          this.module.getDomContent().html(this.dom);

          this.dom.bind('load', function () {
            var frame = that.dom[0];
            that.svgCanvas = new EmbeddedSVGEdit(frame);
            // Hide main button, as we will be controlling new, load, save, etc. from the host document
            that.iframeDoc =
              frame.contentDocument || frame.contentWindow.document;
            that.svgEditor = frame.contentWindow.svgEditor;
            frame.contentWindow.svgedit.options = {};

            // What to do when the canvas changes
            that.svgCanvas.bind('changed', function () {
              that.svgEditor.showSaveWarning = false;
              that._saveSvg();
            });
            that._loadSvg();
            that.iframeLoaded.resolve();
            that.onResize();
            return resolve();
          });
        } else {
          var domContent = that.module.getDomContent();
          return Renderer.render(domContent, {
            type: 'svg',
            value: svgCode
          })
            .catch(function () {
              domContent.html('<svg></svg>');
            })
            .then(function () {
              that.dom = domContent.find('svg');
            })
            .then(resolve);
        }
      }).then(() => {
        this.modifySvgFromArray(this.queuedSvgModifier, true);
      });
    },

    init: function () {
      this._renderSvg().then(() => {
        this.resolveReady();
      });
    },

    onResize: function () {
      if (this._configCheckBox('editable', 'isEditable') && this.dom) {
        this.dom.parent().css({ overflow: 'hidden' });
        this.dom.height(this.height).width(this.width);
        if (this.svgCanvas) {
          this.svgCanvas.zoomChanged(window, 'canvas');
        }
      }
    },

    update: {
      svgModifier: function (data) {
        this.queuedSvgModifier = data;
        this.modifySvgFromArray(this.queuedSvgModifier, true);
      },
      svgInput: function (svgCode) {
        this._renderSvg(svgCode).then(this._saveSvg.bind(this));
      }
    },

    addAnimation: function ($svgEl, anim) {
      var that = this;
      var $allAnimations = $([]);
      if (!anim.attributes) return;
      var id = $svgEl.attr('id');
      anim.tag = anim.tag || 'animate';
      if (animationTags.indexOf(anim.tag) === -1) return;
      if (!Array.isArray(anim.attributes)) {
        anim.attributes = [anim.attributes];
      }
      anim = _.defaults(anim, defaultAnimAttributes);
      var highlightId = that.getHighlightId($svgEl);

      var thisDefault = {};
      for (var k in anim) {
        if (animationReserved.indexOf(k) === -1)
          thisDefault[k] = _.cloneDeep(anim[k]);
      }
      for (let i = 0; i < anim.attributes.length; i++) {
        anim.attributes[i] = _.defaults(anim.attributes[i], thisDefault);

        $svgEl.each(function () {
          var animation = document.createElementNS(
            'http://www.w3.org/2000/svg',
            anim.tag
          );
          for (var attribute in anim.attributes[i]) {
            var attrValue = anim.attributes[i][attribute];
            attrValue =
              typeof attrValue === 'function' ? attrValue.call() : attrValue;
            animation.setAttributeNS(null, attribute, attrValue);
          }
          $(this).append(animation);
        });

        // get the animations we just appended
        var $animations = $svgEl.children(':last-child');
        $allAnimations = $allAnimations.add($animations);
      }

      $allAnimations.each(function (idx, element) {
        this.addEventListener('endEvent', function () {
          blockHighlight[highlightId] = false;
          // Persist works only for <animate/>
          if (anim.options.persistOnEnd) {
            if (anim.tag === 'animate') {
              $svgEl.attr(
                this.getAttribute('attributeName'),
                this.getAttribute('to')
              );
            } else {
              Debug.warn('Could not persist animation');
            }
          }

          if (anim.options.clearAnimationTags) {
            that.$getAnimationTags($svgEl).remove();
          }

          if (anim.options.clearOnEnd) {
            var timeout = anim.options.clearOnEnd.timeout || 0;
            setTimeout(function () {
              $(element).remove();
              that._saveSvg();
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
            that
              .$getAnimationTags($svgEl)
              .not($allAnimations)
              .remove();
            highlightCount[highlightId] = 0;
            blockHighlight[highlightId] = true;
          }
        });
        if (this.getAttribute('begin') === 'indefinite') this.beginElement();
      });
    },

    addAnimations: function ($svgEl, animation) {
      if (Array.isArray(animation)) {
        for (var i = 0; i < animation.length; i++) {
          this.addAnimation($svgEl, animation[i]);
        }
      } else {
        this.addAnimation($svgEl, animation);
      }
    },

    setAttributesOneByOne: function ($svgEl, attributes) {
      for (const key in attributes) {
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
      var that = this;

      if (!arr) return;
      // Convert to array if necessary
      if (!Array.isArray(arr)) {
        arr = [arr];
      }

      if (this._configCheckBox('editable', 'isEditable')) {
        this.$svgcontent = $(that.iframeDoc).find('#svgcontent');
      } else {
        this.$svgcontent = that.dom;
      }

      that.module._data = [];
      for (var i = 0; i < arr.length; i++) {
        this.modifySvgFromObject(arr[i], isPrimaryCall);
      }
      that._saveSvg();
    },

    modifySvgFromObject: function (obj, isPrimaryCall) {
      var that = this;
      var selector = obj.selector;
      if (!selector) return;

      var doHighlight = typeof obj._highlight === 'string';

      if (obj.info) {
        that.module._data = obj.info;
      }

      var $svgEl;
      var $svgcontent = this.$svgcontent;
      $svgEl = $svgcontent.find(selector);
      if ($svgEl.length === 0 && selector[0] !== '#') {
        $svgEl = $svgcontent.find(`#${selector}`);
      }

      if ($svgEl.length === 0) {
        Debug.warn('The svg element to modify was not found', selector);
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
        if (
          _.some(obj.attributes, (attribute) => typeof attribute === 'function')
        ) {
          this.setAttributesOneByOne($svgEl, obj.attributes);
        } else {
          // Use straightforward solution
          $svgEl.attr(obj.attributes);
        }
        that.removeStyleProperties($svgEl, obj.attributes);
      } else if (obj.animation && !obj.attributes) {
        // Case 2)
        that.addAnimations($svgEl, obj.animation);
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
        that.addAnimations($svgEl, obj.animation);
      } else if (obj.attributes && obj.animation && obj.animation.attributes) {
        // Case 4)
        $svgEl.attr(obj.attributes);
        that.removeStyleProperties($svgEl, obj.attributes);
        that.addAnimations($svgEl, obj.animation);
      }

      // We don't set callbacks on secondary calls
      if (!isPrimaryCall) return;

      function onMouseEnter() {
        $(this).css('cursor', 'pointer');
        that.module.controller.onHover(obj.info || {});
      }

      function onMouseLeave() {
        $(this).css('cursor', 'default');
      }

      function onMouseClick() {
        that.module.controller.onClick(obj.info || {});
      }

      // Listen to highlights
      if (doHighlight) {
        var killId = that.getHighlightId($svgEl);
        API.killHighlight(killId);
        API.listenHighlight({ _highlight: obj._highlight }, cb, false, killId);
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
        that.addAnimation($svgEl, animation);
      }

      // Set mouse event callbacks
      (function ($svgEl) {
        // We override the previous varout callback unconditionally
        $svgEl
          .off('mouseenter.svgeditor.varout')
          .off('mouseleave.svgeditor.varout')
          .off('click.svgeditor.varout');

        if (obj.info) {
          $svgEl
            .on('mouseenter.svgeditor.varout', onMouseEnter)
            .on('mouseleave.svgeditor.varout', onMouseLeave)
            .on('click.svgeditor.varout', onMouseClick);
        }

        for (var j = 0; j < mouseEventNames.length; j++) {
          if (obj.hasOwnProperty(mouseEventNames[j])) {
            (function (eventName) {
              $svgEl.off(eventName);
              $svgEl.on(eventName, function () {
                if (!obj[eventName].selector) {
                  obj[eventName].selector = obj.selector;
                }
                that.modifySvgFromArray(obj[eventName], false);
              });
            })(mouseEventNames[j]);
          }
        }
      })($svgEl);
    },

    getHighlightId: function ($svgEl) {
      $svgEl
        .map(function () {
          return this.getAttribute('id');
        })
        .toArray()
        .join(',');
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
      return (
        this.module.getConfiguration(config) &&
        _.find(this.module.getConfiguration(config), (val) => val === option)
      );
    },

    memorizeAnim: function (anim, id) {
      if (
        !id ||
        !anim.attributes ||
        !anim.attributes.to ||
        !anim.attributes.attributeName
      )
        return;
      animMemory[id] = animMemory[id] || {};
      animMemory[id][anim.attributes.attributeName] =
        animMemory[id][anim.attributes.attributeName] || {};
      animMemory[id][anim.attributes.attributeName].to = anim.attributes.to;
    },

    rememberAnim: function (anim, id) {
      if (!anim.attributes || anim.attributes.from || !id) return;
      if (
        !animMemory[id] ||
        !animMemory[id][anim.attributes.attributeName] ||
        !animMemory[id][anim.attributes.attributeName].to
      )
        return;
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
