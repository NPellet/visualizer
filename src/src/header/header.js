'use strict';

define(['require', 'jquery', 'src/util/versioning'], function (require, $, Versioning) {
  class Header {
    constructor(headerConfig) {
      this.elements = [];

      if (headerConfig.elements) {
        this.loadHeaderElements(headerConfig.elements);
      }

      this.dom = $('<div id="header"><div id="title"><div></div></div></div>');
      $('#ci-visualizer').prepend(this.dom);

      this.setHeight(headerConfig.height || '30px');

      this._titleDiv = $('#title').children('div');
      this._titleDiv
        .attr('contenteditable', 'true')
        .bind('keypress', function (e) {
          e.stopPropagation();
          if (e.keyCode !== 13)
            return;
          e.preventDefault();
          $(this).trigger('blur');
        })
        .bind('blur', function () {
          Versioning.getView().configuration.set('title', $(this).text().replace(/[\r\n]/g, ''));
        });

      Versioning.getViewHandler().versionChange().progress((el) => {
        this.setTitle(el);
      });
    }

    setHeight(height) {
      this.dom.css('height', height);
      $('#modules-grid').css('margin-top', height);
    }

    setTitle(view) {
      this._titleDiv.text(view.configuration ? view.configuration.title : 'Untitled');
    }

    loadHeaderElements(all) {
      if (!Array.isArray(all))
        return;

      for (let i = 0; i < all.length; i++) {
        this.addHeaderElement(i, this.createElement(all[i]));
      }

      Promise.all(this.elements).then(this.buildHeaderElements.bind(this));
    }

    addHeaderElement(i, el) {
      this.elements[i] = el;
    }

    createElement(source) {
      return new Promise(function (resolve, reject) {
        let url;
        if (source.type.indexOf('/') > -1) {
          url = source.type;
        } else {
          url = `./components/${source.type}`;
        }
        require([url], function (El) {
          const el = new El();
          el.init(source);
          resolve(el);
        }, reject);
      });
    }

    buildHeaderElements(elements) {
      if (this.ul) this.ul.empty();

      this.ul = this.ul || $('<ul class="noselect" />').appendTo(this.dom);
      for (let i = 0; i < elements.length; i++) {
        this.ul.append(elements[i].getDom());
      }
    }
  }

  let headerSingleton = null;

  return {
    init(headerConfig) {
      headerSingleton = new Header(headerConfig);
    }
  };
});
