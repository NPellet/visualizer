
/*
CI.Async = {};
CI.Async.trigger = function() {

}
CI.Async.stack = [];

CI.Async.instanceId = 0;
CI.Async.createInstance = function() {
	CI.Async.currentInstance = ++CI.Async.instanceId;
}

CI.Async.inDom = function(instanceId) {
	for(var i in CI.Async.instancesElements[instanceId])
		CI.Async.instancesElements[instanceId][i].getDeferred().resolve();
}

CI.Async.createAttribute = function(instanceId) {
	var attr = new CI.TemporaryAttr();
	CI.Async.instancesElements[instanceId].push(attr);
}

CI.Async.createDOM = function(instanceId) {
	var attr = new CI.TemporaryDOM();
	CI.Async.instancesElements[instanceId].push(attr);
}

CI.TemporaryAttr = function() {
	this._class = ".callback-load-attr-";
	this._class += ++CI.DataType.asyncId;
	this._deferred = $.Deferred();

	this._deferred.done(function() {
		// Do
		$(this._class).attr();
	});
}

CI.TemporaryAttr.prototype = {

	getClass: function() {
		return this._class;
	},

	getDeferred: function() {
		return this._deferred;
	}
}

*/
CI.DataType = {};

CI.DataType.asyncId = 0;

CI.DataType.Structures = {
	
	'object': "object",
	'mol2d': "string",
	'molfile2D': "string",
	'gif': "string" ,
	'picture': "string",
	'string': "string",
	'gif': "string",
	'jpg': "string",
	'png': "string",
	'number': "number",
	'mf': 'string',
	'jcamp': "string",

	'boolean': "boolean",
	'arrayXY': {
		'type': 'array',
		'elements': ['number', 'number']
	},

	'matrix': {

		'type': 'object'

	},

	'fromTo': {
		'type': 'object',
		'elements': {
			'from': 'number',
			'to': 'number'
		}
	},


	'loading': {
		'type': 'object',
		'elements': {
			'title': 'string',
			'series': {
				'type': 'array',
				'nbElements': 6,
				'elements': {
					'type': 'object',
					'elements': {
						'label': 'string',
						'data': {
							'type': 'array',
							'elements': {
								'type': 'object',
								'elements': {
									'a': 'number',
									'c': 'string',
									'h': 'number',
									'info': 'object',
									'l': 'string',
									'u': 'string',
									'n': 'string',
									'o': 'number',
									'w': 'number',
									'x': 'number',
									'y': 'number'
								}
							}
						}
					}
				}
			}

		}
	},


	'gridSelector': {
		'type': 'object',
		'elements': {
			'categories': {
				'type': 'array',
				'elements': {
					'type': 'object',
					'elements': {
						'selectorType': 'string',
						'name': 'string',
						'label': 'string',
						'defaultValue': 'number',
						'defaultMaxValue': 'number',
						'defaultMinValue': 'number',
						'maxValue': 'number',
						'minValue': 'number'
					} 
				}
			},

			'variables': {
				'type': 'array',
				'elements': {
					'type': 'object',
					'elements': {
						'name': 'string',
						'label': 'strig'
					}
				}
			}
		}
	},

	'chart': {

		"type": "object",
		"elements": {
			"serieLabels": {
				"type": "array",
				"elements": "string"
			},


			"series": {
				"type": "array",
				"elements": {
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"value": "number",
						},
						"otherElementsPossible": true
					}
				}
			},

			"title": "string",
			"x": {
				"type": "array",
				"elements": "number"
			},

			"xAxis": {
				"type": "object",
				"elements": {
					"label": "string",
					"maxValue": "number",
					"minValue": "number"
				}
			},

			"yAxis": {
				"type": "object",
				"elements": {
					"label": "string"
				}
			}
		}
	},

	'chemical': {
		"type": "object",
		"elements": {
			"_entryID": "int",
			"supplierName": "string",
			"iupac": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"value": "string",
						"language": "string"	
					}
				}
			},
			
			"mf": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"value": "mf",
						"mw": "int",
						"exactMass": "int" 
					}
				}
			},
			
			"mol": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"value": "molfile2D",
						"gif": "gif"
					}
				}
			},
			
			"rn": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"value": "int"
					}
				}
			},
			
			"bachID": "string",
			"catalogID": "string",
			"entryDetails": "chemicalDetails"
		}
	},
	
	"chemicalDetails": {
		"type": "object",
		"elements": {
			"_entryID": "int",
			"supplierName": "string",
			"iupac": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"value": "string",
						"language": "string"	
					}
				}
			},
			
			"mf": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"value": "mf",
						"mw": "int",
						"exactMass": "int" 
					}
				}
			},
			
			"mol": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"value": "molfile2D",
						"gif": "gif"
					}
				}
			},
			
			"rn": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"value": "int"
					}
				}
			},
			
			"bachID": "string",
			"catalogID": "string",
			
			"bp": {
				
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"pressure": "number",
						"high": "number",
						"low": "number"
					}
				}
				
			},
			
			"mp": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"pressure": "number",
						"high": "number",
						"low": "number"
					}
				}
				
			},
			
			"rn": {
				
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"value": "number"
					}
				}
				
			},
			
			"density": {
				
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"high": "number",
						"low": "number",
						"temperature": "number",
					}
				}
				
			},
			
			"mol3d": {
				"type": "array",
				"elements": "molfile3d"
			},
			
			"ir": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"conditions": "string",
						"solvent": "string",
						"jcamp": "jcamp",
						"view": {
							"type": "object",
							"elements": {
								"description": "string",
								"value": "string",
								"url": "string",
								"pdf": "string"
							}
						}
						
					}
					
				}
				
			},
			
			
			"nmr": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"pressure": "string",
						"solvent": "string",
						"experiment": "string",
						"frequency": "number",
						"nucleus": "string",
						"temperature": "string",
						"jcamp": "jcamp",
						"view": {
							"type": "object",
							"elements": {
								"description": "string",
								"value": "string",
								"url": "string",
								"pdf": "string"
							}
						}
						
					}
					
				}
				
			},
			
			
			
			"mass": {
				"type": "array",
				"elements": {
					"type": "object",
					"elements": {
						"experiment": "string",
						"jcamp": "jcamp"
					}
					
				}
				
			}
			
		}
	}
};


