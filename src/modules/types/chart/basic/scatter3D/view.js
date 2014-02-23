define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util', 'threejs', 'components/three.js/examples/js/controls/TrackballControls'], function(Default, Traversing, API, Util) {
  
  
	
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

        // if ( intersects.length > 0 ) {
        //   intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        // }
      }

			function init() {

				self.camera = new THREE.PerspectiveCamera( 60, self.dom.width() / self.dom.height(), 1, 1000 );
				self.camera.position.z = 500;

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

				// world

				self.scene = new THREE.Scene();
        self.scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

        // var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
        //         var geometry = new THREE.SphereGeometry( 5, 32, 32 );
        // var material =  new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );
        // 
        // for ( var i = 0; i < 500; i ++ ) {
        // 
        //   var mesh = new THREE.Mesh( geometry, material );
        //   mesh.position.x = ( Math.random() - 0.5 ) * 1000;
        //   mesh.position.y = ( Math.random() - 0.5 ) * 1000;
        //   mesh.position.z = ( Math.random() - 0.5 ) * 1000;
        //   mesh.updateMatrix();
        //   mesh.matrixAutoUpdate = false;
        //   self.scene.add( mesh );
        // 
        // }


				// lights

        // light = new THREE.DirectionalLight( 0xffffff );
        // light.position.set( 1, 1, 1 );
        // self.scene.add( light );
        // 
        // light = new THREE.DirectionalLight( 0x002288 );
        // light.position.set( -1, -1, -1 );
        // self.scene.add( light );
        // 
        // light = new THREE.AmbientLight( 0x222222 );
        // self.scene.add( light );


				// renderer

				self.renderer = new THREE.WebGLRenderer( { antialias: false } );
        self.renderer.setClearColor( self.scene.fog.color, 1 );
				self.renderer.setSize( window.innerWidth, window.innerHeight );

				container = document.getElementById(self.dom.attr('id'));
        container.innerHTML = '';
        console.log(self.renderer.domElement);
				container.appendChild( self.renderer.domElement );
        console.log(container);
        
        

				//

				//window.addEventListener( 'resize', onWindowResize, false );
        onWindowResize();
        $(self.renderer.domElement).off('mousedown', onMouseDown);
        $(self.renderer.domElement).on('mousedown', onMouseDown);

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
      var geometry = new THREE.SphereGeometry( 5, 32, 32 );
			var material =  new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );
      
      // Remove all objects
      this.scene.traverse(function(obj) {
        self.scene.remove(obj);
      });
      
			for ( var i = 0; i < value.data[0].x.length; i ++ ) {

				var mesh = new THREE.Mesh( geometry, material );
				mesh.position.x = value.data[0].x[i];
				mesh.position.y = value.data[0].y[i];
				mesh.position.z = value.data[0].z[i];
				mesh.updateMatrix();
				mesh.matrixAutoUpdate = false;
				this.scene.add( mesh );
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