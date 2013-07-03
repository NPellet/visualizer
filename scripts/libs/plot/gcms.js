
define(['jquery', 'libs/plot/plot'], function($, Plot) {

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
			/*console.log(val);*/
			/*for(var i in val) {
				LRU.get('http://lpidb.epfl.ch/content/ajax/getstabilityiv.ajax.php?id=' + i +'&date=' + val[i].xBefore).done(function(data) {
			    	for(var i in data) {
			        	self.doIv(i, data[i], self.graphs[0].getSerie(i).getLineColor());
			    	}
			    });
			}*/
		}
	};


	var gcAxis = {

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
				forcedMin: 0
			}
		]
	};

	
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
		zoomMode: 'xy',
		defaultWheelAction: 'zoomY',
		lineToZero: false
	};


	var msAxis = {

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
				nbTicksSecondary: 4,
				forcedMin: 0
			}
		],


		right: [
			{
				labelValue: '',
				ticklabelratio: 1,
				primaryGrid: false,
				secondaryGrid: false,
				nbTicksPrimary: 3,
				nbTicksSecondary: 4,
				forcedMin: 0
			}
		]
	};

	



	var gcms = function() {




	}

	gcms.prototype = {

		inDom: function(domGc, domMs) {

			var gc = new Graph(domGc, optionsGc, axisGc);
			var ms = new Graph(domMs, optionsMs, axisMs);

		}
	}

	


});
