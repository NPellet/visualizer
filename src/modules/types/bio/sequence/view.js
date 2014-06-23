define(['modules/default/defaultview', 'src/util/util',
  'components/jquery/jquery-migrate.min',
  'lib/biojs-1.0/src/main/javascript/Biojs.js',
  'lib/biojs-1.0/src/main/javascript/Biojs.Tooltip.js',
  'lib/biojs-1.0/src/main/javascript/Biojs.Sequence.js'
  ], function(Default, Util) {
    // var $ = jQuery;
    console.log('jquery: ',jQuery.fn.jquery);
  function view() {};
  view.prototype = $.extend(true, {}, Default, {

    init: function() {
			if (! this.dom) {
				this._id = Util.getNextUniqueId();
				this.dom = $(' <div id="' + this._id + '"></div>').css('height', '100%').css('width', '100%');
				this.module.getDomContent().html(this.dom);
				this.resolveReady();
			}
    },


    blank: function() {
      this.dom.empty();
    },


    inDom: function() {
      var self = this;
      var theSequence = "METLCQRLNVCQDKILTHYENDSTDLRDHIDYWKHMRLECAIYYKAREMGFKHINHQVVPTLAVSKNKALQAIELQLTLETIYNSQYSNEKWTLQDVSLEVYLTAPTGCIKKHGYTVEVQFDGDICNTMHYTNWTHIYICEEAojs SVTVVEGQVDYYGLYYVHEGIRTYFVQFKDDAEKYSKNKVWEVHAGGQVILCPTSVFSSNEVSSPEIIRQHLANHPAATHTKAVALGTEETQTTIQRPRSEPDTGNPCHTTKLLHRDSVDSAPILTAFNSSHKGRINCNSNTTPIVHLKGDANTLKCLRYRFKKHCTLYTAVSSTWHWTGHNVKHKSAIVTLTYDSEWQRDQFLSQVKIPKTITVSTGFMSI";
      console.log('init sequence');
      var mySequence = new Biojs.Sequence({
        sequence : theSequence,
        target : this.dom.attr('id'),
        format : 'CODATA',
        id : 'P918283',
        annotations: [
          { name:"CATH", 
            color:"#F0F020", 
            html: "Using color code #F0F020 ", 
            regions: [{start: 122, end: 135}]
          },
          { 
            name:"TEST", 
            html:"<br> Example of <b>HTML</b>", 
            color:"green", 
            regions: [
            {start: 285, end: 292},
            {start: 293, end: 314, color: "#2E4988"}]
          }
        ],
        highlights : [
          { start:30, end:42, color:"white", background:"green", id:"spin1" },
          { start:139, end:140 }, 
          { start:631, end:633, color:"white", background:"blue" }
        ]
      });
      
      mySequence.onSelectionChange(function(data) {
        console.log(data);
        self.module.controller.onSequenceSelectionChanged(data);
      });
      
      // var mySeq = new Biojs.Sequence({
      //   sequenceUrl: 'http://www.rcsb.org/pdb/download/downloadFile.do?fileFormat=xml&compression=NO&structureId=100D',
      //   id: '100D'
      // });
    },

    onResize: function() {
			
      if (!this.webgl) return;
      var self=this;

      this.onReady.done(function() {
				
				
      });

    },


    update: {
      'function':function(data) {

      }
    },

    getDom: function() {
      return this.dom;
    },
  });

  return view;
});