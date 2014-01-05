define(['require', 'modules/defaultview', 'libs/plot/plot', 'util/jcampconverter', 'util/datatraversing', 'util/api', 'util/util'], function(require, Default, Graph, JcampConverter, DataTraversing, API, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {


		init: function() {
			
			var self = this;

			this.highlightedAtom;
			this.dom = $('<iframe />').attr('src', require.toUrl('./jsme.html'));
			this.module.getDomContent().html(this.dom);
			
			this.dom.bind('load', function() {
				self.dom.get( 0 ).contentWindow.setController( self.module.controller );
				self.dom.get( 0 ).contentWindow.setView( self );
			});

			this.onReady = $.Deferred();
			this._highlights = this._highlights || [];
		},
		
		inDom: function() { },

		getPrefs: function() {
			return this.module.getConfiguration( 'prefs' ).join( );
		},

		onResize: function() {
			this.dom.attr( 'width', this.width );
			this.dom.attr( 'height', this.height );

			this.module.getDomContent().css( 'overflow', 'hidden' );

			if( this.dom.get( 0 ).contentWindow.setSize ) {
				this.dom.get( 0 ).contentWindow.setSize( this.width, this.height );
			}
		},
		
		onProgress: function() {

			this.dom.html( "Progress. Please wait..." );
		},

		blank: {
			'mol': function(varName) {
		//		console.log("CLEAR");
				if (this.dom.get(0).contentWindow.clear) {
					this.dom.get(0).contentWindow.clear();
				}
			}
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
					var atoms = [];
					for ( var i = 0, l = highlightId.length ; i < l ; i++ ) {
						if(!(moduleValue._atoms[highlightId[i]] instanceof Array))
							moduleValue._atoms[highlightId[i]] = [moduleValue._atoms[highlightId[i]]];
						atoms = atoms.concat(moduleValue._atoms[highlightId[i]]);
					}
					contentWindow.setHighlight(atoms, onOff);

				}, false, this.module.getId());
			},

			'xArray': function(moduleValue, varname) {
				
			},
		},


		_doHighlight: function(mol, id) {
			if (! this._currentValue) return;
			for(var i in this._currentValue._atoms) {
				if (id==0) {
					if(this._currentValue._atoms[i].indexOf(this.highlightedAtom) > -1) {
						API.highlight(i, false);
					}
				} else {
					if(this._currentValue._atoms[i].indexOf(id-1) > -1) {
						API.highlight(i, true);
					}						
				}

			}

			this.highlightedAtom = id-1;
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
 

