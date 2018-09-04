'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'BiojsSequence',
  'BiojsTooltip'
], function (Default, Util) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      if (!this.dom) {
        this._id = Util.getNextUniqueId();
        this.dom = $(` <div id="${this._id}"></div>`).css('height', '100%').css('width', '100%');
        this.module.getDomContent().html(this.dom);
        this.resolveReady();
      }
    },

    update: {
      sequence: function (value) {
        this.sequence = value;
        this.render();
      },

      annotations: function (value) {
        this.annotations = value;
        this.render();
      }
    },

    blank: {
      sequence: function () {
      },
      annotations: function () {
      }
    },

    render: function () {
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
        highlights: annotations.highlights
      });

      mySequence.onSelectionChange(function (data) {
        that.module.controller.onSequenceSelectionChanged(data);
      });
    },

    resize: function () {
      this.render();
    },

    clear: function () {
      this.dom.html('');
    },

    inDom: function () {
      this.render();
      // var mySeq = new Biojs.Sequence({
      //   sequenceUrl: 'http://www.rcsb.org/pdb/download/downloadFile.do?fileFormat=xml&compression=NO&structureId=100D',
      //   id: '100D'
      // });
    }

  });

  return View;
});
