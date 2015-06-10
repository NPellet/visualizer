'use strict';

define(['modules/default/defaultview', 'lib/twigjs/twig', 'src/util/debug'], function (Default, Twig, Debug) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init: function () {

            this.dom = $('<div>').css({
                height: '100%',
                width: '100%'
            });

            this.elements = [];
            this.template = Twig.twig({
                data: this.module.getConfiguration('template')
            });
        },
        blank: {
            template: function () {
                this.module.definition.configuration.groups.group[0].template[0] = '';
                this.template = Twig.twig({
                    data: ''
                });
                this.dom.html('');
            }
        },
        inDom: function () {
            this.module.getDomContent().html(this.dom);
            this.resolveReady();
            this.render();
        },
        update: {
            value: function (value, name) {
                /*
                 Convert special DataObjects
                 (twig does some check depending on the filter used
                 and the values need to be native)
                 */

                this.elements = value.resurrect();
                this.render();
            },
            template: function (value) {
                var tpl = value.get().toString();
                try {
                    this.template = Twig.twig({
                        data: tpl
                    });
                    this.module.definition.configuration.groups.group[0].template[0] = tpl;
                    this.render();
                } catch (e) {
                    Debug.info('Problem with template: ' + e);
                }
            }
        },
        render: function () {
            this.dom.html('');
            var renderers = [];
            var w = this.width / 18;

            for (var i = 0; i < this.elements.length; i++) {
                console.log(this.elements[i]);
                var position = calcPosition(this.elements[i]);
                var $element = $(this.template.render({element: this.elements[i]}));
                $element.css({
                    'position': 'absolute',
                    'left': position[0] * w,
                    'top': position[1] * w
                });
                this.dom.append($element);
            }
            //// Made with Daniel
            //for(var i=0; i<this.elements.length; i++) {
            //    var td = $('<td>');
            //    td.append(this.template.render({element:this.elements[i]}));
            //    this.dom.append(td);
            //}
        }


    });

    function calcPosition(element) {
        //
        var y = +element.period;
        var x = +element.group;

        return [x, y];
    }

    return View;

});
