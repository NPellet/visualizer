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
      this._currentValue = null;
      this._currentType = null;
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

    blank: {
      rxn() {
        this.clearEditor();
      },
      rxnV3() {
        this.clearEditor();
      },
      smiles() {
        this.clearEditor();
      },
      reactionIdCode() {
        this.clearEditor();
      },
    },

    onActionReceive: {
      addReactant(value) {
        const molecule = OCL.Molecule.fromText(value);
        if (molecule) {
          const reaction = this.editor.getReaction();
          reaction.addReactant(molecule);
          setCurrentValue(this, reaction);
        }
      },
      addProduct(value) {
        const molecule = OCL.Molecule.fromText(value);
        if (molecule) {
          const reaction = this.editor.getReaction();
          reaction.addProduct(molecule);
          setCurrentValue(this, reaction);
        }
      },
    },

    update: {
      rxn(value) {
        this._currentValue = value;
        this._currentType = 'rxn';
        this.setReaction(OCL.Reaction.fromRxn(String(value.get())));
      },
      rxnV3(value) {
        this._currentValue = value;
        this._currentType = 'rxnV3';
        this.setReaction(OCL.Reaction.fromRxn(String(value.get())));
      },
      smiles(value) {
        this._currentValue = value;
        this._currentType = 'smiles';
        this.setReaction(OCL.Reaction.fromSmiles(String(value.get())));
      },
      reactionIdCode(value) {
        const reaction = OCL.ReactionEncoder.decode(String(value.get()));
        if (reaction) {
          this._currentValue = value;
          this._currentType = 'reactionIdCode';
          this.setReaction(reaction);
        }
      },
    },

    initEditor() {
      const controller = this.module.controller;
      this.editor = new OCL.CanvasEditor(this.dom.get(0), {
        initialMode: 'reaction',
      });
      this.editor.setOnChangeListener((event) =>
        controller.onChange(event, this.editor.getReaction()),
      );
      const reaction =
        OCL.ReactionEncoder.decode(controller.currentReactionId) ||
        OCL.Reaction.create();
      this.setReaction(reaction);
      this.resolveReady();
    },

    clearEditor() {
      this._currentValue = null;
      this._currentType = null;
      this.setReaction(OCL.Reaction.create());
    },

    setReaction(reaction) {
      reaction.setFragment(
        this.module.getConfigurationCheckbox('prefs', 'queryFeatures'),
      );
      this.editor.setReaction(reaction);
    },
  });

  function setCurrentValue(self, reaction) {
    const setValue = (value) => {
      if (self._currentValue) {
        self._currentValue.setValue(value);
      }
    };

    switch (self._currentType) {
      case 'rxn':
        setValue(reaction.toRxn());
        break;
      case 'rxnV3':
        setValue(reaction.toRxnV3());
        break;
      case 'smiles':
        setValue(reaction.toSmiles());
        break;
      case 'reactionIdCode': {
        const idCode = OCL.ReactionEncoder.encode(reaction) || '';
        setValue(idCode);
        break;
      }
    }

    self.setReaction(reaction);
  }

  return View;
});
