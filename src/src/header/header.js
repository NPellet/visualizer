'use strict';

define(['require', 'jquery', 'src/util/versioning'], function (require, $, Versioning) {

    var elements = [];
    return {

        init: function (headerConfig) {
            var self = this;

            if (headerConfig.elements) {
                this.loadHeaderElements(headerConfig.elements);
            }

            this.dom = $('<div id="header"><div id="title"><div></div></div></div>');
            $('#ci-visualizer').prepend(this.dom);

            this.setHeight(headerConfig.height || '30px');

            this._titleDiv = $('#title').children('div');
            this._titleDiv.attr('contenteditable', 'true').bind('keypress', function (e) {
                e.stopPropagation();
                if (e.keyCode !== 13)
                    return;
                e.preventDefault();
                $(this).trigger('blur');
            })
                .bind('blur', function () {
                    Versioning.getView().configuration.set('title', $(this).text().replace(/[\r\n]/g, ''));
                });

            Versioning.getViewHandler().versionChange().progress(function (el) {
                self.setTitle(el);
            });

        },

        setHeight: function (height) {
            this.dom.css('height', height);
            $('#modules-grid').css('margin-top', height);
        },

        setTitle: function (view) {
            this._titleDiv.text(view.configuration ? view.configuration.title : 'Untitled');
        },

        loadHeaderElements: function (all) {
            if (!$.isArray(all))
                return;

            var self = this,
                i = 0,
                l = all.length;

            for (; i < l; i++) {
                this.addHeaderElement(i, this.createElement(all[i]));
            }

            Promise.all(elements).then(self.buildHeaderElements.bind(self));

        },

        addHeaderElement: function (i, el) {
            elements[i] = el;
        },

        createElement: function (source) {
            return new Promise(function (resolve, reject) {
                var url;
                if (source.type.indexOf('/') >-1) {
                    url = source.type;
                } else {
                    url = './components/' + source.type;
                }
                require([url], function (El) {
                    var el = new El();
                    el.init(source);
                    resolve(el);
                });
            });
        },

        buildHeaderElements: function (elements) {
            if (this.ul)
                this.ul.empty();

            this.ul = this.ul || $('<ul class="noselect" />').appendTo(this.dom);
            var i = 0, l = elements.length;
            for (; i < l; i++) {
                this.ul.append(elements[i].getDom());
            }
        }

    };

});