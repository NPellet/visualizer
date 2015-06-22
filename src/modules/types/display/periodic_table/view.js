'use strict';

define(['modules/default/defaultview', 'lib/twigjs/twig', 'src/util/debug'], function (Default, Twig, Debug) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init: function () {

            this.dom = $('<div class="periodic-table">').css({
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

                this.elements = JSON.parse(JSON.stringify(value.resurrect()));
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
            //var w = this.width / 18;
            //
            //for (var i = 0; i < this.elements.length; i++) {
            //    console.log(this.elements[i]);
            //    var position = calcPosition(this.elements[i]);
            //    var $element = $(this.template.render({element: this.elements[i]}));
            //    $element.css({
            //        'position': 'absolute',
            //        'left': position[0] * w,
            //        'top': position[1] * w
            //    });
            //    this.dom.append($element);
            //}
            // Made with Daniel
            this.dom.append('<div class="indic-p indic-g"></div>');
            for (var i = 1; i < 19; i++) {
                this.dom.append('<div class="indic-g group' + i + '"><p>' + i + '</p></div>');

            }
            for (var i = 1; i < 8; i++) {
                this.dom.append('<div class="indic-p period' + i + '"><p>' + i + '</p></div>');
            }

            for (var i = 0; i < this.elements.length; i++) {
                this.dom.append(this.template.render({element: this.elements[i]}));
            }


            var actinid = ('<div class="indic-f period7"><p>89-103</p></div>');
            var lanthanid = ('<div class="indic-f period6"><p>57-71</p></div>');
            $('div.e56').after(lanthanid);
            $('div.e88').after(actinid);
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
