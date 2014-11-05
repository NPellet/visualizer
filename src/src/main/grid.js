'use strict';

define(['jquery', 'jqueryui', 'src/util/util', 'modules/modulefactory', 'src/util/context', 'src/util/versioning', 'src/util/api', 'forms/form', 'src/main/variables', 'src/util/debug'], function ($, ui, Util, ModuleFactory, Context, Versioning, API, Form, Variables, Debug) {

    var definition, jqdom, moduleMove, isInit = false;
    var activeLayer = "Default layer";
    var modules = [];
    var layersUl, layersLi;

    var defaults = {
        xWidth: 10, // 20px per step
        yHeight: 10 // 20px per step
    };

    function checkDimensions(extend) {

        var bottomMax = 0;
        for (var i in modules) {
            var pos = modules[i].getPosition(getActiveLayer()),
                size = modules[i].getSize(getActiveLayer());

            if (pos.top && size.height) {
                bottomMax = Math.max(bottomMax, pos.top + size.height);
            }
        }

        jqdom.css('height',
            Math.max($(window).height() - $("#ci-header").outerHeight(true) - 1, (defaults.yHeight * bottomMax + (extend ? 1000 : 0)))
        );
    }

    function addModuleFromJSON(json) {

        var module = ModuleFactory.newModule(json);
        addModule(module);
        return module;
    }

    function duplicateModule(module) {

        var def = DataObject.recursiveTransform(JSON.parse(JSON.stringify(module.definition)));

        def.layers[getActiveLayer()].position.left += 2;
        def.layers[getActiveLayer()].position.top += 2;

        addModuleFromJSON(def);
    }

    function setModuleSize(module) {

        var modulePos = module.getPosition(getActiveLayer()),
            moduleSize = module.getSize(getActiveLayer());


        module.getDomWrapper().css({

            top: Math.round(modulePos.top) * definition.yHeight,
            left: Math.round(modulePos.left) * definition.xWidth,
            width: Math.round(moduleSize.width) * definition.xWidth,
            height: Math.round(moduleSize.height) * definition.yHeight

        });
    }

    function addModule(module) {

        module.setLayers(definition.getChildSync(['layers'], true), true);

        module.ready.then(function () {

            module.getDomWrapper().appendTo(jqdom);

            var grid = this;

            modules.push(module);
            setModuleSize(module);

            if (!API.isViewLocked()) {
                Context.listen(module.getDomWrapper().get(0), [

                    ['<li name="tofront"><a><span class="ui-icon ui-icon-arrowreturn-1-n"></span> Move to front</a></li>',
                        function () {
                            moveToFront(module);
                        }],

                    ['<li name="toback"><a><span class="ui-icon ui-icon-arrowreturn-1-s"></span> Move to back</a></li>',
                        function () {
                            moveToBack(module);
                        }],

                    ['<li name="remove"><a><span class="ui-icon ui-icon-close"></span> Remove module</a></li>',
                        function () {
                            removeModule(module);
                        }],

                    ['<li name="move"><a><span class="ui-icon ui-icon-arrow-4"></span> Move</a></li>',
                        function (e) {
                            var pos = module.getDomWrapper().position();
                            var shiftX = e.pageX - pos.left;
                            var shiftY = e.pageY - pos.top;
                            moveModule(module, shiftX, shiftY);
                        }],


                    ['<li name="duplicate"><a><span class="ui-icon ui-icon-copy"></span> Duplicate</a></li>',
                        function () {
                            duplicateModule(module);
                        }],

                    ['<li name="copy"><a><span class="ui-icon ui-icon-copy"></span> Copy module</a></li>',
                        function () {
                            window.localStorage.setItem("ci-copy-module", JSON.stringify(module.definition));
                        }]
                ]);
            }


            if (module.inDom) {
                module.inDom();
            }


            // Expands the grid when one click on the header
            module.getDomHeader().bind('mousedown', function () {
                checkDimensions(true);
            });

            if (!API.isViewLocked()) {
                // Insert jQuery UI resizable and draggable
                module.getDomWrapper().resizable({
                    grid: [definition.xWidth, definition.yHeight],
                    start: function () {
                        Util.maskIframes();
                        module.resizing = true;
                    },
                    stop: function () {
                        Util.unmaskIframes();
                        moduleResize(module);
                        module.resizing = false;
                        checkDimensions(false);
                    },
                    containment: "parent"

                }).draggable({

                    grid: [definition.xWidth, definition.yHeight],
                    containment: "parent",
                    handle: '.ci-module-header',
                    start: function () {
                        Util.maskIframes();
                        checkDimensions(true);
                        module.moving = true;
                    },
                    stop: function () {
                        var position = $(this).position();
                        Util.unmaskIframes();

                        module.getPosition(getActiveLayer()).set('left', position.left / definition.xWidth);
                        module.getPosition(getActiveLayer()).set('top', position.top / definition.yHeight);

                        //console.log( module.getPosition( getActiveLayer() ) );

                        module.moving = false;
                        checkDimensions(false);
                    },
                    drag: function () {
                        checkDimensions(true);
                    }

                }).trigger('resize');
            }

            module.getDomWrapper().bind('mouseover', function () {

                if (module.resizing || module.moving)
                    return;
                if (module.getDomHeader().hasClass('ci-hidden')) {
                    module.getDomHeader().removeClass('ci-hidden').addClass('ci-hidden-disabled');
                    moduleResize(module);
                }

            }).bind('mouseout', function () {

                if (module.resizing || module.moving)
                    return;

                if (module.getDomHeader().hasClass('ci-hidden-disabled')) {
                    module.getDomHeader().addClass('ci-hidden').removeClass('ci-hidden-disabled');
                    moduleResize(module);
                }
            });

            module.getDomWrapper().find('.ui-resizable-handle').bind('mousedown', function () {
                checkDimensions(true);
            });

            module.getDomWrapper().on('click', '.ci-module-expand', function () {
                module.getDomWrapper().height((module.getDomContent().outerHeight() + module.getDomHeader().outerHeight(true)));
                moduleResize(module);
            });

            moduleResize(module);

            module.toggleLayer(getActiveLayer());

        }, function (err) {
            Debug.error("Error during module dom initialization", err);
        });
    }


    function moduleResize(module) {

        var wrapper = module.getDomWrapper();

        module.getSize(getActiveLayer()).set('width', wrapper.width() / definition.xWidth);
        module.getSize(getActiveLayer()).set('height', wrapper.height() / definition.yHeight);

        var containerHeight = wrapper.height() - (module.getDomHeader().is(':visible') ? module.getDomHeader().outerHeight(true) : 0);

        module.getDomContent().css({
            height: containerHeight
        });

        module.view.width = module.getDomContent().width();
        module.view.height = containerHeight;
        module.view.onResize();
        window.dispatchEvent(new UIEvent('resize')); // Required by ace editor.
    }

    function newModule(url) {

        var modulePos = {};

        var mouseUpHandler = function () {

            var gridPos = jqdom.position();
            var left = Math.round((modulePos.left - gridPos.left) / definition.xWidth);
            var top = Math.round((modulePos.top - gridPos.top) / definition.yHeight);
            var width = Math.round(modulePos.width / definition.xWidth);
            var height = Math.round(modulePos.height / definition.yHeight);

            modulePos.div.remove();
            modulePos = {};

            var module = ModuleFactory.newModule(new DataObject({
                //type: type,
                url: url

            }));


            addModule(module);

            var layer = module.getActiveLayer(getActiveLayer());

            layer.position.set('left', left);
            layer.position.set('top', top);

            layer.size.set('width', width);
            layer.size.set('height', height);

            layer.wrapper = true;
            layer.title = "Untitled";


            $(document)
                .unbind('mousedown', mouseDownHandler)
                .unbind('mousemove', mouseMoveHandler)
                .unbind('mouseup', mouseUpHandler);

            jqdom.css('cursor', 'default');
        };

        var mouseDownHandler = function (e) {
            modulePos.left = e.pageX;
            modulePos.top = e.pageY;

            modulePos.ileft = e.pageX;
            modulePos.itop = e.pageY;

            modulePos.div = $("<div>").css({

                border: '1px solid red',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                width: 0,
                height: 0,
                left: modulePos.left,
                top: modulePos.top,
                position: 'absolute'

            }).appendTo($("body"));
        };

        var mouseMoveHandler = function (e) {

            if (!modulePos.left)
                return;

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
            .bind('mousedown', mouseDownHandler)
            .bind('mousemove', mouseMoveHandler)
            .bind('mouseup', mouseUpHandler);

        jqdom.css('cursor', 'crosshair');
    }

    function moveToFront(module) {

        var modules = ModuleFactory.getModules(),
            dom = module.dom,
            myZIndex = module.definition.zindex || 1,
            count = 0, i;
        for (i in modules) {
            modules[i].definition.zindex = modules[i].definition.zindex || 1;
            if (modules[i].definition.zindex >= myZIndex)
                modules[i].definition.zindex--;
            modules[i].dom.css("zIndex", modules[i].definition.zindex);
            count++;
        }
        $(dom).css("zIndex", count);
        module.definition.zindex = count;
    }

    function moveToBack(module) {

        var modules = ModuleFactory.getModules(),
            dom = module.dom,
            myZIndex = module.definition.zindex || 1,
            count = 0, i;

        for (i in modules) {
            modules[i].definition.zindex = modules[i].definition.zindex || 1;
            if (modules[i].definition.zindex <= myZIndex)
                modules[i].definition.zindex++;
            modules[i].dom.css("zIndex", modules[i].definition.zindex);
            count++;
        }

        $(dom).css("zIndex", 1);
        module.definition.zindex = 1;
    }

    function removeModule(module) {

        if (module.controller && module.controller.onBeforeRemove) {
            if (module.controller.onBeforeRemove() === false) {
                return;
            }
        }

        module.getDomWrapper().remove().unbind();
        ModuleFactory.removeModule(module);

        if (module.controller && module.controller.onRemove) {
            module.controller.onRemove();
        }

        Variables.unlisten(module);
    }


    function moveModule(module, shiftX, shiftY) {

        moduleMove = {module: module, div: module.getDomWrapper()};
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

        var clickHandler = function (e) {

            if (!moduleMove.left)
                return;

            var gridPos = jqdom.position();

            var left = Math.max(0, Math.round((moduleMove.left) / definition.xWidth));
            var top = Math.max(0, Math.round((moduleMove.top) / definition.yHeight));

            moduleMove.module.getPosition(getActiveLayer()).top = top;
            moduleMove.module.getPosition(getActiveLayer()).left = left;

            moduleMove.div.css({
                top: top * definition.yHeight,
                left: left * definition.xWidth
            });

            Util.unmaskIframes();
            moduleMove = null;
            $(document)
                .unbind('click', clickHandler)
                .unbind('mousemove', mouseMoveHandler);

        };

        $(document)
            .bind('click', clickHandler)
            .bind('mousemove', mouseMoveHandler);
    }

    var eachModules = function (callback) {

        if (!modules) {
            return;
        }

        for (var i = 0, l = modules.length; i < l; i++) {
            callback(modules[i]);
        }
    };


    var getActiveLayer = function () {
        return activeLayer;
    };

    function newLayer(toggleToIt, name) {

        var self = this,
            def = $.Deferred();

        if (name) {
            return definition.layers[name] = {name: name};

            setLayers()
            def.resolve(definition.layers[name]);
        }

        var div = $('<div></div>').dialog({modal: true, position: ['center', 50], width: '80%', title: ""}),
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
                                        rules: [{
                                            nonEmpty: true,
                                            feedback: {
                                                _class: true,
                                                message: "The layer name cannot be empty"
                                            }
                                        }]
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

        form.addButton('Validate', {color: 'green'}, function () {

            div.dialog('close');
            var value = form.getValue().sections.layeropts[0].groups.layeropts[0],
                layer = {name: value.layername[0]};

            definition.layers[layer.name] = layer;
            def.resolve(layer);

            setLayers();

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

    function setLayers(newIsBlank) {
        eachModules(function (moduleInstance) {
            moduleInstance.setLayers(definition.layers, newIsBlank);
        });
    }

    function switchToLayer(layerId, noForm) {

        var layer = ( !definition.layers[layerId] ) ? ( newLayer(false, layerId) ) : definition.layers[layerId];

        $.when(layer).then(function (layer2) {

            if (layer2) {
                layer = layer2;
            }

            activeLayer = layer.name;

            eachModules(function (moduleInstance) {

                var layer3 = moduleInstance.toggleLayer(layer.name);

                if (!layer3) {
                    //moduleInstance.hide();
                } else {
                    //moduleInstance.show();
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
        init: function (def, dom, _modules) {

            if (isInit) {
                return;
            }

            if (_modules) {
                modules = _modules;
            }


            jqdom = $(dom);
            isInit = true;

            function makeRecursiveMenu(elements, dom) {

                if (elements.modules) {

                    for (var i = 0, l = elements.modules.length; i < l; i++) {
                        dom.append('<li class="ci-item-newmodule" data-url="' + encodeURIComponent(elements.modules[i].url) + '"><a>' + elements.modules[i].moduleName + '</a></li>');
                    }

                }

                if (elements.folders) { // List of folders

                    for (var i in elements.folders) {

                        var el = $('<li><a>' + i + '</a></li>');
                        var ul = $("<ul />").appendTo(el);
                        makeRecursiveMenu(elements.folders[i], ul);
                        dom.append(el);
                    }
                }
            }

            if (!API.isViewLocked()) {

                Context.listen(Context.getRootDom(), [
                        ['<li name="paste"><a><span class="ui-icon ui-icon-clipboard"></span>Paste module</a></li>',
                            function () {
                                var module = DataObject.recursiveTransform(JSON.parse(window.localStorage.getItem("ci-copy-module")));
                                addModuleFromJSON(module);
                            }]]
                );

                if (API.getContextMenu().indexOf('all') > -1 || API.getContextMenu().indexOf('add') > -1) {
                    Context.listen(dom, [], function (contextDom) {
                        var $li = $('<li name="add"><a> Add a module</a></li>');

                        var $ulModules = $("<ul />").appendTo($li);
                        var allTypes = ModuleFactory.getTypes();
                        $.when(allTypes).then(function (json) {

                            if (typeof json === "object" && !Array.isArray(json)) {
                                json = [json];
                            }

                            if (Array.isArray(json)) {
                                for (var i = 0, l = json.length; i < l; i++) {
                                    makeRecursiveMenu(json[i], $ulModules);
                                }
                            } else {

                            }

                        });

                        $(contextDom).append($li);

                        $li.bind('click', function (event) {
                            var url = $(event.target.parentNode).attr('data-url');
                            if (url)
                                newModule(decodeURIComponent(url));
                        });
                    });
                }


                layersLi = $('<li><a> Switch to layer</a></li>');
                layersUl = $("<ul />").appendTo(layersLi);

                if (API.getContextMenu().indexOf('all') > -1 || API.getContextMenu().indexOf('layers') > -1) {
                    Context.listen(dom, [], function (contextDom) {

                        layersUl.empty();

                        eachLayer(function (layer, key) {
                            var li = $('<li data-layer="' + encodeURIComponent(key) + '"><a><span />' + key + '</a></li>').data('layerkey', key).appendTo(layersUl);

                            if (key == activeLayer) {
                                li.find('span').addClass('ui-icon ui-icon-check');
                            }


                        });

                        $('<li data-layer=""><a>+ Add a new layer</a></li>').data('layerkey', "-1").appendTo(layersUl);

                        $(contextDom).append(layersLi);

                        layersLi.bind('click', function (event) {
                            var layer = $(event.target.parentNode).data('layerkey');

                            if (layer !== "-1") {
                                switchToLayer(layer);

                            } else if (layer == "-1") {
                                newLayer();
                            }
                        });

                    });
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
            modules.forEach(removeModule);

            $(jqdom).empty();
            checkDimensions();
            switchToLayer(activeLayer);
        },
        switchToLayer: function (name) {
            if(definition.layers[name]) {
                switchToLayer(name);
            } else {
                Debug.warn('Layer ' + name + ' is not defined');
            }
        },
        getLayerNames: function () {
            return Object.keys(definition.layers);
        },
        addModule: addModule,
        addModuleFromJSON: addModuleFromJSON,
        checkDimensions: checkDimensions,
        moduleResize: moduleResize,
        setModuleSize: setModuleSize
    };

});