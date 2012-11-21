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

			var view = this;
			var type = CI.DataType.getType(moduleValue);
			CI.DataType.toScreen(moduleValue, this.module, this._id).done(function(mol) {
				view._molecule = mol;
				var atoms = view._molecule.atoms;
				if(canDoAtomLabels) {
					for(var i = 0, l = this._atomLabels.length; i < l; i++) {
						atoms[i].altLabel = this._atomLabels[i] || null;
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
				this.update2.mol2d.call(this.update2, this._lastMol, true);
		}
	},
	
	drawMolecule: function() {

		if(!this._width || !this._height || !this._molecule || !this._canvas)
				return;

		var dim = this._molecule.getDimension();

		var ratio = Math.max(this._width / dim.x, this._height / dim.y);
		if(this._canvas._domcanvas)
			this._canvas._domcanvas.width = this._width;
		
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

			CI.RepoHighlight.listen(moduleValue._highlight, function(dummyvalue, commonKeys) {
				var canvas = self._canvas;
				var commonKeys2 = {};
				var atoms = {};
				for(var i = commonKeys.length; i >= 0; i--)
					atoms[moduleValue._atomID.indexOf(commonKeys[i])] = true;
				for(var i = 0; i < molLoaded.atoms.length; i++) {
					molLoaded.atoms[i].isHover = !!atoms[i] && dummyvalue;
					canvas._domcanvas.width = canvas._domcanvas.width;
					molLoaded.atoms[i].drawChildExtras = !!atoms[i] && dummyvalue;
				}
				canvas.repaint();
			}, true);
		}
	}
}

 
