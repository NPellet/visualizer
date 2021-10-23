'use strict';

define([
  'require',
  'modules/default/defaultview',
  'src/util/util',
  'threejs',
  'src/util/debug',
  'lib/parser/Parser',
  'lib/threejs/TrackballControls'
], function (require, Default, Util, THREE, Debug, Parser) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init: function () {
      var that = this;
      this.webgl = (function () {
        try {
          return (
            !!window.WebGLRenderingContext &&
            !!document.createElement('canvas').getContext('experimental-webgl')
          );
        } catch (e) {
          return false;
        }
      })();

      var cfg = this.module.getConfiguration;

      this._id = Util.getNextUniqueId();
      var $block = $('<div>', { Id: this._id });
      $block
        .css('display', 'table')
        .css('height', '100%')
        .css('width', '100%')
        .css('overflow', 'hidden'); // .css('background','#33ccff');
      this.dom = $block;
      this.module
        .getDomContent()
        .html(this.dom)
        .css('overflow', 'hidden');

      this.zFunctionText =
        cfg('function') || 'sin(sqrt(0.01*x^2  + 0.01*y^2))*10';
      this.xMin = cfg('xMin') || -100;
      this.xMax = cfg('xMax') || 100;
      this.yMin = cfg('yMin') || -100;
      this.yMax = cfg('yMax') || 100;
      this.zMin = cfg('zMin') || -100;
      this.zMax = cfg('zMax') || 100;
      this.xRange = this.xMax - this.xMin;
      this.yRange = this.yMax - this.yMin;

      this.clearScene();

      this.createGraph();
      this.resolveReady();

      // This should reduce CPU if the mouse if not over and we can not move the object
      // this is only valid for non animated graph
      this.doAnimation = false;

      this.dom.on('mouseenter', function () {
        that.doAnimation = true;
      });

      this.dom.on('mouseleave', function () {
        that.doAnimation = false;
      });
    },

    clearScene: function () {
      if (this.scene) {
        // this.scene.remove

        this.scene.remove(this.graphGeometry);
        this.scene.remove(this.graphMesh);
        this.scene.remove(this.floor);
        delete this.graphGeometry;
        delete this.graphMesh;
        delete this.floor;
      }
    },

    blank: {
      function: function () {
        this.clearScene();
      }
    },

    onResize: function () {
      if (!this.webgl) {
        Debug.warn('webgl context does not exist');
        return;
      }
      var that = this;
      this.module.viewReady.then(function () {
        var cfg = that.module.getConfiguration;
        var segments = cfg('segments');

        // /////////////////////
        // end vertex colors //
        // /////////////////////

        // material choices: vertexColorMaterial, wireMaterial , normMaterial , shadeMaterial

        if (that.graphMesh) {
          that.scene.remove(that.graphMesh);
        }

        var wireTexture = THREE.ImageUtils.loadTexture(
          require.toUrl('./square.png')
        );
        wireTexture.wrapS = wireTexture.wrapT = THREE.RepeatWrapping;
        wireTexture.repeat.set(40, 40);
        var wireMaterial = new THREE.MeshBasicMaterial({
          map: wireTexture,
          vertexColors: THREE.VertexColors,
          side: THREE.DoubleSide
        });

        that.graphMesh = new THREE.Mesh(that.graphGeometry, wireMaterial);

        that.graphMesh.doubleSided = true;
        that.scene.add(that.graphMesh);

        that.renderer.setSize(that.width, that.height);

        that.setCamera();
        that.setControls();

        that.firstAnimation = 60;
        that.animate();
      });
    },

    addFloor: function (scene) {
      // scene.add( new THREE.AxisHelper() );
      var wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000088,
        wireframe: true,
        side: THREE.DoubleSide
      });
      var floorGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 10, 10);
      this.floor = new THREE.Mesh(floorGeometry, wireframeMaterial);
      // floor.position.z = 0; // required, otherwise from time to time it is NaN !!!???
      // floor.rotation.x = Math.PI / 2;
      scene.add(this.floor);
    },

    update: {
      function: function (data) {
        this.zFunctionText = data.get();
        this.createGraph();
        this.onResize();
      }
    },

    animate: function () {
      var that = this;
      requestAnimationFrame(that.animate.bind(that));
      if (that.doAnimation || that.firstAnimation > 0) {
        if (that.firstAnimation > 0) that.firstAnimation--;
        that.renderer.render(that.scene, that.camera);
        that.controls.update();
      }
    },

    setCamera: function () {
      var VIEW_ANGLE = 45,
        ASPECT = this.width / this.height,
        NEAR = 0.1,
        FAR = 20000;
      this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
      this.camera.position.set(2 * this.xMax, 0.5 * this.yMax, 4 * this.zMax);
      this.camera.up = new THREE.Vector3(0, 0, 1);
      this.camera.lookAt(this.scene.position);
      this.scene.add(this.camera);
    },

    setControls: function () {
      this.controls = new THREE.TrackballControls(
        this.camera,
        this.renderer.domElement
      );
    },

    createGraph: function () {
      var that = this;
      var cfg = that.module.getConfiguration;
      var segments = cfg('segments');
      var zFunc = Parser.parse(that.zFunctionText).toJSFunction(['x', 'y']);

      var meshFunction = function (x, y) {
        x = that.xRange * x + that.xMin;
        y = that.yRange * y + that.yMin;
        var z = zFunc(x, y); // = Math.cos(x) * Math.sqrt(y);

        if (isNaN(z)) return new THREE.Vector3(0, 0, 0);
        // TODO: better fix
        else return new THREE.Vector3(x, y, z);
      };

      // true => sensible image tile repeat...
      var graphGeometry = new THREE.ParametricGeometry(
        meshFunction,
        segments,
        segments,
        true
      );

      // /////////////////////////////////////////////
      // calculate vertex colors based on Z values //
      // /////////////////////////////////////////////
      graphGeometry.computeBoundingBox();
      that.zMin = graphGeometry.boundingBox.min.z;
      that.zMax = graphGeometry.boundingBox.max.z;
      that.zRange = that.zMax - that.zMin;

      var color, point, face, numberOfSides, vertexIndex;
      // faces are indexed using characters
      var faceIndices = ['a', 'b', 'c', 'd'];
      // first, assign colors to vertices as desired
      for (var i = 0; i < graphGeometry.vertices.length; i++) {
        point = graphGeometry.vertices[i];
        color = new THREE.Color(0x0000ff);
        color.setHSL((0.7 * (that.zMax - point.z)) / that.zRange, 1, 0.5);
        graphGeometry.colors[i] = color; // use this array for convenience
      }
      // copy the colors as necessary to the face's vertexColors array.
      for (var i = 0; i < graphGeometry.faces.length; i++) {
        face = graphGeometry.faces[i];
        numberOfSides = face instanceof THREE.Face3 ? 3 : 4;
        for (var j = 0; j < numberOfSides; j++) {
          vertexIndex = face[faceIndices[j]];
          face.vertexColors[j] = graphGeometry.colors[vertexIndex];
        }
      }
      that.graphGeometry = graphGeometry;

      that.scene = new THREE.Scene();
      if (!that.renderer) {
        if (that.webgl) {
          that.renderer = new THREE.WebGLRenderer({ antialias: true });
        } else {
          that.renderer = new THREE.CanvasRenderer();
        }
        that.renderer.setClearColor(0xeeeeee, 1);
      }

      that.dom.append(that.renderer.domElement);

      that.addFloor(that.scene);
    }
  });

  return View;
});
