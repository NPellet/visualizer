define(['modules/default/defaultview', 'src/util/util',
'components/jquery/jquery-migrate.min',
'lib/biojs-1.0/src/main/javascript/Biojs.js',
'lib/biojs-1.0/src/main/javascript/Biojs.FeatureViewer.js',
'lib/biojs-1.0/src/main/javascript/Biojs.DasProteinFeatureViewer.js',
'lib/biojs-1.0/src/main/resources/dependencies/jquery/jquery.tooltip.js',
'lib/biojs-1.0/src/main/resources/dependencies/graphics/raphael-2.1.2.js',
'lib/biojs-1.0/src/main/resources/dependencies/graphics/canvg.js',
'lib/biojs-1.0/src/main/resources/dependencies/graphics/rgbcolor.js'
], function(Default, Util) {
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
      var myPainter = new Biojs.DasProteinFeatureViewer({
        proxyUrl: "/static/biojs/proxy.php",
        target: this._id,
        segment: "a4_human",
        highlightFeatureOnMouseOver: true
      });
      
      myPainter.onFeatureClick(function(data) {
        console.log('feature click: ', data);
        delete data.shape;
        self.module.controller.onFeatureClicked(data);
      });
      
      myPainter.onFeatureOn(function(data) {
        delete data.shape;
        self.module.controller.onFeatureMouseOver(data);
      });
    },

    onResize: function() {
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