/* Returns the type of an element */
CI.DataType.getType = function(element) {
	
	if(element == undefined)
		return;
		
	var type = typeof element;

	if(type == 'object') {
		if(element instanceof Array)
			return "array";
		if(typeof element.type == "undefined")
			return "object";
		else if(CI.DataType.Structures[element.type])
			return element.type;
		else
			return console.error("Type " + element.type + " could not be found")
	}
	

	// Native types: int, string, boolean
	return type;
}

/*
CI.DataType.SubElements = {
	
	"chemical": {
		"Molecular formula": { "type": "mf", "jpath": "mf.0.value" },
		"Molecular mass": { "type": "int", "jpath": "mf.0.mw" }
	}
}
*/	

CI.DataType.getValueIfNeeded = function(element) {
	if(element.value && element.type)
		return element.value;
	if(element.url && element.type) {
		element.value = undefined;
		return element.value;
	}
	
	return element;
}

CI.DataType.fetchElementIfNeeded = function(element) {
	
	if(element === undefined || element == null)
		return $.Deferred().resolve("");
	
	var type = element.type, ajaxType, def;
	if(!element.value && element.url) {
		
		ajaxType = typeof CI.DataType.Structures[type] == "object" ? 'json' : 'text';
		
		return $.Deferred(function(dfd) {

			$.ajax({
			url: element.url,
			dataType: ajaxType,
			type: "get",
			timeout: 120000,

			success: function(data, text, jqxhr) {
				element.value = data;
				dfd.resolve(element);
			},

			complete: function() {

			},

			error: function() {

			}
		})}).promise();
		
	} else {
		def = $.Deferred()
		return def.resolve(element);
	}
	
	return false;
}


CI.DataType.getValueFromJPath = function(element, jpath, wholeObject) {
	
	if(!jpath.split)
		jpath = '';
		
	var jpath2 = jpath.split('.');
	jpath2.shift();

	return CI.DataType._getValueFromJPath(element, jpath2);
}

CI.DataType._getValueFromJPath = function(element, jpath) {
	var el = CI.DataType.getValueIfNeeded(element);
	var type;
	var jpathElement = jpath.shift();

	if(jpathElement) {
		el = el[jpathElement];
		return CI.DataType.fetchElementIfNeeded(el).pipe(function(elChildren) {
			return CI.DataType._getValueFromJPath(elChildren, jpath);
		});
	} else
		return $.Deferred().resolve(element);
}


