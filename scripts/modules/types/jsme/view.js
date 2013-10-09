define(['require', 'modules/defaultview', 'libs/plot/plot', 'util/jcampconverter', 'util/datatraversing', 'util/api', 'util/util'], function(require, Default, Graph, JcampConverter, DataTraversing, API, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {

			this.highlightedAtom;
			this.dom = $('<iframe />').attr('src', require.toUrl('./jsme.html'));
			this.module.getDomContent().html(this.dom);
			var self = this;

			
			this.dom.bind('load', function() {
				self.dom.get(0).contentWindow.setController(self.module.controller);
				self.dom.get(0).contentWindow.setView(self);
			});
			this.onReady = $.Deferred();
			this._highlights = this._highlights || [];
		},
		
		inDom: function() {
			var cfgM = this.module.getConfiguration();
			var self = this;
		},

		getPrefs: function() {
			if (! this.module.getConfiguration().prefs) return "oldLook";
			return this.module.getConfiguration().prefs.join(",");
		},

		onResize: function(width, height) {
			this.width = width;
			this.height = height;

			this.dom.attr('width', width);
			this.dom.attr('height', height);

			this.module.getDomContent().css('overflow', 'hidden');

			if(this.dom.get(0).contentWindow.setSize)
				this.dom.get(0).contentWindow.setSize(width, height);
		},
		
		onProgress: function() {
			this.dom.html("Progress. Please wait...");
		},

		blank: function() {
		},

		update: { 

			'mol': function(moduleValue) {

				//console.log(moduleValue);
				var contentWindow = this.dom.get(0).contentWindow;
//console.log(this.dom.get(0));
				if(!moduleValue)
					return;

				contentWindow.setMolFile(moduleValue.get());
			
				this._currentValue = moduleValue;

				API.killHighlight( this.module.getId() );

				API.listenHighlight( moduleValue._highlight, function(onOff, highlightId) {

console.log(onOff, highlightId);

					var atoms = [];
					for ( var i = 0, l = highlightId.length ; i < l ; i++ ) {

						if(!(moduleValue._atoms[highlightId[i]] instanceof Array))
							moduleValue._atoms[highlightId[i]] = [moduleValue._atoms[highlightId[i]]];
						atoms = atoms.concat(moduleValue._atoms[highlightId[i]]);
					}

					contentWindow.setHighlight(atoms, onOff);
					
				}, this.module.getId());
			},

			'xArray': function(moduleValue, varname) {
				
			},
		},


		_doHighlight: function(mol, id, val) {
			if (! this._currentValue) return;
			for(var i in this._currentValue._atoms) {
				if (id==0) {
					if(this._currentValue._atoms[i].indexOf(this.highlightedAtom) > -1) {
						API.highlight(i, false);
					}
				} else {
					if(this._currentValue._atoms[i].indexOf(id) > -1) {
						API.highlight(i, true);
					}						
				}

			}

			this.highlightedAtom = id;	
		},


		resetAnnotations: function() {

		//	Util.doAnnotations(this.annotations, this.graph)
		},

	
		onActionReceive: {
	
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		}
	});
	return view;
});
 

