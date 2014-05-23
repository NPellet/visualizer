define(['modules/default/defaultview', 'lib/twigjs/twig'], function(Default, Twig) {

    function view() {
    }
    ;
    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var html = "";
            html += '<div></div>';

            this.dom = $(html).css({
                height: '100%',
                width: '100%'
            });

            this._values = new DataObject();
            this.template = Twig.twig({
                data: this.module.getConfiguration('template')
            });
        },
        blank: {
            value: function(varName) {
                this.dom.empty();
            }
        },
        inDom: function() {
			this.module.getDomContent().html(this.dom);
			this.render();
        },
        update: {
            value: function(value, name) {
                if (!value) {
                    return;
                }
                this._values[name] = value.get();

                this.render();

            },
            tpl: function(value) {
                if (!value)
                    return;
                var tpl = value.get();
                try {
                    this.template = Twig.twig({
                        data: tpl
                    });
                    this.module.definition.configuration.groups.group[0].template[0] = tpl;
                    this.render();
                } catch (e) {
               }
            }
        },
        render: function() {
            var render = this.template.renderAsync(this._values);
            this.dom.html(render.html);
            render.render();
        }
    });

    return view;
});