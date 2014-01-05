define(['modules/defaultview','util/util','util/api','libs/three/three.min'], function(Default, Util, API) {
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {
			console.log("INIT");

			var self=this;

			this.webgl = ( function () {
				try {
					return !! window.WebGLRenderingContext && 
						!! document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
					} catch( e ) {
						return false;
					}
				}
			)();

			
			var cfg = $.proxy(self.module.getConfiguration, self.module);

			this._id = Util.getNextUniqueId();
			$block = $('<div>',{Id: this._id }) ;
			$block.css('display', 'table').css('height', '100%').css('width', '100%').css("overflow","hidden") ; //.css("background","#33ccff");
			this.dom = $block ;
			this.module.getDomContent().html(this.dom) ;

			this.zFunctionText=cfg('function')||"sin(sqrt(0.01*x^2  + 0.01*y^2))*10";
			this.xMin=cfg('xMin')||-100;
			this.xMax=cfg('xMax')||100;
			this.yMin=cfg('yMin')||-100;
			this.yMax=cfg('yMax')||100;
			this.zMin=cfg('zMin')||-100;
			this.zMax=cfg('zMax')||100;
			this.xRange=this.xMax-this.xMin;
			this.yRange=this.yMax-this.yMin;

			
			
			if (this.scene) {
				console.log(this.scene.__webglObjects);
			//	this.scene.remove

				this.scene.remove(this.graphGeometry);
				this.scene.remove(this.graphMesh);
				this.scene.remove(this.floor);
				delete this.graphGeometry;
				delete this.graphMesh;
				delete this.floor;
				console.log(this.scene.__webglObjects);
			}
			this.graphGeometry;
			this.graphMesh;

			this.onReady = $.Deferred();
			require(['libs/three/js/controls/TrackballControls','libs/parser/Parser'], function() {
				
				self.createGraph();


				self.scene = new THREE.Scene();
				console.log(self.scene.__webglObjects);

				if (! self.renderer) {
					if (self.webgl) {
						self.renderer = new THREE.WebGLRenderer( {antialias:true});
					} else {
						self.renderer = new THREE.CanvasRenderer();
					}
					self.renderer.setClearColor( 0xEEEEEE, 1 );
				}

console.log(self.renderer.domElement);

				self.dom.append(self.renderer.domElement);

				self.addFloor(self.scene);
				self.onReady.resolve();
			});

	

			// This should reduce CPU if the mouse if not over and we can not move the object
			// this is only valid for non animated graph
			this.doAnimation=false;
			
			this.dom.on("mouseenter",function(){
				self.doAnimation=true;
			}) ;

			this.dom.on("mouseleave",function(){
				self.doAnimation=false;
			}) ;


		},


		blank: function() {
			this.dom.empty();
		},


		inDom: function() {
		},

		onResize: function() {
			
			if (!this.webgl) return;
			var self=this;

			this.onReady.done(function() {
				console.log("RESIZE: "+self.height+" - "+self.width);
				var cfg = $.proxy(self.module.getConfiguration, self.module);
				var segments=cfg('segments');

				///////////////////////
				// end vertex colors //
				///////////////////////
				
				// material choices: vertexColorMaterial, wireMaterial , normMaterial , shadeMaterial

				if (self.graphMesh) {
					self.scene.remove( self.graphMesh );
				}

				var wireTexture = new THREE.ImageUtils.loadTexture( 'scripts/libs/three/images/square.png' );
				wireTexture.wrapS = wireTexture.wrapT = THREE.RepeatWrapping; 
				wireTexture.repeat.set( 40, 40 );
				var wireMaterial = new THREE.MeshBasicMaterial( { map: wireTexture, vertexColors: THREE.VertexColors, side:THREE.DoubleSide } );


				self.graphMesh = new THREE.Mesh( self.graphGeometry, wireMaterial );


				self.graphMesh.doubleSided = true;
				self.scene.add(self.graphMesh);

				self.renderer.setSize(self.width, self.height);

				self.setCamera();
				self.setControls();

				self.firstAnimation=60;
				self.animate();
				
			});

		},

		addFloor: function(scene) {
		//	scene.add( new THREE.AxisHelper() );
			var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000088, wireframe: true, side:THREE.DoubleSide } ); 
			var floorGeometry = new THREE.PlaneGeometry(1000,1000,10,10);
			self.floor = new THREE.Mesh(floorGeometry, wireframeMaterial);
			//floor.position.z = 0; // required, otherwise from time to time it is NaN !!!???
			// floor.rotation.x = Math.PI / 2;
			scene.add(self.floor);
		},


		update: {
			'function':function(data) {

			}
		},
		
		animate: function() {
			var self=this;
		    requestAnimationFrame( self.animate.bind(self) );
		    if (self.doAnimation || self.firstAnimation>0) {
		    	if (self.firstAnimation>0) self.firstAnimation--;
		    	self.renderer.render( self.scene, self.camera );		
				self.controls.update();	
		    }
		},



		setCamera: function() {
			var VIEW_ANGLE = 45, ASPECT = this.width / this.height, NEAR = 0.1, FAR = 20000;
			this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
			this.camera.position.set( 2*this.xMax, 0.5*this.yMax, 4*this.zMax);
			this.camera.up = new THREE.Vector3( 0, 0, 1 );
			this.camera.lookAt(this.scene.position);	
			this.scene.add(this.camera);
		},

		setControls: function() {
			this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
		},

		createGraph: function() {
			var self=this;
			var cfg = $.proxy(self.module.getConfiguration, self.module);
			var segments=cfg('segments');
			var zFunc = Parser.parse(self.zFunctionText).toJSFunction( ['x','y'] );

			var meshFunction = function(x, y) 
			{
				x = self.xRange * x + self.xMin;
				y = self.yRange * y + self.yMin;
				var z = zFunc(x,y); //= Math.cos(x) * Math.sqrt(y);

				if ( isNaN(z) )
					return new THREE.Vector3(0,0,0); // TODO: better fix
				else
					return new THREE.Vector3(x, y, z);
			};
			


			// true => sensible image tile repeat...
			var graphGeometry = new THREE.ParametricGeometry( meshFunction, segments, segments, true );
			
			///////////////////////////////////////////////
			// calculate vertex colors based on Z values //
			///////////////////////////////////////////////
			graphGeometry.computeBoundingBox();
			self.zMin = graphGeometry.boundingBox.min.z;
			self.zMax = graphGeometry.boundingBox.max.z;
			self.zRange = self.zMax - self.zMin;



			var color, point, face, numberOfSides, vertexIndex;
			// faces are indexed using characters
			var faceIndices = [ 'a', 'b', 'c', 'd' ];
			// first, assign colors to vertices as desired
			for ( var i = 0; i < graphGeometry.vertices.length; i++ ) 
			{
				point = graphGeometry.vertices[ i ];
				color = new THREE.Color( 0x0000ff );
				color.setHSL( 0.7 * (self.zMax - point.z) / self.zRange, 1, 0.5 );
				graphGeometry.colors[i] = color; // use this array for convenience
			}
			// copy the colors as necessary to the face's vertexColors array.
			for ( var i = 0; i < graphGeometry.faces.length; i++ ) 
			{
				face = graphGeometry.faces[ i ];
				numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
				for( var j = 0; j < numberOfSides; j++ ) 
				{
					vertexIndex = face[ faceIndices[ j ] ];
					face.vertexColors[ j ] = graphGeometry.colors[ vertexIndex ];
				}
			}
			self.graphGeometry=graphGeometry;

		},


		getDom: function() {
			return this.dom;
		},
		



	});

	return view;
});