CI.DataType.getJPathsFromStructure = function(structure, title, jpathspool, keystr) {
 
 	if(!structure)
		return;

	var children = [];
		
	if(structure.elements) {
		
			
		if(!keystr || keystr == null) {
			keystr = "element";
			title = keystr;
		} else
			keystr = keystr + "." + title;
					
		jpathspool.push({ title: title, children: children, key: keystr });
	
		switch(structure.type) {
			
			case 'object':
				
				for(var i in structure.elements) {
					CI.DataType.getJPathsFromStructure(structure.elements[i], i + "", children, keystr);
				}
				
			break;
			
			case 'array':
				
				// Array which length is nown
				if(!(structure.elements instanceof Array))
					structure.elements = [structure.elements];
				var len = structure.elements.length;
				if(structure.nbElements)
					len = structure.nbElements;

				for(var i = 0; i < len; i++)
					CI.DataType.getJPathsFromStructure(structure.elements[i] || structure.elements[0], i + "", children, keystr);
				
	
				/*
				var jpathpoolchild = [];
				var keystr2 = keystr + ".0";
				jpathspool.title =  "n-th element";
				jpathspool.children = jpathpoolchild;
				jpathspool.key = keystr2;
				CI.DataType.getJPathsFromStructure(structure.elements, jpathpoolchild, keystr2);*/
			break;
		}		
	} else {
		
		// Pretyped structures
		// Like chemical: "chemical"
		if(typeof CI.DataType.Structures[structure] == "object") {
			
			CI.DataType.getJPathsFromStructure(CI.DataType.Structures[structure], title, jpathspool, keystr);
			
			
		} else {
			
			
					
			if(!keystr || keystr == null) {
				keystr = "element";
				title = keystr;
			} else
				keystr = keystr + "." + title;
				
				
			jpathspool.push({ title: title, children: children, key: keystr });
	
		}
	}
}


CI.DataType.getStructureFromElement = function(element) {
	
	var structure = {};
	var el = element;
	if(element === undefined)
		return;
		
	if(element.type) 
		element = element.value;
	
	if(el !== false && el.type && CI.DataType.Structures[el.type]) {
		structure = CI.DataType.Structures[el.type];
	} else if(element instanceof Array) {
		var element = element[0];
		structure.type = "array";
		structure.elements = {};
		//structure.isFolder = true;
		/*
		if(typeof element != "object")
			structure.elements = typeof element;
		else
			CI.DataType.getStructureFromElement(element, structure.elements);
		*/
		//for(var i in element) 
		structure.elements = CI.DataType.getStructureFromElement(element);
		
	} else if(typeof element == "object") {
		
		
		structure.type = "object";	
		//structure.isFolder = true;
		structure.elements = {};
		for(var i in element) 
			structure.elements[i] = CI.DataType.getStructureFromElement(element[i]);
	} 
	else if(el.type)
		structure = el.type;
	else
		return typeof el;
		
	return structure;
	
}

CI.DataType.getJPathsFromElement = function(element, jpaths) {
	
	
	if(!jpaths)
		var jpaths = [];
		
	if(element === undefined)
		return;
	

	// We know the dynamic structure
	// Apply to typed elements + to js objects


	if(element.structure)
		CI.DataType.getJPathsFromStructure(element.structure, null, jpaths);	
	else if(element.type && CI.DataType.Structures[element.type]) {
		CI.DataType.getJPathsFromStructure(CI.DataType.Structures[element.type], null, jpaths);

	} else {
		
		switch(typeof element) {

			default:
			case 'object':
				var structure = CI.DataType.getStructureFromElement(element, structure);

				CI.DataType.getJPathsFromStructure(structure, null, jpaths);
			break;
			/*
			default:
				return;
			break;*/
		}
	}

	//console.log(jpaths);


	/*
	// Typed element
	if(element.type && element.value) {
		
		var type = element.type;
		// We know the structure
		if(element.structure) {
			
	
	*/
}





CI.DataType._doFetchElementHTMLCallback = function(element, box, asyncId, jpath) {

	CI.DataType.getValueFromJPath(element, jpath).done(function(data) {
		CI.DataType._toScreen(data, box).done(function(val) {
			$("#" + asyncId).html(val);
		});
	});

}


