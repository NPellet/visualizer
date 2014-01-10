
define(['jquery', 'lib/plot/plot'], function($, Graph) {


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
				unZoomMode: 'gradualX',
				rangeLimitX: parseInt(this.rangeLimit) || 1,

				plugins: ['zoom', 'drag', 'integral'],

				onRangeX: function(xStart, xEnd, range) {
					
				},	

				onAnnotationSelect: function(annot) {

					switch(annot.type) {

						case 'verticalLine':

						break;

						case 'surfaceUnderCurve': 

							self.selectAnnot( annot );
							self.onIntegralSelect( annot );

						break;
					}
				},

				onAnnotationChange: function(annot) {
					//this.triggerEvent('onAnnotationSelect', annot);

					self.selectAnnot( annot );
					self.onAnnotationChange(annot);
				},


				onAnnotationRemove: function(annot) {
					self.onAnnotationRemove(annot);
				},


				onAnnotationMake: function(annot) {
					annot = new DataObject(annot, true);
					self.onAnnotationMake(annot);
					return annot;
				},

				onAnnotationUnselect: function(annot) {
					
					if(self.serieIntegral) {
						self.serieIntegral.kill(true);
						self.serieIntegral = false;
					}
				},

				onRangeXRemove: function(range) {
					if(!range.serie) {
						return;
					}
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
				defaultWheelAction: 'zoomY',

				plugins: ['zoom', 'drag', 'verticalLine'],

				onAnnotationMake: function( annot ) {
					annot._msIon = new DataObject({ 
						name: annot.id, 
						data: [], 
						lineColor: annot.fillColor || annot.strokeColor, 
						lineWidth: '2'
					});
					
					this.options.onAnnotationChange(annot);
					self.onAnnotationMake(annot);
				},

				onAnnotationChange: function( annot ) {

					var annot = new DataObject(annot, true);

					var val = annot.pos.x, 
						index, 
						index2, 
						val, 
						target = [];

					
					for(var i = 0, l = self.msData.length; i < l; i++) {

						index = self.searchBinaryIndexMs(i, val),
						index2 = index,
						valAdd = 0;

						while(self.msData[i][index2] > val - 0.3) {
							valAdd += self.msData[i][index2 + 1];
							index2 -= 2;
						}

						index2 = index + 2;

						while(self.msData[i][index2] < val + 0.7) {
							valAdd += self.msData[i][index2 + 1];
							index2 += 2;
						}

						target.push(self.gcData[i * 2]);
						target.push(valAdd);
					}

					annot._msIon.data = target;
					annot._msIon.triggerChange();


					//self.onAnnotationChange();
				}
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

		selectAnnot: function( annot ) { // Creating an averaged MS on the fly

			var self = this;
			var xStart = annot.pos.x;
			var xEnd = annot.pos2.x;

			var indexStart = self.gcSeries[0].searchClosestValue(xStart).xBeforeIndex;
			var indexEnd = self.gcSeries[0].searchClosestValue(xEnd).xBeforeIndex;
			var indexMin = Math.min(indexStart, indexEnd);
			var indexMax = Math.max(indexStart, indexEnd);

			if(indexMax == indexMin) {
				return;
			}
			

			var obj = [], allMs = [], i, j, floor;

			for(i = indexMin; i <= indexMax; i++) {
				for(j = 0, l = self.msData[i].length; j < l; j+=2) {
					floor = Math.floor( self.msData[i][j] + 0.3 );
					if(obj[ floor ]) {

						obj[ floor ] += self.msData[i][j+1];	

					} else {

						obj[ floor ] = self.msData[i][j+1];
						allMs.push( floor );
					}
				}
			}

			allMs.sort(function(a, b) { return a -b; });
			var finalMs = [];

			for(var i = 0; i < allMs.length; i++) {
				finalMs.push( allMs[i] );
				finalMs.push( Math.round( obj[ allMs[ i ] ] / Math.abs( indexMax - indexMin ) ) );
			}

			if(self.serieIntegral) {
				self.serieIntegral.kill(true);
				self.serieIntegral = false;
			}

			self.serieIntegral = self.ms.newSerie('av', { lineToZero: !this.msContinuous });
			self.serieIntegral.autoAxis();
			self.serieIntegral.setYAxis(self.ms.getRightAxis());
			self.serieIntegral.setData(finalMs);

			self.serieIntegral.options.autoPeakPicking = true;

			self.serieIntegral.setLineColor(annot.strokeColor || annot.fillColor);

			self.ms.getRightAxis().setMaxValue(self.ms.getBoundaryAxisFromSeries(self.ms.getRightAxis(), 'y', 'max'));
			self.ms.getRightAxis().setMinMaxToFitSeries();
			//self.ms.getLeftAxis().setMinMaxToFitSeries();

			self.ms.redraw(!self.firstRange);
			self.firstRange = false;
			self.ms.drawSeries();

			self.onMSSelect( finalMs, annot );
		},

		unload: function() {
			this.gc.kill();
			this.ms.kill();
		},

		zoomOn: function(start, end, y) {
			this.gc.getBottomAxis()._doZoomVal(start - (end - start)*0.4, end + (end - start)*0.4);
			this.gc.getLeftAxis().scaleToFitAxis(this.gc.getBottomAxis(), start, end);

			this.gc.redraw(true);
			this.gc.drawSeries();

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



		searchBinaryIndexMs: function(index, x) {

			var haystack = this.msData[index], target = x, reverse = false;

			var seedA = 0,
				length = haystack.length,
				seedB = (length - 2);

			if(haystack[seedA] == target)
				return seedA;

			if(haystack[seedB] == target)
				return seedB;

			var seedInt;
			var i = 0;
			
			while(true) {
				i++;
				if(i > 100)
					throw "Error loop";

				seedInt = (seedA + seedB) / 2;
				seedInt -= seedInt % 2; // Always looks for an x.

				if(seedInt == seedA || haystack[seedInt] == target)
					return seedInt;

		//		console.log(seedA, seedB, seedInt, haystack[seedInt]);
				if(haystack[seedInt] <= target) {
					if(reverse)
						seedB = seedInt;
					else
						seedA = seedInt;
				} else if(haystack[seedInt] > target) {
					if(reverse)
						seedA = seedInt;
					else
						seedB = seedInt;
				}
			}
		},


		blank: function() {

			var i = 0,
				l = this.gcSeries.length;

			for( ; i < l ; i++ ) {
				this.gcSeries[i].kill();
			}

			this.gcSeries = [];


			if( this.msSerie ) {

				this.msSerie.kill( true );
				this.msSerie = false;
			}
		},

		setGC: function(gc) {
			var serie;
			if(!this.gc)
				return;

			this.blank();
			this.gcSeries = [];

			for(var i in gc) {
				serie = this.gc.newSerie(i, {
					areaUnderLine: true,
					useSlots: true
				});
				this.gcSeries.push(serie);
				serie.setData(gc[i]);
				serie.autoAxis();
				this.gc.redraw();
				this.gc.drawSeries();

				this.gcData = gc[i];
			}
		},

		setMS: function(ms) {
			this.msData = ms;	
		},


		msIonAdded: function() {},
				

		setExternalGC: function(gc) {
			if(this.extGC)
				this.extGC.kill(true);

			this.extGC = this.gc.newSerie('external', {useSlots: true, lineWidth: 2, lineColor: 'red'});
			this.extGC.setXAxis(this.gc.getXAxis());
			this.extGC.setYAxis(this.gc.getRightAxis(0, {primaryGrid: false, secondaryGrid: false, axisDataSpacing: { min: 0, max: 0}, display: false }));
			this.extGC.setData(gc);

			this.gc.redraw();
			this.gc.drawSeries();
		},


		setExternalMS: function(ms, cont) {
			if(this.extMS)
				this.extMS.kill(true);

			this.extMS = this.ms.newSerie('external', { useSlots: false, lineToZero: !cont, lineWidth: 3, lineColor: 'rgba(0, 0, 255, 0.2)' });
			this.extMS.setXAxis(this.ms.getXAxis());
			this.extMS.setYAxis(this.ms.getRightAxis(1, {primaryGrid: false, secondaryGrid: false, axisDataSpacing: { min: 0, max: 0}, display: false }));
			this.extMS.setData(ms);
			this.ms.redraw(true, true, false);
			this.ms.drawSeries();
		}
	}

	return gcms;
});
