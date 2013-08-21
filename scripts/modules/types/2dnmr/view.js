define(['modules/defaultview', 'libs/plot/plot', 'util/datatraversing', 'util/jcampconverter'], function(Default, Graph, Traversing, JcampConverter) {
	
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
			NMR.setOption('defaultMouseAction', 'drag');

			NMR.getTopAxis().setLabel('ppm');
			NMR.getLeftAxis().setLabel('ppm');
		},

		onResize: function(width, height) {
			this._instance.resize(width, height);
		},
		
		update: {
			'jcamp2d': function(moduleValue) {
				var self = this;
				require(['util/jcampconverter'], function(tojcamp) {
					var jcamp = tojcamp(moduleValue);
					if(jcamp.gcms) {
						self._instance.setMS(jcamp.gcms.ms);		
					}
				});
			},

			'jcampx': function(moduleValue) {
				this.addSerieJcampXOrY(moduleValue, true);

				this.redraw();
			},

			'jcampy': function(moduleValue) {
				this.addSerieJcampXOrY(moduleValue, false);

				this.redraw();
			},

			'jcampxy': function(moduleValue) {
				value = JcampConverter(DataTraversing.getValueIfNeeded(moduleValue));
				this.addSerieXOrY(value, true);
				this.addSerieXOrY(value, false);

				this.redraw();
			},

			'jcamp2d': function(moduleValue) {
				var value = JcampConverter(DataTraversing.getValueIfNeeded(moduleValue)),
					NMR = this._instance,
					serie = NMR.newSerie('2d' + Date.now(), {}, 'contour');

				serie.setData(value.contourLines);
				serie.setXAxis(NMR.getTopAxis());
				serie.setYAxis(NMR.getLeftAxis());
			}
		},


		addSerieJcampXOrY: function(value, x) {
			value = DataTraversing.getValueIfNeeded(value);
			spectra = JcampConverter(value);
			this.addSerieXOrY(spectra, x);
		},

		addSerieXOrY: function(spectra, x) {

			var NMR = this._instance,
				axis = x ? NMR.getLeftAxis() : NMR.getTopAxis();
			axis.killSeries();	
			spectra = spectra.spectra;
			for (var i = 0, l = spectra.length; i<l; i++) {

				serie = axis.addSerie((x ? 'x' : 'y') + Date.now(), {
					trackMouse: false, 
					trackMouseLabel: '<x>', 
					trackMouseLabelRouding: 3
				});

				serie.setData(spectra[i].data[spectra[i].data.length - 1]);
				if(!x)
					serie.setFlip(true);
			}
		},

		redraw: function() {
			this._instance.redraw();
			this._instance.drawSeries();
		}


	});

	return view;
});

 
