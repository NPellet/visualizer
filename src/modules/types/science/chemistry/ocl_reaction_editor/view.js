'use strict';

define(['modules/default/defaultview', 'src/util/ui', 'openchemlib'], function (
  Default,
  ui,
  OCL,
) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      this.editor = null;
    },

    inDom() {
      this.dom = $('<div>').css({
        height: '99%',
        width: '100%',
      });
      this.module.getDomContent().html(this.dom);
    },

    onResize() {
      this.dom.empty();
      this.initEditor();
    },

    blank: {},

    onActionReceive: {},

    update: {},

    initEditor() {
      const controller = this.module.controller;
      this.editor = new OCL.CanvasEditor(this.dom.get(0), {
        initialMode: 'reaction',
      });
      this.editor.setOnChangeListener((event) =>
        controller.onChange(event, this.editor.getReaction()),
      );
      const reaction =
        OCL.ReactionEncoder.decode(controller.currentReaction) ||
        OCL.Reaction.create();
      reaction.setFragment(
        this.module.getConfigurationCheckbox('prefs', 'queryFeatures'),
      );
      this.editor.setReaction(reaction);
      this.resolveReady();
    },

    clearEditor() {
      this._currentValue = null;
      this._currentType = null;
      this.editor.getReaction().clear();
      this.editor.moleculeChanged();
    },
  });

  return View;
});
