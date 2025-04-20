'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'BiojsSequence',
  'BiojsTooltip',
], function (Default, Util) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      if (!this.dom) {
        this._id = Util.getNextUniqueId();
        this.dom = $(` <div id="${this._id}"></div>`)
          .css('height', '100%')
          .css('width', '100%');
        this.module.getDomContent().html(this.dom);
        this.resolveReady();
      }
    },

    update: {
      sequence(value) {
        this.sequence = value;
        this.render();
      },

      annotations(value) {
        this.annotations = value;
        this.render();
      },
    },

    blank: {
      sequence() {},
      annotations() {},
    },

    render() {
      var that = this;
      this.clear();
      if (!this.sequence) return;

      var seq = String(this.sequence);
      var annotations = this.annotations || {};
      var mySequence = new window.Biojs.Sequence({
        sequence: seq,
        target: this.dom.attr('id'),
        format: 'CODATA',
        annotations: annotations.annotations,
        highlights: annotations.highlights,
      });

      mySequence.onSelectionChange(function (data) {
        that.module.controller.onSequenceSelectionChanged(data);
      });
    },

    resize() {
      this.render();
    },

    clear() {
      this.dom.html('');
    },

    inDom() {
      this.render();
      // var mySeq = new Biojs.Sequence({
      //   sequenceUrl: 'http://www.rcsb.org/pdb/download/downloadFile.do?fileFormat=xml&compression=NO&structureId=100D',
      //   id: '100D'
      // });
    },
  });

  return View;
});
