define(['modules/default/defaultview','lib/plotBis/plot','src/util/datatraversing','src/util/api','src/util/util', 'underscore', 'threejs', 'components/three.js/examples/js/controls/TrackballControls'], function(Default, Graph, Traversing, API, Util, _) {
  function generateRandomArray(n, min, max) {
    var result = [];
    for(var i=0; i<n; i++) {
      result.push(Math.random()*(max-min) + min);
    }
    return result;
  }
  
  function generateRandomFromArray(arr, n) {
    var x = generateRandomArray(n, 0, arr.length-0.001);
    x = x.map(function(a) {
      return arr[Math.floor(a)];
    }); 
    return x;
  }
  
  
  function generateRandomColors(n) {
    var result = [];
    var letters = '0123456789ABCDEF'.split('');
    for(var i=0; i<n; i++) {
      var color = '#'
      for(var j=0; j<3; j++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      result.push(color);
    }
    return result;
  }

  function hexToRgb(hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
          return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
  }
  
  function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
  
  function arrayToRgba(arr) {
    if(arr.length === 3) {
      return 'rgba(' + arr[0] + ',' + arr[1] + ',' + arr[2] + ',1)';
    }
    else if(arr.length === 4) {
      return 'rgba(' + arr[0] + ',' + arr[1] + ',' + arr[2] + ',' + arr[3] + ')';
    }
    else {
      return 'rgba(0,0,0,1)';
    }
    
  }
  
  function rgbStringToHex(rgbString) {
    var shorthandRegex = /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/
    var m = shorthandRegex.exec(rgbString);
    if(m) {
      return rgbToHex(m[1], m[2], m[3]);
    }
    else {
      console.error('rgb string to hex conversion failed', rgbString);
      return '#ffffff'
    }
  }
  
  function rotateAroundObjectAxis(object, axis, radians) {
      var rotObjectMatrix = new THREE.Matrix4();
      rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
      console.log('rotation matrix', rotObjectMatrix);
      object.applyMatrix(rotObjectMatrix);
      // object.rotation.setEulerFromRotationMatrix(object.matrix);
  }

  var NORM_CONSTANT = 1000;
  var TOOLTIP_WIDTH = 100;
  var ZOOM_START = 3;
  var DEFAULT_BACKGROUND_COLOR = '#eeeeee';
  var DEFAULT_PROJECTION_COLOR = '#888888';
  var DEFAULT_POINT_COLOR = '#0000ff';
  var DEFAULT_POINT_RADIUS = 0.03;
  var DEFAULT_POINT_GEOMETRY = "sphere";
  var DEFAULT_POINT_APPEARANCE = "none";
  var DEFAULT_TEXT_COLOR = "rgba(0,0,0,1)";
  var HIGHLIGHT_OPACITY = 0.6;
  var DELTA = NORM_CONSTANT / 1000;
  var CAMERA_NEAR = 120;
  var CAMERA_FAR = 10000;
  
  $.fn.listHandlers = function(events, outputFunction) {
    return this.each(function(i){
      var elem = this,
      dEvents = $(this).data('events');
      if(!dEvents) return;
      $.each(dEvents, function(name, handler){
        if((new RegExp('^(' + (events === '*' ? '.+' : events.replace(',','|').replace(/^on/i,'')) + ')$' ,'i')).test(name)) {
          $.each(handler, function(i,handler){
            outputFunction(elem, '\n' + i + ': [' + name + '] : ' + handler );
          });
        }
      });
    });
  };
	
	function view() {
	  this._firstLoad = true;
	};
	view.prototype = $.extend(true, {}, Default, {
    
		DEBUG: true,


    _initThreejs: function() {
      var self = this;
			var container;
      var pointedObjects = [];
      var lastMouseMoveEvent = null;
      var currentPoint = null;
      var drawTickLabelsThrottled = $.proxy(_.throttle(self._drawTickLabels, 500), self);
      var drawAxisLabelsThrottled = $.proxy(_.throttle(self._drawAxisLabels, 500), self);
      var drawGraphTitleThrottled = $.proxy(_.throttle(self._drawGraphTitle, 500), self);
      var projections = [];
      
			init();
			animate();
      
      function getIntersects(event) {
        var vector = new THREE.Vector3(
          ( event.offsetX / $(self.renderer.domElement).width() ) * 2 - 1,
          - ( event.offsetY / $(self.renderer.domElement).height() ) * 2 + 1,
          0.5
        );
        projector = new THREE.Projector();
        projector.unprojectVector( vector, self.camera );

        var ray = new THREE.Raycaster( self.camera.position,
          vector.sub(self.camera.position).normalize());

        var intersects = ray.intersectObjects(self.points);
        intersects = _.filter(intersects, function(intersect) {
          return intersect.object.data;
        });
        
        intersects = _.map(intersects, function(val) {
          return val.object.data.index;
        });
        return intersects;
      }
      
      var descSort = function ( a, b ) {
      		return a.distance - b.distance;
      };
      
      function getIntersectsBis(event) {
        var vector = new THREE.Vector3(
          ( event.offsetX / $(self.renderer.domElement).width() ) * 2 - 1,
          - ( event.offsetY / $(self.renderer.domElement).height() ) * 2 + 1,
          0.5
        );
        projector = new THREE.Projector();
        projector.unprojectVector( vector, self.camera );
        
        var ray = new THREE.Ray( self.camera.position,
          vector.sub(self.camera.position).normalize());
          
        var count = 0;
        var intersects = [];
        for(var i=0; i<self.mathPoints.length; i++) {
          if(ray.isIntersectionSphere(self.mathPoints[i])) {
            count++;
            intersects.push({
              index: self.mathPoints[i].index,
              distance: self.camera.position.distanceTo(self.mathPoints[i].center)
            });
          }
        }
        intersects.sort(descSort);
        intersects = _.filter(intersects, function(val){
          return val.distance > CAMERA_NEAR;
        })
        intersects = _.map(intersects, function(val){
          return val.index;
        });
        return intersects;
      }
      
      function showPointCoordinates(index) {
        if(self._configCheckBox('displayPointCoordinates', 'onhover')) {
          var arr = [];
          arr.push('X: ' + parseFloat(self._data.x[index].toPrecision(3)).toExponential());
          arr.push('Y: ' + parseFloat(self._data.y[index].toPrecision(3)).toExponential());
          arr.push('Z: ' + parseFloat(self._data.z[index].toPrecision(3)).toExponential());
          $('#legend_point_coordinates').html(arr.join('<br/>'));
          $('#legend_point_coordinates').show();
        }
      }
      
      function hidePointCoordinates() {
        if(self._configCheckBox('displayPointCoordinates', 'onhover')) {
          $('#legend_point_coordinates').hide();
        }
      }
      
      function onMouseMove(event) {
        var intersects;
        if(self._configCheckBox('optimize', 'show')) {
          intersects = getIntersectsBis(event);
        }
        else {
          intersects = getIntersects(event);
        }
        pointedObjects = intersects;
        lastMouseMoveEvent = event;
        if(intersects.length > 0){
          var index = intersects[0];
          var newPoint = index;
          var pointChanged = (newPoint !== currentPoint);
          if( currentPoint && pointChanged) {
           // rehighlight currentPoint -> newPoint
           API.highlightId(self._data._highlight[currentPoint], 0);
           API.highlightId(self._data._highlight[newPoint], 1);
           showPointCoordinates(index);
         }
          else if(pointChanged){
            // highlight newPoint
            API.highlightId(self._data._highlight[newPoint], 1);
            showPointCoordinates(index);
          }
          currentPoint = newPoint;
        }
        else {
          if(currentPoint !== null) {
            // unhighlight currentPoint
            API.highlightId(self._data._highlight[currentPoint], 0);
            hidePointCoordinates();
          }
          currentPoint = null;
        }
        
      }
      
      function showTooltip() {
        if(pointedObjects.length === 0) {
          return;
        }
        var jpath = self.module.getConfiguration('tooltipJpath');
        if(!jpath) {
          return;
        }
        
        var data = self._data;
        
        if(!data.info){
          return;
        }
        
        var info = data.info[pointedObjects[0]];
        var label = info.getChildSync(jpath);
        $('#scatter3D_tooltip').css('left', lastMouseMoveEvent.offsetX - TOOLTIP_WIDTH);
        $('#scatter3D_tooltip').css('top', lastMouseMoveEvent.offsetY);
        $('#scatter3D_tooltip').css('width', TOOLTIP_WIDTH);
        $('#scatter3D_tooltip').html(label.value);
        $('#scatter3D_tooltip').show();
      }
      
      function hideTooltip() {
        $('#scatter3D_tooltip').hide();
      }
      
      function showProjection() {
        
        if(pointedObjects.length === 0) {
          return;
        }
        
        var index = pointedObjects[0];
        if(projections.length > 0) {
          hideProjection();
        }
        var options = {
          color: 0x888888
        };
        // xy projection
        var p1 = new THREE.Vector3(self._data.normalizedData.x[index], self._data.normalizedData.y[index], self._data.normalizedData.z[index]);
        var p2 = new THREE.Vector3(self._data.normalizedData.x[index], self._data.normalizedData.y[index], 0);
        projections.push(self._drawLine(p1, p2, options));
        projections.push(self._drawCircle({
          color: '#000000',
          radius: self._data.size[index],
          x: self._data.normalizedData.x[index], 
          y: self._data.normalizedData.y[index],
          z: DELTA+self.gorigin.z
        }));
        
        // xz projection
        p2 = new THREE.Vector3(self._data.normalizedData.x[index], 0, self._data.normalizedData.z[index]);
        projections.push(self._drawLine(p1, p2, options));
        projections.push(self._drawCircle({
          rotationAngle: Math.PI/2,
          rotationAxis: {x: 1},
          color: '#000000',
          radius: self._data.size[index],
          x: self._data.normalizedData.x[index], 
          y: DELTA + self.gorigin.y,
          z: self._data.normalizedData.z[index]
        }));
        
        // yz projection
        p2 = new THREE.Vector3(0, self._data.normalizedData.y[index], self._data.normalizedData.z[index]);
        projections.push(self._drawLine(p1, p2, options));
        projections.push(self._drawCircle({
          rotationAngle: Math.PI/2,
          rotationAxis: {y: 1},
          color: '#000000',
          radius: self._data.size[index],
          x: DELTA + self.gorigin.x,
          y: self._data.normalizedData.y[index], 
          z: self._data.normalizedData.z[index]
        }));
        render();
      }
      
      function hideProjection() {
        for(var i=0; i<projections.length; i++) {
          self.scene.remove(projections[i]);
        }
        projections = [];
        render();
      }

			function init() {
        self.camera = self.camera || new THREE.PerspectiveCamera( 60, self.dom.width() / self.dom.height(), CAMERA_NEAR, CAMERA_FAR );
        if(self.controls) {
          // self.controls.reset();
        }
        else {
				self.controls = new THREE.TrackballControls( self.camera, self.dom.get(0) );

				self.controls.rotateSpeed = 1.0;
				self.controls.zoomSpeed = 1.2;
				self.controls.panSpeed = 0.8;
				self.controls.noZoom = false;
				self.controls.noPan = false;
				self.controls.staticMoving = true;
				self.controls.dynamicDampingFactor = 0.3;
				self.controls.keys = [ 65, 83, 68 ];
				self.controls.addEventListener( 'change', render );
      }

        // Init scene
				self.scene = new THREE.Scene();

				// renderer

				self.renderer = new THREE.WebGLRenderer( { antialias: false } );
        // self.renderer.setClearColor( self.scene.fog.color, 1 );
        var bgColor = self.module.getConfiguration('backgroundColor');
        self.renderer.setClearColor(rgbToHex(bgColor[0], bgColor[1], bgColor[2]) || DEFAULT_BACKGROUND_COLOR, 1);
				self.renderer.setSize( window.innerWidth, window.innerHeight );

				container = document.getElementById(self.dom.attr('id'));
        container.innerHTML = '';
				container.appendChild(self.renderer.domElement);
        
        $(self.dom).append( '<div id="scatter3D_tooltip" style="z-index: 10000; position:absolute; top: 20px; width:' + TOOLTIP_WIDTH + 100 + 'px; height: auto; background-color: #f9edbe;"> </div>');
        $('#scatter3D_tooltip').hide();
        
        $(self.dom).append( '<div id="legend" style="z-index: 10000; right:10px ;position:absolute; top: 25px; height: auto; background-color: #ffffff;"> </div>');
        $('#legend').append( '<div id="legend_titles"></div>');
        $('#legend').append( '<div id="legend_point_coordinates"></div>');
        $('#legend').css('background-color', self.module.getConfiguration('backgroundColor')).css('text-align', 'right');
        $('#legend_titles').hide();
        $('#legend_point_coordinates').hide();

        onWindowResize();

        
        function onHover() {
          if(pointedObjects.length > 0) {
            var j = pointedObjects[0];
            self.module.controller.onHover([self._data.info[j], [
              self._data.x[j],
              self._data.y[j],
              self._data.z[j]]
            ], ['info', 'coordinates']);
          }
        }
        
        console.log('Init three js');
        // self.renderer is recreated each time in init() so we don't need to 'off' events
        $(self.renderer.domElement).on('mousemove', _.throttle(onMouseMove, 100));
        $(self.renderer.domElement).on('mousemove', _.throttle(onHover, 300));
        console.log('tooltip config: ', self.module.getConfiguration('tooltip'));
        console.log('tooltip jpath: ', self.module.getConfiguration('tooltipJpath'));
        if(self._configCheckBox('tooltip', 'show')) {
          console.log('Activating tooltip');
          $(self.renderer.domElement).on('mousemove', _.debounce(showTooltip, 500));
          $(self.renderer.domElement).on('mousemove', _.throttle(hideTooltip, 500));
        }
        
        if(self._configCheckBox('projection', 'show')) {
          console.log('Activating projections');
          $(self.renderer.domElement).on('mousemove', _.debounce(showProjection, 500));
          $(self.renderer.domElement).on('mousemove', _.throttle(hideProjection, 500));
        }
        
        $(self.renderer.domElement).listHandlers('mousemove', function(a, b) { console.log('handler list: ', a,b);});

			}

			function onWindowResize() {
				self.camera.aspect = self.dom.width() / self.dom.height();
				self.camera.updateProjectionMatrix();
				self.renderer.setSize(self.dom.width(), self.dom.height());
				self.controls.handleResize();
				render();
			}

			function animate() {

				requestAnimationFrame( animate );
				self.controls.update();

			}

			function render() {
				self._render();
        if(self.headlight) {
         self.headlight.position.x = self.camera.position.x +200;
         self.headlight.position.y = self.camera.position.y +200;
         self.headlight.position.z = self.camera.position.z +200; 
        }
        if(self.tickLabels) {
          drawTickLabelsThrottled();
          drawAxisLabelsThrottled();
          drawGraphTitleThrottled();
        }
			}
      
    },
    
    _drawGraph: function() {
      var self = this;
      var tstart = new Date().getTime();
      // Remove all objects
      _.keys(self.scene.children).forEach(function(key){
        self.scene.remove(self.scene.children[key]);
      });
      console.log('objects removed', new Date().getTime());
      // this.scene.traverse(function(obj) {
      //   self.scene.remove(obj);
      // });
      
      // textGeo = new THREE.TextGeometry( 'hello', {
      // 
      //   size: 70,
      //   height: 20,
      // 
      //   font: 'optimer',
      //   weight: 'bold',
      //   style: 'normal',
      // 
      //   material: 0,
      //   extrudeMaterial: 1
      // 
      // });
      // 
      // textGeo.computeBoundingBox();
      // textGeo.computeVertexNormals();
      // 
      // textMaterial = new THREE.MeshFaceMaterial( [ 
      //   new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
      //   new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
      //   ] );
      // textMesh1 = new THREE.Mesh( textGeo, material );
      // this.scene.add(textMesh1)
      
      var light;
			// 8 DIRECTIONAL LIGHTS =======================
      // for(var i=0; i<8; i++) {
      //   var a = i%2 ? 1 : -1;
      //   var b = parseInt(i/2)%2 ? 1 : -1;
      //   var c = parseInt(i/4)%2 ? 1 : -1;
      //   console.log(a,b,c);
      //   var light = new THREE.DirectionalLight(0x777777, 1);
      //   light.position.set(a,b,c);
      //   self.scene.add(light);
      // }
      // ===============================================

      // HEADLIGHT ============
      light = new THREE.AmbientLight( 0x222222, 1 );
      self.scene.add(light);
      
      self.headlight = new THREE.PointLight ( 0xaaaaaa, 1.5 );
      // self.headlight.position = self.camera.position;
      self.headlight.position.x = 1000;
      self.headlight.position.y = 1000;
      self.headlight.position.z = 1000;
      self.scene.add(self.headlight);
      // ===================================================
      
      // 2 Directional light with diff intensities =========
      // ===================================================
      
      if(self._configCheckBox('optimize', 'show')) {
        // self._drawPoints({
        //   render: false
        // });
        self._mathPoints();
        self._drawPointsQuick();
      }
      else {
       self._drawPoints(); 
      }
      // self._drawPointsQuick();
      
      self._drawAxes();
      self._drawFaces();
      self._drawGrid();
      self._drawSecondaryGrid();
      self._drawTicks();
      self._drawTickLabels(); 
      self._drawAxisLabels();
      self._drawGraphTitle();
      self._render()
      console.log('end plot points', new Date().getTime()-tstart);
    },
    
    _drawPoints: function(options) {
      var self = this;
      
      if(!self._data) {
        return;
      }
      self._reinitObject3DArray('points');
      
      for(var i=0; i<self._data.x.length; i++) {
        if(i===0) {
          self.module._data = self._data.info[i];
        }
          
        var color = undefined;
        var radius = undefined;
        var geometry = undefined;
        
        if(self._data.size && self._data.size[i]) {
          radius = self._data.size[i];
        }
        if(self._data.color && self._data.color[i]) {
          color = self._data.color[i];
        }
        if(self._data.geometry && self._data.geometry[i]) {
          geometry = self._data.geometry[i];
        }
        var opt = {
          x: self._data.normalizedData.x[i],
          y: self._data.normalizedData.y[i],
          z: self._data.normalizedData.z[i],
          color: color,
          radius: radius,
          geometry: geometry,
          opacity: 1,
          index: i,
        };
        
        $.extend(opt, options);
        var mesh = this._drawPoint(opt);

        $.extend(mesh, {
          data: {
            index: i,
          }
        });
        self.points.push(mesh);
      }
    },
    
    _drawPointsQuick: function() {
      var self = this;
      
      self._mainParticleObject = self._newParticleObject();      
      self._updateParticleObject(self._mainParticleObject);
			self.scene.add(self._mainParticleObject);
    },
    
    _configCheckBox: function(config, option) {
      return this.module.getConfiguration(config) && _.find(this.module.getConfiguration(config), function(val){
        return val === option;
      });
    },
    
    _getDataField: function(field) {
      if(!this._data) {
        return [];
      }
      return _.flatten(_.pluck(this._data.data, field));
    },
    
    _normalizeData: function() {
      var self = this;
      if(!this._data) {
        return;
      }
      self._data.normalizedData = {};
      self._data.normalizedData.x = _.map(self._data.x, function(x) {
        return NORM_CONSTANT * (x - self._data.realMin.x)/self._data.realLen.x;
      });
      self._data.normalizedData.y = _.map(self._data.y, function(y){
        return NORM_CONSTANT * (y - self._data.realMin.y)/self._data.realLen.y;
      });
      self._data.normalizedData.z = _.map(self._data.z, function(z){
        return NORM_CONSTANT * (z - self._data.realMin.z)/self._data.realLen.z;
      });
      console.log('Data normalized');
    },
    
    _computeMinMax: function() {
      var self = this;
      if(!self._data) {
        return;
      }
      self.minMax = {};
      var x = self._data.x
      var y = self._data.y;
      var z = self._data.z;
      
      self._data.min = {};
      self._data.max = {};
      self._data.len = {};
      
      self._data.min.x = parseFloat(self.module.getConfiguration('minX')) || Math.min.apply(null, x);
      self._data.min.y = parseFloat(self.module.getConfiguration('minY')) || Math.min.apply(null, y);
      self._data.min.z = parseFloat(self.module.getConfiguration('minZ')) || Math.min.apply(null, z);
      self._data.max.x = parseFloat(self.module.getConfiguration('maxX')) || Math.max.apply(null, x);
      self._data.max.y = parseFloat(self.module.getConfiguration('maxY')) || Math.max.apply(null, y);
      self._data.max.z = parseFloat(self.module.getConfiguration('maxZ')) || Math.max.apply(null, z);
      self._data.len.x = self._data.max.x - self._data.min.x;
      self._data.len.y = self._data.max.y - self._data.min.y;
      self._data.len.z = self._data.max.z - self._data.min.z;

    },
    
    _getUnitPerTick: function(px, nbTick, valrange, axis) {
      var self = this;
      var pxPerTick = px / nbTicks; // 1000 / 100 = 10 px per tick
      if(!nbTick)
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

      var numberToNatural = unitPerTick * Math.pow(10, - decimals);
				
      /*
      Example:
      13'453 (4) => 1.345
      0.0000341 (-5) => 3.41
      */


      var possibleTicks = [1,2,5,10];
      var closest = false;
      for(var i = possibleTicks.length - 1; i >= 0; i--)
      if(!closest || (Math.abs(possibleTicks[i] - numberToNatural) < Math.abs(closest - numberToNatural))) {
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


      self._data.realMin[axis] = Math.floor(self._data.min[axis] / unitPerTickCorrect) * unitPerTickCorrect;
      self._data.realMax[axis] = Math.ceil(self._data.max[axis] / unitPerTickCorrect) * unitPerTickCorrect;
      
      console.log('Real min x', self._data.realMin.x, 'Min x', self._data.min.x)
      if(self._data.realMin[axis] !== self._data.min[axis]) {
        nbTicks++;
      }

      if(self._data.realMax[axis] !== self._data.max[axis]) {
        nbTicks++;
      }      
      
      self._data.nbTicks[axis] = Math.floor(nbTicks) + 1;
      self._data.intervalVal[axis] = unitPerTickCorrect;
      self._data.intervalPx[axis] = NORM_CONSTANT / (self._data.nbTicks[axis]-1);
      self._data.realLen[axis] = self._data.realMax[axis] - self._data.realMin[axis];
      self._data.decimals[axis] = decimals;
      self._data.pxPerTick[axis] = pxPerTick;
      var intdec = Math.floor(Math.log(unitPerTickCorrect) / Math.log(10));
      if(Math.abs(intdec) <= 1) {
        self._data.intervalFactor[axis] = 1;
      }
      else {
        self._data.intervalFactor[axis] = Math.pow(10, intdec);
      }
		},
    
    _computeTickInfo: function() {
      console.log('compute tick info');
      var self = this;
      self._data.realMin = {};
      self._data.realMax = {};
      self._data.realLen = {};
      
      self._data.intervalPx = {};
      self._data.nbTicks = {};
      self._data.intervalVal = {}; 
      self._data.decimals = {};
      self._data.pxPerTick = {};
      self._data.intervalFactor = {};
      
      self._getUnitPerTick(NORM_CONSTANT, 3, self._data.len.x, 'x');
      self._getUnitPerTick(NORM_CONSTANT, 3, self._data.len.y, 'y');
      self._getUnitPerTick(NORM_CONSTANT, 3, self._data.len.z, 'z');
    },
    
    _drawAxes: function() {
      var self = this;
      if(!self._data) {
        return;
      }
      
      self._reinitObject3DArray('axes');
      
      var vX = new THREE.Vector3(1, 0, 0);
      var vY = new THREE.Vector3(0, 1, 0);
      var vZ = new THREE.Vector3(0, 0, -1);
      var origin = new THREE.Vector3(0, 0, 0);
      var color = 0x000000;
      
      var axX = new THREE.ArrowHelper( vX, new THREE.Vector3(0,0,NORM_CONSTANT), NORM_CONSTANT, color, 1, 1);
      var axY = new THREE.ArrowHelper( vY, new THREE.Vector3(0,0,NORM_CONSTANT), NORM_CONSTANT, color, 1, 1);
      var axZ = new THREE.ArrowHelper( vZ, new THREE.Vector3(NORM_CONSTANT,0,NORM_CONSTANT), NORM_CONSTANT, color, 1, 1);
      
      self.axes.push(axX, axY, axZ);
      
      this.scene.add(axX);
      this.scene.add(axY);
      this.scene.add(axZ);
    },
    
    _drawCircle: function(options) {
      var self = this;
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
      var material = new THREE.MeshBasicMaterial({ color: options.color || DEFAULT_PROJECTION_COLOR , side:THREE.DoubleSide});
      var mesh = new THREE.Mesh(geometry, material);
      
      var m1 = new THREE.Matrix4();
      var m2 = new THREE.Matrix4();
      if(options.rotationAxis) {
       m1.makeRotationAxis(new THREE.Vector3(options.rotationAxis.x || 0, options.rotationAxis.y || 0, options.rotationAxis.z || 0), options.rotationAngle || 0); 
      }
      m2.makeTranslation(options.x || 0, options.y || 0, options.z || 0);
      m2.multiplyMatrices(m2,m1);
      mesh.applyMatrix(m2);
      this.scene.add(mesh);
      return mesh;
    },
    
    _drawLine: function(p1, p2, options) {
      options = options || {};
      var self = this;
      var material = new THREE.LineBasicMaterial({
      	color: options.color || 0x000000
      });
      var geometry = new THREE.Geometry();
      geometry.vertices.push(p1);
      geometry.vertices.push(p2);
      var line = new THREE.Line(geometry, material);
      self.scene.add(line);
      return line;
    },
    
    _reinitObject3DArray: function(name) {
      this[name] = this[name] || [];
      for(var i=0; i<this[name].length; i++) {
        this.scene.remove(this[name][i]);
      }
      this[name] = [];
    },
    
    _setGridOrigin: function() {
      var self = this;
      self.gorigin = {};
      self.gorigin.x = parseFloat(self.module.getConfiguration('gridOriginX') || self._data.realMin.x);
      self.gorigin.y = parseFloat(self.module.getConfiguration('gridOriginY') || self._data.realMin.y);
      self.gorigin.z = parseFloat(self.module.getConfiguration('gridOriginZ') || self._data.realMin.z);
      self.gorigin.x = NORM_CONSTANT * (self.gorigin.x - self._data.realMin.x)/self._data.realLen.x;
      self.gorigin.y = NORM_CONSTANT * (self.gorigin.y - self._data.realMin.y)/self._data.realLen.y;
      self.gorigin.z = NORM_CONSTANT * (self.gorigin.z - self._data.realMin.z)/self._data.realLen.z;
      console.log('GRID ORIGIN', self.gorigin.x, self.gorigin.y, self.gorigin.z);
    },
    
    _drawSecondaryGrid: function() {
      var self = this;
      self._reinitObject3DArray('secondaryGrid');
      console.log('secondary grid', self._data.nbTicks.x);
      var options = { color: 0x888888 };
      
      // x lines
      var jmax = self.module.getConfiguration('secondaryGrids') || 2;
      for(var i=0; i<self._data.nbTicks.x-1; i++) {
        for(var j=1; j<jmax; j++) {
          if(this._configCheckBox('grid', 'xysec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3(self._data.intervalPx.x * i + self._data.intervalPx.x/jmax * j, 0, DELTA+self.gorigin.z), 
            new THREE.Vector3(self._data.intervalPx.x * i + self._data.intervalPx.x/jmax * j, NORM_CONSTANT, DELTA+self.gorigin.z), options));
          if(this._configCheckBox('grid', 'xzsec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3(self._data.intervalPx.x * i + self._data.intervalPx.x/jmax * j, DELTA+self.gorigin.y, 0), 
            new THREE.Vector3(self._data.intervalPx.x * i + self._data.intervalPx.x/jmax * j, DELTA+self.gorigin.y, NORM_CONSTANT), options));
        }
      }
      
      // y lines
      for(var i=0; i<self._data.nbTicks.y-1; i++) {
        for(var j=1; j<jmax; j++){
          if(this._configCheckBox('grid', 'yzsec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3(DELTA+self.gorigin.x, self._data.intervalPx.y * i + self._data.intervalPx.y/jmax * j, 0),
            new THREE.Vector3(DELTA+self.gorigin.x, self._data.intervalPx.y * i + self._data.intervalPx.y/jmax * j, NORM_CONSTANT), options));
          if(this._configCheckBox('grid', 'xysec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3(0, self._data.intervalPx.y * i + self._data.intervalPx.y/jmax * j, DELTA+self.gorigin.z),
            new THREE.Vector3(NORM_CONSTANT, self._data.intervalPx.y * i + self._data.intervalPx.y/jmax * j, DELTA+self.gorigin.z), options));
        }
      }
      
      // z lines
      for(var i=0; i<self._data.nbTicks.z-1; i++) {
        for(var j=1; j<jmax; j++) {
          if(this._configCheckBox('grid', 'yzsec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3(DELTA+self.gorigin.x, 0, self._data.intervalPx.z * i + self._data.intervalPx.z/jmax * j),
            new THREE.Vector3(DELTA+self.gorigin.x, NORM_CONSTANT, self._data.intervalPx.z * i + self._data.intervalPx.z/jmax * j), options));
          if(this._configCheckBox('grid', 'xzsec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3( 0, DELTA+self.gorigin.y, self._data.intervalPx.z * i + self._data.intervalPx.z/jmax * j),
            new THREE.Vector3( NORM_CONSTANT, DELTA+self.gorigin.y, self._data.intervalPx.z * i + self._data.intervalPx.z/jmax * j), options));
        }
      }
    },
    
    _drawGrid: function() {
      var self = this;
      self._reinitObject3DArray('grid');
      // x lines
      for(var i=0; i<self._data.nbTicks.x; i++) {
        if(this._configCheckBox('grid', 'xy'))
        self.grid.push(self._drawLine(new THREE.Vector3(self._data.intervalPx.x * i, 0, DELTA+self.gorigin.z),
          new THREE.Vector3(self._data.intervalPx.x * i, NORM_CONSTANT, DELTA+self.gorigin.z)));
        if(this._configCheckBox('grid', 'xz'))
        self.grid.push(self._drawLine(new THREE.Vector3(self._data.intervalPx.x * i, DELTA+self.gorigin.y, 0), 
          new THREE.Vector3(self._data.intervalPx.x * i, DELTA+self.gorigin.y, NORM_CONSTANT)));
      }


      
      // y lines
      for(var i=0; i<self._data.nbTicks.y; i++) {
        if(this._configCheckBox('grid', 'yz'))
        self.grid.push(self._drawLine(new THREE.Vector3(DELTA+self.gorigin.x, self._data.intervalPx.y * i, 0),
          new THREE.Vector3(DELTA+self.gorigin.x, self._data.intervalPx.y * i, NORM_CONSTANT)));
        if(this._configCheckBox('grid', 'xy'))
        self.grid.push(self._drawLine(new THREE.Vector3(0, self._data.intervalPx.y * i, DELTA+self.gorigin.z),
          new THREE.Vector3(NORM_CONSTANT, self._data.intervalPx.y * i, DELTA+self.gorigin.z)));
      }
      
      
      // z lines
      for(var i=0; i<self._data.nbTicks.z; i++) {
        if(this._configCheckBox('grid', 'yz'))
        self.grid.push(self._drawLine(new THREE.Vector3(DELTA+self.gorigin.x, 0, self._data.intervalPx.z * i),
          new THREE.Vector3(DELTA+self.gorigin.x, NORM_CONSTANT, self._data.intervalPx.z * i)));
        if(this._configCheckBox('grid', 'xz'))
        self.grid.push(self._drawLine(new THREE.Vector3( 0, DELTA+self.gorigin.y, self._data.intervalPx.z * i),
          new THREE.Vector3( NORM_CONSTANT, DELTA+self.gorigin.y, self._data.intervalPx.z * i)));

      }
    },
    
    _drawTicks: function() {
      var self = this;
      self._reinitObject3DArray('ticks');
      
      // x ticks
      if(self._configCheckBox('ticks', 'x')) {
        for(var i=0; i<self._data.nbTicks.x; i++) {
          self.ticks.push(self._drawLine(new THREE.Vector3(self._data.intervalPx.x * i, 0, NORM_CONSTANT), 
          new THREE.Vector3(self._data.intervalPx.x * i, 0, NORM_CONSTANT*1.05)));
        }
      }
      // y ticks
      if(self._configCheckBox('ticks', 'y')) {
        for(var i=0; i<self._data.nbTicks.y; i++) {
          self.ticks.push(self._drawLine(new THREE.Vector3(0, self._data.intervalPx.y * i, NORM_CONSTANT),
          new THREE.Vector3(-0.05*NORM_CONSTANT, self._data.intervalPx.y * i, NORM_CONSTANT)));
        }
      }
      
      // z ticks
      if(self._configCheckBox('ticks', 'z')) {
        for(var i=0; i<self._data.nbTicks.z; i++) {
          self.ticks.push(self._drawLine(new THREE.Vector3( NORM_CONSTANT, 0, self._data.intervalPx.z * i),
          new THREE.Vector3( NORM_CONSTANT*1.05, 0, self._data.intervalPx.z * i)));
        }
      }
    },
    
    _addText: function(text, x,y,z, options) {
      var self = this;
      var options = options || {};
      
      // Set default options
      options.size = options.size || 50;
      options.fillStyle = options.fillStyle || arrayToRgba(self.module.getConfiguration('annotationColor')) || DEFAULT_TEXT_COLOR;
      options.textAlign = options.textAlign || "left";  
      options.font = options.font || "Arial";
      // Stange, opacity of 1 will dispaly a black background on the text
      options.opacity = options.opacity || 0.99;
      
      
      // create a canvas element
      var canvas = document.createElement('canvas');
      canvas.height = options.size *1.2;
      canvas.width = options.size * text.length / 2 + options.size / 2;
      
      switch(options.textAlign) {
      case "left":
        x += canvas.width/2;
        break;
      case "right":
        x -= canvas.width /2;
        break;
      }
  
      var ctx = canvas.getContext('2d');
      ctx.font = "Bold " + options.size + "px " + options.font;
      ctx.fillStyle = options.fillStyle;
      ctx.fillText(text, 0, options.size);
      
      // canvas contents will be used for a texture
      var texture = new THREE.Texture(canvas) 
      texture.needsUpdate = true;
      
      var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: (options.opacity === 1) ? false : true,
        opacity: options.opacity
      });
      var mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(canvas.width, canvas.height),
        material
      );
      // mesh.position.set(0,50,0);
      var textOrientation = self.camera.matrix.clone();
      textOrientation.setPosition(new THREE.Vector3(0,0,0));
      mesh.applyMatrix(textOrientation);
      mesh.position.set(x,y,z);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      self.scene.add(mesh);
      return mesh;
    },
    
    _drawTickLabels: function() {
      var self = this;
      
      self._reinitObject3DArray('tickLabels');
      
      
      // z labels
      if(self._configCheckBox('ticks', 'zlab')) {
        for(var i=0; i<self._data.nbTicks.z; i++) {
          var text = ((self._data.realMin.z+i*self._data.intervalVal.z)/self._data.intervalFactor.z).toString();
          self.tickLabels.push(self._addText(text, NORM_CONSTANT *1.1,0,i * self._data.intervalPx.z, {
            textAlign: "left"
          }));
        }
      }
      // y labels
      if(self._configCheckBox('ticks', 'ylab')) {
        for(var i=0; i<self._data.nbTicks.y; i++) {
          var text = ((self._data.realMin.y+i*self._data.intervalVal.y)/self._data.intervalFactor.y).toString();
          self.tickLabels.push(self._addText(text, -0.05*NORM_CONSTANT,i * self._data.intervalPx.y, NORM_CONSTANT, {
            textAlign: "right"
          }));
        }
      }
      // x labels
      if(self._configCheckBox('ticks', 'xlab')) {
        for(var i=0; i<self._data.nbTicks.x; i++) {
          var text = ((self._data.realMin.x+i*self._data.intervalVal.x)/self._data.intervalFactor.x).toString();
          self.tickLabels.push(self._addText(text, i * self._data.intervalPx.x, 0, NORM_CONSTANT *1.1, {
            textAlign: "right"
          }));
        }
      }
    },
    
    _drawGraphTitle: function() {
      var self = this;
      
      self._reinitObject3DArray('graphTitle');
      var mode = self.module.getConfiguration('labels');
      var title = self._meta.title || '';
      if(!title || title === '') return;
      switch(mode) {
        case 'none':
          return;
          break;
        default:
          self.graphTitle.push(self._addText(title, NORM_CONSTANT/10, NORM_CONSTANT * 1.3, 100, {
            textAlign: 'left'
          }));
          break;
      }
    },
    
    _drawAxisLabels: function() {
      var self = this;
      
      self._reinitObject3DArray('axisLabels');
      
      var mode = self.module.getConfiguration('labels');
      var xkey = (self._data.xAxis) ? self._data.xAxis : null;
      var ykey = (self._data.yAxis) ? self._data.xAxis : null;
      var zkey = (self._data.yAxis) ? self._data.xAxis : null;
      
      console.log('xAxis', self._data);
      console.log('meta', self._meta);
      var xtitle = (xkey && self._meta.axis && self._meta.axis[xkey]) ? self._meta.axis[xkey].name : 'X';
      var ytitle = (ykey && self._meta.axis && self._meta.axis[ykey]) ? self._meta.axis[ykey].name : 'Y';
      var ztitle = (zkey && self._meta.axis && self._meta.axis[zkey]) ? self._meta.axis[zkey].name : 'Z';
      
      console.log('xtitle', xtitle);
      switch(mode) {
      case 'axis':
        drawOnAxis(xtitle, ytitle, ztitle);
        $('#legend_titles').hide();
        break;
      case 'alegend':
        drawOnAxis('X', 'Y', 'Z');
        drawLegend(xtitle, ytitle, ztitle);
        $('#legend_titles').show();
        break;
      case 'both':
        drawOnAxis(xtitle, ytitle, ztitle);
        drawLegend(xtitle, ytitle, ztitle);
        $('#legend_titles').show();
        break;
      default:
        return;
        break;
      }
      
      
      function drawLegend(tx, ty, tz) {
        var arr = [];
        arr.push('X: '+ tx);
        arr.push('Y: '+ ty);
        arr.push('Z: '+ tz);
        $('#legend_titles').html(arr.join('<br/>'));
      }
      
      function drawOnAxis(tx, ty, tz) {
        // x label
        self.tickLabels.push(self._addText(addFactor(tx, 'x'), NORM_CONSTANT/2, 0, NORM_CONSTANT *1.4, {
          textAlign: "right"
        }));
      
        // y label
        self.tickLabels.push(self._addText(addFactor(ty,'y'), -0.4*NORM_CONSTANT, NORM_CONSTANT/2, NORM_CONSTANT, {
          textAlign: "right"
        }));
      
        // z label
        self.tickLabels.push(self._addText(addFactor(tz,'z'), NORM_CONSTANT *1.4,0,NORM_CONSTANT/2, {
          textAlign: "left"
        }));
        
      }
      
      function addFactor(text, axis) {
        if(self._data.intervalFactor[axis] === 1)
        return text;
        else if(self._data.intervalFactor[axis] > 1)
        return text + ' (\u00D7 10' + unicodeSuperscript(Math.round(Math.log(self._data.intervalFactor[axis])/Math.LN10)) + ')';
        else
        return text + ' (\u00D7 10' + unicodeSuperscript('-'+(-Math.round(Math.log(self._data.intervalFactor[axis])/Math.LN10))) + ')';
      }
      
      function unicodeSuperscript(num) {
        var num = num.toString();
        var result = '';
        for(var i=0; i<num.length; i++) {
          if(parseInt(num[i] === NaN))
          continue;
          if(num[i] === '2' || num[i] === '3') {
            result += String.fromCharCode(176 + parseInt(num[i]));
          }
          else if(num[i] >= '0' && num[i] < '9'){
            result += String.fromCharCode(8304 + parseInt(num[i]));
          }
          else if(num[i] === '-') {
            result += String.fromCharCode(8315);
          }
        }
        return result;
      }
    },
    
    _drawFaces: function() {
      var self = this;
      if(!self._data) {
        return;
      }
      self._reinitObject3DArray('faces');
      
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
      
      
      var geometry1 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry2 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry3 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry4 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry5 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry6 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);

      var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity:0.6} );
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
      m3 = new THREE.Matrix4();
      m1.makeTranslation(NORM_CONSTANT/2, NORM_CONSTANT/2, self.gorigin.z);
      m2.makeTranslation(0,0,NORM_CONSTANT/2);
      mesh1.applyMatrix(m1);
      m2.multiplyMatrices(m1,m2);
      mesh4.applyMatrix(m2);
      
      
      // Face 2
      m1 = new THREE.Matrix4();
      m2 = new THREE.Matrix4();
      m3 = new THREE.Matrix4();
      m1.makeRotationY(Math.PI/2);
      m2.makeTranslation(-NORM_CONSTANT/2, NORM_CONSTANT/2, self.gorigin.x);
      m2.multiplyMatrices(m1,m2);
      // m3.makeTranslation(0, 0, self._data.len.x);
      m3.makeTranslation(0, 0, NORM_CONSTANT);
      mesh2.applyMatrix(m2);
      m3.multiplyMatrices(m2, m3);
      mesh5.applyMatrix(m3);
      
      // Face 3
      m1 = new THREE.Matrix4();
      m2 = new THREE.Matrix4();
      m3 = new THREE.Matrix4();
      m1.makeRotationX(Math.PI/2);
      m2.makeTranslation(NORM_CONSTANT/2, NORM_CONSTANT/2, -self.gorigin.y);
      m2.multiplyMatrices(m1,m2);
      mesh3.applyMatrix(m2);
      // m3.makeTranslation(0, 0, -self._data.len.y);
      m3.makeTranslation(0, 0, -NORM_CONSTANT);
      m3.multiplyMatrices(m2, m3);
      mesh6.applyMatrix(m3);
      
      mesh4.visible = false;
      mesh5.visible = false;
      mesh6.visible = false;
      
      self.faces.push(mesh1);
      self.faces.push(mesh2);
      self.faces.push(mesh3);

      for(var i=0; i<self.faces.length; i++) {
        self.scene.add(self.faces[i]);
      }
    },
    
    _inBoundary: function(point) {
      var self = this;
      if(_.isObject(point)) {
        if(point.x < self._data.realMin.x || point.x > self._data.realMax.x)
        return false;
        
        if(point.y < self._data.realMin.y || point.y > self._data.realMax.y)
        return false;
          
        if(point.z < self._data.realMin.z || point.z > self._data.realMax.z)
        return false;
        
        return true;
      }
      else if(_.isArray(point)) {
        return self._inBoundary({
          x: point[0],
          y: point[1],
          z: point[2]
        });
      }
      else {
        return false;
      }
    },
    
    _computeInBoundaryIndexes: function() {
      var self = this;
      self._data.inBoundary = [];
      for (var i = 0; i < self._data.x.length; i++) {
        self._inBoundary({
          x: self._data.x[i],
          y: self._data.y[i],
          z: self._data.z[i]
        }) ? self._data.inBoundary.push(true) : self._data.inBoundary.push(false);
      }
    },
    
    
    _mathPoints: function() {
      var self = this;
      if(!self._data) return;
      self.mathPoints = [];
      
      for(var i=0; i<self._data.x.length; i++) {
        if(!self._data.inBoundary[i]) continue;
                
        var radius = DEFAULT_POINT_RADIUS;
        if(self._data.size && self._data.size[i]){
          var radius = self._data.size[i];
        }
        
        var sphere = new THREE.Sphere(new THREE.Vector3(self._data.normalizedData.x[i], self._data.normalizedData.y[i], self._data.normalizedData.z[i]), radius*NORM_CONSTANT);
        sphere.index = i;
        self.mathPoints.push(sphere);
      }
      
    },
    
    _drawPoint: function(point) {
      var self = this;
      if(point.render !== false) point.render = true;
      if(!self._inBoundary({
        x: self._data.x[point.index],
        y: self._data.y[point.index],
        z: self._data.z[point.index]
      })) {
        console.log('not in boundary', point);
        return;
      }
      var segments = 32;
      if(self._data.x.length >200) {
        segments = 16;
      }
      else if(self._data.x.length > 500) {
        segments = 8;
      }
      point.color = point.color || DEFAULT_POINT_COLOR;
      point.radius = point.radius || DEFAULT_POINT_RADIUS;
      point.geometry = point.geometry || DEFAULT_POINT_GEOMETRY;
      var trueRadius = point.radius * NORM_CONSTANT;
      var geometry;
      switch(point.geometry) {
      case "cube":
        var len = 2 * trueRadius;
        geometry = new THREE.CubeGeometry(len, len, len);
        break;
      case "tetrahedron":
        geometry = new THREE.TetrahedronGeometry(trueRadius);
        break;
      case "octahedron":
        geometry = new THREE.OctahedronGeometry(trueRadius);
        break;
      case "ring":
        geometry = new THREE.RingGeometry(trueRadius*0.7, trueRadius,segments,segments);
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(trueRadius, trueRadius*0.3, segments, segments);
        break;
      default:
        geometry = new THREE.SphereGeometry(trueRadius, segments, segments);
        break;
      }
    
      var material = null;
      var appearance = self.module.getConfiguration('appearance') || DEFAULT_POINT_APPEARANCE;
      
      // We only care about appearance if we are rendering this point
        switch(appearance) {
        case "metallic":
          var cubemap2 = THREE.ImageUtils.loadDDSTexture( '/test/threejs/examples/textures/compressed/Mountains_argb_mip.dds', new THREE.CubeReflectionMapping, function( cubemap ) {
            cubemap2.magFilter = cubemap2.minFilter = THREE.LinearFilter;
            material.needsUpdate = true;
          });
          cubemap2.anisiotropy = 4;
          material = new THREE.MeshBasicMaterial({
            envMap: cubemap2,
            color: new THREE.Color(point.color),
            transparent: point.opacity === 1 ? false : true,
            opacity: point.opacity || 1
          });
          break;
        case "plastic":
          material = new THREE.MeshPhongMaterial({
            specular: 0x505050,
            side: THREE.DoubleSide,
            ambient: 0x030303,
            color: new THREE.Color(point.color),
            shininess: 1,
            shading: THREE.SmoothShading,
            transparent: point.opacity === 1 ? false : true,
            opacity: point.opacity || 1
          })
          break;
        case "mirror":
          var path = "/test/threejs/examples/textures/cube/pisa/";
          var format = '.png';
          var urls = [
          path + 'px' + format, path + 'nx' + format,
          path + 'py' + format, path + 'ny' + format,
          path + 'pz' + format, path + 'nz' + format
          ];
          var textureCube = THREE.ImageUtils.loadTextureCube( urls );
          var shader = THREE.ShaderLib[ "cube" ];
          shader.uniforms[ "tCube" ].value = textureCube;
          material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide,
            transparent: point.opacity === 1 ? false : true,
            opacity: point.opacity || 1
          });
          // material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
          break;
        case "none":
          material = undefined;
          break;
        default:
          material =  new THREE.MeshLambertMaterial({ 
            color: new THREE.Color(point.color),
            shading: THREE.FlatShading,
            opacity: point.opacity,
            transparent: point.opacity === 1 ? false : true
          });
          break;
        }
      
      
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = point.x;
      mesh.position.y = point.y;
      mesh.position.z = point.z;
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = true;
      if(point.render) {
        this.scene.add(mesh);
      }
      return mesh;
    },
    
    _zoomToFit: function() {
      console.log('Zoom to fit');
      var self = this;
      var theta = Math.PI/3;
      var phi = Math.PI/4;
      var r = NORM_CONSTANT * ZOOM_START;
      var eye = this._polarToCartesian(theta, phi, r);
      eye = new THREE.Vector3(eye[0], eye[1], eye[2]);
     
      // Lookat the middle of the cube
      var target = new THREE.Vector3(NORM_CONSTANT/2, NORM_CONSTANT/2, NORM_CONSTANT/2);
      self.camera.position = eye;
      self.camera.lookAt(target);
    },
    
    _polarToCartesian: function(theta, phi, r) {
      var x = Math.sin(phi) * Math.cos(theta) * r;
      var y = Math.sin(phi) * Math.sin(theta) * r;
      var z = Math.cos(phi) * r;
      return [x, y, z];
    },
    
    
		init: function() {
			if (this.DEBUG) console.log("Scatter 3D: init");

			// When we change configuration the method init is called again. Also the case when we change completely of view
			if (! this.dom) {
				this._id = Util.getNextUniqueId();
				this.dom = $(' <div id="' + this._id + '"></div>').css('height', '100%').css('width', '100%');
				this.module.getDomContent().html(this.dom);
			}
      

			if (this.dom) {
				// in the dom exists and the preferences has been changed we need to clean the canvas
				this.dom.empty();
				
			}
			if (this._flot) { // if the dom existedd there was probably a rgraph or when changing of view
				delete this._flot;
			}

			// Adding a deferred allows to wait to get actually the data before we draw the chart
			// we decided here to plot the chart in the "onResize" event
			this.loadedData=$.Deferred();

      // this.updateOptions();

			if (this.DEBUG) console.log("Scatter 3D: ID: "+this._id);      
		},
		

		inDom: function() {
			if (this.DEBUG) console.log("Scatter 3D: inDom");

		},

		onResize: function() {
      var highlightObjects = {};
      var highlightObjectBis = null;
      var self = this;
      
			if (this.DEBUG) console.log("Scatter 3D: onResize");
			// the size is now really defined (we are after inDom)
			// and we received the data ...
			this.loadedData.done(function() {
        self._initThreejs();
        if(self._firstLoad) {
          self._zoomToFit();
          self._firstLoad = false;
        }
        console.log('loadedData done');
        if(self._data) {
          self._drawGraph();
          
          API.killHighlight( self.module.getId());
          var highlightSet = {};
          console.log("-----");
          if(self._data._highlight) {
            console.log('listen highlights');
            if(self._configCheckBox('optimize', 'show')) listenHighlightsBis(self._data._highlight);
            else listenHighlights(self._data._highlight);
          }
          var infoHighlights = _.flatten(_.pluck(self._data.info, '_highlight'))
          if(infoHighlights) {
            if(self._configCheckBox('optimize', 'show')) listenHighlightsBis(infoHighlights);
            else listenHighlights(infoHighlights);
          }
        }
      });
      
      
		  function listenHighlights(hl) {
        for(var i=0; i<hl.length; i++) {
          (function(){
            var index = i;
            API.listenHighlight( {_highlight: hl[i]}, function( onOff, key ) {
              if(onOff) {
                drawHighlight(index);
              }
              else {
                undrawHighlight(index);
              }
      
            }, false, self.module.getId());
          })();
        }
		  }
      
      function listenHighlightsBis(hl) {
        self._prepareHighlights(hl);
        var hlset = _.uniq(hl);
        
        _.keys(hlset).forEach(function(k){
          if(!hlset[k]) return;
          API.listenHighlight( {_highlight: hlset[k]}, function(onOff, key) {
            if(onOff) {
              drawHighlightBis(key);
            }
            else {
              undrawHighlightBis(key);
            }
          });
        });
      }
      
      function undrawHighlightBis(hl) {
        if(self.hlObjectsBis[hl] && self.hlObjectsBis[hl].drawn) {
          self.scene.remove(self.hlObjectsBis[hl]);
          self.hlObjectsBis[hl].drawn = false;
          self._render();
        }
      }
      
      function drawHighlightBis(hl) {
        console.log('draw highlights', hl);
        if(self.hlObjectsBis[hl]) {
          if(self.hlObjectsBis[hl].drawn === true) {
            return;
          }
          else {
            self.scene.add(self.hlObjectsBis[hl]);
            self.hlObjectsBis[hl].drawn = true;
            self._render();
          }
        }
      }
      
      function undrawHighlight(index) {
        if(!highlightObjects[index]) return;
        self.scene.remove(highlightObjects[index]);
        delete highlightObjects[index];
        self._render();
      }
      
      
      function drawHighlight(index) {
        if(highlightObjects[index]) {
          return;
        }
        
        // Highlight radius
        var radius = DEFAULT_POINT_RADIUS * 1.0;
        if(self._data.size && self._data.size[index]) {
          radius = self._data.size[index] * 1.0;
        }
        
        var geometry = DEFAULT_POINT_GEOMETRY;
        if(self._data.geometry && self._data.geometry[index]) {
          geometry = self._data.geometry[index];
        }
        
        // Highlight color
        var color = '#e5be39';
        // if(self._data[serie].color && self._data[serie].color[index]) {
        //   color = self._data[serie].color[index];
        // }
        
        var mesh = self._drawPoint({
          x: self._data.normalizedData.x[index],
          y: self._data.normalizedData.y[index],
          z: self._data.normalizedData.z[index],
          color: color,
          radius: radius,
          opacity: HIGHLIGHT_OPACITY,
          transparent: true,
          index: index,
          geometry: geometry
        });
        highlightObjects[index] = mesh;
        self._render();
      }
    },
    
    _newParticleObject: function(indexes, options) {
      var self = this;
      options = options || {};
      attributes = {
        size: {	type: 'f', value: [] },
        ca:   {	type: 'c', value: [] }
      };
      uniforms = {
        amplitude: { type: "f", value: 1 },
        color:     { type: "c", value: new THREE.Color( '#e5be39' ) },
        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( options.image || "/test/threejs/examples/textures/sprites/ball.png" ) },
      };

      //uniforms.texture.value.wrapS = uniforms.texture.value.wrapT = THREE.RepeatWrapping;

      var shaderMaterial = new THREE.ShaderMaterial( {

        uniforms: 		uniforms,
        attributes:     attributes,
        vertexShader:   "			attribute float size;			attribute vec4 ca;			varying vec4 vColor;			void main() {				vColor = ca;				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );				gl_PointSize = size * ( 1.0 / length( mvPosition.xyz ) );				gl_Position = projectionMatrix * mvPosition;			}",
        fragmentShader: "uniform vec3 color;			uniform sampler2D texture;			varying vec4 vColor;			void main() {				vec4 outColor = texture2D( texture, gl_PointCoord );				if ( outColor.a < 0.5 ) discard;				gl_FragColor = outColor * vec4( color * vColor.xyz, 1.0 );				float depth = gl_FragCoord.z / gl_FragCoord.w;				const vec3 fogColor = vec3( 0.0 );				float fogFactor = smoothstep( 0.0, 10000.0, depth );				gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );			}",
        transparent: true
      });


      var geometry = new THREE.Geometry();
      if(indexes){
        for(var i=0; i<indexes.length; i++) {
          var vertex = new THREE.Vector3();
          vertex.x = self._data.normalizedData.x[indexes[i]];
          vertex.y = self._data.normalizedData.y[indexes[i]];
          vertex.z = self._data.normalizedData.z[indexes[i]];
          geometry.vertices.push(vertex);
        }
      }
      else {
        for(var i=0; i<self._data.normalizedData.x.length; i++) {
          var vertex = new THREE.Vector3();
          vertex.x = self._data.normalizedData.x[i];
          vertex.y = self._data.normalizedData.y[i];
          vertex.z = self._data.normalizedData.z[i];
          geometry.vertices.push(vertex);
        }
      }

      // particle system
      var object = new THREE.ParticleSystem( geometry, shaderMaterial );
      object.indexes = indexes;
      // self.hlObjectsBis[key].drawn = true;
      // highlightObjectBis.dynamic = true;
      return object;
    },
    
    _updateParticleObject: function(object, options) {
      var self = this;
      options = options || {};
      var indexes = object.indexes;
      var vertices = object.geometry.vertices;
      var values_size = object.material.attributes.size.value;
      var values_color = object.material.attributes.ca.value;
      var color = self._data.color;
      var size  = self._data.size;
      var factor = 2.2388 * (options.sizeFactor || 1.0);
      var forcedColor = options.forcedColor ? new THREE.Color(options.forcedColor) : null;
      if(indexes) {
        for( var v = 0; v < vertices.length; v ++ ) {
          values_size[ v ] = self._data.inBoundary[indexes[v]]
            ? (size[indexes[v]] || DEFAULT_POINT_RADIUS) * NORM_CONSTANT * self.dom.height() * factor
            : 0;
          values_color[ v ] = forcedColor || new THREE.Color(color[v] || DEFAULT_POINT_COLOR);
        }
      }
      else {
        for( var v = 0; v < vertices.length; v ++ ) {
          values_size[ v ] = self._data.inBoundary[v] 
            ?(size[v] || DEFAULT_POINT_RADIUS) * NORM_CONSTANT * self.dom.height() * factor
            : 0;
          values_color[ v ] = forcedColor || new THREE.Color(color[v] || DEFAULT_POINT_COLOR);
        }
      }
    },
    
    _prepareHighlights: function(hl) {
      var self = this;
      self.hlObjectsBis = self.hlObjectsBis || {};
      var m = {};
      for(var i=0; i<hl.length; i++) {
        m[hl[i]] = m[hl[i]] || [];
        m[hl[i]].push(i);
      }
      
      _.keys(m).forEach(function(key) {
        var tstart = new Date().getTime();
        self.hlObjectsBis[key] = self._newParticleObject(m[key], {
          image: "/test/threejs/examples/textures/sprites/ballt.png"
        });
        
        self._updateParticleObject(self.hlObjectsBis[key], {
          sizeFactor: 1.5,
          forcedColor: '#e5be39'
        });
        console.log('highlight time:', new Date().getTime() - tstart);
      });
    },
    
    _updatePoints: function() {
      
    },
		
		/* When a value changes this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {
			'chart': function(moduleValue) {
				if (this.DEBUG) console.log("Scatter 3D: update from chart object");
        
        console.log('module value on update', moduleValue);
				if (! moduleValue.get() ){ 
          console.error('Unvalid value', moduleValue);
          return;
        }

        // Convert series
        this._convertChartToData(moduleValue.get());
        this._computeMinMax();
        this._computeTickInfo();
        this._computeInBoundaryIndexes();
        this._normalizeData();
        this._setGridOrigin();
        this._updateChartData();
        
        console.log('moduleValue.get(): ', this._data);

				// data are ready to be ploted
        console.log('state:', this.loadedData.state());
        if(this.loadedData.state() === 'pending') {
  				this.loadedData.resolve();
        }
        else {
          console.log("points changed");
          this._drawGraph();
        }
			},
      'data3D': function(moduleValue) {
        console.log('data3d received');
        console.log('Scatter 3D: update from data3D object');
        if(!moduleValue || !moduleValue.get()) {
          console.error('Unvalid value', moduleValue);
          return;
        }
        
        // Convert data
        this._convertData3dToData(moduleValue.get());
        console.log(this._data);
        
        
        this._computeMinMax();
        this._computeTickInfo();
        this._computeInBoundaryIndexes();
        this._normalizeData();
        this._setGridOrigin();
        this._updateChartData();
        
        console.log('moduleValue.get(): ', this._data);

				// data are ready to be ploted
        console.log('state:', this.loadedData.state());
        if(this.loadedData.state() === 'pending') {
  				this.loadedData.resolve();
        }
        else {
          console.log("points changed");
          this._drawGraph();
        }
      }
		},
    
    _render: function () {
      var self = this;
      setTimeout(function() {
        self.renderer.render(self.scene, self.camera, 0);
      }, 20);
    },
    
    _convertData3dToData: function(value) {
      var self = this;
      if(! value instanceof Array || value.length === 0) {
        console.error('Data 3D not valid');
      }
      self._data = self._data || {};
      for (var i = 0; i < value.length; i++) {
        for(var key in value[i]) {
          self._data[key] ? self._data[key].push(value[i][key]) : (self._data[key] = [value[i][key]]);
        }
      }
      self._meta = {};
      self._data._highlight = self._data._highlight || [];
      self._data.info = self._data._info || [];
      
      // generate random x,y z
      var n = 1000;
      self._data.x =       generateRandomArray(n,0,5);
      self._data.y =       generateRandomArray(n,0,5);
      self._data.z =       generateRandomArray(n,0,5);
      self._data.size =    generateRandomArray(n, 0.01, 0.02);
      self._data.color =  generateRandomColors(n);
      // self._data._highlight = generateRandomFromArray(['A','B','C','D'], n);
    },
		
		_convertChartToData: function(value) {
			this._data = {};
      this._meta = {};
			var self=this;
			if ( ! value.data instanceof Array || ! value.data[0] || ! value.data[0].y instanceof Array) return;
			if (value.data.length>0) {
				console.log("Scatter 3D module will merge series together");
			}
      
      for(var j=0; j<value.data.length; j++) {
        _.keys(value.data[j]).forEach(function(key){
          if(value.data[j][key] instanceof Array) {
            self._data[key] = self._data[key] || [];
            self._data[key].push(value.data[j][key]);
            self._data[key] = _.flatten(self._data[key], true);
            
          }
          else {
            self._data[key] = value.data[j][key];
          }
          _.filter(self._data[key], function(val) {
            return val !== undefined;
          });
        });
      }
      
      _.keys(value).forEach(function(key){
        if(key === 'data') return;
        else self._meta[key] = value[key];
      });
      
      console.log('meta: ', self._meta);
      
      // generate random x,y z
      var n = 1000;
      self._data.x =       generateRandomArray(n,0,5);
      self._data.y =       generateRandomArray(n,0,5);
      self._data.z =       generateRandomArray(n,0,5);
      self._data.size =    generateRandomArray(n, 0.01, 0.02);
      self._data.color =  generateRandomColors(n);
      self._data._highlight = generateRandomFromArray(['A','B','C','D'], n);
      console.log('Converted data: ', self._data);
		},
    
    _completeDataInfo: function(name, defaultValue) {
      var self = this;
      self._data[name] = self._data[name] || [];
      for(var i=0; i<self._data.x.length; i++) {
        if(!self._data[name][i]) self._data[name][i] = defaultValue;
      }
    },
    
    _updateChartData: function() {
      this._completeDataInfo('size', DEFAULT_POINT_RADIUS);
      this._completeDataInfo('color', DEFAULT_POINT_COLOR);
    },

		updateOptions: function() {
      console.log('update options');
			this._options = {
				grid: {
					clickable:true,
					hoverable:true
				},
				series: {
					pie: {
						show:true
					}
				}
			};


       // var cfg = $.proxy( this.module.getConfiguration, this.module );

		}


	});

	return view;
});