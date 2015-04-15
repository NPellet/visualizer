define(['src/util/util', 'modules/modulefactory', 'src/main/grid','select2'], function(Util, ModuleFactory, Grid) {
    return function() {

        Util.loadCss('components/select2/dist/css/select2.css').then(function() {
            var modules = ModuleFactory.getModulesById();

            console.log(modules);
            var keys = Object.keys(modules);

            var modulesArr = new Array(keys.length);
            for(var i=0; i<keys.length; i++) {
                modulesArr[i] = modules[keys[i]];
                modulesArr[i].id = keys[i];
                modulesArr[i].text = keys[i];
            }
            var $select2 = '<div><select>';
            //for(var i=0; i<keys.length; i++) {
            //    $select2 += '<option value="' + modules[keys[i]].url + '">' + keys[i] + '</option>';
            //}
            $select2 += '</select></div>';
            $select2 = $($select2);

            $select2 = $select2.css({
                position: 'fixed',
                top: 200,
                left: 200 })
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

            $select2.on('select2:select', function(e) {
                console.log(e);
                var url = e.params.data.url;
                $select2.select2('destroy');
                $select2.remove();
                Grid.newModule(url);
            });

            $select2.on('select2:close', function(e) {

            })
        });
    };
});