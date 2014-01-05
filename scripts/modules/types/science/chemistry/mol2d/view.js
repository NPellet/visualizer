define(['modules/defaultview','util/api','util/util','util/datatraversing', 'util/typerenderer', 'ChemDoodle'], function(Default, API, Util, Traversing, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			this._id = Util.getNextUniqueId();
			//this.dom = $('<canvas id="' + this._id + '"></div>');
			this.module.getDomContent().html(this.dom);
			this._highlighted = {};

			this.typeToScreen.molfile2D = this.typeToScreen.mol2d;
		},
		
		inDom: function() {

		},

		onResize: function() {

			this._height = this.height - 20;
			this._width = this.width - 20;

			if( this.def && this.def.canvas ) {
				this.def.canvas.resize( this._width , this._height );
			}
			
			this.drawMolecule( );
		},

		blank: {
			mol2d: function() {
				var view = this;
				API.killHighlight( this.module.id );
				view.module.getDomContent( ).empty( );
			}
		},
		
		update: {
			'mol2d': function(moduleValue, canDoAtomLabels) {
				
				if( ! moduleValue ) {
					return;
				}

				if( ! moduleValue.get( ) ) {
					return;
				}

				API.killHighlight( this.module.id );
				this._lastMol = moduleValue;
				
				var self = this,
					type = Traversing.getType(moduleValue),
					def = Renderer.toScreen(moduleValue, this.module, this._id);

				this.def = def;
				this.def.always(function(mol) {

					self.module.getDomContent( ).empty( );
					self.module.getDomContent( ).html( mol );

					if( ! self.def.build ) {
						return;
					}

					self.def.build( );

					self._molecule = self.def.canvas;
					var atoms = self._molecule.atoms;

					if( canDoAtomLabels && self._atomLabels ) {
						for(var i = 0, l = self._atomLabels.length; i < l; i++) {
							if( atoms[ i ] ) {
								atoms[ i ].altLabel = self._atomLabels[ i ] == "" ? null : (self._atomLabels[ i ] || null);
							}
						}
					} else {
						this._atomLabels = false;
					}

					self.def.canvas.CIOnMouseMove(function(e) {

						var b, radius = self.def.canvas.specs.atoms_font_size_2D;
						var x = e.offsetX, y = e.offsetY;
						

						if( moduleValue._atoms && moduleValue._highlight ) {

							x -= this.width / 2; x /= this.specs.scale; x += this.width / 2; 
							y -= this.height / 2; y /= this.specs.scale; y += this.height / 2;

							for( var i = 0, l = self.def.molecule.atoms.length; i < l; i++ ) {

								if(self.def.molecule.atoms[i].textBounds.length > 0) {
									inside = false;
									for(var j = 0, k = self.def.molecule.atoms[i].textBounds.length; j < k; j++) {
										b = self.def.molecule.atoms[i].textBounds[j];

										if(b.x < x && b.x + b.w > x && b.y < y && b.y + b.h > y) {
											self._doHighlight(i, true);
											inside = true;
											break;
										}
									}

									if(!inside) {
										self._doHighlight(i, false);
									}
									
								} else {
									var difX = x - self.def.molecule.atoms[i].x;
									var difY = y - self.def.molecule.atoms[i].y;
									if(Math.pow(Math.pow(difX, 2) + Math.pow(difY, 2), 0.5) < this.specs.atoms_font_size_2D) {
										self._doHighlight(i, true);
									} else {
										self._doHighlight(i, false);
									}
								}
							}
						}
					});
				});
			},

			'atomLabels': function(moduleValue) {
				this._atomLabels = moduleValue;

				if(this._lastMol) {
					this.update.mol2d.call( this, this._lastMol, true );
				}
			}
		},
		
		drawMolecule: function() {

			if(!this._width || !this._height || !this.def || !this.def.molecule || !this.def.canvas) {
				return;
			}
		},
		
		getDom: function() {

			return this.dom;
		},
		
		_doHighlight: function(id, val) {

			if(this._highlighted[id] && val) {
				return;
			}

			if(!this._highlighted[id] && !val) {
				return;
			}
			
			this._highlighted[id] = val;

			for(var i in this._lastMol._atoms) {
				if(this._lastMol._atoms[i].indexOf(id) > -1) {
					API.highlight(i, val);
				}
			}
		},

		typeToScreen: {

			'mol2d': function(deferred, moduleValue) {
				var self = this;

				if(!this._canvas) {
					return;
				}
				
				var molLoaded = ChemDoodle.readMOL(moduleValue.value);
				molLoaded.scaleToAverageBondLength(30);
				deferred.resolve(molLoaded);
				self._currentValue = moduleValue;
				molLoaded._highlights = molLoaded._highlights || {};
				
				API.killHighlight( this.module.id );

				API.listenHighlight( moduleValue._highlight, function(value, commonKeys) {

					var canvas = self._canvas;
					var commonKeys2 = {};
					var atoms = {};
					molLoaded._highlights = molLoaded._highlights || {};
					for(var i = commonKeys.length - 1; i >= 0; i--) {

						atoms = moduleValue._atoms[commonKeys[i]]; // [0, 1, 15, 12]
						
						if(!atoms) {
							continue;
						}

						for(var j = atoms.length - 1; j >= 0; j--) {
							molLoaded.atoms[atoms[j]].isHover = value;
						}
					}

					canvas._domcanvas.width = canvas._domcanvas.width; // Erase canvas
					
					for(var i = 0; i < molLoaded.atoms.length; i++) {
						molLoaded.atoms[i].drawChildExtras = true;
					}

					canvas.repaint();
					
				}, true, this.module.id);
			}	
		}
	});

	return view;
});
 
 