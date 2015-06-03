'use strict';

define([
    'modules/default/defaultview',
    'src/util/util',
    'BiojsCore',
    'lib/biojs-1.0/src/main/javascript/Biojs.Tooltip',
    'lib/biojs-1.0/src/main/javascript/Biojs.Sequence'
], function (Default, Util, Biojs) {

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

        inDom: function () {
            var self = this;
            var theSequence = 'METLCQRLNVCQDKILTHYENDSTDLRDHIDYWKHMRLECAIYYKAREMGFKHINHQVVPTLAVSKNKALQAIELQLTLETIYNSQYSNEKWTLQDVSLEVYLTAPTGCIKKHGYTVEVQFDGDICNTMHYTNWTHIYICEEAojs SVTVVEGQVDYYGLYYVHEGIRTYFVQFKDDAEKYSKNKVWEVHAGGQVILCPTSVFSSNEVSSPEIIRQHLANHPAATHTKAVALGTEETQTTIQRPRSEPDTGNPCHTTKLLHRDSVDSAPILTAFNSSHKGRINCNSNTTPIVHLKGDANTLKCLRYRFKKHCTLYTAVSSTWHWTGHNVKHKSAIVTLTYDSEWQRDQFLSQVKIPKTITVSTGFMSI';
            var mySequence = new Biojs.Sequence({
                sequence: theSequence,
                target: this.dom.attr('id'),
                format: 'CODATA',
                id: 'P918283',
                annotations: [
                    {
                        name: 'CATH',
                        color: '#F0F020',
                        html: 'Using color code #F0F020 ',
                        regions: [{start: 122, end: 135}]
                    },
                    {
                        name: 'TEST',
                        html: '<br> Example of <b>HTML</b>',
                        color: 'green',
                        regions: [
                            {start: 285, end: 292},
                            {start: 293, end: 314, color: '#2E4988'}]
                    }
                ],
                highlights: [
                    {
                        start: 30,
                        end: 42,
                        color: 'white',
                        background: 'green',
                        id: 'spin1'
                    },
                    {start: 139, end: 140},
                    {start: 631, end: 633, color: 'white', background: 'blue'}
                ]
            });

            mySequence.onSelectionChange(function (data) {
                self.module.controller.onSequenceSelectionChanged(data);
            });

            // var mySeq = new Biojs.Sequence({
            //   sequenceUrl: 'http://www.rcsb.org/pdb/download/downloadFile.do?fileFormat=xml&compression=NO&structureId=100D',
            //   id: '100D'
            // });
        }

    });

    return View;

});
