define(['modules/default/defaultview', 'lib/plot/plot', 'src/util/datatraversing', 'src/util/jcampconverter'], function(Default, Graph, Traversing, JcampConverter) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		init: function() {

			var html = [];
			html.push('<div class="2drmn"></div>');
			this.namedSeries = {};
			this.dom = $(html.join(''));
			this.module.getDomContent().html(this.dom);
		},

		
		inDom: function() {
			var self = this;
			var NMR = new Graph(this.dom.get(0), {});
			this._instance = NMR;

			NMR.resetAxis();
			NMR.resetSeries();
			NMR.setOption('zoomMode', 'xy');
			NMR.setOption('defaultWheelAction', 'toSeries');
			NMR.setOption('defaultMouseAction', 'zoomXY');
			NMR.setOption('shiftMouseAction', 'drag');

			NMR.getTopAxis(0, { flipped: true }).setLabel('Blahppm');
			NMR.getLeftAxis(0, { flipped: false }).setLabel('ppm');
		},

		onResize: function() {
			this._instance.resize(this.width - 20, this.height - 20);
		},
		
		update: {
		
			'jcampx': function(moduleValue) {
				if(!this._instance)
					return;
			
				this.addSerieJcampXOrY(moduleValue, true);
				this.redraw();

			},

			'jcampy': function(moduleValue) {
				if(!this._instance)
					return;
			
				this.addSerieJcampXOrY(moduleValue, false);
				this.redraw();
			},

			'jcampxy': function(moduleValue) {

				if(!this._instance)
					return;
			
				value = JcampConverter(Traversing.getValueIfNeeded(moduleValue), {lowres: 1024});
				this.addSerieXOrY(value, true);
				this.addSerieXOrY(value, false);

				this.redraw();
			},

			'jcamp2d': function(moduleValue) {

				if(!this._instance)
					return;
				var value = JcampConverter(Traversing.getValueIfNeeded(moduleValue));
				if(!value.contourLines)
					return;
				var NMR = this._instance;
					NMR.resetSeries();
				var serie = NMR.newSerie('2d' + Date.now(), {}, 'contour');
				serie.setData(value.contourLines);
				serie.setXAxis(NMR.getTopAxis());
				serie.setYAxis(NMR.getLeftAxis());
				this.redraw();
			}
		},


		addSerieJcampXOrY: function(value, x) {
			value = Traversing.getValueIfNeeded(value);
			spectra = JcampConverter(value, {lowres: 1024});
			this.addSerieXOrY(spectra, x);
		},

		addSerieXOrY: function(spectra, x) {

			var NMR = this._instance,
				axis = x ? NMR.getTopAxis() : NMR.getLeftAxis();

			axis.killSeries(true);
			spectra = spectra.spectra;
			for (var i = 0, l = spectra.length; i<l; i++) {

				serie = axis.addSerie((x ? 'x' : 'y') + Date.now(), {
					trackMouse: false, 
					trackMouseLabel: '<x>', 
					trackMouseLabelRouding: 3,
					zoomMode: x ? 'x' : 'y'
				});
				serie.setData(spectra[i].data[spectra[i].data.length - 1]);
				if(!x)
					serie.setFlip(true);
				break;
			}
		},

		redraw: function() {
			this._instance.redraw();
			this._instance.drawSeries();
		}


	});

	return view;
});

 
