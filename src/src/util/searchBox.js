'use strict';

define([
  'src/util/util',
  'src/util/api',
  'modules/modulefactory',
  'src/main/grid',
  'select2'
], function (Util, API, ModuleFactory, Grid) {
  return function () {
    Util.loadCss('components/select2/dist/css/select2.css').then(function () {
      var modules = ModuleFactory.getModulesById();
      var keys = Object.keys(modules);

      var modulesArr = [];
      var layers = API.getLayerNames();
      var activeLayer = API.getActiveLayerName();
      var layersArr = [];
      for (var i = 0; i < keys.length; i++) {
        if (!modules[keys[i]].hidden) {
          const module = modules[keys[i]];
          modulesArr.push(module);
          module.text = `${keys[i]} ${module.moduleName}`;
          module.cat = 'module';
        }
      }

      for (i = 0; i < layers.length; i++) {
        var l = {};
        l.text = layers[i];
        l.cat = 'layer';
        l.id = `layer-${layers[i]}`;
        if (layers[i] === activeLayer) l.disabled = true;
        layersArr.push(l);
      }
      var $select2 = '<div><div style="height:50px"></div> <select>';
      var selectWidth = 500;

      var ww = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      var wh = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );

      $select2 += '</select></div>';
      $select2 = $($select2);

      $select2 = $select2
        .css({
          position: 'fixed',
          'justify-content': 'center',
          top: 0,
          left: 0,
          width: ww,
          height: wh,
          paddingLeft: Math.floor(ww / 2 - selectWidth / 2),
          paddingTop: 50,
          margin: 0,
          'box-sizing': 'border-box',
          opacity: 0.7,
          backgroundColor: '#262b33'
        })
        .appendTo('body')
        .find('select')
        .addClass('js-example-basic-single')
        .css({
          width: selectWidth,
          zIndex: 5000
        });

      function outputTemplate(module) {
        return module.moduleName || module.text;
      }

      var selectData = [];
      if (layersArr.length) {
        selectData.push({
          id: 'layer-list',
          text: 'Layers',
          children: layersArr
        });
      }
      if (modulesArr.length) {
        selectData.push({
          id: 'module-list',
          text: 'Modules',
          children: modulesArr
        });
      }
      $select2
        .select2({
          placeholder: 'Select a module',
          data: selectData,
          templateResult: outputTemplate
        })
        .select2('open')
        .val(null)
        .trigger('change');

      var selecting;
      $select2.on('select2:selecting', function (event) {
        selecting = true;
      });
      $select2.on('select2:select', function (e) {
        var url = e.params.data.url;
        $select2.select2('destroy');
        $select2.parent().remove();
        if (e.params.data.cat === 'module') {
          setImmediate(function () {
            Grid.newModule(url);
          });
        } else if (e.params.data.cat === 'layer') {
          API.switchToLayer(e.params.data.text);
        }
      });

      $select2.on('select2:close', function (event) {
        if (!selecting) {
          $select2.select2('destroy');
          $select2.parent().remove();
        }
      });
    });
  };
});
