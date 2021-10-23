'use strict';

define([
  'jquery',
  'src/util/ui',
  'src/util/util',
  'src/util/diagram',
  'modules/modulefactory',
  'src/util/context',
  'src/util/versioning',
  'forms/form',
  'src/main/variables',
  'src/util/debug',
  'version',
  'src/util/config',
  'delay'
], function (
  $,
  ui,
  Util,
  diagram,
  ModuleFactory,
  Context,
  Versioning,
  Form,
  Variables,
  Debug,
  Version,
  Config,
  delay
) {
  var definition, jqdom, moduleMove;
  var isInit = false;
  var activeLayer = 'Default layer';
  var layersUl, layersLi;
  var utilUl, utilLi;

  const SCREEN_RESOLUTIONS = [
    {
      name: '1080',
      width: 1920,
      height: 1080
    },
    {
      name: '768',
      width: 1366,
      height: 768
    },
    {
      name: '1440',
      width: 2560,
      height: 1440
    }
  ];

  const defaults = {
    xWidth: 10,
    yHeight: 10
  };

  const infoCss = {
    position: 'absolute',
    fontSize: '16pt'
  };
  const widthInfo = $('<span>').css(infoCss);
  const heightInfo = $('<span>').css(infoCss);
  const positionInfo = $('<span>')
    .css(infoCss)
    .css({ top: -2, left: 4 });

  function checkDimensions(extend) {
    var modules = ModuleFactory.getModules();
    var bottomMax = 0;
    for (var i in modules) {
      var pos = modules[i].getPosition(getActiveLayer()),
        size = modules[i].getSize(getActiveLayer());

      if (
        pos.top &&
        size.height &&
        modules[i].getLayer(getActiveLayer()).display
      ) {
        bottomMax = Math.max(bottomMax, pos.top + size.height);
      }
    }

    jqdom.css(
      'height',
      Math.max(
        $('#ci-visualizer').height() - $('#header').outerHeight(true) - 5,
        defaults.yHeight * bottomMax + (extend ? 400 : 0)
      )
    );
  }

  function addModuleFromJSON(json) {
    const module = ModuleFactory.newModule(json);
    addModule(module);
    return module;
  }

  function duplicateModule(module) {
    const def = DataObject.recursiveTransform(
      JSON.parse(JSON.stringify(module.definition))
    );

    def.layers[getActiveLayer()].position.left += 2;
    def.layers[getActiveLayer()].position.top += 2;

    addModuleFromJSON(def);
  }

  // this should only be called in the init script.
  function setInitialLayerName(layerName) {
    activeLayer = layerName;
  }

  function setModuleSize(module) {
    const modulePos = module.getPosition(getActiveLayer());
    const moduleSize = module.getSize(getActiveLayer());

    module.getDomWrapper().css({
      top: Math.round(modulePos.top) * definition.yHeight,
      left: Math.round(modulePos.left) * definition.xWidth,
      width: Math.round(moduleSize.width) * definition.xWidth,
      height: Math.round(moduleSize.height) * definition.yHeight,
      position: 'absolute' // We have to explicitly set the position in JS to avoid problems when the visualizer is in a display:none iframe.
      // jquery-ui/draggable forces the position to relative in this case because styles are not computed until the element is visible.
      // Refs: https://bugzilla.mozilla.org/show_bug.cgi?id=548397 and https://github.com/whatwg/html/issues/1813
    });
  }

  function addModule(module) {
    module.setLayers(
      definition.getChildSync(['layers'], true),
      true,
      false,
      false,
      getActiveLayer()
    );

    module.ready.then(
      function () {
        module.getDomWrapper().appendTo(jqdom);
        setModuleSize(module);
        if (!Versioning.isViewLocked()) {
          Context.listen(module.getDomWrapper().get(0), [
            [
              '<li name="tofront"><a><span class="ui-icon ui-icon-arrowreturn-1-n"></span> Move to front</a></li>',
              function () {
                moveToFront(module);
              }
            ],

            [
              '<li name="toback"><a><span class="ui-icon ui-icon-arrowreturn-1-s"></span> Move to back</a></li>',
              function () {
                moveToBack(module);
              }
            ],

            [
              '<li name="remove"><a><span class="ui-icon ui-icon-close"></span> Remove module</a></li>',
              function () {
                removeModule(module);
              }
            ],

            [
              '<li name="move"><a><span class="ui-icon ui-icon-arrow-4"></span> Move</a></li>',
              function (e) {
                var pos = module.getDomWrapper().position();
                var shiftX = e.pageX - pos.left;
                var shiftY = e.pageY - pos.top;
                moveModule(module, shiftX, shiftY);
              }
            ],

            [
              '<li name="duplicate"><a><span class="ui-icon ui-icon-copy"></span> Duplicate</a></li>',
              function () {
                duplicateModule(module);
              }
            ],

            [
              '<li name="copy"><a><span class="ui-icon ui-icon-copy"></span> Copy module</a></li>',
              function () {
                let currentDefinition = JSON.parse(
                  JSON.stringify(module.definition)
                );
                Object.keys(currentDefinition.layers).forEach((layer) => {
                  if (layer !== 'Default layer') {
                    delete currentDefinition.layers[layer];
                  }
                });
                window.localStorage.setItem(
                  'ci-copy-module',
                  JSON.stringify(currentDefinition)
                );
              }
            ]
          ]);
        }

        if (module.inDom) {
          module.inDom();
        }

        if (!Versioning.isViewLocked()) {
          // Insert jQuery UI resizable and draggable
          module
            .getDomWrapper()
            .resizable({
              grid: [definition.xWidth, definition.yHeight],
              start() {
                Util.maskIframes();
                module.resizing = true;
              },
              stop() {
                Util.unmaskIframes();
                hideModuleDimensions();
                moduleResize(module);
                module.resizing = false;
                checkDimensions(false);
              },
              resize(event, ui) {
                showModuleDimensions(module, ui.size);
                checkDimensions(true);
              },
              containment: 'parent'
            })
            .draggable({
              grid: [definition.xWidth, definition.yHeight],
              containment: 'parent',
              handle: '.ci-module-header',
              start() {
                Util.maskIframes();
                checkDimensions(true);
                module.moving = true;
              },
              stop() {
                const position = $(this).position();
                Util.unmaskIframes();
                hideModulePosition();
                module
                  .getPosition(getActiveLayer())
                  .set('left', Math.round(position.left / definition.xWidth));
                module
                  .getPosition(getActiveLayer())
                  .set('top', Math.round(position.top / definition.yHeight));
                module.moving = false;
                checkDimensions(true);
              },
              drag(event, ui) {
                showModulePosition(module, ui.position);
                checkDimensions(true);
              }
            })
            .trigger('resize');
        }

        module
          .getDomWrapper()
          .on('mouseover', function () {
            if (module.resizing || module.moving) return;
            if (module.getDomHeader().hasClass('ci-hidden')) {
              module
                .getDomHeader()
                .removeClass('ci-hidden')
                .addClass('ci-hidden-disabled');
              moduleResize(module);
            }
          })
          .on('mouseout', function () {
            if (module.resizing || module.moving) return;

            if (module.getDomHeader().hasClass('ci-hidden-disabled')) {
              module
                .getDomHeader()
                .addClass('ci-hidden')
                .removeClass('ci-hidden-disabled');
              moduleResize(module);
            }
          });

        module
          .getDomWrapper()
          .find('.ui-resizable-handle')
          .on('mousedown', function () {
            checkDimensions(true);
          });

        module.getDomWrapper().on('click', '.ci-module-expand', function () {
          module
            .getDomWrapper()
            .height(
              module.getDomContent().outerHeight() +
                module.getDomHeader().outerHeight(true)
            );
          moduleResize(module);
        });

        moduleResize(module);

        module.toggleLayer(getActiveLayer());
      },
      function (err) {
        Debug.error('Error during module dom initialization', err);
      }
    );
  }

  function showModuleDimensions(module, size) {
    const width = Math.round(size.width);
    const height = Math.round(size.height);
    const domWrapper = module.getDomWrapper();
    domWrapper.append(widthInfo);
    widthInfo
      .css({
        top: size.height,
        left: size.width / 2
      })
      .text(String(width));
    domWrapper.append(heightInfo);
    heightInfo
      .css({
        top: size.height / 2,
        left: size.width + 4
      })
      .text(String(height));
  }

  function hideModuleDimensions() {
    widthInfo.remove();
    heightInfo.remove();
  }

  function showModulePosition(module, position) {
    const left = Math.round(position.left / definition.xWidth);
    const top = Math.round(position.top / definition.yHeight);
    const domWrapper = module.getDomWrapper();
    domWrapper.append(positionInfo);
    positionInfo.text(`${left} / ${top}`);
  }

  function hideModulePosition() {
    positionInfo.remove();
  }

  function moduleResize(module) {
    var wrapper = module.getDomWrapper();

    module
      .getSize(getActiveLayer())
      .set('width', Math.round(wrapper.width() / definition.xWidth));
    module
      .getSize(getActiveLayer())
      .set('height', Math.round(wrapper.height() / definition.yHeight));

    var containerHeight =
      wrapper.height() -
      (module.getDomHeader().is(':visible')
        ? module.getDomHeader().outerHeight(true)
        : 0);

    module.getDomContent().css({
      height: containerHeight
    });

    module.view.width = module.getDomContent().width();
    module.view.height = containerHeight;
    module.view.onResize(module.view.width, module.view.height);
  }

  function newModule(url) {
    var modulePos = {};

    var mouseUpHandler = function () {
      var gridPos = jqdom.position();
      var left = Math.round(
        (modulePos.left - gridPos.left) / definition.xWidth
      );
      var top = Math.round((modulePos.top - gridPos.top) / definition.yHeight);
      var width = Math.round(modulePos.width / definition.xWidth);
      var height = Math.round(modulePos.height / definition.yHeight);

      modulePos.div.remove();
      modulePos = {};

      var module = ModuleFactory.newModule(
        new DataObject({
          // type: type,
          url: url
        })
      );

      addModule(module);

      var layer = module.getLayer(getActiveLayer());

      layer.position.set('left', left);
      layer.position.set('top', top);

      layer.size.set('width', width);
      layer.size.set('height', height);

      layer.wrapper = true;
      layer.title = '';

      $(document)
        .off('mousedown', mouseDownHandler)
        .off('mousemove', mouseMoveHandler)
        .off('mouseup', mouseUpHandler);

      jqdom.css('cursor', 'default');
    };

    var mouseDownHandler = function (e) {
      modulePos.left = e.pageX;
      modulePos.top = e.pageY;

      modulePos.ileft = e.pageX;
      modulePos.itop = e.pageY;

      modulePos.div = $('<div>')
        .css({
          border: '1px solid red',
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          width: 0,
          height: 0,
          left: modulePos.left,
          top: modulePos.top,
          position: 'absolute'
        })
        .appendTo($('body'));
    };

    var mouseMoveHandler = function (e) {
      if (!modulePos.left) return;

      modulePos.width = Math.abs(e.pageX - modulePos.ileft);
      modulePos.height = Math.abs(e.pageY - modulePos.itop);

      modulePos.left = Math.min(modulePos.ileft, e.pageX);
      modulePos.top = Math.min(modulePos.itop, e.pageY);

      modulePos.div.css({
        width: modulePos.width,
        height: modulePos.height,
        left: modulePos.left,
        top: modulePos.top
      });
    };

    $(document)
      .on('mousedown', mouseDownHandler)
      .on('mousemove', mouseMoveHandler)
      .on('mouseup', mouseUpHandler);

    jqdom.css('cursor', 'crosshair');
  }

  function moveToFront(module) {
    var modules = ModuleFactory.getModules(),
      dom = module.dom,
      myZIndex = module.definition.zindex || 1,
      count = 0,
      i;
    for (i in modules) {
      modules[i].definition.zindex = modules[i].definition.zindex || 1;
      if (modules[i].definition.zindex >= myZIndex)
        modules[i].definition.zindex--;
      modules[i].dom.css('zIndex', modules[i].definition.zindex);
      count++;
    }
    $(dom).css('zIndex', count);
    module.definition.zindex = count;
  }

  function moveToBack(module) {
    var modules = ModuleFactory.getModules(),
      dom = module.dom,
      myZIndex = module.definition.zindex || 1,
      count = 0,
      i;

    for (i in modules) {
      modules[i].definition.zindex = modules[i].definition.zindex || 1;
      if (modules[i].definition.zindex <= myZIndex)
        modules[i].definition.zindex++;
      modules[i].dom.css('zIndex', modules[i].definition.zindex);
      count++;
    }

    $(dom).css('zIndex', 1);
    module.definition.zindex = 1;
  }

  function removeModule(module) {
    if (module.controller && module.controller.onBeforeRemove) {
      if (module.controller.onBeforeRemove() === false) {
        return;
      }
    }

    try {
      module
        .getDomWrapper()
        .remove()
        .unbind();
    } catch (e) {
      module
        .onReady()
        .then(function () {
          module
            .getDomWrapper()
            .remove()
            .unbind();
        })
        .catch(function (e) {
          Debug.warn('Could not remove module from dom.', e);
        });
    }

    ModuleFactory.removeModule(module);

    if (module.controller && module.controller.onRemove) {
      module.controller.onRemove();
    }

    Variables.unlisten(module);
  }

  function moveModule(module, shiftX, shiftY) {
    moduleMove = { module: module, div: module.getDomWrapper() };
    Util.maskIframes();

    var mouseMoveHandler = function (e) {
      var gridPos = jqdom.position();

      moduleMove.top = e.pageY - shiftY;
      moduleMove.left = e.pageX - shiftX;
      moduleMove.div.css({
        top: moduleMove.top,
        left: moduleMove.left
      });
    };

    var clickHandler = function () {
      if (!moduleMove.left) return;

      var gridPos = jqdom.position();

      var left = Math.max(-3, Math.round(moduleMove.left / definition.xWidth));
      var top = Math.max(-3, Math.round(moduleMove.top / definition.yHeight));

      moduleMove.module.getPosition(getActiveLayer()).top = top;
      moduleMove.module.getPosition(getActiveLayer()).left = left;

      moduleMove.div.css({
        top: top * definition.yHeight,
        left: left * definition.xWidth
      });

      Util.unmaskIframes();
      moduleMove = null;
      $(document)
        .off('click', clickHandler)
        .off('mousemove', mouseMoveHandler);
    };

    $(document)
      .on('click', clickHandler)
      .on('mousemove', mouseMoveHandler);
  }

  var eachModules = function (callback) {
    var modules = ModuleFactory.getModules();

    for (var i = 0, l = modules.length; i < l; i++) {
      callback(modules[i]);
    }
  };

  var getActiveLayer = function () {
    return activeLayer;
  };

  function newLayer(toggleToIt, name) {
    var def = $.Deferred();

    if (name) {
      return (definition.layers[name] = { name: name });
    }

    var div = ui.dialog({
        autoPosition: true,
        title: 'New layer',
        width: '600px'
      }),
      form = new Form({});

    form.init();
    form.setStructure({
      sections: {
        layeropts: {
          options: {},
          groups: {
            layeropts: {
              options: {
                type: 'list',
                multiple: true
              },
              fields: {
                layername: {
                  type: 'text',
                  title: 'Layer name',
                  validation: {
                    rules: [
                      {
                        nonEmpty: true,
                        feedback: {
                          _class: true,
                          message: 'The layer name cannot be empty'
                        }
                      }
                    ]
                  }
                },
                blanklayer: {
                  type: 'checkbox',
                  title: 'Blank layer?',
                  options: {
                    blank: ' yes / no'
                  }
                }
              }
            }
          }
        }
      }
    });

    form.onStructureLoaded().done(function () {
      form.fill({});
    });

    form.addButton('Validate', { color: 'green' }, function () {
      div.dialog('close');
      var value = form.getValue().sections.layeropts[0].groups.layeropts[0],
        layer = { name: value.layername[0] };

      definition.layers[layer.name] = layer;
      def.resolve(layer);

      if (value.blanklayer[0].length === 0) {
        setLayers(false, undefined, false);
      } else {
        setLayers(false, undefined, true);
      }

      if (toggleToIt) {
        switchToLayer(layer.name);
      }
    });

    form.onLoaded().done(function () {
      div.html(form.makeDom(2));
      form.inDom();
    });

    return def;
  }

  function removeLayer() {
    var def = $.Deferred();

    var div = ui.dialog({
        autoPosition: true,
        title: 'Remove layer',
        width: '600px'
      }),
      form = new Form({});

    form.init();
    form.setStructure({
      sections: {
        layeropts: {
          options: {},
          groups: {
            layeropts: {
              options: {
                type: 'list',
                multiple: true
              },
              fields: {
                layername: {
                  type: 'text',
                  title: 'Layer name',
                  validation: {
                    rules: [
                      {
                        nonEmpty: true,
                        feedback: {
                          _class: true,
                          message: 'The layer name cannot be empty'
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    });

    form.onStructureLoaded().done(function () {
      form.fill({});
    });

    form.addButton('Validate', { color: 'green' }, function () {
      div.dialog('close');
      var value = form.getValue().sections.layeropts[0].groups.layeropts[0],
        layer = { name: value.layername[0] };

      if (
        definition.layers[layer.name] &&
        Object.keys(definition.layers).length > 1
      ) {
        ui.confirm(
          `<p>Are you sure that you want to delete the layer "${
            layer.name
          }"</p>`,
          'Confirm',
          'Cancel'
        ).then(function (conf) {
          if (conf) {
            // changes to other layer if is in the actual
            if (layer.name === activeLayer) {
              switchToLayer(Object.keys(definition.layers)[0]);
            }
            delete definition.layers[layer.name];
            ui.showNotification(`Layer "${layer.name}" deleted`, 'success');
          } else {
            ui.showNotification('Cancel layer deletion', 'info');
          }
        });
      } else {
        ui.showNotification(`Layer "${layer.name}" doesn't exist`, 'error');
      }

      setLayers(false, { remove: layer.name });
    });

    form.onLoaded().done(function () {
      div.html(form.makeDom(2));
      form.inDom();
    });

    return def;
  }

  function renameLayer() {
    var def = $.Deferred();

    var div = ui.dialog({
        autoPosition: true,
        title: 'Rename layer',
        width: '600px'
      }),
      form = new Form({});

    form.init();
    form.setStructure({
      sections: {
        layeropts: {
          options: {},
          groups: {
            layeropts: {
              options: {
                type: 'list',
                multiple: true
              },
              fields: {
                originalname: {
                  type: 'text',
                  title: 'Original layer name',
                  validation: {
                    rules: [
                      {
                        nonEmpty: true,
                        feedback: {
                          _class: true,
                          message: 'The layer name cannot be empty'
                        }
                      }
                    ]
                  }
                },
                newname: {
                  type: 'text',
                  title: 'New layer name',
                  validation: {
                    rules: [
                      {
                        nonEmpty: true,
                        feedback: {
                          _class: true,
                          message: 'The layer name cannot be empty'
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    });

    form.onStructureLoaded().done(function () {
      form.fill({});
    });

    form.addButton('Validate', { color: 'green' }, function () {
      div.dialog('close');
      var value = form.getValue().sections.layeropts[0].groups.layeropts[0],
        layer = { old: value.originalname[0], new: value.newname[0] };

      if (definition.layers[layer.old]) {
        if (definition.layers[layer.new]) {
          ui.showNotification(`Layer "${layer.new}" already exist`, 'error');
        } else {
          definition.layers[layer.new] = { name: layer.new };
          delete definition.layers[layer.old];
          if (layer.old === activeLayer) {
            switchToLayer(layer.new);
          }
          ui.showNotification(
            `Layer "${layer.old}" renamed to "${layer.new}"`,
            'success'
          );
        }
      } else {
        ui.showNotification(`Layer "${layer.old}" doesn't exist`, 'error');
      }

      setLayers(false, { rename: layer });
    });

    form.onLoaded().done(function () {
      div.html(form.makeDom(2));
      form.inDom();
    });

    return def;
  }

  function setLayers(newIsBlank, modify_layer, blank) {
    eachModules(function (moduleInstance) {
      moduleInstance.setLayers(
        definition.layers,
        newIsBlank,
        modify_layer,
        blank,
        getActiveLayer()
      );
    });
  }

  function getBestLayerName(name, options) {
    var resolutions = getBestResolutions(options);
    var layerNames = getLayerNames();
    for (var resolution of resolutions) {
      for (var layerName of layerNames) {
        if (layerName.match(new RegExp(`${name}.${resolution}`))) {
          return layerName;
        }
      }
    }
    return name;
  }

  // we will find the large resolution we could use
  function getBestResolutions(options = {}) {
    var { onlyLarger = true } = options;
    var resolutions = JSON.parse(JSON.stringify(SCREEN_RESOLUTIONS));
    var width = screen.width;
    var height = screen.height;
    for (var resolution of resolutions) {
      resolution.error = width - resolution.width + height - resolution.height;
    }
    if (onlyLarger) resolutions = resolutions.filter((a) => a.error >= 0);
    resolutions.sort((a, b) => {
      if (a.error >= 0 && b.error >= 0) return a.error - b.error;
      if (a.error >= 0) return -1;
      if (b.error >= 0) return 1;
      return b.error - a.error;
    });
    return resolutions.map((a) => a.name);
  }

  function getLayerNames() {
    return Object.keys(definition.layers);
  }

  function switchToLayer(layerId, options = {}) {
    if (options.autoSize) layerId = getBestLayerName(layerId, options);

    var layer = !definition.layers[layerId]
      ? newLayer(false, layerId)
      : definition.layers[layerId];

    $.when(layer).then(function (layer2) {
      if (layer2) {
        layer = layer2;
      }

      if (getActiveLayer() === layer.name) return;
      activeLayer = layer.name;

      eachModules(async function (moduleInstance) {
        while (!moduleInstance.domWrapper) {
          await delay(10);
        }
        var layer3 = moduleInstance.toggleLayer(layer.name);

        if (!layer3) {
          // moduleInstance.hide();
        } else {
          // moduleInstance.show();
          setModuleSize(moduleInstance);
        }
      });
    });
  }

  function eachLayer(callback) {
    for (var i in definition.layers) {
      callback(definition.layers[i], i);
    }
  }

  return {
    init: function (def, dom) {
      if (isInit) {
        return;
      }

      jqdom = $(dom);
      isInit = true;

      function makeRecursiveMenu(elements, dom) {
        if (elements.modules) {
          for (var i = 0, l = elements.modules.length; i < l; i++) {
            if (elements.modules[i].hidden) {
              continue;
            }
            dom.append(
              `<li class="ci-item-newmodule" data-url="${encodeURIComponent(
                elements.modules[i].url
              )}"><a>${elements.modules[i].moduleName}</a></li>`
            );
          }
        }

        if (elements.folders) {
          // List of folders
          for (var i in elements.folders) {
            var el = $(`<li><a>${i}</a></li>`);
            var ul = $('<ul />').appendTo(el);
            makeRecursiveMenu(elements.folders[i], ul);
            dom.append(el);
          }
        }
      }

      if (!Versioning.isViewLocked()) {
        Context.listen(Context.getRootDom(), [
          [
            '<li name="paste"><a><span class="ui-icon ui-icon-clipboard"></span>Paste module</a></li>',
            function () {
              var module = DataObject.recursiveTransform(
                JSON.parse(window.localStorage.getItem('ci-copy-module'))
              );
              addModuleFromJSON(module);
            }
          ]
        ]);

        if (
          Config.contextMenu().indexOf('all') > -1 ||
          Config.contextMenu().indexOf('add') > -1
        ) {
          Context.listen(dom, [], function (contextDom) {
            var $li = $('<li name="add"><a> Add a module</a></li>');

            var $ulModules = $('<ul />').appendTo($li);
            var allTypes = ModuleFactory.getTypes();
            $.when(allTypes).then(function (json) {
              if (typeof json === 'object' && !Array.isArray(json)) {
                json = [json];
              }

              if (Array.isArray(json)) {
                for (var i = 0, l = json.length; i < l; i++) {
                  makeRecursiveMenu(json[i], $ulModules);
                }
              }
            });

            $(contextDom).append($li);

            $li.on('mouseup', function (event) {
              event.stopPropagation();
              var module = $(event.target);
              if (module.prop('tagName') === 'A') {
                module = module.parent();
              }
              var url = module.attr('data-url');
              if (url) newModule(decodeURIComponent(url));
            });
          });
        }

        layersLi = $('<li><a> Switch to layer</a></li>');
        layersUl = $('<ul />').appendTo(layersLi);

        if (
          Config.contextMenu().indexOf('all') > -1 ||
          Config.contextMenu().indexOf('layers') > -1
        ) {
          Context.listen(dom, [], function (contextDom) {
            layersUl.empty();

            eachLayer(function (layer, key) {
              var li = $(
                `<li data-layer="${encodeURIComponent(
                  key
                )}"><a><span />${key}</a></li>`
              )
                .data('layerkey', key)
                .appendTo(layersUl);

              if (key == activeLayer) {
                li.find('span').addClass('ui-icon ui-icon-check');
              }
            });

            $('<li data-layer=""><a>+ Add a new layer</a></li>')
              .data('layerkey', '-1')
              .appendTo(layersUl);
            $('<li data-layer=""><a>- Remove a layer</a></li>')
              .data('layerkey', '-2')
              .appendTo(layersUl);
            $('<li data-layer=""><a>= Rename a layer</a></li>')
              .data('layerkey', '-3')
              .appendTo(layersUl);

            $(contextDom).append(layersLi);

            layersLi.on('mouseup', function (event) {
              event.stopPropagation();
              var target = $(event.target);
              if (target.prop('tagName') === 'A') {
                target = target.parent();
              }
              var layer = target.data('layerkey');
              if (layer !== '-1' && layer !== '-2' && layer !== '-3') {
                switchToLayer(layer);
              } else if (layer == '-1') {
                newLayer();
              } else if (layer == '-2') {
                removeLayer();
              } else if (layer == '-3') {
                renameLayer();
              }
            });
          });
        }

        utilLi = $('<li name="utils"><a>Utils</a></li>');
        utilUl = $('<ul />').appendTo(utilLi);

        if (
          Config.contextMenu().indexOf('all') > -1 ||
          Config.contextMenu().indexOf('utils') > -1
        ) {
          Context.listen(dom, [], function (contextDom) {
            utilUl.empty();
            utilUl.append(
              $('<li data-util="copyview"><a><span/>Copy view</a></li>').data(
                'utilkey',
                'copyview'
              )
            );
            utilUl.append(
              $('<li data-util="copydata"><a><span/>Copy data</a></li>').data(
                'utilkey',
                'copydata'
              )
            );
            utilUl.append(
              $('<li data-util="pasteview"><a><span/>Paste view</a></li>').data(
                'utilkey',
                'pasteview'
              )
            );
            utilUl.append(
              $('<li data-util="pastedata"><a><span/>Paste data</a></li>').data(
                'utilkey',
                'pastedata'
              )
            );
            utilUl.append(
              $('<li data-util="blankview"><a><span/>Blank view</a></li>').data(
                'utilkey',
                'blankview'
              )
            );
            utilUl.append(
              $(
                '<li data-util="feedback"><a><span/>Send Feedback</a></li>'
              ).data('utilkey', 'feedback')
            );
            $(contextDom).append(utilLi);

            utilLi.on('mouseup', function (event) {
              var utilkey = $(event.target.parentNode).data('utilkey');
              switch (utilkey) {
                case 'copyview':
                  Versioning.copyView();
                  break;
                case 'blankview':
                  Versioning.blankView();
                  break;
                case 'copydata':
                  Versioning.copyData();
                  break;
                case 'pasteview':
                  Versioning.pasteView();
                  break;
                case 'pastedata':
                  Versioning.pasteData();
                  break;
                case 'feedback':
                  ui.feedback();
                  break;
                default:
                  Debug.warn('Unknow util key');
                  break;
              }
            });
          });
        }

        Context.listen(Context.getRootDom(), [
          [
            '<li name="diagram"><a><span class="ui-icon ui-icon-zoomin"></span>View Diagram</a></li>',
            function () {
              diagram.showVariableDiagram();
            }
          ]
        ]);
        Context.listen(
          Context.getRootDom(),
          [
            [
              `<li class="ci-item-configureentrypoint" class="ui-state-disabled" id="context-menu-version"><a class="ui-state-disabled"><span class="ui-icon ui-icon-info"></span>${
                Versioning.version
              } </a></li>`,
              function () {
                window.open('https://github.com/NPellet/visualizer', '_blank');
              }
            ]
          ],
          null,
          function ($ctxmenu) {
            var original = Versioning.originalVersion;
            var prefix = '';
            if (original !== 'none' && original !== Versioning.version) {
              prefix = `${original}\u2192`;
            }
            $ctxmenu
              .find('#context-menu-version a')
              .html(
                `<span class="ui-icon ui-icon-info"></span>${prefix}${
                  Versioning.version
                }${Version.isRelease ? '' : ' (pre)'}`
              );
          }
        );

        if (Version.buildTime) {
          Context.listen(
            Context.getRootDom(),
            [
              [
                `<li id="context-menu-build-info"><a class="ui-state-disabled"><span class="ui-icon ui-icon-info"></span>Built ${
                  Version.buildTime
                }</a></li>`,
                Util.noop
              ]
            ],
            null,
            function ($ctxmenu) {
              $ctxmenu
                .find('#context-menu-build-info')
                .insertAfter($ctxmenu.find('#context-menu-version'));
            }
          );
        }
      }

      this.reset(def);
    },
    reset: function (def) {
      definition = def;
      definition.layers = definition.layers || {};

      if (!definition.xWidth) {
        definition.xWidth = 10;
      }

      if (!definition.yHeight) {
        definition.yHeight = 10;
      }

      var modules = ModuleFactory.getModules();
      while (modules.length) {
        removeModule(modules[0]);
      }

      $(jqdom).empty();
      checkDimensions();
      switchToLayer(activeLayer, { autoSize: true });
    },
    switchToLayer: function (name, options) {
      if (definition.layers[name] || options.autoSize) {
        switchToLayer(name, options);
      } else {
        Debug.warn(`Layer ${name} is not defined`);
      }
    },
    getLayerNames,
    setInitialLayerName,
    getActiveLayerName: getActiveLayer,
    addModule: addModule,
    newModule: newModule,
    removeModule: removeModule,
    addModuleFromJSON: addModuleFromJSON,
    checkDimensions: checkDimensions,
    moduleResize: moduleResize,
    setModuleSize: setModuleSize
  };
});