CI.DataType.asyncToScreenAttribute = function(source, attribute, jpath, element) {
		
	var def = $.Deferred();
	var _class = "callback-load-attr-";
	_class += ++CI.DataType.asyncId;
	
	var def = CI.DataType.getValueFromJPath(source, jpath).done(function(value) {
			if(element)
				element.attr(attribute, value);
			else
				$("." + _class).attr(attribute, value);
		});

	if(source.type && !source.value && source.url) {
		def._class = _class;
		return def;
	} else
		return def;
}


CI.DataType.asyncToScreenHtml = function(element, box, jpath) {
	
	var asyncId = 'callback-load-' + (++CI.DataType.asyncId);
	var html = "";
		html += '<span id="';
		html += asyncId;
		html += '" class="loading">Loading...</span>';

	// Needs fetching
	/*if(!element.value && element.url) {
		CI.DataType._doFetchElementHTMLCallback(element, box, 'callback-load-' + CI.DataType.asyncId, jpath);
		var def = $.Deferred.resolve(html);
	} else*/
		// returns element.value if fetched

	var def = CI.DataType.getValueFromJPath(element, jpath).pipe(function(data) {  var val = CI.DataType._toScreen(data, box); $("#callback-load-" + asyncId).html(val); return val; });
	def.html = html;
	return def; 	
}


CI.DataType._toScreen = function(element, box) {
	var slice = Array.prototype.slice;
	var newargs = slice.call(arguments, 2);
	var dif = $.Deferred();

	CI.DataType.fetchElementIfNeeded(element).done(function(data) { CI.DataType._valueToScreen(dif, data, box, newargs); });
	return dif.promise();
}

CI.DataType.toScreen = CI.DataType._toScreen;
CI.DataType._valueToScreen = function(def, data, box, args) {

	var repoFuncs = box.view.typeToScreen;
	var type = CI.DataType.getType(data);
	CI.DataType.getValueIfNeeded(data);

	if(typeof repoFuncs[type] == 'function')
		return repoFuncs[type].call(box.view, def, data, args);
	
	if(CI.Type[type] && typeof CI.Type[type].toScreen == 'function')
		return CI.Type[type].toScreen(def, data, args);
}

CI.Type = {};

CI.Type["string"] = {
	toScreen: function(def, val) { def.resolve(val); }
};
	
CI.Type["number"] = {		
	toScreen: function(def, val) { def.resolve(val); }
};

CI.Type["chemical"] = {

	getIUPAC: function(def, source) {
		CI.DataType.getValueFromJPath(source, "element.iupac.0.value").done(def.resolve);
	},
	
	toScreen: function(def, val) {
		CI.Type["chemical"].getIUPAC(def, val);
	}
};
	


CI.Type["picture"] = {		
	
	toScreen: function(def, val) {

		def.resolve('<img src="' + CI.DataType.getValueIfNeeded(val) + '" />');
	}
};
	




CI.Type["mol2d"] = {		
	
	toScreen: function(def, molfile) {


		var id = CI.Util.getNextUniqueId();
		CI.Util.DOMDeferred.progress(function(dom) {

			if($("#" + id, dom).length == 0)
				return;

			var canvas = new ChemDoodle.ViewerCanvas(id, 100, 100);

			canvas.specs.backgroundColor = "transparent";
			canvas.specs.bonds_width_2D = .6;
			canvas.specs.bonds_saturationWidth_2D = .18;
			canvas.specs.bonds_hashSpacing_2D = 2.5;
			canvas.specs.atoms_font_size_2D = 10;
			canvas.specs.atoms_font_families_2D = ['Helvetica', 'Arial', 'sans-serif'];
			canvas.specs.atoms_displayTerminalCarbonLabels_2D = true;

			var molLoaded = ChemDoodle.readMOL(molfile.value);
			molLoaded.scaleToAverageBondLength(14.4);
			canvas.loadMolecule(molLoaded);

//console.log(molfile._highlight);
			CI.RepoHighlight.listen(molfile._highlight, function(dummyvalue, commonKeys) {

				if($("#" + id, dom).length == 0)
					return;


				var commonKeys2 = {};
				var atoms = {};
				for(var i = commonKeys.length; i >= 0; i--)
					atoms[molfile._atomID.indexOf(commonKeys[i])] = true;
				for(var i = 0; i < molLoaded.atoms.length; i++) {
					molLoaded.atoms[i].isHover = !!atoms[i] && dummyvalue;
					canvas._domcanvas.width = canvas._domcanvas.width;
					molLoaded.atoms[i].drawChildExtras = !!atoms[i] && dummyvalue;
				}
				canvas.repaint();
			}, true);


		});

		def.resolve('<canvas id="' + id + '"></canvas>');
	}
};
CI.Type["molfile2D"] = CI.Type.mol2d;
	




