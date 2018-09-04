'use strict';

define([
  'jquery',
  'require',
  'modules/default/defaultview',
  'src/util/util',
  'src/util/color',
  'src/util/worker',
  'components/jquery.threedubmedia/event.drag/jquery.event.drag'
], function ($, require, Default, Util, Color, Worker) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      this.colors = null;

      this.canvas = document.createElement('canvas');
      this.canvasContext = this.canvas.getContext('2d');

      this.scaleCanvas = document.createElement('canvas');
      this.scaleCanvasContext = this.scaleCanvas.getContext('2d');
      this.scaleCanvas.width = 40;

      this.canvasContainer = $('<div />').addClass('matrix-container');
      this.scaleContainer = $('<div />').addClass('scale-container');

      this.dom = $('<div />').addClass('canvasmatrix-container').append(this.canvasContainer.append(this.canvas)).append(this.scaleContainer.append(this.scaleCanvas));
      this.module.getDomContent().html(this.dom);

      this.squareLoading = 250;
      this.availableZooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      this.buffers = {};

      var that = this;
      that.accumulatedDelta = 0;
      $(this.canvasContainer).on('mousewheel', 'canvas', function (e) {
        e.preventDefault();
        var delta = e.originalEvent.detail || e.originalEvent.wheelDelta;

        if (that.max && delta > 0 || that.min && delta < 0)
          return;

        that.accumulatedDelta += delta;
        if (delta !== undefined)
          that.changeZoom(that.accumulatedDelta / 1000, (e.offsetX || e.pageX - $(e.target).offset().left), (e.offsetY || e.pageY - $(e.target).offset().top));
      }).on('dblclick', function (e) {
        that.accumulatedDelta = 0;
        that.changeZoom(that.accumulatedDelta / 1000, (e.offsetX || e.pageX - $(e.target).offset().left), (e.offsetY || e.pageY - $(e.target).offset().top));
      });

      $(this.canvasContainer).drag(function (e1, e2) {
        e1.preventDefault();
        var baseShift = that.baseShift;
        var shift = that.getXYShift();
        shift.x = baseShift.x + e2.deltaX;
        shift.y = baseShift.y + e2.deltaY;
        that.doCanvasErase();
        that.doCanvasRedraw();
        that.launchWorkers(true);
      });

      $(this.canvasContainer).drag('start', function (e1, e2) {
        e1.preventDefault();
        that.baseShift = $.extend({}, that.getXYShift());
      });
    },

    inDom: function () {
      this.onResize(true);
      this.initWorkers().then(this.resolveReady.bind(this));
      this.module.controller.initEvents();
    },

    onResize: function (doNotRedraw) {
      this.canvasContainer.width(this.width - 55);
      // We only care about resizing
      this.canvas.width = this.canvasContainer.width();
      this.canvas.height = this.height;

      if (!doNotRedraw) {
        this.doCanvasErase();
        this.doCanvasRedraw();
      }
    },

    doCanvasErase: function () {
      this.redrawStarted = false;
      this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    doCanvasRedraw: function () {
      var bufferIndices = this.getBufferIndices(this.getPxPerCell());

      for (var i = bufferIndices.minXIndexBuffer; i <= bufferIndices.maxXIndexBuffer; i++) {
        for (var j = bufferIndices.minYIndexBuffer; j <= bufferIndices.maxXIndexBuffer; j++) {
          this.doCanvasDrawBuffer(i, j);
        }
      }
    },

    getBufferIndices: function (pxPerCell) {
      var currentPxPerCell = this.getPxPerCell();
      var ratioIndex = currentPxPerCell / pxPerCell;
      var shift = this.getXYShift();

      var minXIndex = 0;
      if (shift.x < 0)
        minXIndex = Math.floor(-shift.x / currentPxPerCell / this.squareLoading);

      var minYIndex = 0;
      if (shift.y < 0)
        minYIndex = Math.floor(-shift.y / currentPxPerCell / this.squareLoading);

      var maxXIndex = Math.min(this.canvasNbX / this.squareLoading - 1, (this.canvas.width - shift.x) / pxPerCell / this.squareLoading);// , (this.canvas.width + shift.x) / pxPerCell);
      var maxYIndex = Math.min(this.canvasNbY / this.squareLoading - 1, (this.canvas.height - shift.y) / pxPerCell / this.squareLoading);// , (this.canvas.height + shift.y) / pxPerCell);

      var currentIndices = {
        minXIndexBuffer: minXIndex,
        minYIndexBuffer: minYIndex,

        maxXIndexBuffer: Math.ceil(maxXIndex),
        maxYIndexBuffer: Math.ceil(maxYIndex)
      };

      if (currentPxPerCell > pxPerCell) {
        var ultraMaxX = Math.ceil(this.canvasNbX / this.squareLoading) - 1;
        var ultraMaxY = Math.ceil(this.canvasNbY / this.squareLoading) - 1;

        var diff = (currentIndices.maxXIndexBuffer - currentIndices.minXIndexBuffer);
        var diff2 = (currentIndices.maxYIndexBuffer - currentIndices.minYIndexBuffer);

        currentIndices.minXIndexBuffer = Math.floor(Math.max(0, currentIndices.minXIndexBuffer - diff * (ratioIndex - 1)));
        currentIndices.maxXIndexBuffer = Math.floor(Math.min(ultraMaxX, currentIndices.maxXIndexBuffer + diff * (ratioIndex - 1) - 1));
        currentIndices.minYIndexBuffer = Math.floor(Math.max(0, currentIndices.minXIndexBuffer - diff2 * (ratioIndex - 1)));
        currentIndices.maxYIndexBuffer = Math.floor(Math.min(ultraMaxY, currentIndices.maxYIndexBuffer + diff2 * (ratioIndex - 1) - 1));
      }

      return currentIndices;
    },

    getBufferKey: function (pxPerCell, x, y) {
      return `${pxPerCell}-${x}-${y}`;
    },

    doCanvasDrawBuffer: function (bufferX, bufferY) {
      var shift = this.getXYShift();
      var pxPerCell = this.getPxPerCell();
      var bufferKey = this.getBufferKey(pxPerCell, bufferX, bufferY);

      if (!this.buffers[bufferKey])
        return;

      this.canvasContext.putImageData(this.buffers[bufferKey], bufferX * this.squareLoading * pxPerCell + shift.x, bufferY * this.squareLoading * pxPerCell + shift.y);
    },

    getPxPerCell: function (force) {
      if (this.pxPerCell && !force)
        return this.pxPerCell;
      this.pxPerCell = this.getOriginalPxPerCell();
      this.resetZoomPrefetch(this.pxPerCell);
      return this.pxPerCell;
    },

    resetZoomPrefetch: function () {
      var currentIndex, i, len;
      for (i = 0; i < this.availableZooms.length; i++) {
        if (this.availableZooms[i] == this.pxPerCell) {
          currentIndex = i;
          break;
        }
      }

      var arrBefore = this.availableZooms.slice(currentIndex - 2, currentIndex).reverse();
      var arrAfter = this.availableZooms.slice(currentIndex + 1, currentIndex + 3);
      this.availableZoomsForFetch = [];

      for (i = 0, len = (arrBefore.length + arrAfter.length); i < len; i++) {
        if ((i % 2 && arrBefore.length > 0) || arrAfter.length == 0)
          this.availableZoomsForFetch.push(arrBefore.shift());
        else
          this.availableZoomsForFetch.push(arrAfter.shift());
      }
    },

    getOriginalPxPerCell: function () {
      return this.getClosest(this.availableZooms, Math.max(1, Math.min(this.canvas.width / this.canvasNbX, this.canvas.height / this.canvasNbY)));
    },

    getClosest: function (haystack, needle) {
      var closest = false,
        newClosest;
      for (var i = 0; i < haystack.length; i++)
        if (!closest || (haystack[i] - needle < 0 && needle - haystack[i] < needle - closest))
          closest = haystack[i];
      return closest;
    },

    changeZoom: function (diff, mouseX, mouseY) {
      var newPxPerCell = Math.max(1, this.getClosest(this.availableZooms, this.getOriginalPxPerCell() + this.tanh(diff)));

      if (this.pxPerCell != newPxPerCell) {
        var zoomRatio = newPxPerCell / this.pxPerCell;

        var shift = this.getXYShift();

        shift.x = mouseX - (mouseX - shift.x) * zoomRatio;
        shift.y = mouseY - (mouseY - shift.y) * zoomRatio;

        this.pxPerCell = newPxPerCell;

        if (this.pxPerCell == this.availableZooms[this.availableZooms.length - 1]) {
          this.max = true;
          this.min = false;
        } else if (this.pxPerCell == this.availableZooms[0]) {
          this.min = true;
          this.max = false;
        } else {
          this.min = false;
          this.max = false;
        }

        this.doCanvasErase();
        this.launchWorkers(true);
        this.doCanvasRedraw();
      }
    },

    tanh: function (arg) {
      arg /= 15;
      return this.availableZooms[this.availableZooms.length - 1] * 2.5 * arg;
    },

    // Get the XY shift (in case you have zoomed on the canvas)
    // Used to center the canvas on the loading

    getXYShift: function () {
      if (this.xyShift && !isNaN(this.xyShift.x) && !isNaN(this.xyShift.y))
        return this.xyShift;
      var pxPerCell = this.getPxPerCell();
      var zoneX = pxPerCell * this.canvasNbX;
      var zoneY = pxPerCell * this.canvasNbY;


      this.xyShift = {
        x: Math.floor((this.canvas.width - zoneX) / 2),
        y: Math.floor((this.canvas.height - zoneY) / 2)
      };
      return this.xyShift;
    },

    blank: {
      matrix: function () {
        this.doCanvasErase();
        this.gridData = [];
        this.canvasNbX = 0;
        this.canvasNbY = 0;
      }
    },

    // Here we receive new data, we need to relaunch the workers
    update: {
      matrix: function (moduleValue) {
        if (!this.canvas)
          return;

        moduleValue = moduleValue.get();

        this.gridData = moduleValue.data ? moduleValue.data : moduleValue;
        this.canvasNbX = this.gridData[0].length;
        this.canvasNbY = this.gridData.length;

        this.minmaxworker.postMessage(JSON.stringify(this.gridData));
      }
    },

    initWorkers: function () {
      var minMaxWorker = Worker(require.toUrl('src/util/workers/getminmaxmatrix.js'));
      var mainWorker = Worker(require.toUrl('./worker.js'));
      var that = this;
      return Promise.all([minMaxWorker, mainWorker]).then(function (workers) {
        var minMaxWorker = workers[0];
        minMaxWorker.addEventListener('message', function (event) {
          that.minValue = event.data.min;
          that.maxValue = event.data.max;
          that.doChangeWorkersData();
          // We can keep the actual workers, not a problem. We just need to erase the buffers array
          that.buffers = [];
          that.buffersDone = [];
          if (!that.getHighContrast()) {
            that.minValue = 0;
            that.maxValue = 1;
          }
          that.redoScale(that.minValue, that.maxValue);
          that.launchWorkers(true);
        });
        that.minmaxworker = minMaxWorker;

        var mainWorker = workers[1];
        mainWorker.postMessage({
          title: 'init',
          message: {
            colors: that.getColors(),
            squareLoading: that.squareLoading,
            highcontrast: that.getHighContrast()
          }
        });
        mainWorker.addEventListener('message', function (event) {
          var data = event.data;
          var pxPerCell = data.pxPerCell;
          var buffIndexX = data.indexX;
          var buffIndexY = data.indexY;

          that.buffers[that.getBufferKey(pxPerCell, buffIndexX, buffIndexY)] = data.data;
          if (that.getPxPerCell() == pxPerCell)
            that.doCanvasDrawBuffer(buffIndexX, buffIndexY);

          that.launchWorkers();
        });
        that.workers = mainWorker;
      });
    },

    getCurrentPxPerCellFetch: function () {
      return this.currentPxFetch ? this.currentPxFetch : (this.currentPxFetch = this.getPxPerCell());
    },

    incrementPxPerCellFetch: function () {
      this.currentPxFetch = this.availableZoomsForFetch.shift();
      return this.currentPxFetch;
    },

    launchWorkers: function (restartAtNormal) {
      var pxPerCell;
      this.cachedPxPerCell = this.pxPerCell;
      if (restartAtNormal) {
        pxPerCell = this.getPxPerCell();
        this.resetZoomPrefetch(pxPerCell);
        this.pxPerCell = this.cachedPxPerCell;
      } else {
        pxPerCell = this.getCurrentPxPerCellFetch();
      }

      if (!this.postNextMessageToWorker(pxPerCell)) {
        if (this.incrementPxPerCellFetch())
          this.launchWorkers();
      }
    },

    // http://localhost:8888/git/visualizer/?viewURL=http%3A//script.epfl.ch/servletScript/JavaScriptServlet%3Faction%3DLoadFile%26filename%3Dlpatiny/data//Demo/Basic/LargeMatrix.view%26key%3DZv1Ib2VDf6&dataURL=http%3A//script.epfl.ch/servletScript/JavaScriptServlet%3Faction%3DLoadFile%26filename%3Dlpatiny/result/2012-07-06/2012-07-06_09-11-38oE4j5XDDPd%26key%3DieGxx34DhR&saveViewURL=http%3A//script.epfl.ch/servletScript/JavaScriptServlet%3Faction%3DSaveFile%26filename%3Dlpatiny/data//Demo/Basic/LargeMatrix.view%26key%3Dh5fKTxoIWD
    postNextMessageToWorker: function (pxPerCell) {
      var bufferIndices = this.getBufferIndices(pxPerCell);
      for (var i = bufferIndices.minXIndexBuffer; i <= bufferIndices.maxXIndexBuffer; i++) {
        for (var j = bufferIndices.minYIndexBuffer; j <= bufferIndices.maxYIndexBuffer; j++) {
          var key = this.getBufferKey(pxPerCell, i, j);

          if (typeof this.buffers[key] == 'undefined') {
            this.doPostNextMessageToWorker(pxPerCell, i, j);
            return true;
          }
        }
      }

      var maxXBuffer = Math.ceil(this.canvasNbX / this.squareLoading) - 1;
      var maxYBuffer = Math.ceil(this.canvasNbY / this.squareLoading) - 1;

      return false;
    },

    doPostNextMessageToWorker: function (pxPerCell, indexX, indexY) {
      if (!this.buffers[this.getBufferKey(pxPerCell, indexX, indexY)]) {
        var w = this.squareLoading,
          h = this.squareLoading;

        if ((indexX + 1) * this.squareLoading > this.canvasNbX)
          w = (this.canvasNbX % this.squareLoading);

        if ((indexY + 1) * this.squareLoading > this.canvasNbY)
          h = (this.canvasNbY % this.squareLoading);

        this.buffers[this.getBufferKey(pxPerCell, indexX, indexY)] = this.canvasContext.createImageData(w * pxPerCell, h * pxPerCell);
      }

      this.workers.postMessage({
        title: 'doPx',
        message: {
          pxPerCell: pxPerCell,
          indexX: indexX,
          indexY: indexY,
          buffer: this.buffers[this.getBufferKey(pxPerCell, indexX, indexY)],
          nbValX: w
        }
      });
    },

    doChangeWorkersData: function () {
      this.workers.postMessage({
        title: 'changeData',
        message: {
          data: JSON.stringify(this.gridData),
          min: this.minValue,
          max: this.maxValue
        }
      });
    },

    getColors: function () {
      if (!this.colors) {
        var colors = this.module.getConfiguration('colors');
        if (colors) {
          if (colors.length === 1) {
            colors.push([255, 255, 255, 1]);
          }
          this.colors = colors;
        } else {
          this.colors = [[0, 0, 0, 1], [255, 255, 255, 1]];
        }
      }
      return this.colors;
    },

    getHighContrast: function () {
      return this.highContrast || (this.highContrast = this.module.getConfiguration('highContrast', false));
    },

    redoScale: function (min, max) {
      var colors = this.getColors();
      this.scaleCanvas.height = this.scaleContainer.height() - 20;
      this.scaleCanvas.width = 40;

      var gradHeight = this.scaleCanvas.height - 30;
      var step = (max - min) / (colors.length - 1);
      var stepPx = gradHeight / (colors.length - 1);

      var lineargradient = this.scaleCanvasContext.createLinearGradient(0, 0, 0, gradHeight);

      for (var i = 0; i < colors.length; i++) {
        lineargradient.addColorStop(i / (colors.length - 1), Color.getColor(colors[i]));
        this.scaleCanvasContext.fillText(String(Math.round(100 * (i * step + min)) / 100), 5, stepPx * i <= 0 ? 15 : stepPx * i - 5);
      }

      this.scaleCanvasContext.fillStyle = lineargradient;
      this.scaleCanvasContext.fillRect(28, 5, 10, gradHeight);
    },

    erase: function () {
      this.dom.remove();
      this.highContrast = false;
      this.colors = false;

      this.workers.terminate();

      this.workers = [];
      this.buffers = [];
    }
  });

  return View;
});
