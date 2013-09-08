
define(['jquery', 'libs/plot/plot'], function($, Graph) {


	var gcms = function() {
		this.gcSeries = [];
		this.msData = null;
		this.firstMs = true;
		this.firstRange = true;
		this.msContinuous = false;
		this.rangeLimit = false;

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
				defaultMouseAction: 'zoomX',
				defaultWheelAction: 'zoomY',
				shiftMouseAction: 'rangeX',
				lineToZero: false,
				rangeLimitX: parseInt(this.rangeLimit) || 1,

				onRangeX: function(xStart, xEnd, range) {
					var indexStart = self.gcSeries[0].searchClosestValue(xStart).xBeforeIndex;
					var indexEnd = self.gcSeries[0].searchClosestValue(xEnd).xBeforeIndex;
					var indexMin = Math.min(indexStart, indexEnd);
					var indexMax = Math.max(indexStart, indexEnd);

					if(indexMax == indexMin)
						return;
					

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

					range.serie = self.ms.newSerie('av', { lineToZero: !this.msContinuous });
					range.serie.autoAxis();
					range.serie.setYAxis(self.ms.getRightAxis());
					range.serie.setData(finalMs);
					range.serie.setLineColor('rgb(' + range.color + ')');

					self.ms.getRightAxis().setMaxValue(self.ms.getBoundaryAxisFromSeries(self.ms.getRightAxis(), 'y', 'max'));
					self.ms.getRightAxis().setMinMaxToFitSeries();
					//self.ms.getLeftAxis().setMinMaxToFitSeries();

					self.ms.redraw(!self.firstRange);
					self.firstRange = false;
					self.ms.drawSeries();
				},	

				onRangeXRemove: function(range) {
					if(!range.serie)
						return;
					range.serie.kill(true);
					range.serie = false;
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

					self.msSerie = self.ms.newSerie('', { lineToZero: !this.msContinuous });
					self.msSerie.autoAxis();
					self.msSerie.setData(ms);
					self.ms.getLeftAxis().setMaxValue(self.ms.getBoundaryAxisFromSeries(self.ms.getLeftAxis(), 'y', 'max'));
					self.ms.getLeftAxis().setMinMaxToFitSeries();
					
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

						onZoom: function(from, to) {
							if(self.onZoomGC)
								self.onZoomGC(from, to);
						}
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
				zoomMode: 'x',
				defaultMouseAction: 'zoom',
				defaultWheelAction: 'zoomY'
				
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

						onZoom: function(from, to) {
							if(self.onZoomMS)
								self.onZoomMS(from, to);
						}
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
						forcedMin: 0,
						axisDataSpacing: { min: 0, max: 0.2 },
					}
				],

				right: [
					{
						primaryGrid: false,
						secondaryGrid: false,
						nbTicksSecondary: 5,
						axisDataSpacing: { min: 0, max: 0.2 },
					}
				]
			};

			this.gc = new Graph(domGc, optionsGc, axisGc);
			this.ms = new Graph(domMs, optionsMs, axisMs);

		},

		unload: function() {
			this.gc.kill();
			this.ms.kill();
		},

		zoomOn: function(start, end) {
			this.gc.getBottomAxis()._doZoomVal(start - (end - start)*0.4, end + (end - start)*0.4);

			this.gc.redraw(true);
			this.gc.drawSeries(true);

		},

		setMSContinuous: function(cont) {
			this.msContinuous = cont;
		},

		setRangeLimit: function(nbRange) {
			this.rangeLimit = nbRange;
		},

		resize: function(width, height) {
			this.gc.resize(width - 10, height / 2 - 10);
			this.ms.resize(width - 10, height / 2 - 10);
			

			this.gc.redraw();
			this.gc.drawSeries();
			this.ms.drawSeries();
		},

		getGC: function() {
			return this.gc;
		},

		getMS: function() {
			return this.ms;
		},

		setGC: function(gc) {
			var serie;
			if(!this.gc)
				return;

			for(var i = 0, l = this.gcSeries.length; i < l; i++)
				this.gcSeries[i].kill();
			this.gcSeries = [];

			for(var i in gc) {
				serie = this.gc.newSerie(i, {
					areaUnderLine: true
				});
				this.gcSeries.push(serie);
				serie.setData(gc[i]);
				serie.autoAxis();
				this.gc.redraw();
				this.gc.drawSeries();
			}
		},

		setMS: function(ms) {
			this.msData = ms;	
		},



		setExternalGC: function(gc) {
			if(this.extGC)
				this.extGC.kill(true);

			this.extGC = this.gc.newSerie('external', {lineWidth: 2, lineColor: 'red'});
			this.extGC.setXAxis(this.gc.getXAxis());
			this.extGC.setYAxis(this.gc.getRightAxis(0, {primaryGrid: false, secondaryGrid: false, axisDataSpacing: { min: 0, max: 0}, display: false }));
			this.extGC.setData(gc);

			this.gc.redraw();
			this.gc.drawSeries(true);
		},


		setExternalMS: function(ms, cont) {
			if(this.extMS)
				this.extMS.kill(true);

			this.extMS = this.ms.newSerie('external', { lineToZero: !cont, lineWidth: 3, lineColor: 'rgba(0, 0, 255, 0.2)' });
			this.extMS.setXAxis(this.ms.getXAxis());
			this.extMS.setYAxis(this.ms.getRightAxis(1, {primaryGrid: false, secondaryGrid: false, axisDataSpacing: { min: 0, max: 0}, display: false }));
			this.extMS.setData(ms);
			this.ms.redraw(true, true, false);
			this.ms.drawSeries(true);
		}
	}

	return gcms;
});
