define(['src/util/util', 'modules/modulefactory', 'src/main/grid','select2'], function(Util, ModuleFactory, Grid) {
    return function() {

        Util.loadCss('components/select2/dist/css/select2.css').then(function() {
            var modules = ModuleFactory.getModulesById();

            var keys = Object.keys(modules);

            var modulesArr = new Array(keys.length);
            for(var i=0; i<keys.length; i++) {
                modulesArr[i] = modules[keys[i]];
                modulesArr[i].id = keys[i];
                modulesArr[i].text = keys[i];
            }
            var $select2 = '<div><select>';

            var ww = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var wh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            $select2 += '</select></div>';
            $select2 = $($select2);

            $select2 = $select2.css({
                position: 'fixed',
                display: 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                top:0,
                left: 0,
                width: ww,
                height:wh,
                padding:0,
                margin:0,
                backgroundColor: 'rgba(255,255,255,0.3'
            })
                .appendTo('body')
                .find('select')
                .addClass('js-example-basic-single').css({
                    width: 500,
                    zIndex: 5000
                });

            $select2.select2({
                placeholder: "Select a module",
                data: modulesArr
            }).select2('open');

            var selecting;
            $select2.on('select2:selecting', function(e) {
                selecting = true;
            });
            $select2.on('select2:select', function(e) {
                var url = e.params.data.url;
                $select2.select2('destroy');
                $select2.parent().remove();
                Grid.newModule(url);
            });

            $select2.on('select2:close', function(e) {
                if(!selecting) {
                    $select2.select2('destroy');
                    $select2.parent().remove();
                }
            })
        });
    };
});