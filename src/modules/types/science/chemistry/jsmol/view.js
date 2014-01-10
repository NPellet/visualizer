define(['require',
        'modules/default/defaultview',
		'src/util/util',
		'src/util/datatraversing',
		"libs/jsmol/JSmol.min.nojq"
		], 



function(require,Default, UTIL, DataTraversing) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

	 	init: function() {
            var self = this;

            this.highlightedAtom;
            this.dom = $('<iframe>',{src:require.toUrl('./jsmol.html')}).css("border",0);
            this.module.getDomContent().html(this.dom);

            this.dom.bind('load', function() {
            	self.dom.get( 0 ).contentWindow.setInDom( self.module.inDom,Jmol );
                self.dom.get( 0 ).contentWindow.setController( self.module.controller );
                self.dom.get( 0 ).contentWindow.setView( self );
            });

            this._highlights = this._highlights || [];
            this.onReady = $.Deferred();
	 	},

	 	inDom: function() {},

	 	onResize: function() {

        	this.dom.height(this.height).width(this.width);

            if( this.dom.get( 0 ).contentWindow.setSize ) {
                this.dom.get( 0 ).contentWindow.setSize( this.width, this.height );
            }
	 	},

	 	blank: function() {
	 	},

        update: {

            data: function(data) {
                var self = this ;
                this.onReady.done(function() {
	                self.dom.get( 0 ).contentWindow.setMolFile(data);

	                var cfg = $.proxy(self.module.getConfiguration, self.module);
	                if (cfg('script')) {
	                    self.dom.get( 0 ).contentWindow.executeScript([cfg('script')]);
	                }
	            });
            }
        },


		getDom: function() {
			return this.dom;
		},

		onActionReceive:  {
			jsmolscript : function(a) {
				this.module.controller.onJSMolScriptReceive(a);
			}
		},

		executeScript : function(src){
            this.dom.get( 0 ).contentWindow.executeScript([src]);
		},

		typeToScreen: {

		}
	});

	return view;
});