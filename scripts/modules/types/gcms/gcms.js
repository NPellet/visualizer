
define(['jquery', 'libs/plot/plot'], function($, Graph) {

	



	var gcms = function() {




	}

	gcms.prototype = {

		inDom: function(domGc, domMs) {

			var self = this;
			var optionsGc = {

				paddingTop: 5,
				paddingBottom: 0,
				paddingLeft: 20,
				paddingRight: 20,

				close: {
					left: true,
					right: true, 
					top: true,
					bottom: true
				},

				title: '',
				zoomMode: 'x',
				defaultMouseAction: 'rangeX',
				defaultWheelAction: 'none',
				lineToZero: false,

				onMouseMoveData: function(e, val) {
					if(!val.gc)
						return;

					var x = val.gc.xBeforeIndex;
					var ms = self.msData[x];

					if(self.msSerie) {
						self.msSerie.kill();
						self.msSerie = false;
					}

					if(!ms)
						return;

					self.msSerie = self.ms.newSerie();
					self.msSerie.autoAxis();
					self.msSerie.setData(ms);
					self.ms.redraw();
					self.ms.drawSeries();
				}
			};


			var axisGc = {

				bottom: [
					{
						labelValue: 'Time',
						unitModification: 'time',
						shiftToZero: true,
						primaryGrid: false,
						nbTicksPrimary: 10,
						secondaryGrid: false,
						axisDataSpacing: { min: 0, max: 0.1 },
					}
				],

				left: [
					{
						labelValue: 'Intensity (-)',
						ticklabelratio: 1,
						primaryGrid: true,
						secondaryGrid: false,
						nbTicksPrimary: 3,
						exponentialFactor: -7,
						forcedMin: 0,
						display: false
					}
				]
			};

			
			var optionsMs = {

				paddingTop: 5,
				paddingBottom: 0,
				paddingLeft: 20,
				paddingRight: 20,

				close: {
					left: true,
					right: true, 
					top: true,
					bottom: true
				},

				title: '',
				zoomMode: 'xy',
				defaultWheelAction: 'zoomY',
				lineToZero: false
			};


			var axisMs = {

				bottom: [
					{
						labelValue: 'm/z',
						unitModification: false,
						shiftToZero: true,
						primaryGrid: false,
						nbTicksPrimary: 10,
						secondaryGrid: false,
						axisDataSpacing: { min: 0, max: 0.1 },
					}
				],

				left: [
					{
						labelValue: 'Intensity (-)',
						ticklabelratio: 1,
						primaryGrid: true,
						secondaryGrid: false,
						nbTicksPrimary: 3,
						forcedMin: 0
					}
				]
			};

			this.gc = new Graph(domGc, optionsGc, axisGc);
			this.ms = new Graph(domMs, optionsMs, axisMs);

		},

		resize: function(width, height) {
			this.gc.resize(width, height / 2);
			this.ms.resize(width, height / 2);
		},

		setGC: function(gc) {

			if(!this.gc)
				return;
			if(this.gcSerie)
				this.gcSerie.kill();

			this.gcSerie = this.gc.newSerie('gc', {

			});

			this.gcSerie.setData(gc);
			this.gcSerie.autoAxis();
			this.gc.redraw();
			this.gc.drawSeries();

			

		},

		setMS: function(ms) {
			this.msData = ms;
		}
	}

	return gcms;
});
