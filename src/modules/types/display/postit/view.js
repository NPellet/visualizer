'use strict';

define(['modules/default/defaultview', 'forms/button', 'src/util/util', 'src/main/grid'], function (Default, Button, Util, Grid) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      var that = this,
        id = Util.getNextUniqueId(),
        done = false;

      this._id = id;
      if (this.module.getConfigurationCheckbox('editable', 'isEditable')) {
        this.inside = $('<div>', {
          id: id,
          class: 'inside',
          contentEditable: 'true'
        }).html(that.module.definition.text || '');

        require(['ckeditor'], function (CKEDITOR) {
          if (done)
            return;
          CKEDITOR.disableAutoInline = true;
          that.instance = CKEDITOR.inline(that._id, {
            extraPlugins: 'mathjax',
            mathJaxLib: '//cdn.mathjax.org/mathjax/2.2-latest/MathJax.js?config=TeX-AMS_HTML'
          });
          that.instance.on('change', function () {
            that.module.definition.text = that.instance.getData();
            that.module.getDomWrapper().height(that.inside.height() + 70);
            Grid.moduleResize(that.module);
          });
          done = true;
        });
      } else {
        this.inside = $('<div>', {
          id: id,
          class: 'inside'
        }).html(that.module.definition.text || '');
      }

      this.dom = $('<div />', { class: 'postit' }).css('font-family', `${this.module.getConfiguration('fontfamily')}, Arial`);


      this.dom.html(this.inside);
      this.module.getDomContent().html(this.dom);
      this.resolveReady();
    }

  });

  return View;
});
