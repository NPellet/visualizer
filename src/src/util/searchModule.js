'use strict';

define(['src/util/util', 'modules/modulefactory', 'src/main/grid', 'select2'], function (Util, ModuleFactory, Grid) {
    return function () {

        Util.loadCss('components/select2/dist/css/select2.css').then(function () {
            var modules = ModuleFactory.getModulesById();
            var keys = Object.keys(modules);

            var modulesArr = new Array(keys.length);
            for (var i = 0; i < keys.length; i++) {
                modulesArr[i] = modules[keys[i]];
                modulesArr[i].text = keys[i] + ' ' + modulesArr[i].moduleName;
            }
            var $select2 = '<div><div style="height:50px"></div> <select>';
            var selectWidth = 500;

            var ww = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var wh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            $select2 += '</select></div>';
            $select2 = $($select2);

            $select2 = $select2.css({
                position: 'fixed',
                'justify-content': 'center',
                top:0,
                left: 0,
                width: ww,
                height:wh,
                paddingLeft: Math.floor(ww / 2 - selectWidth / 2),
                paddingTop: 50,
                margin:0,
                'box-sizing': 'border-box',
                opacity: 0.7,
                backgroundColor: '#262b33'
            })
                .appendTo('body')
                .find('select')
                .addClass('js-example-basic-single').css({
                    width: selectWidth,
                    zIndex: 5000
                });

            function outputTemplate(module) {
                return module.moduleName;
            }

            $select2.select2({
                placeholder: 'Select a module',
                data: modulesArr,
                templateResult: outputTemplate

            }).select2('open');

            var selecting;
            $select2.on('select2:selecting', function (e) {
                selecting = true;
            });
            $select2.on('select2:select', function (e) {
                var url = e.params.data.url;
                $select2.select2('destroy');
                $select2.parent().remove();
                Grid.newModule(url);
            });

            $select2.on('select2:close', function (e) {
                if (!selecting) {
                    $select2.select2('destroy');
                    $select2.parent().remove();
                }
            });
        });
    };
});
