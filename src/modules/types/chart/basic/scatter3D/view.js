'use strict';

define([
  'modules/default/defaultview',
  'src/main/datas',
  'src/util/datatraversing',
  'src/util/api',
  'src/util/util',
  'src/util/color',
  'src/util/colorbar',
  'lodash',
  'threejs',
  'src/util/debug',
  'chroma',
  'components/ml/dist/ml.min',
  'lib/threejs/TrackballControls'
], function (Default, Data, Traversing, API, Util, colorUtil, colorbar, _, THREE, Debug, chroma, ml) {
  var separation = 0.55,
    incrementation = 0.001;
  var Stat = ml.Stat;

  function addKeyHandler() {
    document.addEventListener('keyup', onKeyUp, false);
  }

  function onKeyUp(event) {
    event.preventDefault();

    switch (event.keyCode) {
      case 38: // Up
        separation += incrementation;
        break;
      case 40: // Down
        separation -= incrementation;
        break;
      case 39: // Right
        incrementation *= 1.1;
        break;
      case 37:// left
        incrementation *= 0.9;
        break;
    }
  }

  addKeyHandler();

  function preloadImages(img) {
    for (var key in img) {
      THREE.ImageUtils.loadTexture(img[key]);
    }
  }

  function generateRandomArray(n, min, max) {
    var result = [];
    for (var i = 0; i < n; i++) {
      result.push(Math.random() * (max - min) + min);
    }
    return result;
  }

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? `0${hex}` : hex;
  }

  function rgbToHex(r, g, b) {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
  }

  function keepDecimals(num, n) {
    num = `${num}`;
    var idx = num.indexOf('.');
    if (idx === -1) return +num;
    return num.slice(0, idx + n + 1);
  }

  function rotateAroundObjectAxis(object, axis, radians) {
    var rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.applyMatrix(rotObjectMatrix);
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
  }

  var NORM_CONSTANT = 1000;
  var TOOLTIP_WIDTH = 100;
  var ZOOM_START = 3;
  var DEFAULT_BACKGROUND_COLOR = '#eeeeee';
  var DEFAULT_PROJECTION_COLOR = '#888888';
  var DEFAULT_POINT_COLOR = 'lightblue';
  var DEFAULT_POINT_RADIUS = 0.03;
  var DEFAULT_POINT_SHAPE = 'sphere';
  var DEFAULT_TEXT_COLOR = 'rgba(0,0,0,1)';
  var HIGHLIGHT_OPACITY = 0.6;
  var DELTA = NORM_CONSTANT / 1000;
  var CAMERA_NEAR = 2;
  var CAMERA_FAR = 10000;


  var baseURL = `${require.toUrl('modules/types/chart/basic/scatter3D')}/`;
  var shapeImages = {
    sphere: `${baseURL}img/ball.png`,
    spheret: `${baseURL}img/ballt.png`,
    tetrahedron: `${baseURL}img/tetrahedron2.png`,
    tetrahedront: `${baseURL}img/tetrahedron2t.png`,
    cone: `${baseURL}img/cone.png`,
    conet: `${baseURL}img/conet.png`,
    cube: `${baseURL}img/cube.png`,
    cubet: `${baseURL}img/cubet.png`,
    pyramid: `${baseURL}img/pyramid.png`,
    pyramidt: `${baseURL}img/pyramidt.png`,
    cylinder: `${baseURL}img/cylinder.png`,
    cylindert: `${baseURL}img/cylindert.png`,
    cuboid: `${baseURL}img/cuboid.png`,
    cuboidt: `${baseURL}img/cuboidt.png`
  };


  preloadImages(shapeImages);

  $.fn.listHandlers = function (events, outputFunction) {
    return this.each(function (i) {
      var that = this,
        dEvents = $(this).data('events');
      if (!dEvents) return;
      $.each(dEvents, function (name, handler) {
        if ((new RegExp(`^(${events === '*' ? '.+' : events.replace(',', '|').replace(/^on/i, '')})$`, 'i')).test(name)) {
          $.each(handler, function (i, handler) {
            outputFunction(that, `\n${i}: [${name}] : ${handler}`);
          });
        }
      });
    });
  };

  function View() {
    this._firstLoad = true;
  }

  $.extend(true, View.prototype, Default, {

    _initThreejs: function () {
      var that = this;
      var container;
      var pointedObjects = [];
      var lastMouseMoveEvent = null;
      var currentPoint = null;
      var drawTickLabelsThrottled = _.throttle(this._drawTickLabels.bind(this), 500);
      var drawAxisLabelsThrottled = _.throttle(this._drawAxisLabels.bind(this), 500);
      var drawGraphTitleThrottled = _.throttle(this._drawGraphTitle.bind(this), 500);
      var projections = [];

      init();
      animate();

      const descSort = (a, b) => (a.distance - b.distance);

      function getIntersectsBis(event) {
        var width, height;
        if (that._3d === 'sideBySide') width = that.width / 2;
        else width = that.width;
        var height = that.height;
        var vector = new THREE.Vector3(
          (event.offsetX / width) * 2 - 1,
          -(event.offsetY / height) * 2 + 1,
          0.5
        );
        vector.unproject(that.camera);

        var ray = new THREE.Ray(that.camera.position,
          vector.sub(that.camera.position).normalize());

        var count = 0;
        var intersects = [];
        for (var i = 0; i < that.mathPoints.length; i++) {
          if (ray.isIntersectionSphere(that.mathPoints[i])) {
            count++;
            intersects.push({
              index: that.mathPoints[i].index,
              distance: that.camera.position.distanceTo(that.mathPoints[i].center)
            });
          }
        }
        intersects.sort(descSort);
        intersects = _.filter(intersects, function (val) {
          return val.distance > CAMERA_NEAR;
        });
        intersects = _.map(intersects, function (val) {
          return val.index;
        });
        return intersects;
      }

      function showPointCoordinates(index) {
        if (that._configCheckBox('displayPointCoordinates', 'onhover')) {
          var arr = [];
          arr.push(`X: ${parseFloat(that._data.x[index].toPrecision(3)).toExponential()}`);
          arr.push(`Y: ${parseFloat(that._data.y[index].toPrecision(3)).toExponential()}`);
          arr.push(`Z: ${parseFloat(that._data.z[index].toPrecision(3)).toExponential()}`);
          var $legend = $('#legend_point_coordinates');
          $legend.html(arr.join('<br/>'));
          $legend.show();
        }
      }

      function hidePointCoordinates() {
        if (that._configCheckBox('displayPointCoordinates', 'onhover')) {
          $('#legend_point_coordinates').hide();
        }
      }

      function onMouseMove(event) {
        var intersects;
        intersects = getIntersectsBis(event);
        pointedObjects = intersects;
        lastMouseMoveEvent = event;
        if (intersects.length > 0) {
          var index = intersects[0];
          var newPoint = index;
          var pointChanged = (newPoint !== currentPoint);
          if (currentPoint && pointChanged) {
            // rehighlight currentPoint -> newPoint
            API.highlightId(that._data._highlight[currentPoint], 0);
            API.highlightId(that._data._highlight[newPoint], 1);
            showPointCoordinates(index);
          } else if (pointChanged) {
            // highlight newPoint
            API.highlightId(that._data._highlight[newPoint], 1);
            showPointCoordinates(index);
          }
          currentPoint = newPoint;
        } else {
          if (currentPoint !== null) {
            // unhighlight currentPoint
            API.highlightId(that._data._highlight[currentPoint], 0);
            hidePointCoordinates();
          }
          currentPoint = null;
        }
      }

      function showTooltip() {
        if (pointedObjects.length === 0) {
          return;
        }
        var jpath = that.module.getConfiguration('tooltipJpath');
        if (!jpath) {
          return;
        }

        var data = that._data;

        if (!data.info) {
          return;
        }

        var info = data.info[pointedObjects[0]];
        var label = info.getChildSync(jpath);
        var $tooltip = that.$tooltip;
        $tooltip.css('left', lastMouseMoveEvent.offsetX - TOOLTIP_WIDTH);
        $tooltip.css('top', lastMouseMoveEvent.offsetY);
        $tooltip.css('width', TOOLTIP_WIDTH);
        $tooltip.html(label.value);
        $tooltip.show();
      }

      function hideTooltip() {
        that.$tooltip.hide();
      }

      function showProjection() {
        if (pointedObjects.length === 0) {
          return;
        }

        var index = pointedObjects[0];
        if (projections.length > 0) {
          hideProjection();
        }
        var options = {
          color: 0x888888
        };
        // xy projection
        var p1 = new THREE.Vector3(that._data.normalizedData.x[index], that._data.normalizedData.y[index], that._data.normalizedData.z[index]);
        var p2 = new THREE.Vector3(that._data.normalizedData.x[index], that._data.normalizedData.y[index], 0);
        projections.push(that._drawLine(p1, p2, options));
        projections.push(that._drawCircle({
          color: '#000000',
          radius: that._data.size[index],
          x: that._data.normalizedData.x[index],
          y: that._data.normalizedData.y[index],
          z: DELTA + that.gorigin.z
        }));

        // xz projection
        p2 = new THREE.Vector3(that._data.normalizedData.x[index], 0, that._data.normalizedData.z[index]);
        projections.push(that._drawLine(p1, p2, options));
        projections.push(that._drawCircle({
          rotationAngle: Math.PI / 2,
          rotationAxis: { x: 1 },
          color: '#000000',
          radius: that._data.size[index],
          x: that._data.normalizedData.x[index],
          y: DELTA + that.gorigin.y,
          z: that._data.normalizedData.z[index]
        }));

        // yz projection
        p2 = new THREE.Vector3(0, that._data.normalizedData.y[index], that._data.normalizedData.z[index]);
        projections.push(that._drawLine(p1, p2, options));
        projections.push(that._drawCircle({
          rotationAngle: Math.PI / 2,
          rotationAxis: { y: 1 },
          color: '#000000',
          radius: that._data.size[index],
          x: DELTA + that.gorigin.x,
          y: that._data.normalizedData.y[index],
          z: that._data.normalizedData.z[index]
        }));
        render();
      }

      function hideProjection() {
        for (var i = 0; i < projections.length; i++) {
          that.scene.remove(projections[i]);
        }
        projections = [];
        render();
      }

      function init() {
        that.camera = that.camera || new THREE.PerspectiveCamera(60, that.width / that.height, CAMERA_NEAR, CAMERA_FAR);
        that.cameraLeft = that.cameraLeft || new THREE.PerspectiveCamera(60, that.width / that.height, CAMERA_NEAR, CAMERA_FAR);
        that.cameraRight = that.cameraRight || new THREE.PerspectiveCamera(60, that.width / that.height, CAMERA_NEAR, CAMERA_FAR);
        if (that.controls) {
          // self.controls.reset();
        } else {
          that.controls = new THREE.TrackballControls(that.camera, that.dom.get(0));

          that.controls.rotateSpeed = 1.0;
          that.controls.zoomSpeed = 1.2;
          that.controls.panSpeed = 0.8;
          that.controls.noZoom = false;
          that.controls.noPan = false;
          that.controls.staticMoving = true;
          that.controls.dynamicDampingFactor = 0.3;
          that.controls.keys = [65, 83, 68];
          that.controls.addEventListener('change', render);
        }

        // Init scene
        that.scene = new THREE.Scene();

        // renderer

        that.renderer = new THREE.WebGLRenderer({ antialias: false });
        // self.renderer.setClearColor( self.scene.fog.color, 1 );
        that._setBackgroundColor();
        that.renderer.setSize(window.innerWidth, window.innerHeight);

        container = document.getElementById(that.dom.attr('id'));
        container.innerHTML = '';
        container.appendChild(that.renderer.domElement);

        that.$tooltip = $(`<div style="z-index: 10000; position:absolute; top: 20px; width:${TOOLTIP_WIDTH + 100}px; height: auto; background-color: #f9edbe;"> </div>`);
        $(that.dom).append(that.$tooltip);

        that.$colorbar = $('<div>');
        $(that.dom).append(that.$colorbar);
        that.$tooltip.hide();

        $(that.dom).append('<div id="legend" style="z-index: 10000; right:10px ;position:absolute; top: 25px; height: auto; background-color: #ffffff;"> </div>');
        var $legend = $('#legend');
        $legend.append('<div id="legend_titles"></div>');
        $legend.append('<div id="legend_point_coordinates"></div>');
        $legend.css('background-color', that.module.getConfiguration('backgroundColor')).css('text-align', 'right');
        $('#legend_titles').hide();
        $('#legend_point_coordinates').hide();

        onWindowResize();


        function onHover() {
          if (pointedObjects.length > 0) {
            var j = pointedObjects[0];
            that.module.controller.onHover(j);
          }
        }

        // self.renderer is recreated each time in init() so we don't need to 'off' events
        $(that.renderer.domElement).on('mousemove', _.throttle(onMouseMove, 100));
        $(that.renderer.domElement).on('mousemove', _.throttle(onHover, 300));
        if (that._configCheckBox('tooltip', 'show')) {
          $(that.renderer.domElement).on('mousemove', _.debounce(showTooltip, 500));
          $(that.renderer.domElement).on('mousemove', _.throttle(hideTooltip, 500));
        }

        if (that._configCheckBox('projection', 'show')) {
          $(that.renderer.domElement).on('mousemove', _.debounce(showProjection, 500));
          $(that.renderer.domElement).on('mousemove', _.throttle(hideProjection, 500));
        }

        $(that.renderer.domElement).listHandlers('mousemove', function (a, b) {
          // List jquery handlers (to debug...)
        });
      }

      function onWindowResize() {
        that.camera.aspect = that.width / that.height;
        that.camera.updateProjectionMatrix();
        that.renderer.setSize(that.width, that.height);
        that.controls.handleResize();
        render();
      }


      function animate() {
        requestAnimationFrame(animate);
        that.controls.update();

        if (that._3d) {
          that.camera.updateMatrix();
          var leftPos = new THREE.Vector3(-separation, 0, 0);
          var rightPos = new THREE.Vector3(separation, 0, 0);
          that.camera.localToWorld(leftPos);
          that.camera.localToWorld(rightPos);

          that.cameraLeft.position.x = leftPos.x;
          that.cameraLeft.position.y = leftPos.y;
          that.cameraLeft.position.z = leftPos.z;
          that.cameraLeft.rotation.x = that.camera.rotation.x;
          that.cameraLeft.rotation.y = that.camera.rotation.y;
          that.cameraLeft.rotation.z = that.camera.rotation.z;
          that.cameraLeft.updateMatrix();

          that.cameraRight.position.x = rightPos.x;
          that.cameraRight.position.y = rightPos.y;
          that.cameraRight.position.z = rightPos.z;
          that.cameraRight.rotation.x = that.camera.rotation.x;
          that.cameraRight.rotation.y = that.camera.rotation.y;
          that.cameraRight.rotation.z = that.camera.rotation.z;
          that.cameraRight.updateMatrix();
        }
      }

      function render() {
        that._render();
        if (that.headlight) {
          that.headlight.position.x = that.camera.position.x + 200;
          that.headlight.position.y = that.camera.position.y + 200;
          that.headlight.position.z = that.camera.position.z + 200;
        }
        if (that.tickLabels) {
          drawTickLabelsThrottled();
          drawAxisLabelsThrottled();
          drawGraphTitleThrottled();
        }
      }
    },


    _drawGraph: function () {
      var that = this;
      // Remove all objects
      _.keys(that.scene.children).forEach(function (key) {
        that.scene.remove(that.scene.children[key]);
      });


      var light;
      // HEADLIGHT ============
      light = new THREE.AmbientLight(0x222222, 1);
      that.scene.add(light);

      that.headlight = new THREE.PointLight(0xaaaaaa, 1.5);
      // self.headlight.position = self.camera.position;
      that.headlight.position.set(1000, 1000, 1000);
      that.scene.add(that.headlight);
      // ===================================================

      // 2 Directional light with diff intensities =========
      // ===================================================

      that._mathPoints();
      that._drawPointsQuick();
      // that._drawAxes();
      that._drawFaces();
      that._drawGrid();
      that._drawSecondaryGrid();
      that._drawTicks();
      that._drawTickLabels();
      that._drawAxisLabels();
      that._drawGraphTitle();
      that._render();
    },

    _drawPointsQuick: function () {
      var that = this;
      if (that._mainParticleObjects) {
        for (var shape in that._mainParticleObjects) {
          that.scene.remove(that._mainParticleObjects[shape]);
        }
      }
      that._mainParticleObjects = {};
      var m = {};
      for (var i = 0; i < that._data.shape.length; i++) {
        m[that._data.shape[i]] = m[that._data.shape[i]] || [];
        m[that._data.shape[i]].push(i);
      }

      for (var shape in m) {
        that._mainParticleObjects[shape] = that._newParticleObject(m[shape], {
          shape: shape
        });
        that._updateParticleObject(that._mainParticleObjects[shape]);
        that.scene.add(that._mainParticleObjects[shape]);
      }

      that._doRender();
    },

    _configCheckBox: function (config, option) {
      return this.module.getConfiguration(config) && _.find(this.module.getConfiguration(config), function (val) {
        return val === option;
      });
    },

    _getDataField: function (field) {
      if (!this._data) {
        return [];
      }
      return _.flatten(_.map(this._data.data, field));
    },

    _normalizeData: function () {
      var that = this;
      if (!this._data) {
        return;
      }
      that._data.normalizedData = {};
      that._data.normalizedData.x = _.map(that._data.x, function (x) {
        return NORM_CONSTANT * (x - that._data.realMin.x) / that._data.realLen.x;
      });
      that._data.normalizedData.y = _.map(that._data.y, function (y) {
        return NORM_CONSTANT * (y - that._data.realMin.y) / that._data.realLen.y;
      });
      that._data.normalizedData.z = _.map(that._data.z, function (z) {
        return NORM_CONSTANT * (z - that._data.realMin.z) / that._data.realLen.z;
      });

      // size normalization
      var sizeConstant = this.module.getConfiguration('sizeNormalization');
      var sizeMin = Stat.array.min(that._data.size);
      var sizeMax = Stat.array.max(that._data.size);
      var sizeInt = sizeMax - sizeMin;
      that._data.size = _.map(that._data.size, function (s) {
        return sizeInt === 0 ? sizeConstant / 2 : sizeConstant * ((s - sizeMin) / sizeInt + 0.01);
      });
    },

    _processColors: function () {
      this.colorDomain = _.filter(this._data.color, function (v) {
        return !isNaN(v);
      });
      this.colorDomain = [Math.min.apply(null, this.colorDomain), Math.max.apply(null, this.colorDomain)];
      var gradient = this.module.getConfiguration('gradient');
      gradient = _.filter(gradient, function (v) {
        return v.stopPosition !== undefined;
      });
      this.stopPositions = _.map(gradient, 'stopPosition');
      this.stopColors = _(gradient).map('color').map(colorUtil.getColor).map((v) => colorUtil.rgb2hex(v)).value();

      this.numberToColor = colorbar.getColorScale({
        stops: this.stopColors,
        stopPositions: this.stopPositions,
        domain: this.colorDomain
      });
      for (var i = 0; i < this._data.color.length; i++) {
        if (!isNaN(this._data.color[i])) {
          this._data.color[i] = this.numberToColor(this._data.color[i]).color;
          if (Number.isNaN(this._data.color[i])) {
            this._data.color[i] = DEFAULT_POINT_COLOR;
            continue;
          }
        }
      }

      // Normalize
      // No rgba accepted
      for (i = 0; i < this._data.color.length; i++) {
        this._data.color[i] = new chroma(this._data.color[i]).hex();
      }
    },

    _computeMinMax: function () {
      var that = this;
      if (!that._data) {
        return;
      }
      that.minMax = {};
      var x = that._data.x;
      var y = that._data.y;
      var z = that._data.z;

      that._data.min = {};
      that._data.max = {};
      that._data.len = {};

      var xm = that._meta.getChildSync(['axis', 0, 'min']);
      var xM = that._meta.getChildSync(['axis', 0, 'max']);
      var ym = that._meta.getChildSync(['axis', 1, 'min']);
      var yM = that._meta.getChildSync(['axis', 1, 'max']);
      var zm = that._meta.getChildSync(['axis', 2, 'min']);
      var zM = that._meta.getChildSync(['axis', 2, 'max']);

      that._data.min.x = parseFloat(that.module.getConfiguration('minX')) || xm && xm.get() || Stat.array.min(x);
      that._data.min.y = parseFloat(that.module.getConfiguration('minY')) || ym && ym.get() || Stat.array.min(y);
      that._data.min.z = parseFloat(that.module.getConfiguration('minZ')) || zm && zm.get() || Stat.array.min(z);
      that._data.max.x = parseFloat(that.module.getConfiguration('maxX')) || xM && xM.get() || Stat.array.max(x);
      that._data.max.y = parseFloat(that.module.getConfiguration('maxY')) || yM && yM.get() || Stat.array.max(y);
      that._data.max.z = parseFloat(that.module.getConfiguration('maxZ')) || zM && zM.get() || Stat.array.max(z);
      that._data.len.x = that._data.max.x - that._data.min.x;
      that._data.len.y = that._data.max.y - that._data.min.y;
      that._data.len.z = that._data.max.z - that._data.min.z;
    },

    _getUnitPerTick: function (px, nbTick, valrange, axis) {
      var that = this;
      var pxPerTick = px / nbTicks; // 1000 / 100 = 10 px per tick
      if (!nbTick)
        nbTick = px / 10;
      else
        nbTick = Math.min(nbTick, px / 10);


      // So now the question is, how many units per ticks ?
      // Say, we have 0.0004 unit per tick
      var unitPerTick = valrange / nbTick;

      // We take the log
      var decimals = Math.floor(Math.log(unitPerTick) / Math.log(10));
      /*
             Example:
             13'453 => Math.log10() = 4.12 => 4
             0.0000341 => Math.log10() = -4.46 => -5
             */

      var numberToNatural = unitPerTick * Math.pow(10, -decimals);

      /*
             Example:
             13'453 (4) => 1.345
             0.0000341 (-5) => 3.41
             */


      var possibleTicks = [1, 2, 5, 10];
      var closest = false;
      for (var i = possibleTicks.length - 1; i >= 0; i--)
        if (!closest || (Math.abs(possibleTicks[i] - numberToNatural) < Math.abs(closest - numberToNatural))) {
          closest = possibleTicks[i];
        }

      // Ok now closest is the number of unit per tick in the natural number
      /*
             Example:
             13'453 (4) (1.345) => 1
             0.0000341 (-5) (3.41) => 5
             */

      // Let's scale it back
      var unitPerTickCorrect = closest * Math.pow(10, decimals);
      /*
             Example:
             13'453 (4) (1.345) (1) => 10'000
             0.0000341 (-5) (3.41) (5) => 0.00005
             */

      var nbTicks = valrange / unitPerTickCorrect;
      var pxPerTick = px / nbTick;


      that._data.realMin[axis] = Math.floor(that._data.min[axis] / unitPerTickCorrect) * unitPerTickCorrect;
      that._data.realMax[axis] = Math.ceil(that._data.max[axis] / unitPerTickCorrect) * unitPerTickCorrect;

      if (that._data.realMin[axis] !== that._data.min[axis]) {
        nbTicks++;
      }

      if (that._data.realMax[axis] !== that._data.max[axis]) {
        nbTicks++;
      }

      // self._data.nbTicks[axis] = Math.floor(nbTicks) + 1;
      that._data.intervalVal[axis] = unitPerTickCorrect;
      that._data.realLen[axis] = that._data.realMax[axis] - that._data.realMin[axis];
      that._data.nbTicks[axis] = Math.round((that._data.realMax[axis] - that._data.realMin[axis]) / that._data.intervalVal[axis] + 1);
      that._data.intervalPx[axis] = NORM_CONSTANT / (that._data.nbTicks[axis] - 1);
      that._data.decimals[axis] = decimals;

      var intdec = Math.floor(Math.log(unitPerTickCorrect) / Math.log(10));
      if (Math.abs(intdec) <= 1) {
        that._data.intervalFactor[axis] = 1;
      } else {
        that._data.intervalFactor[axis] = Math.pow(10, intdec);
      }

      // Special case where the axis has only one distinct value (interval = 0)
      if (!_.isFinite(that._data.intervalPx[axis])) {
        that._data.nbTicks[axis] = 3;
        that._data.intervalPx[axis] = NORM_CONSTANT / 2;
        var num = that._data[axis][0];
        that._data.decimals[axis] = that._data[axis][0] === 0 ? 0 : Math.floor(Math.log(Math.abs(num)) / Math.log(10));
        that._data.intervalFactor[axis] = Math.pow(10, that._data.decimals[axis]);
        var diff = that._data.intervalFactor[axis];
        that._data.realMin[axis] = Math.ceil((num - diff) / diff) * diff;
        that._data.realMax[axis] = Math.floor((num + diff) / diff) * diff;
        that._data.realLen[axis] = that._data.realMax[axis] - that._data.realMin[axis];
        that._data.intervalVal[axis] = (that._data.realLen[axis]) / 2;
      }
    },

    _computeTickInfo: function () {
      var that = this;
      that._data.realMin = {};
      that._data.realMax = {};
      that._data.realLen = {};

      that._data.intervalPx = {};
      that._data.nbTicks = {};
      that._data.intervalVal = {};
      that._data.decimals = {};
      that._data.intervalFactor = {};

      that._getUnitPerTick(NORM_CONSTANT, 3, that._data.len.x, 'x');
      that._getUnitPerTick(NORM_CONSTANT, 3, that._data.len.y, 'y');
      that._getUnitPerTick(NORM_CONSTANT, 3, that._data.len.z, 'z');
    },

    _drawAxes: function () {
      var that = this;
      if (!that._data) {
        return;
      }

      that._reinitObject3DArray('axes');

      var vX = new THREE.Vector3(1, 0, 0);
      var vY = new THREE.Vector3(0, 1, 0);
      var vZ = new THREE.Vector3(0, 0, -1);
      var origin = new THREE.Vector3(0, 0, 0);
      var color = 0x000000;

      var axX = new THREE.ArrowHelper(vX, new THREE.Vector3(0, 0, NORM_CONSTANT), NORM_CONSTANT, color, 1, 1);
      var axY = new THREE.ArrowHelper(vY, new THREE.Vector3(0, 0, NORM_CONSTANT), NORM_CONSTANT, color, 1, 1);
      var axZ = new THREE.ArrowHelper(vZ, new THREE.Vector3(NORM_CONSTANT, 0, NORM_CONSTANT), NORM_CONSTANT, color, 1, 1);

      that.axes.push(axX, axY, axZ);

      this.scene.add(axX);
      this.scene.add(axY);
      this.scene.add(axZ);
    },

    _drawCircle: function (options) {
      var options = options || {};
      var circle = new THREE.Shape();
      var radius = options.radius || DEFAULT_POINT_RADIUS;
      radius = radius * NORM_CONSTANT;

      for (var i = 0; i < 16; i++) {
        var pct = (i + 1) / 16;
        var theta = pct * Math.PI * 2.0;
        var x = radius * Math.cos(theta);
        var y = radius * Math.sin(theta);
        if (i == 0) {
          circle.moveTo(x, y);
        } else {
          circle.lineTo(x, y);
        }
      }

      var geometry = circle.makeGeometry();
      var material = new THREE.MeshBasicMaterial({
        color: options.color || DEFAULT_PROJECTION_COLOR,
        side: THREE.DoubleSide
      });
      var mesh = new THREE.Mesh(geometry, material);

      var m1 = new THREE.Matrix4();
      var m2 = new THREE.Matrix4();
      if (options.rotationAxis) {
        m1.makeRotationAxis(new THREE.Vector3(options.rotationAxis.x || 0, options.rotationAxis.y || 0, options.rotationAxis.z || 0), options.rotationAngle || 0);
      }
      m2.makeTranslation(options.x || 0, options.y || 0, options.z || 0);
      m2.multiplyMatrices(m2, m1);
      mesh.applyMatrix(m2);
      this.scene.add(mesh);
      return mesh;
    },

    _drawColorBar: function () {
      this.$colorbar.empty();
      this.$colorbar.css({
        position: 'absolute',
        top: 0
      });
      if (!this.module.getConfiguration('gradient') || this.module.getConfiguration('gradient').length <= 1) return;
      colorbar.renderSvg(this.$colorbar[0], {
        width: 50,
        height: 200,
        axis: {
          orientation: 'left',
          ticks: 5,
          order: 'asc'
        },
        stops: this.stopColors,
        stopPositions: this.stopPositions,
        domain: this.colorDomain
      });
    },

    _drawLine: function (p1, p2, options) {
      options = options || {};
      var material = new THREE.LineBasicMaterial({
        color: options.color || 0x000000
      });
      var geometry = new THREE.Geometry();
      geometry.vertices.push(p1);
      geometry.vertices.push(p2);
      var line = new THREE.Line(geometry, material);
      this.scene.add(line);
      return line;
    },

    _reinitObject3DArray: function (name) {
      this[name] = this[name] || [];
      for (var i = 0; i < this[name].length; i++) {
        this.scene.remove(this[name][i]);
      }
      this[name] = [];
    },

    _setGridOrigin: function () {
      this.gorigin = {};
      this.gorigin.x = parseFloat(this.module.getConfiguration('gridOriginX') || this._data.realMin.x);
      this.gorigin.y = parseFloat(this.module.getConfiguration('gridOriginY') || this._data.realMin.y);
      this.gorigin.z = parseFloat(this.module.getConfiguration('gridOriginZ') || this._data.realMin.z);
      this.gorigin.x = NORM_CONSTANT * (this.gorigin.x - this._data.realMin.x) / this._data.realLen.x;
      this.gorigin.y = NORM_CONSTANT * (this.gorigin.y - this._data.realMin.y) / this._data.realLen.y;
      this.gorigin.z = NORM_CONSTANT * (this.gorigin.z - this._data.realMin.z) / this._data.realLen.z;
    },

    _drawSecondaryGrid: function () {
      var that = this;
      that._reinitObject3DArray('secondaryGrid');
      var options = { color: 0x888888 };

      // x lines
      var jmax = that.module.getConfiguration('secondaryGrids') || 2;
      for (var i = 0; i < that._data.nbTicks.x - 1; i++) {
        for (var j = 1; j < jmax; j++) {
          if (this._configCheckBox('grid', 'xysec'))
            that.secondaryGrid.push(that._drawLine(new THREE.Vector3(that._data.intervalPx.x * i + that._data.intervalPx.x / jmax * j, 0, DELTA + that.gorigin.z),
              new THREE.Vector3(that._data.intervalPx.x * i + that._data.intervalPx.x / jmax * j, NORM_CONSTANT, DELTA + that.gorigin.z), options));
          if (this._configCheckBox('grid', 'xzsec'))
            that.secondaryGrid.push(that._drawLine(new THREE.Vector3(that._data.intervalPx.x * i + that._data.intervalPx.x / jmax * j, DELTA + that.gorigin.y, 0),
              new THREE.Vector3(that._data.intervalPx.x * i + that._data.intervalPx.x / jmax * j, DELTA + that.gorigin.y, NORM_CONSTANT), options));
        }
      }

      // y lines
      for (var i = 0; i < that._data.nbTicks.y - 1; i++) {
        for (var j = 1; j < jmax; j++) {
          if (this._configCheckBox('grid', 'yzsec'))
            that.secondaryGrid.push(that._drawLine(new THREE.Vector3(DELTA + that.gorigin.x, that._data.intervalPx.y * i + that._data.intervalPx.y / jmax * j, 0),
              new THREE.Vector3(DELTA + that.gorigin.x, that._data.intervalPx.y * i + that._data.intervalPx.y / jmax * j, NORM_CONSTANT), options));
          if (this._configCheckBox('grid', 'xysec'))
            that.secondaryGrid.push(that._drawLine(new THREE.Vector3(0, that._data.intervalPx.y * i + that._data.intervalPx.y / jmax * j, DELTA + that.gorigin.z),
              new THREE.Vector3(NORM_CONSTANT, that._data.intervalPx.y * i + that._data.intervalPx.y / jmax * j, DELTA + that.gorigin.z), options));
        }
      }

      // z lines
      for (var i = 0; i < that._data.nbTicks.z - 1; i++) {
        for (var j = 1; j < jmax; j++) {
          if (this._configCheckBox('grid', 'yzsec'))
            that.secondaryGrid.push(that._drawLine(new THREE.Vector3(DELTA + that.gorigin.x, 0, that._data.intervalPx.z * i + that._data.intervalPx.z / jmax * j),
              new THREE.Vector3(DELTA + that.gorigin.x, NORM_CONSTANT, that._data.intervalPx.z * i + that._data.intervalPx.z / jmax * j), options));
          if (this._configCheckBox('grid', 'xzsec'))
            that.secondaryGrid.push(that._drawLine(new THREE.Vector3(0, DELTA + that.gorigin.y, that._data.intervalPx.z * i + that._data.intervalPx.z / jmax * j),
              new THREE.Vector3(NORM_CONSTANT, DELTA + that.gorigin.y, that._data.intervalPx.z * i + that._data.intervalPx.z / jmax * j), options));
        }
      }
    },

    _drawGrid: function () {
      var that = this;
      that._reinitObject3DArray('grid');
      // x lines
      for (var i = 0; i < that._data.nbTicks.x; i++) {
        if (this._configCheckBox('grid', 'xy'))
          that.grid.push(that._drawLine(new THREE.Vector3(that._data.intervalPx.x * i, 0, DELTA + that.gorigin.z),
            new THREE.Vector3(that._data.intervalPx.x * i, NORM_CONSTANT, DELTA + that.gorigin.z)));
        if (this._configCheckBox('grid', 'xz'))
          that.grid.push(that._drawLine(new THREE.Vector3(that._data.intervalPx.x * i, DELTA + that.gorigin.y, 0),
            new THREE.Vector3(that._data.intervalPx.x * i, DELTA + that.gorigin.y, NORM_CONSTANT)));
      }


      // y lines
      for (var i = 0; i < that._data.nbTicks.y; i++) {
        if (this._configCheckBox('grid', 'yz'))
          that.grid.push(that._drawLine(new THREE.Vector3(DELTA + that.gorigin.x, that._data.intervalPx.y * i, 0),
            new THREE.Vector3(DELTA + that.gorigin.x, that._data.intervalPx.y * i, NORM_CONSTANT)));
        if (this._configCheckBox('grid', 'xy'))
          that.grid.push(that._drawLine(new THREE.Vector3(0, that._data.intervalPx.y * i, DELTA + that.gorigin.z),
            new THREE.Vector3(NORM_CONSTANT, that._data.intervalPx.y * i, DELTA + that.gorigin.z)));
      }


      // z lines
      for (var i = 0; i < that._data.nbTicks.z; i++) {
        if (this._configCheckBox('grid', 'yz'))
          that.grid.push(that._drawLine(new THREE.Vector3(DELTA + that.gorigin.x, 0, that._data.intervalPx.z * i),
            new THREE.Vector3(DELTA + that.gorigin.x, NORM_CONSTANT, that._data.intervalPx.z * i)));
        if (this._configCheckBox('grid', 'xz'))
          that.grid.push(that._drawLine(new THREE.Vector3(0, DELTA + that.gorigin.y, that._data.intervalPx.z * i),
            new THREE.Vector3(NORM_CONSTANT, DELTA + that.gorigin.y, that._data.intervalPx.z * i)));
      }
    },

    _drawTicks: function () {
      var that = this;
      that._reinitObject3DArray('ticks');

      // x ticks
      if (that._configCheckBox('ticks', 'x')) {
        for (var i = 0; i < that._data.nbTicks.x; i++) {
          that.ticks.push(that._drawLine(new THREE.Vector3(that._data.intervalPx.x * i, 0, NORM_CONSTANT),
            new THREE.Vector3(that._data.intervalPx.x * i, 0, NORM_CONSTANT * 1.05)));
        }
      }
      // y ticks
      if (that._configCheckBox('ticks', 'y')) {
        for (var i = 0; i < that._data.nbTicks.y; i++) {
          that.ticks.push(that._drawLine(new THREE.Vector3(0, that._data.intervalPx.y * i, NORM_CONSTANT),
            new THREE.Vector3(-0.05 * NORM_CONSTANT, that._data.intervalPx.y * i, NORM_CONSTANT)));
        }
      }

      // z ticks
      if (that._configCheckBox('ticks', 'z')) {
        for (var i = 0; i < that._data.nbTicks.z; i++) {
          that.ticks.push(that._drawLine(new THREE.Vector3(NORM_CONSTANT, 0, that._data.intervalPx.z * i),
            new THREE.Vector3(NORM_CONSTANT * 1.05, 0, that._data.intervalPx.z * i)));
        }
      }
    },

    _addText: function (text, x, y, z, options) {
      var that = this;
      var options = options || {};

      // Set default options
      options.size = options.size || 64;
      options.fillStyle = options.fillStyle || colorUtil.array2rgba(that.module.getConfiguration('annotationColor')) || DEFAULT_TEXT_COLOR;
      options.textAlign = options.textAlign || 'left';
      options.font = options.font || 'Arial';
      // Stange, opacity of 1 will dispaly a black background on the text
      options.opacity = options.opacity || 0.99;


      // create a canvas element
      var canvas = document.createElement('canvas');
      canvas.height = options.size;
      canvas.width = options.size * text.length / 2 + options.size / 2;

      switch (options.textAlign) {
        case 'left':
          x += canvas.width / 2;
          break;
        case 'right':
          x -= canvas.width / 2;
          break;
      }

      var ctx = canvas.getContext('2d');
      ctx.font = `Bold ${options.size * 0.9}px ${options.font}`;
      ctx.fillStyle = options.fillStyle;
      ctx.fillText(text, 0, options.size * 0.9);

      // canvas contents will be used for a texture
      var texture = new THREE.Texture(canvas);
      texture.minFilter = THREE.NearestFilter;
      texture.needsUpdate = true;

      var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: (options.opacity === 1) ? false : true,
        opacity: options.opacity
      });
      var mesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(canvas.width, canvas.height),
        material
      );
      // mesh.position.set(0,50,0);
      var textOrientation = that.camera.matrix.clone();
      textOrientation.setPosition(new THREE.Vector3(0, 0, 0));
      mesh.applyMatrix(textOrientation);
      mesh.position.set(x, y, z);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      that.scene.add(mesh);
      return mesh;
    },

    _drawTickLabels: function () {
      var that = this;

      that._reinitObject3DArray('tickLabels');


      // z labels
      if (that._configCheckBox('ticks', 'zlab')) {
        for (var i = 0; i < that._data.nbTicks.z; i++) {
          var text = (keepDecimals((that._data.realMin.z + i * that._data.intervalVal.z) / that._data.intervalFactor.z, 2)).toString();
          that.tickLabels.push(that._addText(text, NORM_CONSTANT * 1.1, 0, i * that._data.intervalPx.z, {
            textAlign: 'left'
          }));
        }
      }
      // y labels
      if (that._configCheckBox('ticks', 'ylab')) {
        for (var i = 0; i < that._data.nbTicks.y; i++) {
          var text = (keepDecimals((that._data.realMin.y + i * that._data.intervalVal.y) / that._data.intervalFactor.y, 2)).toString();
          that.tickLabels.push(that._addText(text, -0.05 * NORM_CONSTANT, i * that._data.intervalPx.y, NORM_CONSTANT, {
            textAlign: 'right'
          }));
        }
      }
      // x labels
      if (that._configCheckBox('ticks', 'xlab')) {
        for (var i = 0; i < that._data.nbTicks.x; i++) {
          var text = (keepDecimals((that._data.realMin.x + i * that._data.intervalVal.x) / that._data.intervalFactor.x, 2)).toString();
          that.tickLabels.push(that._addText(text, i * that._data.intervalPx.x, 0, NORM_CONSTANT * 1.1, {
            textAlign: 'right'
          }));
        }
      }
    },

    _drawGraphTitle: function () {
      var that = this;

      that._reinitObject3DArray('graphTitle');
      var mode = that.module.getConfiguration('labels');
      var title = that._meta.title || '';
      if (!title || title === '') return;
      switch (mode) {
        case 'none':
          return;
        default:
          that.graphTitle.push(that._addText(title, NORM_CONSTANT / 10, NORM_CONSTANT * 1.3, 100, {
            textAlign: 'left'
          }));
          break;
      }
    },

    _drawAxisLabels: function () {
      var that = this;

      that._reinitObject3DArray('axisLabels');

      var mode = that.module.getConfiguration('labels');
      var xt = that._meta.getChildSync(['axis', that._data.xAxis || 0, 'label']);
      var yt = that._meta.getChildSync(['axis', that._data.yAxis || 1, 'label']);
      var zt = that._meta.getChildSync(['axis', that._data.zAxis || 2, 'label']);
      var xu = that._meta.getChildSync(['axis', 0, 'unit']);
      var yu = that._meta.getChildSync(['axis', 1, 'unit']);
      var zu = that._meta.getChildSync(['axis', 2, 'unit']);

      xt = xt && xt.get();
      yt = yt && yt.get();
      zt = zt && zt.get();
      xt = xu && (`${xt} [${xu.get()}]`) || xt;
      yt = yu && (`${yt} [${yu.get()}]`) || yt;
      zt = zu && (`${zt} [${zu.get()}]`) || zt;

      var xtitle = this.module.getConfiguration('xLabel') || xt || 'X';
      var ytitle = this.module.getConfiguration('yLabel') || yt || 'Y';
      var ztitle = this.module.getConfiguration('zLabel') || zt || 'Z';


      var $legendTitles = $('#legend_titles');

      switch (mode) {
        case 'axis':
          drawOnAxis(xtitle, ytitle, ztitle);
          $legendTitles.hide();
          break;
        case 'alegend':
          drawOnAxis('X', 'Y', 'Z');
          drawLegend(xtitle, ytitle, ztitle);
          $legendTitles.show();
          break;
        case 'both':
          drawOnAxis(xtitle, ytitle, ztitle);
          drawLegend(xtitle, ytitle, ztitle);
          $legendTitles.show();
          break;
        default:
      }


      function drawLegend(tx, ty, tz) {
        var arr = [];
        arr.push(`X: ${tx}`);
        arr.push(`Y: ${ty}`);
        arr.push(`Z: ${tz}`);
        $('#legend_titles').html(arr.join('<br/>'));
      }

      function drawOnAxis(tx, ty, tz) {
        // x label
        that.tickLabels.push(that._addText(addFactor(tx, 'x'), NORM_CONSTANT / 2, 0, NORM_CONSTANT * 1.4, {
          textAlign: 'right'
        }));

        // y label
        that.tickLabels.push(that._addText(addFactor(ty, 'y'), -0.4 * NORM_CONSTANT, NORM_CONSTANT / 2, NORM_CONSTANT, {
          textAlign: 'right'
        }));

        // z label
        that.tickLabels.push(that._addText(addFactor(tz, 'z'), NORM_CONSTANT * 1.4, 0, NORM_CONSTANT / 2, {
          textAlign: 'left'
        }));
      }

      function addFactor(text, axis) {
        if (that._data.intervalFactor[axis] === 1)
          return text;
        else if (that._data.intervalFactor[axis] > 1)
          return `${text} (\u00D7 10${unicodeSuperscript(Math.round(Math.log(that._data.intervalFactor[axis]) / Math.LN10))})`;
        else
          return `${text} (\u00D7 10${unicodeSuperscript(`-${-Math.round(Math.log(that._data.intervalFactor[axis]) / Math.LN10)}`)})`;
      }

      function unicodeSuperscript(num) {
        num = num.toString();
        var result = '';
        for (var i = 0; i < num.length; i++) {
          if (num[i] === '2' || num[i] === '3') {
            result += String.fromCharCode(176 + parseInt(num[i], 10));
          } else if (num[i] >= '0' && num[i] < '9') {
            result += String.fromCharCode(8304 + parseInt(num[i], 10));
          } else if (num[i] === '-') {
            result += String.fromCharCode(8315);
          }
        }
        return result;
      }
    },

    _drawFaces: function () {
      var that = this;
      if (!that._data) {
        return;
      }
      that._reinitObject3DArray('faces');

      //                  _________        y
      //                 /|       /|       |
      //                /_|______/ |       |___ x
      //               |  |______|_|      /
      //               | /       | /     /
      //               |/________|/      z

      // 1: xy back
      // 2: yz left
      // 3: xz bottom
      // 4: xy front
      // 5: yz right
      // 6: xz top


      var geometry1 = new THREE.PlaneBufferGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry2 = new THREE.PlaneBufferGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry3 = new THREE.PlaneBufferGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry4 = new THREE.PlaneBufferGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry5 = new THREE.PlaneBufferGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry6 = new THREE.PlaneBufferGeometry(NORM_CONSTANT, NORM_CONSTANT);

      var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: HIGHLIGHT_OPACITY
      });
      var mesh1 = new THREE.Mesh(geometry1, material);
      var mesh2 = new THREE.Mesh(geometry2, material);
      var mesh3 = new THREE.Mesh(geometry3, material);
      var mesh4 = new THREE.Mesh(geometry4, material);
      var mesh5 = new THREE.Mesh(geometry5, material);
      var mesh6 = new THREE.Mesh(geometry6, material);


      var m1, m2, m3;
      // Face 1
      m1 = new THREE.Matrix4();
      m2 = new THREE.Matrix4();
      m1.makeTranslation(NORM_CONSTANT / 2, NORM_CONSTANT / 2, that.gorigin.z);
      m2.makeTranslation(0, 0, NORM_CONSTANT / 2);
      mesh1.applyMatrix(m1);
      m2.multiplyMatrices(m1, m2);
      mesh4.applyMatrix(m2);


      // Face 2
      m1 = new THREE.Matrix4();
      m2 = new THREE.Matrix4();
      m3 = new THREE.Matrix4();
      m1.makeRotationY(Math.PI / 2);
      m2.makeTranslation(-NORM_CONSTANT / 2, NORM_CONSTANT / 2, that.gorigin.x);
      m2.multiplyMatrices(m1, m2);
      m3.makeTranslation(0, 0, NORM_CONSTANT);
      mesh2.applyMatrix(m2);
      m3.multiplyMatrices(m2, m3);
      mesh5.applyMatrix(m3);

      // Face 3
      m1 = new THREE.Matrix4();
      m2 = new THREE.Matrix4();
      m3 = new THREE.Matrix4();
      m1.makeRotationX(Math.PI / 2);
      m2.makeTranslation(NORM_CONSTANT / 2, NORM_CONSTANT / 2, -that.gorigin.y);
      m2.multiplyMatrices(m1, m2);
      mesh3.applyMatrix(m2);
      m3.makeTranslation(0, 0, -NORM_CONSTANT);
      m3.multiplyMatrices(m2, m3);
      mesh6.applyMatrix(m3);

      mesh4.visible = false;
      mesh5.visible = false;
      mesh6.visible = false;

      that.faces.push(mesh1);
      that.faces.push(mesh2);
      that.faces.push(mesh3);

      for (var i = 0; i < that.faces.length; i++) {
        that.scene.add(that.faces[i]);
      }
    },

    _inBoundary: function (point) {
      var that = this;
      if (_.isObject(point)) {
        if (point.x < that._data.realMin.x || point.x > that._data.realMax.x)
          return false;

        if (point.y < that._data.realMin.y || point.y > that._data.realMax.y)
          return false;

        if (point.z < that._data.realMin.z || point.z > that._data.realMax.z)
          return false;

        return true;
      } else if (_.isArray(point)) {
        return that._inBoundary({
          x: point[0],
          y: point[1],
          z: point[2]
        });
      } else {
        return false;
      }
    },

    _computeInBoundaryIndexes: function () {
      var that = this;
      that._data.inBoundary = [];
      for (var i = 0; i < that._data.x.length; i++) {
        if (that._inBoundary({
          x: that._data.x[i],
          y: that._data.y[i],
          z: that._data.z[i]
        })) {
          that._data.inBoundary.push(true);
        } else {
          that._data.inBoundary.push(false);
        }
      }
    },


    _mathPoints: function () {
      var that = this;
      if (!that._data) return;
      that.mathPoints = [];

      for (var i = 0; i < that._data.x.length; i++) {
        if (!that._data.inBoundary[i]) continue;

        var radius = DEFAULT_POINT_RADIUS;
        if (that._data.size && that._data.size[i]) {
          radius = that._data.size[i];
        }

        var sphere = new THREE.Sphere(new THREE.Vector3(that._data.normalizedData.x[i], that._data.normalizedData.y[i], that._data.normalizedData.z[i]), radius * NORM_CONSTANT);
        sphere.index = i;
        that.mathPoints.push(sphere);
      }
    },

    _updateMathPoints: function (options) {
      var that = this;
      var filter;
      if (options.applyFilter) {
        filter = that._data.inBoundary.slice(0);
        for (var i = 0; i < that._dispFilter.length; i++) {
          filter[i] = that._dispFilter[i] && filter[i];
        }
      } else {
        filter = that._data.inBoundary;
      }

      for (var i = 0; i < that._data.x.length; i++) {
        that.mathPoints[i].radius = filter[i]
          ? that._data.size[i] * NORM_CONSTANT
          : 0;
      }
    },

    _zoomToFit: function () {
      var that = this;
      var theta = Math.PI / 3;
      var phi = Math.PI / 4;
      var r = NORM_CONSTANT * ZOOM_START;
      var eye = this._polarToCartesian(theta, phi, r);

      // Lookat the middle of the cube
      var target = new THREE.Vector3(NORM_CONSTANT / 2, NORM_CONSTANT / 2, NORM_CONSTANT / 2);
      that.camera.position.set(eye[0], eye[1], eye[2]);
      that.camera.lookAt(target);

      that.cameraLeft.position.set(eye[0], eye[1], eye[2]);
      that.cameraLeft.lookAt(target);

      that.cameraRight.position.set(eye[0], eye[1], eye[2]);
      that.cameraRight.lookAt(target);
    },

    _polarToCartesian: function (theta, phi, r) {
      var x = Math.sin(phi) * Math.cos(theta) * r;
      var y = Math.sin(phi) * Math.sin(theta) * r;
      var z = Math.cos(phi) * r;
      return [x, y, z];
    },


    init: function () {
      var that = this;
      var c = this.module.getConfiguration('defaultPointColor');
      DEFAULT_POINT_COLOR = rgbToHex(c[0], c[1], c[2]);

      if (!this.dom) {
        this._id = Util.getNextUniqueId();
        this.dom = $(` <div id="${this._id}"></div>`).css({
          height: '100%',
          width: '100%',
          overflow: 'hidden'
        });

        this.dom.on('dblclick', function () {
          that.controls.reset();
          that._zoomToFit();
        });
        this.module.getDomContent().html(this.dom);
      }

      // Adding a deferred allows to wait to get actually the data before we draw the chart
      // we decided here to plot the chart in the 'onResize' event
      this.loadedData = $.Deferred();

      this.resolveReady();
    },

    onResize: function () {
      var that = this;

      // the size is now really defined (we are after inDom)
      // and we received the data ...
      this.loadedData.done(function () {
        if (that._firstLoad) {
          that._initThreejs();
          that._activateHighlights();
          that._zoomToFit();
          that._firstLoad = false;
        } else {
          that.camera.aspect = that.width / that.height;
          that.camera.updateProjectionMatrix();
          that.renderer.setSize(that.width, that.height);
          that._setBackgroundColor();
          that.controls.handleResize();
          that._render();
          if (that.headlight) {
            that.headlight.position.x = that.camera.position.x + 200;
            that.headlight.position.y = that.camera.position.y + 200;
            that.headlight.position.z = that.camera.position.z + 200;
          }
          if (that.tickLabels) {
            that._drawTickLabels();
            that._drawAxisLabels();
            that._drawGraphTitle();
          }
        }
        if (that._data) {
          that._drawGraph();
          that._drawColorBar();
        }
      });
    },

    _setBackgroundColor: function () {
      var bgColor = this.module.getConfiguration('backgroundColor');
      DEFAULT_BACKGROUND_COLOR = rgbToHex(bgColor[0], bgColor[1], bgColor[2]);
      this.renderer.setClearColor(DEFAULT_BACKGROUND_COLOR, 1);
    },

    _newParticleObject: function (indexes, options) {
      var that = this;
      options = options || {};
      var image = shapeImages[options.shape] || shapeImages[DEFAULT_POINT_SHAPE];
      if (options.transparent) {
        image = image.replace(/\.(png|svg|jpeg|jpg|gif)$/i, 't.$1');
      }
      var attributes = {
        size: { type: 'f', value: [] },
        ca: { type: 'c', value: [] }
      };
      var uniforms = {
        amplitude: { type: 'f', value: 1 },
        color: { type: 'c', value: new THREE.Color('#ffffff') },
        texture: { type: 't', value: THREE.ImageUtils.loadTexture(image) }
      };

      // uniforms.texture.value.wrapS = uniforms.texture.value.wrapT = THREE.RepeatWrapping;

      var shaderMaterial = new THREE.ShaderMaterial({

        uniforms: uniforms,
        attributes: attributes,
        vertexShader: '      attribute float size;      attribute vec4 ca;      varying vec4 vColor;      void main() {        vColor = ca;        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );        gl_PointSize = size * ( 1.0 / length( mvPosition.xyz ) );        gl_Position = projectionMatrix * mvPosition;      }',
        fragmentShader: 'uniform vec3 color;      uniform sampler2D texture;      varying vec4 vColor;      void main() {        vec4 outColor = texture2D( texture, gl_PointCoord );        if ( outColor.a < 0.5 ) discard;        gl_FragColor = outColor * vec4( color * vColor.xyz, 1.0 );        float depth = gl_FragCoord.z / gl_FragCoord.w;        const vec3 fogColor = vec3( 0.0 );        float fogFactor = smoothstep( 0.0, 10000.0, depth );        gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );      }',
        transparent: true
      });


      var geometry = new THREE.Geometry();
      if (indexes) {
        for (var i = 0; i < indexes.length; i++) {
          var vertex = new THREE.Vector3();
          vertex.x = that._data.normalizedData.x[indexes[i]];
          vertex.y = that._data.normalizedData.y[indexes[i]];
          vertex.z = that._data.normalizedData.z[indexes[i]];
          geometry.vertices.push(vertex);
        }
      } else {
        for (var i = 0; i < that._data.normalizedData.x.length; i++) {
          var vertex = new THREE.Vector3();
          vertex.x = that._data.normalizedData.x[i];
          vertex.y = that._data.normalizedData.y[i];
          vertex.z = that._data.normalizedData.z[i];
          geometry.vertices.push(vertex);
        }
      }

      // particle system
      var object = new THREE.PointCloud(geometry, shaderMaterial);
      object.indexes = indexes;
      return object;
    },

    _updateParticleObject: function (object, options) {
      if (!object) {
        return;
      }
      var that = this;
      options = options || {};
      var indexes = object.indexes;
      var vertices = object.geometry.vertices;
      var values_size = object.material.attributes.size.value;
      var values_color = object.material.attributes.ca.value;
      var color = that._data.color;
      var size = that._data.size;
      var factor = 2.2388 * (options.sizeFactor || 1.0) * NORM_CONSTANT * that.height;
      var forcedColor = options.forcedColor ? new THREE.Color(options.forcedColor) : null;
      var updateColor = options.updateColor || true;
      var filter;
      if (options.applyFilter) { // Filter point to display
        filter = that._data.inBoundary.slice(0);
        for (var i = 0; i < that._dispFilter.length; i++) {
          filter[i] = that._dispFilter[i] && filter[i];
        }
      } else {
        filter = that._data.inBoundary;
      }
      if (indexes) {
        for (var v = 0; v < vertices.length; v++) {
          values_size[v] = filter[indexes[v]]
            ? (size[indexes[v]] || DEFAULT_POINT_RADIUS) * factor
            : -1;
          if (forcedColor) {
            values_color[v] = forcedColor;
          } else if (updateColor) {
            values_color[v] = new THREE.Color(color[indexes[v]] || DEFAULT_POINT_COLOR);
          }
        }
      } else {
        for (var v = 0; v < vertices.length; v++) {
          values_size[v] = filter[v]
            ? (size[v] || DEFAULT_POINT_RADIUS) * factor
            : 0;
          if (forcedColor) {
            values_color[v] = forcedColor;
          } else if (updateColor) {
            values_color[v] = new THREE.Color(color[v] || DEFAULT_POINT_COLOR);
          }
        }
      }
      object.material.attributes.size.needsUpdate = true;
      object.material.attributes.ca.needsUpdate = true;
    },

    _prepareHighlights: function (hl) {
      var that = this;
      that._highlightParticleObjects = {};
      var m = {};

      for (var i = 0; i < hl.length; i++) {
        m[that._data.shape[i]] = m[that._data.shape[i]] || {};
        m[that._data.shape[i]][hl[i]] = m[that._data.shape[i]][hl[i]] || [];
        m[that._data.shape[i]][hl[i]].push(i);
      }

      for (var shape in m) {
        for (var hlkey in m[shape]) {
          that._highlightParticleObjects[shape] = that._highlightParticleObjects[shape] || {};
          that._highlightParticleObjects[shape][hlkey] = that._newParticleObject(m[shape][hlkey], {
            shape: shape || DEFAULT_POINT_SHAPE,
            transparent: true
          });
        }
      }
      that._doRender();
    },

    blank: {
      chart: blank,
      data3D: blank
    },

    /* When a value changes this method is called. It will be called for all
         possible received variable of this module.
         It will also be called at the beginning and in this case the value is null !
         */
    update: {
      chart: function (moduleValue) {
        this._3d = this.module.getConfiguration('3d');
        this.module.data = moduleValue;
        if (!moduleValue.get()) {
          Debug.error('Unvalid value', moduleValue);
          return;
        }

        // Convert series
        this._convertChartToData(moduleValue.get());
        this._completeChartData();
        this._computeMinMax();
        this._computeTickInfo();
        this._computeInBoundaryIndexes();
        this._normalizeData();
        this._processColors();
        this._setGridOrigin();


        if (!this._firstLoad) this._activateHighlights();

        // data are ready to be ploted
        if (this.loadedData.state() === 'pending') {
          this.loadedData.resolve();
        } else {
          this._drawGraph();
        }
      },
      data3D: function (moduleValue) {
        this._3d = this.module.getConfiguration('3d');
        this.module.data = moduleValue;
        if (!moduleValue || !moduleValue.get()) {
          Debug.error(`Invalid value${moduleValue}`);
          return;
        }

        // Convert data
        this._convertData3dToData(moduleValue);
        this._completeChartData();
        this._computeMinMax();
        this._computeTickInfo();
        this._computeInBoundaryIndexes();
        this._normalizeData();
        this._processColors();
        this._setGridOrigin();

        if (!this._firstLoad) this._activateHighlights();


        // data are ready to be ploted
        if (this.loadedData.state() === 'pending') {
          this.loadedData.resolve();
        } else {
          this._drawGraph();
        }
      },

      boolArray: function (moduleValue) {
        if (!this._data || !this._mainParticleObjects) {
          return;
        }
        var that = this;
        if (!moduleValue || !moduleValue.get()) {
          Debug.error('Unvalid value boolArray', moduleValue);
          return;
        }
        that._dispFilter = moduleValue.get();
        for (var shape in that._mainParticleObjects) {
          that._updateParticleObject(that._mainParticleObjects[shape], {
            applyFilter: true,
            updateColor: false
          });
        }

        that._updateMathPoints({ applyFilter: true });
        for (var shape in that._highlightParticleObjects) {
          for (var hlkey in that._highlightParticleObjects[shape]) {
            that._updateParticleObject(that._highlightParticleObjects[shape][hlkey], {
              applyFilter: true,
              updateColor: false,
              sizeFactor: 1.35
            });
          }
        }
        that._doRender();
      }
    },

    _render: function () {
      var that = this;
      setTimeout(function () {
        that._doRender();
      }, 20);
    },

    _doRender: function () {
      if (this._3d === 'sideBySide') {
        var width = this.width / 2;
        var height = this.height;
        this.renderer.setViewport(0, 0, width, height);
        this.renderer.setScissor(0, 0, width, height);
        this.renderer.enableScissorTest(true);
        this.cameraLeft.aspect = width * 2 / height;
        this.cameraLeft.updateProjectionMatrix();
        // this.cameraLeft.position.set( separation, 0, 3 );
        this.renderer.render(this.scene, this.cameraLeft);

        this.renderer.setViewport(width, 0, width, height);
        this.renderer.setScissor(width, 0, width, height);
        this.renderer.enableScissorTest(true);
        this.cameraRight.aspect = width * 2 / height;
        this.cameraRight.updateProjectionMatrix();
        // this.cameraRight.position.set( -separation, 0, 3 );
        this.renderer.render(this.scene, this.cameraRight);

        this.renderer.setViewport(width * 2, height, 0, 0);
        this.renderer.setScissor(width * 2, height, 0, 0);
        this.renderer.enableScissorTest(true);
      }
      this.renderer.render(this.scene, this.camera);
    },

    _convertData3dToData: function (value) {
      var that = this;
      if (!Array.isArray(value) || value.length === 0) {
        Debug.error('Data 3D not valid');
      }


      that._data = new DataObject();

      var jpaths = that.module.getConfiguration('dataJpaths');
      that._data.x = [];
      that._data.y = [];
      that._data.z = [];
      that._data.size = [];
      that._data.color = [];
      that._data.shape = [];
      that._data._highlight = [];

      var jp = _.cloneDeep(Data.resurrect(jpaths));
      _.each(jp, (v) => v.unshift(0));


      function validate(x) {
        return (_.isObject(x) || _.isArray(x)) ? null : x;
      }

      function getFromJpath(value, jp, fallback) {
        var val = value.getChildSync(jp);
        if (val === undefined) {
          return fallback;
        }
        return validate(val.get());
      }

      for (let i = 0; i < value.length; i++) {
        _.each(jp, (v) => (v[0] = i));
        that._data.x.push(getFromJpath(value, jp.x, 0));
        that._data.y.push(getFromJpath(value, jp.y, 0));
        that._data.z.push(getFromJpath(value, jp.z, 0));
        that._data.color.push(getFromJpath(value, jp.color, DEFAULT_POINT_COLOR));
        that._data.size.push(getFromJpath(value, jp.size, DEFAULT_POINT_RADIUS));
        that._data.shape.push(getFromJpath(value, jp.shape, DEFAULT_POINT_SHAPE));
      }
      that._meta = new DataObject();
      that._data.x = that._data.x || [];
      that._data.y = that._data.y || [];
      that._data.z = that._data.z || [];
      that._data.info = _.map(value, 'info');
      that._data._highlight = _.map(value, '_highlight');
      if (!_.some(that._data._highlight)) that._data._highlight = [];
      that._dispFilter = that._dispFilter || [];
    },

    _convertChartToData: function (value) {
      this._data = new DataObject();
      this._meta = new DataObject();
      var that = this;
      if (!Array.isArray(value.data) || !value.data[0] || !Array.isArray(value.data[0].y)) return;
      if (value.data.length > 1) {
        Debug.warn('Scatter 3D module will merge series together');
      }

      // Get data
      for (let j = 0; j < value.data.length; j++) {
        _.keys(value.data[j]).forEach(function (key) {
          if (Array.isArray(value.data[j][key])) {
            that._data[key] = that._data[key] || [];
            that._data[key].push(value.data[j][key]);
            that._data[key] = _.flatten(that._data[key], true);
          } else {
            that._data[key] = value.data[j][key];
          }
          _.filter(that._data[key], function (val) {
            return val !== undefined;
          });
        });
      }

      // Get axis data
      this._meta.axis = value.axis;

      // Highlight
      this._data._highlight = this._data._highlight || [];

      _.keys(value).forEach(function (key) {
        if (key !== 'data') that._meta[key] = value[key];
      });

      that._dispFilter = that._dispFilter || [];
    },

    _completeData: function (name, defaultValue) {
      var that = this;
      that._data[name] = that._data[name] || [];
      for (var i = 0; i < that._data.x.length; i++) {
        if (that._data[name][i] === undefined) that._data[name][i] = defaultValue;
      }
    },

    _completeChartData: function () {
      this._completeData('size', DEFAULT_POINT_RADIUS);
      this._completeData('color', DEFAULT_POINT_COLOR);
      this._completeData('shape', DEFAULT_POINT_SHAPE);
    },

    _activateHighlights: function () {
      var that = this;
      if (that._data) {
        API.killHighlight(that.module.getId());
        if (that._data._highlight) {
          listenHighlightsBis(that._data._highlight);
        }
      }


      function listenHighlightsBis(hl) {
        that._prepareHighlights(hl);
        var hlset = _.uniq(hl);

        _.keys(hlset).forEach(function (k) {
          if (!hlset[k]) return;
          API.listenHighlight({ _highlight: hlset[k] }, function (onOff, key) {
            if (onOff) {
              drawHighlightBis(key);
            } else {
              undrawHighlightBis(key);
            }
          });
        });
      }

      function undrawHighlightBis(hl) {
        var doDraw = false;
        for (var shape in that._highlightParticleObjects) {
          if (that._highlightParticleObjects[shape][hl] && that._highlightParticleObjects[shape][hl].drawn) {
            that.scene.remove(that._highlightParticleObjects[shape][hl]);
            that._highlightParticleObjects[shape][hl].drawn = false;
            doDraw = true;
          }
        }
        if (doDraw) that._render();
      }

      function drawHighlightBis(hl) {
        for (var shape in that._highlightParticleObjects) {
          if (that._highlightParticleObjects[shape][hl]) {
            if (that._highlightParticleObjects[shape][hl].drawn === true) {
              return;
            } else {
              that.scene.add(that._highlightParticleObjects[shape][hl]);
              that._highlightParticleObjects[shape][hl].drawn = true;
              that._updateParticleObject(that._highlightParticleObjects[shape][hl], {
                updateColor: true,
                sizeFactor: 1.35,
                transparent: true
              });
              that._render();
            }
          }
        }
      }
    },

    updateOptions: function () {
      this._options = {
        grid: {
          clickable: true,
          hoverable: true
        },
        series: {
          pie: {
            show: true
          }
        }
      };
    }
  });

  function blank() {
    var that = this;
    if (!this.scene || !this.scene.children) return;
    _.keys(this.scene.children).forEach(function (key) {
      that.scene.remove(that.scene.children[key]);
    });
    this._render();
  }

  return View;
});
