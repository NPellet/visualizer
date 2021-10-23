'use strict';

define(['modules/default/defaultview', 'src/util/typerenderer', 'src/util/api', 'src/util/util'], function (Default, Renderer, API, Util) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      this.dom = $('<div class="ci-displaylist-list-2d-fast"></div>');
      this.module.getDomContent().html(this.dom);
      this.rendererOptions = Util.evalOptions(this.module.getConfiguration('rendererOptions')) || {};
      var forceType = this.module.getConfiguration('forceType');
      if (forceType) this.rendererOptions.forceType = forceType;
    },

    blank: {
      list: function () {
        this.list = null;
        API.killHighlight(this.module.getId());
        this.dom.empty();
      },
      showList: function () {
        this.showList = null;
      }
    },

    inDom: function () {
      var that = this;
      this.dom.on('mouseenter mouseleave click', '> div', function (e) {
        var elementId = $(this).index();
        var value = that.list[elementId];
        var jpath;
        if (that.dim === 1) {
          jpath = [elementId];
        } else {
          var row = Math.floor(elementId / that.dimWidth);
          var col = elementId % that.dimWidth;
          jpath = [row, col];
        }
        if (e.type === 'mouseenter') {
          that.module.controller.setVarFromEvent('onHover', 'cell', 'list', jpath);
          API.highlight(value, 1);
        } else if (e.type === 'mouseleave') {
          API.highlight(value, 0);
        } else if (e.type === 'click') {
          that.module.controller.setVarFromEvent('onClick', 'cell', 'list', jpath);
          that.module.controller.sendActionFromEvent('onClick', 'cell', value);
        }
      });
      this.resolveReady();
    },

    update: {
      list: function (moduleValue) {
        var val = moduleValue.get();
        this.setDim(val);

        var cfg = this.module.getConfiguration;
        var cols, list, length;

        if (this.dim === 1) {
          cols = `${100 / (cfg('colnumber', 4) || 4)}%`;
          list = val;
          length = val.length;
        } else {
          var width = val[0].length;
          cols = `${100 / val[0].length}%`;
          length = val.length * width;
          list = convert2Dto1D(val);
        }

        this.dataReady = new Array(length);
        this.dataDivs = new Array(length);

        this.list = list;

        var colorJpath = cfg('colorjpath', false),
          valJpath = cfg('valjpath', ''),
          dimensions = {
            width: cols
          };
        var height = cfg('height');
        if (height) {
          dimensions.height = `${height}px`;
        }

        for (var i = 0; i < length; i++) {
          var data = this.renderElement(this.list.getChildSync([i]), dimensions, colorJpath, valJpath);
          this.dataReady[i] = data[0];
          this.dataDivs[i] = data[1];
        }

        this.updateVisibility();
      },

      showList: function (value) {
        var list = value.get();
        this.setDim(list);
        if (this.dim === 1) {
          this.showList = list;
        } else {
          this.showList = convert2Dto1D(list);
        }
        this.updateVisibility();
      }
    },

    updateVisibility: function () {
      if (!this.showList || !this.list)
        return;

      var that = this;

      Promise.all(this.dataReady).then(function () {
        var value = that.showList;
        for (var i = 0; i < value.length; i++) {
          if (value[i]) {
            that.dataDivs[i].show();
          } else {
            that.dataDivs[i].hide();
          }
        }
      });
    },

    renderElement: function (element, dimensions, colorJpath, valJpath) {
      var td = $('<div>').css(dimensions).appendTo(this.dom);

      if (colorJpath) {
        element.getChild(colorJpath, true).then(function (val) {
          td.css('background-color', val.get());
        });
      }

      API.listenHighlight(element, function (onOff) {
        if (onOff) {
          td.css('border-color', 'black');
        } else {
          td.css('border-color', '');
        }
      }, false, this.module.getId());

      return [Renderer.render(td, element, valJpath, this.rendererOptions), td];
    },

    setDim: function (val) {
      var currentDim = this.dim;
      var newDim = Array.isArray(val[0]) ? 2 : 1;
      if (newDim !== currentDim) {
        this.dim = newDim;
        this.list = null;
        this.showList = null;
      }
      if (this.dim === 2) {
        this.dimWidth = val[0].length;
        this.dimHeight = val.length;
      }
    }

  });

  function convert2Dto1D(val) {
    var height = val.length;
    var width = val[0].length;
    var length = height * width;
    var array = new Array(length);
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        array[i * width + j] = val[i][j];
      }
    }
    return new DataArray(array);
  }

  return View;
});
