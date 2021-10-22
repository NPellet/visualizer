'use strict';

define(['modules/default/defaultview', 'src/util/typerenderer', 'src/util/api', 'src/util/util'], function (Default, Renderer, API, Util) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      this.dom = $('<div class="ci-displaylist-list-2d-fast"></div>');
      this.module.getDomContent().html(this.dom);
      this.rendererOptions = Util.evalOptions(this.module.getConfiguration('rendererOptions')) || {};
      let forceType = this.module.getConfiguration('forceType');
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
      let that = this;
      this.dom.on('mouseenter mouseleave click', '> div', function (e) {
        let elementId = $(this).index();
        let value = that.list[elementId];
        let jpath;
        if (that.dim === 1) {
          jpath = [elementId];
        } else {
          let row = Math.floor(elementId / that.dimWidth);
          let col = elementId % that.dimWidth;
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
        let val = moduleValue.get();
        this.setDim(val);

        let cfg = this.module.getConfiguration;
        let cols, list, length;

        if (this.dim === 1) {
          cols = `${100 / (cfg('colnumber', 4) || 4)}%`;
          list = val;
          length = val.length;
        } else {
          let width = val[0].length;
          cols = `${100 / val[0].length}%`;
          length = val.length * width;
          list = convert2Dto1D(val);
        }

        this.dataReady = new Array(length);
        this.dataDivs = new Array(length);

        this.list = list;

        let colorJpath = cfg('colorjpath', false),
          valJpath = cfg('valjpath', ''),
          dimensions = {
            width: cols
          };
        let height = cfg('height');
        if (height) {
          dimensions.height = `${height}px`;
        }

        for (let i = 0; i < length; i++) {
          let data = this.renderElement(this.list.getChildSync([i]), dimensions, colorJpath, valJpath);
          this.dataReady[i] = data[0];
          this.dataDivs[i] = data[1];
        }

        this.updateVisibility();
      },

      showList: function (value) {
        let list = value.get();
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

      let that = this;

      Promise.all(this.dataReady).then(function () {
        let value = that.showList;
        for (let i = 0; i < value.length; i++) {
          if (value[i]) {
            that.dataDivs[i].show();
          } else {
            that.dataDivs[i].hide();
          }
        }
      });
    },

    renderElement: function (element, dimensions, colorJpath, valJpath) {
      let td = $('<div>').css(dimensions).appendTo(this.dom);

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
      let currentDim = this.dim;
      let newDim = Array.isArray(val[0]) ? 2 : 1;
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
    let height = val.length;
    let width = val[0].length;
    let length = height * width;
    let array = new Array(length);
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        array[i * width + j] = val[i][j];
      }
    }
    return new DataArray(array);
  }

  return View;
});
