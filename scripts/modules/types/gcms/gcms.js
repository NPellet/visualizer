
define(['jquery', 'libs/plot/plot'], function($, Graph) {


	var gcms = function() {
		this.gcSeries = [];
		this.msData = null;
		this.firstMs = true;


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
				rangeLimitX: 20,

				onRangeX: function(xStart, xEnd, range) {
					var indexStart = self.gcSeries[0].searchClosestValue(xStart).xBeforeIndex;
					var indexEnd = self.gcSeries[0].searchClosestValue(xEnd).xBeforeIndex;
					var indexMin = Math.min(indexStart, indexEnd);
					var indexMax = Math.max(indexStart, indexEnd);

					var obj = [], allMs = [], i, j;

					for(i = indexMin; i <= indexMax; i++) {
						for(j = 0, l = self.msData[i].length; j < l; j+=2) {
							if(obj[self.msData[i][j]])
								obj[self.msData[i][j]] += self.msData[i][j+1];	
							else {
								obj[self.msData[i][j]] = self.msData[i][j+1];
								allMs.push(self.msData[i][j]);
							}
						}
					}

					allMs.sort(function(a, b) { return a -b; });
					var finalMs = [];
					for(var i = 0; i < allMs.length; i++) {
						finalMs.push(allMs[i]);
						finalMs.push(obj[allMs[i]] / Math.abs(indexMax - indexMin));
					}

					if(range.serie) {
						range.serie.kill(true);
						range.serie = false;
					}

					range.serie = self.ms.newSerie('av');
					range.serie.autoAxis();
					range.serie.setYAxis(self.ms.getRightAxis());
					range.serie.setData(finalMs);
					range.serie.setLineColor('rgb(' + range.color + ')');

					self.ms.redraw(true);
					self.ms.getRightAxis()._recalculateDataInterval();
					self.ms.getLeftAxis()._recalculateDataInterval();
					
					self.ms.drawSeries();
				},	

				onMouseMoveData: function(e, val) {
					for(var i in val) {
						break;
					}

					if(val[i] == undefined)
						return;

					var x = val[i].xBeforeIndex;
					var ms = self.msData[x];

					if(self.msSerie) {
						self.msSerie.kill(true);
						self.msSerie = false;
					}

					if(!ms)
						return;

					self.msSerie = self.ms.newSerie();
					self.msSerie.autoAxis();
					self.msSerie.setData(ms);

					self.ms.getLeftAxis()._recalculateDataInterval();
					
					self.ms.redraw(!self.firstMs);
					self.firstMs = false;
					self.ms.drawSeries();
				}
			};


			var axisGc = {

				bottom: [
					{
						labelValue: 'Time',
						unitModification: 'time',
						
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
				defaultMouseAction: 'zoom',
				defaultWheelAction: 'zoomY',
				lineToZero: false
			};


			var axisMs = {

				bottom: [
					{
						labelValue: 'm/z',
						unitModification: false,
						
						primaryGrid: false,
						nbTicksPrimary: 10,
						nbTicksSecondary: 4,
						secondaryGrid: false,
						axisDataSpacing: { min: 0, max: 0.1 },
					}
				],

				left: [
					{
						labelValue: 'Intensity (-)',
						ticklabelratio: 1,
						primaryGrid: true,
						nbTicksSecondary: 4,
						secondaryGrid: false,
						scientificTicks: true,
						nbTicksPrimary: 3,
						forcedMin: 0
					}
				],

				right: [
					{
						primaryGrid: false,
						secondaryGrid: false,
						nbTicksSecondary: 5
					}
				]
			};

			this.gc = new Graph(domGc, optionsGc, axisGc);
			this.ms = new Graph(domMs, optionsMs, axisMs);

		},

		resize: function(width, height) {
			this.gc.resize(width - 10, height / 2 - 10);
			this.ms.resize(width - 10, height / 2 - 10);

			this.gc.redraw();
			this.gc.drawSeries();
			this.ms.drawSeries();
		},

		setGC: function(gc) {
			var serie;
			if(!this.gc)
				return;

			for(var i = 0, l = this.gcSeries.length; i < l; i++)
				this.gcSeries[i].kill();
			this.gcSeries = [];

			for(var i in gc) {
				serie = this.gc.newSerie(i, {});
				this.gcSeries.push(serie);
				serie.setData(gc[i]);
				serie.autoAxis();
				this.gc.redraw();
				this.gc.drawSeries();
			}
		},

		setMS: function(ms) {
			this.msData = ms;
			
		}
	}

	return gcms;
});
