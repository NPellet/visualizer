define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util', 'underscore', 'threejs', 'components/three.js/examples/js/controls/TrackballControls'], function(Default, Traversing, API, Util, _) {
  
  var TOOLTIP_WIDTH = 100;
  $.fn.listHandlers = function(events, outputFunction) {
    return this.each(function(i){
      console.log('hello a');
      var elem = this,
      dEvents = $(this).data('events');
      console.log(this);
      if (!dEvents) {console.log('hello d'); return;}
      $.each(dEvents, function(name, handler){
        console.log('hello c');
        if((new RegExp('^(' + (events === '*' ? '.+' : events.replace(',','|').replace(/^on/i,'')) + ')$' ,'i')).test(name)) {
          $.each(handler, function(i,handler){
            console.log('hello b');
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
        pointerObjects = intersects;
        lastMouseMoveEvent = event;
        if(intersects.length > 0){
          console.log(self._data.data[intersects[0].object.data.serie].label[intersects[0].object.data.index]);
        }
      }
      
      function showTooltip() {
        if(pointerObjects.length === 0) {
          return;
        }
        var data = self._data.data[pointerObjects[0].object.data.serie];
        if(!data.label){
          return;
        }
        
        var label = data.label[pointerObjects[0].object.data.index];
        $('#scatter3D_tooltip').css('left', lastMouseMoveEvent.offsetX - TOOLTIP_WIDTH);
        $('#scatter3D_tooltip').css('top', lastMouseMoveEvent.offsetY);
        $('#scatter3D_tooltip').css('width', TOOLTIP_WIDTH);
        $('#scatter3D_tooltip').html(label)
        $('#scatter3D_tooltip').show();
        console.log('tooltip show object: ', pointerObjects[0]);
        console.log(lastMouseMoveEvent);
      }
      
      
      function hideTooltip() {
        $('#scatter3D_tooltip').hide();
        console.log('hide tooltip');
      }

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
				container.appendChild(self.renderer.domElement);
        console.log(container);
        
        console.log(self.dom);
        $(self.dom).append( '<div id="scatter3D_tooltip" style="z-index: 10000; position:absolute; top: 20px; width:' + TOOLTIP_WIDTH + 100 + 'px; height: auto; background-color: #f9edbe;"> </div>');
        $('#scatter3D_tooltip').hide();


				//window.addEventListener( 'resize', onWindowResize, false );
        onWindowResize();
        // $(self.renderer.domElement).off('mousedown', onMouseDown);
        // $(self.renderer.domElement).on('mousedown', onMouseDown);
        
        function onHover() {
          if(pointerObjects.length > 0) {
            var i = pointerObjects[0].object.data.serie;
            var j = pointerObjects[0].object.data.index;
            self.module.controller.onHover(self._data.data[i].info[j]);
          }
        }
        
        console.log('Init three js');
        // self.renderer is recreated each time in init() so we don't need to 'off' events
        $(self.renderer.domElement).on('mousemove', _.throttle(onMouseMove, 200));
        $(self.renderer.domElement).on('mousemove', _.debounce(showTooltip, 500));
        $(self.renderer.domElement).on('mousemove', _.throttle(hideTooltip, 500));
        $(self.renderer.domElement).on('mousemove', _.throttle(onHover, 300));
        
        $(self.renderer.domElement).listHandlers('mousemove', function(a, b) { console.log(a,b);});

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
          if(i===0 && j===0) {
            self.module._data = value.data[j].info[i];
          }
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
          $.extend(mesh, {
            data: {
              serie: j,
              index: i,
            }
          });
          this.scene.add( mesh );
        }
      }
      
      this.renderer.render(self.scene, self.camera);
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

			this.updateOptions();

			if (this.DEBUG) console.log("Scatter 3D: ID: "+this._id);

			this._data=[];	// the data that will be sent to FLOT
      
		},
		

		inDom: function() {
			if (this.DEBUG) console.log("Scatter 3D: inDom");

		},

		onResize: function() {
			if (this.DEBUG) console.log("Scatter 3D: onResize");
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
      
      API.killHighlight( self.module.getId());
      var highlightSet = {};
      console.log("-----")
      console.log(self._data);
      for(var i=0; i<self._data.data.length; i++) {
        console.log('setting highlights: ', self._data.data[i]._highlight);
        for(var j=0; j<self._data.data[i]._highlight.length; j++) {
          highlightSet[self._data.data[i]._highlight[j].toString()] = self._data.data[i]._highlight[j];
        }
      }
			
      _.keys(highlightSet).forEach(function(key){
        API.listenHighlight( {_highlight: highlightSet[key]}, function( onOff, key ) {
          console.log('-- Listening to highlight ', key, '(is '+ (onOff ? 'on': 'off') + ')');
          // console.log(onOff, key, currentDataPoint);
        
        }, false, self.module.getId());
        
      });
      
      
      
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

				this._data = moduleValue.get();
        
        console.log('moduleValue.get(): ', this._data);

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
				if (this.DEBUG) console.log("Scatter 3D: update from array");
				this._data=moduleValue.get();
				this.loadedData.resolve();
			}
		},
		
		_convertChartToData: function(value) {
			this._data = [];
			var self=this;
			if ( ! value.data instanceof Array || ! value.data[0] || ! value.data[0].y instanceof Array) return;
			if (value.data.length>0) {
				console.log("Scatter 3D module can only display the first serie of data")
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


	 		var cfg = $.proxy( this.module.getConfiguration, this.module );

			this._options.test=cfg('nodeSize') || 1;

		}


	});

	return view;
});