'use strict';

define(['modules/default/defaultview', 'src/util/util', 'msa'], function (
  Default,
  Util,
  msa,
) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      if (!this.dom) {
        this._id = Util.getNextUniqueId();
        this.dom = $(`<div id="${this._id}"></div>`)
          .css('height', '100%')
          .css('width', '100%');
        this.module.getDomContent().html(this.dom);
      }
      this.resolveReady();
    },

    update: {
      sequences(value) {
        this.sequences = value;
        this.render();
      },
    },

    blank: {
      sequences() {
        this.clear();
      },
    },

    render() {
      if (!this.sequences) return;
      this.clear();
      var opts = {};

      opts.el = this.dom[0];
      opts.vis = { conserv: false, overviewbox: false };
      opts.zoomer = {
        alignmentHeight: 405,
        labelWidth: 110,
        labelFontsize: '13px',
        labelIdLength: 50,
      };
      opts.seqs = this.sequences;
      // opts.columns = {
      //     hidden: [1, 2]
      // };

      try {
        var m = new msa.msa(opts);
        const schema = this.module.getConfiguration('colorSchema');
        if (colorSchemas[schema]) {
          m.g.colorscheme.addDynScheme('dyn', colorSchemas[schema]);
          m.g.colorscheme.set('scheme', 'dyn');
        }

        m.render();
      } catch {
        this.clear();
      }
    },

    onResize() {
      this.render();
    },

    clear() {
      this.dom.html('');
    },

    inDom() {
      this.render();
    },
  });

  const colorSchemas = {
    match: {
      init() {
        const seqs = this.opt.seqs;
        // you have here access to the conservation or the sequence object
        let max = 0;
        for (const seq of seqs) {
          max = Math.max(max, seq.length);
        }
        this.cons = new Array(max);
        for (let i = 0; i < max; i++) {
          let matchType = 'match';
          for (let j = 1; j < seqs.length; j++) {
            if (seqs[j][i] !== '-') {
              if (!nuclMatch(seqs[0][i], seqs[j][i])) {
                matchType = 'mismatch';
                break;
              }
            } else {
              matchType = 'gap';
              break;
            }
          }
          this.cons[i] = matchType;
        }
        // this.cons = this.opt.conservation();
      },

      run(letter, opts) {
        switch (this.cons[opts.pos]) {
          case 'match':
            return 'green';
          case 'gap':
            return 'orange';
          case 'mismatch':
            return 'red';
          default:
            return 'white';
        }
      },
    },
  };

  const nuclLookup = {
    A: ['A'],
    T: ['T', 'U'],
    U: ['U', 'T'],
    G: ['G'],
    C: ['C'],
    W: ['A', 'T', 'U'],
    S: ['G', 'C'],
    M: ['A', 'C'],
    K: ['G', 'T', 'U'],
    R: ['A', 'G'],
    Y: ['C', 'T', 'U'],
    B: ['C', 'G', 'T', 'U'],
    D: ['A', 'G', 'T', 'U'],
    H: ['A', 'C', 'T', 'U'],
    V: ['A', 'C', 'G'],
    N: ['A', 'C', 'G', 'T', 'U'],
  };

  function nuclMatch(nucl1, nucl2) {
    if (nucl1 === nucl2) return true;
    nucl1 = nuclLookup[nucl1];
    nucl2 = nuclLookup[nucl2];
    if (!nucl1 || !nucl2) return false;
    return nucl1.some((n1) => nucl2.find((n2) => n1 === n2));
  }

  return View;
});
