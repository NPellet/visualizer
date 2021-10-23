'use strict';

define(['modules/default/defaultview', 'src/util/typerenderer', 'src/util/api', 'src/util/util'], function (Default, Renderer, API, Util) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      var html = [];
      html.push('<div class="ci-displaylist-list-2d"></div>');
      this.dom = $(html.join(''));
      this.module.getDomContent().html(this.dom);
      this.rendererOptions = Util.evalOptions(this.module.getConfiguration('rendererOptions')) || {};
      var forceType = this.module.getConfiguration('forceType');
      if (forceType) this.rendererOptions.forceType = forceType;
    },
    blank: {
      list: function () {
        API.killHighlight(this.module.getId());
        this.dom.empty();
      }
    },
    inDom: function () {
      var that = this;
      this.dom.on('mouseenter mouseleave click', 'td', function (e) {
        var tdIndex = $(this).index();
        var trIndex = $(this).parent().index();
        var cols = that.module.getConfiguration('colnumber', 4) || 4;
        var elementId = trIndex * cols + tdIndex;
        var value = that.list.get()[elementId];
        if (e.type === 'mouseenter') {
          that.module.controller.setVarFromEvent('onHover', 'cell', 'list', [elementId]);
          API.highlight(value, 1);
        } else if (e.type === 'mouseleave') {
          API.highlight(value, 0);
        } else if (e.type === 'click') {
          that.module.controller.setVarFromEvent('onClick', 'cell', 'list', [elementId]);
          that.module.controller.sendActionFromEvent('onClick', 'cell', value);
        }
      });
      this.resolveReady();
    },

    update: {

      list: function (moduleValue) {
        var cfg = this.module.getConfiguration,
          cols = cfg('colnumber', 4) || 4,
          val = moduleValue.get(),
          table = $('<table cellpadding="3" cellspacing="0">').css('text-align', 'center');

        this.dom.html(table);

        this.list = val;

        var height = cfg('height');

        var css = {
          width: `${Math.round(100 / cols)}%`,
          height: `${cfg('height', 0)}px`
        };

        var current, colId;

        for (var i = 0; i < val.length; i++) {
          colId = i % cols;

          if (colId === 0) {
            current = $('<tr>').appendTo(table);
          }

          this.renderElement(current, i, css, cfg('colorjpath', false), cfg('valjpath', ''));
        }
      }
    },

    renderElement: function (dom, index, css, colorJpath, valJpath) {
      var that = this;
      var td = $('<td>').css(css).appendTo(dom);

      this.list.getChild([index]).then(function (element) {
        if (colorJpath) {
          element.getChild(colorJpath).then(function (val) {
            td.css('background-color', val.get());
          });
        }


        Renderer.render(td, element, valJpath, that.rendererOptions);

        API.listenHighlight(element, function (onOff, key) {
          if (onOff) {
            td.css('border-color', 'black');
          } else {
            td.css('border-color', '');
          }
        }, false, that.module.getId());
      });
    }
  });

  return View;
});
