'use strict';

define([
    'modules/default/defaultview',
    'src/util/util',
    'msa'
], function (Default, Util, msa) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {

        init: function () {
            if (!this.dom) {
                this._id = Util.getNextUniqueId();
                this.dom = $(' <div id="' + this._id + '"></div>').css('height', '100%').css('width', '100%');
                this.module.getDomContent().html(this.dom);
                this.resolveReady();
            }
        },

        update: {
            sequences: function (value) {
                this.sequences = value;
                this.render();
            }
        },

        blank: {
            sequences: function () {
                this.clear();
            }
        },

        render: function () {
            if (!this.sequences) return;

            var opts = {};
            opts.el = this.dom[0];
            opts.vis = {conserv: false, overviewbox: false};
            opts.zoomer = {alignmentHeight: 405, labelWidth: 110, labelFontsize: '13px', labelIdLength: 50};
            opts.seqs = this.sequences;
            // opts.columns = {
            //     hidden: [1, 2]
            // };
            this.clear();

            var m = new msa.msa(opts);
            m.render();
        },

        onResize: function () {
            this.render();
        },

        clear: function () {
            this.dom.html('');
        },

        inDom: function () {
            this.render();
        }

    });

    return View;

});