CI.Type["mol3d"] = {		
	
	toScreen: function(def, molfile) {


		var id = CI.Util.getNextUniqueId();
		CI.Util.DOMDeferred.progress(function(dom) {

			if($("#" + id, dom).length == 0)
				return;

			var mg = new ChemDoodle.MolGrabberCanvas3D(id, 600, 400);
			mg.specs.projectionWidthHeightRatio_3D = 600 / 400;
			mg.specs.set3DRepresentation('Stick');
			mg.setSearchTerm('penicillin');
			mg.handle = null;
			mg.timeout = 15;
			mg.startAnimation = ChemDoodle._AnimatorCanvas.prototype.startAnimation;
			mg.stopAnimation = ChemDoodle._AnimatorCanvas.prototype.stopAnimation;
			//mg.isRunning = ChemDoodle._AnimatorCanvas.prototype.isRunning;
			mg.dblclick = ChemDoodle.RotatorCanvas.prototype.dblclick;
			mg.nextFrame = function(delta){
				var matrix = [];
				mat4.identity(matrix);
				var change = delta/1000;
			        var increment = Math.PI/15;
				mat4.rotate(matrix, increment*change, [ 1, 0, 0 ]);
				mat4.rotate(matrix, increment*change, [ 0, 1, 0 ]);
				mat4.rotate(matrix, increment*change, [ 0, 0, 1 ]);
				mat4.multiply(this.rotationMatrix, matrix);
			}
			
			mg.startAnimation();
		});

		def.resolve('<canvas id="' + id + '"></canvas>');
	}
};
	




CI.Type["jcamp"] = {

	_id: 0,
	cache: [],

	doFromDom: function(dom, value, opts) {

			if(dom.length == 0)
				return;

			var spectra = new ChemDoodle.PerspectiveCanvas(dom.attr('id'), dom.parent().width(), dom.parent().height());
			dom.data('spectra', spectra);
			spectra.specs.plots_showYAxis = true;
			//spectra.specs.plots_flipXAxis = false;
		
			var ctns = opts.continuous || false;
			spectra.specs.plots_flipXAxis =  opts.flipX || false;
			spectra.specs.plots_flipYAxis =  opts.flipY || false;
		
			if(value._cacheId && CI.Type.jcamp.cache[value._cacheId]) {
				var jcampLoaded = CI.Type.jcamp.cache[value._cacheId];
			} else {
				var jcampLoaded = ChemDoodle.readJCAMP(value.value);
				CI.Type.jcamp.cache.push(jcampLoaded);
				value._cacheId = CI.Type.jcamp._id;
				CI.Type.jcamp._id++;

				if(CI.Type.jcamp.cache.length == 100) {
					CI.Type.jcamp.cache.splice(0, 1);
					CI.Type.jcamp._id--;
				}
			}
			
	  		spectra.loadSpectrum(jcampLoaded);
	  		spectra.getSpectrum().continuous = ctns;
	  		spectra.repaint();
	},

	toScreen: function(def, value, args) {
		
		if(args[0])
			return def.resolve(CI.Type.jcamp.doFromDom(args[0], value, args[1]));

		var id = CI.Util.getNextUniqueId();
		CI.Util.DOMDeferred.progress(function(dom) { CI.Type.jcamp.doFromDom($("#" + id, dom), value); });
		def.resolve('<canvas id="' + id + '"></canvas>');
	}
};

CI.Type["mf"] = {
	toScreen: function(def, value) {
		return def.resolve(CI.DataType.getValueIfNeeded(value).replace(/\[([0-9]+)/g,"[<sup>$1</sup>").replace(/([a-zA-Z)])([0-9]+)/g,"$1<sub>$2</sub>").replace(/\(([0-9+-]+)\)/g,"<sup>$1</sup>"));
	}
};



CI.Type["chart"] = {
	toScreen: function(def, value) {

		
	}
};




CI.Type["boolean"] = {
	toScreen: function(def, value) {
		if(value)
			def.resolve('<span style="color: green;">&#10004;</span>');
		else
			def.resolve('<span style="color: red;">&#10008;</span>');
	}
};

CI.Type.gif = CI.Type.picture;
CI.Type.jpeg = CI.Type.picture;
CI.Type.png = CI.Type.picture;
