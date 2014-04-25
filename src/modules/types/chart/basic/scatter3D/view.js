define(['modules/default/defaultview','lib/plotBis/plot','src/util/datatraversing','src/util/api','src/util/util', 'underscore', 'threejs', 'components/three.js/examples/js/controls/TrackballControls'], function(Default, Graph, Traversing, API, Util, _) {
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
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		DEBUG: true,


    _initThreejs: function() {
      var self = this;
			var container;
      var pointerObjects = [];
      var lastMouseMoveEvent = null;
      var currentPoint = null;
      var drawTickLabelsThrottled = $.proxy(_.throttle(self._drawTickLabels, 500), self);
      var drawAxisLabelsThrottled = $.proxy(_.throttle(self._drawAxisLabels, 500), self);
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

        var intersects = ray.intersectObjects(self.scene.children);
        intersects = _.filter(intersects, function(intersect) {
          return intersect.object.data;
        });
        return intersects;
      }
      
      function onMouseDown(event) {
        var intersects = getIntersects(event);
        console.log(intersects);
      }
      
      function onMouseMove(event) {
        var intersects = getIntersects(event);
        pointerObjects = intersects;
        lastMouseMoveEvent = event;
        if(intersects.length > 0){
          console.log(self._data.label[intersects[0].object.data.index]);
          var newPoint = { index: intersects[0].object.data.index };
          var pointChanged = JSON.stringify(newPoint) !== JSON.stringify(currentPoint);
          if( currentPoint && pointChanged) {
           // rehighlight currentPoint -> newPoint
           console.log('rehighlight currentPoint -> newPoint');
           API.highlightId(self._data._highlight[currentPoint.index], 0);
           API.highlightId(self._data._highlight[newPoint.index], 1);
          }
          else if(pointChanged){
            // highlight newPoint
            console.log('highlight newPoint');
            API.highlightId(self._data._highlight[newPoint.index], 1);
          }
          currentPoint = newPoint;
        }
        else {
          if(currentPoint) {
            // unhighlight currentPoint
            console.log('unhighlight currentPoint');
            API.highlightId(self._data._highlight[currentPoint.index], 0);
          }
          currentPoint = null;
        }
        
      }
      
      function showTooltip() {
        console.log('Show tooltip');
        if(pointerObjects.length === 0) {
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
        
        var info = data.info[pointerObjects[0].object.data.index];
        var label = info.getChildSync(jpath);
        console.log('jpath is: ', jpath);
        console.log('info is: ', info);
        console.log('selected text is: ', label.value);
        $('#scatter3D_tooltip').css('left', lastMouseMoveEvent.offsetX - TOOLTIP_WIDTH);
        $('#scatter3D_tooltip').css('top', lastMouseMoveEvent.offsetY);
        $('#scatter3D_tooltip').css('width', TOOLTIP_WIDTH);
        $('#scatter3D_tooltip').html(label.value);
        $('#scatter3D_tooltip').show();
        console.log('tooltip show object: ', pointerObjects[0]);
        console.log(lastMouseMoveEvent);
      }
      
      function hideTooltip() {
        $('#scatter3D_tooltip').hide();
        console.log('hide tooltip');
      }
      
      function showProjection() {
        console.log('Show projection');
        
        if(pointerObjects.length === 0) {
          return;
        }
        
        var index = pointerObjects[0].object.data.index;
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
          y: self._data.normalizedData.y[index]
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
          y: self._data.normalizedData.y[index], 
          z: self._data.normalizedData.z[index]
        }));
        render();
      }
      
      function hideProjection() {
        console.log('hide projections');
        for(var i=0; i<projections.length; i++) {
          self.scene.remove(projections[i]);
        }
        projections = [];
        render();
      }

			function init() {
        self.camera = new THREE.PerspectiveCamera( 60, self.dom.width() / self.dom.height(), 1, 10000 );

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
        $('#legend').hide();
        $('#legend').css('background-color', self.module.getConfiguration('backgroundColor'));
        
        self._zoomToFit();


				//window.addEventListener( 'resize', onWindowResize, false );
        onWindowResize();
        // $(self.renderer.domElement).off('mousedown', onMouseDown);
        // $(self.renderer.domElement).on('mousedown', onMouseDown);
        
        function onHover() {
          if(pointerObjects.length > 0) {
            var j = pointerObjects[0].object.data.index;
            self.module.controller.onHover(self._data.info[j]);
          }
        }
        
        function sendHighlight() {
          if(pointerObjects.length > 0) {
            
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

				self.renderer.setSize( self.dom.width(), self.dom.height() );

				self.controls.handleResize();

				render();

			}

			function animate() {

				requestAnimationFrame( animate );
				self.controls.update();

			}

			function render() {
				self.renderer.render( self.scene, self.camera );
        if(self.headlight) {
         self.headlight.position.set = self.camera.position; 
        }
        if(self.tickLabels) {
          drawTickLabelsThrottled();
          drawAxisLabelsThrottled();
        }
			}
      
    },
    
    _plotPoints: function(value) {
      var self = this;
      console.log('plot points');
      // Remove all objects
      _.keys(self.scene.children).forEach(function(key){
        self.scene.remove(self.scene.children[key]);
      });
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
      self.scene.add( light );
      
      self.headlight = new THREE.PointLight ( 0xaaaaaa, 1.5 );
      self.headlight.position = self.camera.position;
      self.scene.add(self.headlight);
      // ===================================================
      
      // 2 Directional light with diff intensities =========
      // ===================================================
      
      // Add all data levels in one graph
      console.log('Value: ', value);
      for(var i=0; i<value.x.length; i++) {
        if(i===0) {
          self.module._data = value.info[i];
        }
          
        var color = '#000000';
        var radius = 5;
        if(value.size && value.size[i]) {
          radius = value.size[i] * NORM_CONSTANT;
        }
        if(value.color && value.color[i]) {
          color = value.color[i];
        }
        
        var mesh = this._plotPoint({
          x: self._data.normalizedData.x[i],
          y: self._data.normalizedData.y[i],
          z: self._data.normalizedData.z[i],
          color: color,
          radius: radius,
          opacity: 1,
          index: i
        });
          
        $.extend(mesh, {
          data: {
            index: i,
          }
        });
        self.scene.add(mesh);
      }
      this._drawAxes();
      this._drawFaces();
      this._drawGrid();
      this._drawSecondaryGrid();
      this._drawTicks();
      this._drawTickLabels(); 
      this._drawAxisLabels();
      this.renderer.render(self.scene, self.camera);
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
      
      self._data.nbTicks[axis] = Math.floor(nbTicks);
      self._data.intervalVal[axis] = unitPerTickCorrect;
      self._data.intervalPx[axis] = NORM_CONSTANT / (self._data.nbTicks[axis]-1);
      self._data.realLen[axis] = self._data.realMax[axis] - self._data.realMin.x;
      self._data.decimals[axis] = decimals;
      self._data.pxPerTick[axis] = pxPerTick;
      var intdec = Math.floor(Math.log(unitPerTickCorrect) / Math.log(10));
      if(Math.abs(intdec <= 1)) {
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
      var radius = options.radius || 0.03;
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
      // var mat = new THREE.Matrix4();
      // console.log('MATH PI', Math.PI);
      // mat.makeRotationY(Math.PI/2);
      // console.log(mat);
      // mat.makeTranslation(100,0,0);
      // mesh.applyMatrix(mat);
      // rotateAroundObjectAxis(mesh, new THREE.Vector3(1,0,0), Math.PI/2);
      
      
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
    
    _drawSecondaryGrid: function() {
      var self = this;
      self._reinitObject3DArray('secondaryGrid');
      console.log('secondary grid', self._data.nbTicks.x);
      var options = { color: 0x888888 };
      
      // x lines
      var jmax = 3;
      for(var i=0; i<self._data.nbTicks.x-1; i++) {
        for(var j=1; j<jmax; j++) {
          if(this._configCheckBox('grid', 'xysec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3(self._data.intervalPx.x * i + self._data.intervalPx.x/jmax * j, 0, 0), 
            new THREE.Vector3(self._data.intervalPx.x * i + self._data.intervalPx.x/jmax * j, NORM_CONSTANT, 0), options));
          if(this._configCheckBox('grid', 'xzsec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3(self._data.intervalPx.x * i + self._data.intervalPx.x/jmax * j, 0, 0), 
            new THREE.Vector3(self._data.intervalPx.x * i + self._data.intervalPx.x/jmax * j, 0, NORM_CONSTANT), options));
        }
      }
      
      // y lines
      for(var i=0; i<self._data.nbTicks.y-1; i++) {
        for(var j=1; j<jmax; j++){
          if(this._configCheckBox('grid', 'yzsec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3(0, self._data.intervalPx.y * i + self._data.intervalPx.y/jmax * j, 0),
            new THREE.Vector3(0, self._data.intervalPx.y * i + self._data.intervalPx.y/jmax * j, NORM_CONSTANT), options));
          if(this._configCheckBox('grid', 'xysec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3(0, self._data.intervalPx.y * i + self._data.intervalPx.y/jmax * j, 0),
            new THREE.Vector3(NORM_CONSTANT, self._data.intervalPx.y * i + self._data.intervalPx.y/jmax * j, 0), options));
        }
      }
      
      // z lines
      for(var i=0; i<self._data.nbTicks.z-1; i++) {
        for(var j=1; j<jmax; j++) {
          if(this._configCheckBox('grid', 'yzsec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3(0, 0, self._data.intervalPx.z * i + self._data.intervalPx.z/jmax * j),
            new THREE.Vector3(0, NORM_CONSTANT, self._data.intervalPx.z * i + self._data.intervalPx.z/jmax * j), options));
          if(this._configCheckBox('grid', 'xzsec'))
          self.secondaryGrid.push(self._drawLine(new THREE.Vector3( 0, 0, self._data.intervalPx.z * i + self._data.intervalPx.z/jmax * j),
            new THREE.Vector3( NORM_CONSTANT, 0, self._data.intervalPx.z * i + self._data.intervalPx.z/jmax * j), options));
        }
      }
    },
    
    _drawGrid: function() {
      var self = this;
      self._reinitObject3DArray('grid');
      
      // x lines
      for(var i=0; i<self._data.nbTicks.x; i++) {
        if(this._configCheckBox('grid', 'xy'))
        self.grid.push(self._drawLine(new THREE.Vector3(self._data.intervalPx.x * i, 0, 0), 
          new THREE.Vector3(self._data.intervalPx.x * i, NORM_CONSTANT, 0)));
        if(this._configCheckBox('grid', 'xz'))
        self.grid.push(self._drawLine(new THREE.Vector3(self._data.intervalPx.x * i, 0, 0), 
          new THREE.Vector3(self._data.intervalPx.x * i, 0, NORM_CONSTANT)));
      }


      
      // y lines
      for(var i=0; i<self._data.nbTicks.y; i++) {
        if(this._configCheckBox('grid', 'yz'))
        self.grid.push(self._drawLine(new THREE.Vector3(0, self._data.intervalPx.y * i, 0),
          new THREE.Vector3(0, self._data.intervalPx.y * i, NORM_CONSTANT)));
        if(this._configCheckBox('grid', 'xy'))
        self.grid.push(self._drawLine(new THREE.Vector3(0, self._data.intervalPx.y * i, 0),
          new THREE.Vector3(NORM_CONSTANT, self._data.intervalPx.y * i, 0)));
      }
      
      
      // z lines
      for(var i=0; i<self._data.nbTicks.z; i++) {
        if(this._configCheckBox('grid', 'yz'))
        self.grid.push(self._drawLine(new THREE.Vector3(0, 0, self._data.intervalPx.z * i),
          new THREE.Vector3(0, NORM_CONSTANT, self._data.intervalPx.z * i)));
        if(this._configCheckBox('grid', 'xz'))
        self.grid.push(self._drawLine(new THREE.Vector3( 0, 0, self._data.intervalPx.z * i),
          new THREE.Vector3( NORM_CONSTANT, 0, self._data.intervalPx.z * i)));

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
      

      // create a canvas element
      var canvas = document.createElement('canvas');
      canvas.height = 100;
      canvas.width = NORM_CONSTANT * 2;
      var ctx = canvas.getContext('2d');
      ctx.font = "Bold " + (options.size || 50) + "px " + (options.font || "Arial");
      ctx.fillStyle = options.fillStyle || "rgba(255,0,0,0.95)";
      ctx.textAlign = options.textAlign || "left";
      ctx.fillText(text, NORM_CONSTANT, 50);
      
      // canvas contents will be used for a texture
      var texture = new THREE.Texture(canvas) 
      texture.needsUpdate = true;
      
      var material = new THREE.MeshBasicMaterial( {map: texture, side:THREE.DoubleSide } );
      material.transparent = true;
      var mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(canvas.width, canvas.height),
        material
      );
      // mesh.position.set(0,50,0);
      var textOrientation = self.camera.matrix.clone();
      textOrientation.setPosition(new THREE.Vector3(0,0,0));
      mesh.applyMatrix(textOrientation);
      mesh.position.set(x,y,z);
      self.scene.add(mesh);
      return mesh;
    },
    
    _drawTickLabels: function() {
      console.log("Draw labels");
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
    
    _drawAxisLabels: function() {
      console.log("Draw labels");
      var self = this;
      
      self._reinitObject3DArray('axisLabels');
      
      var mode = self.module.getConfiguration('labels');
      switch(mode) {
      case 'axis':
        drawOnAxis('X title', 'Y title', 'Z title');
        $('#legend').hide();
        break;
      case 'alegend':
        drawOnAxis('X', 'Y', 'Z');
        drawLegend('X title', 'Y title', 'Z title');
        $('#legend').show();
        break;
      case 'none':
        return;
        break;
      }
      
      
      function drawLegend(tx, ty, tz) {
        var arr = [];
        arr.push('X: '+ tx);
        arr.push('Y: '+ ty);
        arr.push('Z: '+ tz);
        $('#legend').html(arr.join('<br/>'));
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
          textAlign: "left",
        }));
        
      }
      
      function addFactor(text, axis) {
        return text + (self._data.intervalFactor[axis] === 1 ? '' : ' (\u00D7 10' + unicodeSuperscript(Math.log(self._data.intervalFactor[axis])/Math.LN10) + ')');
      }
      
      function unicodeSuperscript(num) {
        console.log(num);
        num = num.toString();
        var result = '';
        for(var i=0; i<num.length; i++) {
          if(parseInt(num[i] === NaN))
          continue;
          if(num[i] < '2' && num[i] > '3') {
            result += String.fromCharCode(8304 + parseInt(num[i]));
          }
          else {
            result += String.fromCharCode(176 + parseInt(num[i]));
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
      
      var geometry1 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry2 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry3 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry4 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry5 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);
      var geometry6 = new THREE.PlaneGeometry(NORM_CONSTANT, NORM_CONSTANT);

      var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity:0.6} );
      var group = new THREE.Object3D();
      var mesh1 = new THREE.Mesh(geometry1, material);
      var mesh2 = new THREE.Mesh(geometry2, material);
      var mesh3 = new THREE.Mesh(geometry3, material);
      var mesh4 = new THREE.Mesh(geometry4, material);
      var mesh5 = new THREE.Mesh(geometry5, material);
      var mesh6 = new THREE.Mesh(geometry6, material);
      group.add(mesh1);
      group.add(mesh2);
      group.add(mesh3);
      group.add(mesh4);
      group.add(mesh5);
      group.add(mesh6);
      
      
      var m1, m2, m3;
      // Face 1
      m1 = new THREE.Matrix4();
      m2 = new THREE.Matrix4();
      m3 = new THREE.Matrix4();
      m1.makeTranslation(NORM_CONSTANT/2, NORM_CONSTANT/2, 0);
      m2.makeTranslation(0,0,NORM_CONSTANT/2);
      mesh1.applyMatrix(m1);
      m2.multiplyMatrices(m1,m2);
      mesh4.applyMatrix(m2)
      
      
      // Face 2
      m1 = new THREE.Matrix4();
      m2 = new THREE.Matrix4();
      m3 = new THREE.Matrix4();
      m1.makeRotationY(Math.PI/2);
      m2.makeTranslation(-NORM_CONSTANT/2, NORM_CONSTANT/2, 0);
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
      m2.makeTranslation(NORM_CONSTANT/2, NORM_CONSTANT/2, 0);
      m2.multiplyMatrices(m1,m2);
      mesh3.applyMatrix(m2);
      // m3.makeTranslation(0, 0, -self._data.len.y);
      m3.makeTranslation(0, 0, -NORM_CONSTANT);
      m3.multiplyMatrices(m2, m3);
      mesh6.applyMatrix(m3);
      
      mesh1.receiveShadow = false;
      mesh2.receiveShadow = false;
      mesh3.receiveShadow = false;
      mesh4.visible = false;
      mesh5.visible = false;
      mesh6.visible = false;
      
      self.faces.push(group);
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
    
    _plotPoint: function(point) {
      var self = this;
      if(!self._inBoundary({
        x: self._data.x[point.index],
        y: self._data.y[point.index],
        z: self._data.z[point.index]
      })) {
        console.log('not in boundary', point);
        return;
      }
      var geometry = new THREE.SphereGeometry( point.radius, 32, 32 );
      console.log(new THREE.Color(point.color));
			var material =  new THREE.MeshLambertMaterial({ 
        color: new THREE.Color(point.color),
        shading: THREE.FlatShading,
        opacity: point.opacity,
        transparent: point.opacity === 1 ? false : true
      });

      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = point.x;
      mesh.position.y = point.y;
      mesh.position.z = point.z;
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      this.scene.add( mesh );
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
      var self = this;
      
			if (this.DEBUG) console.log("Scatter 3D: onResize");
			// the size is now really defined (we are after inDom)
			// and we received the data ...
			this.loadedData.done(function() {
        self._initThreejs();
        console.log('loadedData done');
        if(self._data) {
          self._plotPoints(self._data);
          
          API.killHighlight( self.module.getId());
          var highlightSet = {};
          console.log("-----");
          console.log(self._data);
          for(var i=0; i<self._data.x.length; i++) {
            console.log('setting highlights: ', self._data._highlight);
            (function(){
              var index = i;
              // highlightSet[self._data[i]._highlight[j].toString()] = self._data[i]._highlight[j];
              API.listenHighlight( {_highlight: self._data._highlight[i]}, function( onOff, key ) {
                console.log('-- Listening to highlight ', key, '(is '+ (onOff ? 'on': 'off') + ')');
                // console.log(onOff, key, currentDataPoint);
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
      });
      
      
		
      
      function undrawHighlight(index) {
        if(!highlightObjects[index]) {
          return;
        }
        self.scene.remove(highlightObjects[index]);
        delete highlightObjects[index];
        self.renderer.render( self.scene, self.camera );
      }
      function drawHighlight(index) {
        if(highlightObjects[index]) {
          return;
        }
        
        var color = '#e5be39';
        // var color = '#aaaaaa';
        var radius = 8;
        if(self._data.size && self._data.size[index]) {
          radius = self._data.size[index] * NORM_CONSTANT * 1.5;
        }
        // if(self._data[serie].color && self._data[serie].color[index]) {
        //   color = self._data[serie].color[index];
        // }
        
        var mesh = self._plotPoint({
          x: self._data.normalizedData.x[index],
          y: self._data.normalizedData.y[index],
          z: self._data.normalizedData.z[index],
          color: color,
          radius: radius,
          opacity: 0.6,
          transparent: true,
          index: index
        });
        highlightObjects[index] = mesh;
        self.renderer.render( self.scene, self.camera );
      }
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
          console.log('unvalid value', moduleValue);
          return;
        }

        // Convert series
        this._convertChartToData(moduleValue.get());
        this._computeMinMax();
        this._computeTickInfo();
        this._normalizeData();
        
        console.log('moduleValue.get(): ', this._data);

				// data are ready to be ploted
        console.log('state:', this.loadedData.state());
        if(this.loadedData.state() === 'pending') {
  				this.loadedData.resolve();
        }
        else {
          console.log("points changed");
          this._plotPoints(this._data);
        }
			}
		},
		
		_convertChartToData: function(value) {
			this._data = {};
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
            // self._data[key] = _.union(self._data[key], value.data[j][key]);
          }
          _.filter(self._data[key], function(val) {
            return val !== undefined;
          });
        });
      }
      console.log('Converted data: ', self._data);
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