 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

 
if(typeof CI.Module.prototype._types.mol2d == 'undefined')
	CI.Module.prototype._types.mol2d = {};

CI.Module.prototype._types.mol2d.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.mol2d.View.prototype = {
	
	init: function() {	
		this._id = BI.Util.getNextUniqueId();
		this.dom = $('<canvas id="' + this._id + '"></div>');
		this.module.getDomContent().html(this.dom);
		

		this.typeToScreen.molfile2D = this.typeToScreen.mol2d;
	},
	
	inDom: function() {

		var canvas = new ChemDoodle.ViewerCanvas(this._id, 100, 100);

		canvas.specs.backgroundColor = "transparent";
		canvas.specs.bonds_width_2D = .6;
		canvas.specs.bonds_saturationWidth_2D = .18;
		canvas.specs.bonds_hashSpacing_2D = 2.5;
		canvas.specs.atoms_font_size_2D = 10;
		canvas.specs.atoms_font_families_2D = ['Helvetica', 'Arial', 'sans-serif'];
		canvas.specs.atoms_displayTerminalCarbonLabels_2D = true;

		this._canvas = canvas;

	},

	onResize: function(width, height) {

		this._height = height - 20;
		this._width = width - 20;
		this._canvas.resize(width - 20, height - 20);
		this.drawMolecule();
	},
	
	update2: {
		'mol2d': function(moduleValue, canDoAtomLabels) {
			
			if(moduleValue === undefined)
				return;

			this._lastMol = moduleValue;

			var view = this, self = this;
			var type = CI.DataType.getType(moduleValue);

			CI.DataType.toScreen(moduleValue, this.module, this._id).done(function(mol) {
				view._molecule = mol;
				var atoms = view._molecule.atoms;
				if(canDoAtomLabels && self._atomLabels) {
					for(var i = 0, l = self._atomLabels.length; i < l; i++) {
						atoms[i].altLabel = self._atomLabels[i] == "" ? null : (self._atomLabels[i] || null);
					}
				} else {
					this._atomLabels = false;
				}

				view.drawMolecule();
			});
		},

		'atomLabels': function(moduleValue) {
			this._atomLabels = moduleValue;

			if(this._lastMol)
				this.update2.mol2d.call(this, this._lastMol, true);
		}
	},
	
	drawMolecule: function() {

		if(!this._width || !this._height || !this._molecule || !this._canvas)
				return;

		var dim = this._molecule.getDimension();

		var ratio = Math.max(this._width / dim.x, this._height / dim.y);
		if(this._canvas._domcanvas)
			this._canvas._domcanvas.width = this._width;
		
		
		var ratio = Math.min(1, ratio);
		this._molecule.scaleToAverageBondLength(30 * ratio);

		this._canvas.specs.atoms_font_size_2D = 10 * ratio;
		this._canvas.specs.bonds_hashSpacing_2D = 2.5 * ratio;
		this._canvas.specs.bonds_width_2D = .6 * ratio;
		//this._canvas.specs.bonds_saturationWidth_2D = .18 * ratio;
		this._canvas.loadMolecule(this._molecule);
	},
	
	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {

		'mol2d': function(deferred, moduleValue) {
			var self = this;
			var molLoaded = ChemDoodle.readMOL(moduleValue.value);
			molLoaded.scaleToAverageBondLength(30);
			deferred.resolve(molLoaded);
			molLoaded._highlights = molLoaded._highlights || {};
			self._canvas.CIOnMouseMove(function(e) {
				var b, radius = self._canvas.specs.atoms_font_size_2D;
				var x = e.offsetX, y = e.offsetY;
				

				if(moduleValue._atomID && moduleValue._highlight) {
					x -= this.width / 2; x /= this.specs.scale; x += this.width / 2; 
					y -= this.height / 2; y /= this.specs.scale; y += this.height / 2;

					for(var i = 0, l = molLoaded.atoms.length; i < l; i++) {

						if(molLoaded.atoms[i].textBounds.length > 0) {
							inside = false;
							for(var j = 0, k = molLoaded.atoms[i].textBounds.length; j < k; j++) {
								b = molLoaded.atoms[i].textBounds[j];

								if(b.x < x && b.x + b.w > x && b.y < y && b.y + b.h > y) {
									inside = true;
									if(moduleValue._atomID[i] && !molLoaded._highlights[moduleValue._atomID[i]])
										CI.RepoHighlight.set(moduleValue._atomID[i], 1);
								}
							}

							if(moduleValue._atomID[i] && !inside && molLoaded._highlights[moduleValue._atomID[i]]) {

								CI.RepoHighlight.set(moduleValue._atomID[i], 0);
							}
						} else {
							var difX = x - molLoaded.atoms[i].x;
							var difY = y - molLoaded.atoms[i].y;
							
							if(Math.pow(Math.pow(difX, 2) + Math.pow(difY, 2), 0.5) < this.specs.atoms_font_size_2D) {
								// Ok inside
								if(moduleValue._atomID[i] && !molLoaded._highlights[moduleValue._atomID[i]])
										CI.RepoHighlight.set(moduleValue._atomID[i], 1);
							} else {
								// Do not send
								if(moduleValue._atomID[i] && molLoaded._highlights[moduleValue._atomID[i]])
										CI.RepoHighlight.set(moduleValue._atomID[i], 0);
							}
						}
					}
				}
			});

			CI.RepoHighlight.listen(moduleValue._highlight, function(value, commonKeys) {
				var canvas = self._canvas;
				var commonKeys2 = {};
				var atoms = {};


				molLoaded._highlights = molLoaded._highlights || {};
				for(var i = 0; i < commonKeys.length; i++) 
					molLoaded._highlights[commonKeys[i]] = value;


				for(var i = commonKeys.length; i >= 0; i--)
					atoms[moduleValue._atomID.indexOf(commonKeys[i])] = true;


				for(var i = 0; i < molLoaded.atoms.length; i++) {
					molLoaded.atoms[i].isHover = molLoaded._highlights[moduleValue._atomID[i]];
					canvas._domcanvas.width = canvas._domcanvas.width;
					molLoaded.atoms[i].drawChildExtras = true;
				}

				canvas.repaint();
			}, true);
		}
	}
}

 
