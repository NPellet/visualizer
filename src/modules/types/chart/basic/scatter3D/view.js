define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util', 'threejs', 'components/three.js/examples/js/controls/TrackballControls'], function(Default, Traversing, API, Util) {
  
  
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		DEBUG: true,


    _initThreejs: function() {
      var self = this;

			var container;

			var camera, controls, scene, renderer;

			var cross;

			init();
			animate();
      
      function onMouseDown(event) {
        // event.preventDefault();
        var vector = new THREE.Vector3(
          ( event.offsetX / $(renderer.domElement).width() ) * 2 - 1,
          - ( event.offsetY / $(renderer.domElement).height() ) * 2 + 1,
          0.5
        );
        projector = new THREE.Projector();
        projector.unprojectVector( vector, camera );

        var ray = new THREE.Raycaster( camera.position, 
          vector.sub( camera.position ).normalize() );

        var intersects = ray.intersectObjects(scene.children);
        console.log(intersects);

        // if ( intersects.length > 0 ) {
        //   intersects[ 0 ].object.materials[ 0 ].color.setHex( Math.random() * 0xffffff );
        // }
      }

			function init() {

				camera = new THREE.PerspectiveCamera( 60, self.dom.width() / self.dom.height(), 1, 1000 );
				camera.position.z = 500;

				controls = new THREE.TrackballControls( camera, self.dom.get(0) );

				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;

				controls.noZoom = false;
				controls.noPan = false;

				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;

				controls.keys = [ 65, 83, 68 ];

				controls.addEventListener( 'change', render );

				// world

				scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

        // var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
        var geometry = new THREE.SphereGeometry( 5, 32, 32 );
				var material =  new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );

				for ( var i = 0; i < 500; i ++ ) {

					var mesh = new THREE.Mesh( geometry, material );
					mesh.position.x = ( Math.random() - 0.5 ) * 1000;
					mesh.position.y = ( Math.random() - 0.5 ) * 1000;
					mesh.position.z = ( Math.random() - 0.5 ) * 1000;
					mesh.updateMatrix();
					mesh.matrixAutoUpdate = false;
					scene.add( mesh );

				}


				// lights

				light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 1, 1, 1 );
				scene.add( light );

				light = new THREE.DirectionalLight( 0x002288 );
				light.position.set( -1, -1, -1 );
				scene.add( light );

				light = new THREE.AmbientLight( 0x222222 );
				scene.add( light );


				// renderer

				renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.setClearColor( scene.fog.color, 1 );
				renderer.setSize( window.innerWidth, window.innerHeight );

				container = document.getElementById(self.dom.attr('id'));
        container.innerHTML = '';
        console.log(renderer.domElement);
				container.appendChild( renderer.domElement );
        console.log(container);
        
        

				//

				//window.addEventListener( 'resize', onWindowResize, false );
        onWindowResize();
        $(renderer.domElement).off('mousedown', onMouseDown);
        $(renderer.domElement).on('mousedown', onMouseDown);

			}

			function onWindowResize() {

				camera.aspect = self.dom.width() / self.dom.height();
				camera.updateProjectionMatrix();

				renderer.setSize( self.dom.width(), self.dom.height() );

				controls.handleResize();

				render();

			}

			function animate() {

				requestAnimationFrame( animate );
				controls.update();

			}

			function render() {

				renderer.render( scene, camera );

			}
      
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
				self._plot=$.plot("#"+self._id, self._data, self._options);

				$("#"+self._id).bind("plotclick", function (event, pos, item) {
				    if (item) {
				      	cconsole.log(item.dataIndex, item.seriesIndex);
				    }
				});
				$("#"+self._id).bind("plothover", function (event, pos, item) {
				    if (item) {
				    	self.module.controller.elementHover(self._data[item.seriesIndex]);
				    } else {
				    	self.module.controller.elementOut();
				    }
				});

				for (var i=0; i<self._data.length; i++) {
					var currentDataPoint=i;
					API.listenHighlight( self._data[i], function( onOff, key ) {

						// we need to highlight the correct shape ...
						console.log(onOff, key, currentDataPoint);
						if (onOff) {
							console.log(i);
							self._plot.highlight(0, currentDataPoint);
						} else {
							self._plot.unhighlight(0, currentDataPoint);
						}
					});
				}
        
				


			})
		},
		
		/* When a vaue change this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {
			'chart': function(moduleValue) {
				if (this.DEBUG) console.log("Pie Chart: update from chart object");

				if (! moduleValue || ! moduleValue.value) return;

				this._convertChartToData(moduleValue.get());

				// data are ready to be ploteed
				this.loadedData.resolve();
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