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
      this._currentReaction = OCL.Reaction.create();
      this._currentValue = null;
      this._currentType = null;
    },

    inDom() {
      this.dom = $('<div>').css({
        height: '99%',
        width: '100%',
      });
      this.module.getDomContent().html(this.dom);
      this.resetEditor();
      this.resolveReady();
    },

    onResize() {
      this.resetEditor();
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
          this.setReaction(reaction, true);
        }
      },
      addProduct(value) {
        const molecule = OCL.Molecule.fromText(value);
        if (molecule) {
          const reaction = this.editor.getReaction();
          reaction.addProduct(molecule);
          this.setReaction(reaction, true);
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

    resetEditor() {
      if (this.editor) {
        this.editor.destroy();
        this.dom.empty();
      }
      this.editor = new OCL.CanvasEditor(this.dom.get(0), {
        initialMode: 'reaction',
      });
      this.editor.setOnChangeListener((event) => {
        const reaction = this.editor.getReaction();
        this._currentReaction = reaction;
        this.module.controller.onChange(event, reaction);
      });
      this.setReaction(this._currentReaction);
    },

    clearEditor() {
      this._currentValue = null;
      this._currentType = null;
      this.setReaction(OCL.Reaction.create());
    },

    setReaction(reaction, updateValue = false) {
      reaction.setFragment(
        this.module.getConfigurationCheckbox('prefs', 'queryFeatures'),
      );
      this._currentReaction = reaction;
      this.editor.setReaction(reaction);
      if (updateValue) {
        setCurrentValue(this, reaction);
      }
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
  }

  return View;
});
