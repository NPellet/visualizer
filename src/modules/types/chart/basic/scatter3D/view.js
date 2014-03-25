define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util', 'underscore', 'threejs', 'components/three.js/examples/js/controls/TrackballControls'], function(Default, Traversing, API, Util, _) {
  
  
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		DEBUG: true,


    _initThreejs: function() {
      var self = this;
			var container;
      
			init();
			animate();
      
      function onMouseDown(event) {
        // event.preventDefault();
        var vector = new THREE.Vector3(
          ( event.offsetX / $(self.renderer.domElement).width() ) * 2 - 1,
          - ( event.offsetY / $(self.renderer.domElement).height() ) * 2 + 1,
          0.5
        );
        projector = new THREE.Projector();
        projector.unprojectVector( vector, self.camera );

        var ray = new THREE.Raycaster( self.camera.position, 
          vector.sub( self.camera.position ).normalize() );

        var intersects = ray.intersectObjects(self.scene.children);
        console.log(intersects);
      }
      
      function onMouseMove(event) {
        var vector = new THREE.Vector3(
          ( event.offsetX / $(self.renderer.domElement).width() ) * 2 - 1,
          - ( event.offsetY / $(self.renderer.domElement).height() ) * 2 + 1,
          0.5
        );
        projector = new THREE.Projector();
        projector.unprojectVector( vector, self.camera );

        var ray = new THREE.Raycaster( self.camera.position, 
          vector.sub( self.camera.position ).normalize() );

        var intersects = ray.intersectObjects(self.scene.children);
        console.log(intersects);
      }
      
      var onMouseMoveThrottle = _.throttle(onMouseMove, 200);

			function init() {
        if(!self.camera) {
          self.camera = new THREE.PerspectiveCamera( 60, self.dom.width() / self.dom.height(), 1, 10000 );
          self.camera.position.z = 500;
        }

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
        self.renderer.setClearColor('#eeeeee', 1);
				self.renderer.setSize( window.innerWidth, window.innerHeight );

				container = document.getElementById(self.dom.attr('id'));
        container.innerHTML = '';
        console.log(self.renderer.domElement);
				container.appendChild( self.renderer.domElement );
        console.log(container);
        
        console.log(self.dom);
        // $(self.dom).append('<div style="z-index: 10000; position:absolute; top: 20px;"> Hello world </div>');

				//

				//window.addEventListener( 'resize', onWindowResize, false );
        onWindowResize();
        // $(self.renderer.domElement).off('mousedown', onMouseDown);
        // $(self.renderer.domElement).on('mousedown', onMouseDown);
        
        // $(self.renderer.domElement).off('mousemove', onMouseMoveThrottle);
        $(self.renderer.domElement).on('mousemove', _.throttle(onMouseMove, 200));

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

			}
      
    },
    
    _plotPoints: function(value) {
      var self = this;
      
      // Remove all objects
      this.scene.traverse(function(obj) {
        self.scene.remove(obj);
      });
      
      var maxX = Math.max.apply(null, value.data[1].x);
      var oX = Math.min.apply(null, value.data[1].x);
      var maxY = Math.max.apply(null, value.data[1].y);
      var oY = Math.min.apply(null, value.data[1].y);
      var maxZ = Math.max.apply(null, value.data[1].z);
      var oZ = Math.min.apply(null, value.data[1].z);
      console.log('Max X: ', maxX);
      var vX = new THREE.Vector3( maxX, 0, 0 );
      var vY = new THREE.Vector3(0, maxY, 0);
      var vZ = new THREE.Vector3(0,0,maxZ);
      var origin = new THREE.Vector3( 0, 0, 0 );
      var length = maxX;
      var hex = 0x000000;

      var axX = new THREE.ArrowHelper( vX, origin, maxX, hex );
      var axY = new THREE.ArrowHelper( vY, origin, maxY, hex );
      var axZ = new THREE.ArrowHelper( vZ, origin, maxZ, hex );
      
      this.scene.add(axX);
      this.scene.add(axY);
      this.scene.add(axZ);
      
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
      
      
      
      var light1 = new THREE.DirectionalLight( 0xffffff, 1000 );
      light1.position.set( 1, 1, 1 );
      var light2 = new THREE.DirectionalLight(0xffffff, 1000);
      light2.position.set( -1, -1, -1 );
      // self.scene.add( light );
      // 
      // light = new THREE.DirectionalLight( 0x002288 );
      // light.position.set( -1, -1, -1 );
      // self.scene.add( light );
      
      // var light = new THREE.AmbientLight( 0x404040 );
      self.scene.add(light1);
      self.scene.add(light2);
      
      // Add all data levels in one graph
      for(var j=0; j<value.data.length; j++) {
        for ( var i = 0; i < value.data[j].x.length; i++ ) {
          var radius = 5;
          var color = '#000000';
          if(value.data[j].size && value.data[j].size[i]) {
            radius = value.data[j].size[i];
          }
          if(value.data[j].color && value.data[j].color[i]) {
            color = value.data[j].color[i];
          }
          
          var geometry = new THREE.SphereGeometry( radius, 32, 32 );
    			var material =  new THREE.MeshLambertMaterial( { color: new THREE.Color(color), shading: THREE.FlatShading } );

          var mesh = new THREE.Mesh( geometry, material );
          mesh.position.x = value.data[j].x[i];
          mesh.position.y = value.data[j].y[i];
          mesh.position.z = value.data[j].z[i];
          mesh.updateMatrix();
          mesh.matrixAutoUpdate = false;
          this.scene.add( mesh );
        }
      }
      
      this.renderer.render(self.scene, self.camera);
    },
    
    
		init: function() {
			if (this.DEBUG) console.log("Pie Chart: init");

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

			this.updateOptions();

			


			if (this.DEBUG) console.log("Pie Chart: ID: "+this._id);

			this._data=[];	// the data that will be sent to FLOT
      

		},
		

		inDom: function() {
			if (this.DEBUG) console.log("Pie Chart: inDom");

		},

		onResize: function() {
			if (this.DEBUG) console.log("Pie Chart: onResize");
      this._initThreejs();
			var self=this;
			// the size is now really defined (we are after inDom)
			// and we received the data ...
			this.loadedData.done(function() {
        console.log('loadedData done');
        if(self._data) {
          self._plotPoints(self._data);
        }
			})
		},
		
		/* When a value changes this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {
			'chart': function(moduleValue) {
				if (this.DEBUG) console.log("Pie Chart: update from chart object");
        
				if (! moduleValue.get() ){ 
          console.log('unvalid value', moduleValue);
          return;
        }

				this._data = moduleValue.get();

				// data are ready to be ploteed
        console.log('state:', this.loadedData.state());
        if(this.loadedData.state() === 'pending') {
  				this.loadedData.resolve();
        }
        else {
          console.log("points changed");
          this._plotPoints(this._data);
        }
			},
			'yArray': function(moduleValue) {
				if (this.DEBUG) console.log("Pie Chart: update from array");
				this._data=moduleValue.get();
				this.loadedData.resolve();
			}
		},
		
		_convertChartToData: function(value) {
			this._data = [];
			var self=this;
			if ( ! value.data instanceof Array || ! value.data[0] || ! value.data[0].y instanceof Array) return;
			if (value.data.length>0) {
				console.log("Pie Chart module can only display the first serie of data")
			}
			var y=value.data[0].y;
			var highlight=value.data[0]._highlight;
			var infos=value.data[0].info;
			for (var i = 0; i < y.length; i++) {
				this._data[i] = {
					data: y[i]
				}
				if (highlight instanceof Array && highlight.length>i) {
					if (highlight[i] instanceof Array) {
						this._data[i]._highlight=highlight[i];
					} else {
						this._data[i]._highlight=[highlight[i]];
					}
				}
				if (infos instanceof Array && infos.length>i) {
					// Data can be retrieved async so to fetch an information from the "info" object we need this strange code
					Traversing.getValueFromJPath(infos[i],"element.name").done(function(elVal) {
						self._data[i].label=elVal;
						self._data[i].info=infos[i];
					});
				}				
			}
		},

		updateOptions: function() {
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


	 		var cfg = $.proxy( this.module.getConfiguration, this.module );

			this._options.test=cfg('nodeSize') || 1;

		}


	});

	return view;
});