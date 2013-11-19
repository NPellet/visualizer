define(['require',
        'modules/defaultview',
		'util/util',
		'util/datatraversing',
		"libs/jsmol/JSmol.min.nojq"
		], 



function(require,Default, UTIL, DataTraversing) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

	 	init: function() {

            /*
	 		this.jsmolid = UTIL.getNextUniqueId();
	 		this.dom = $('<div id="' + this.jsmolid + '"></div>');
	 		this.module.getDomContent().html(this.dom);
	 		this._highlights = this._highlights || [];

	 		this.onReady = $.Deferred();

	 		*/

            var self = this;

            this.highlightedAtom;
            this.dom = $('<iframe>',{src:require.toUrl('./jsmol.html')}).css("border",0);
            this.module.getDomContent().html(this.dom);

            this.dom.bind('load', function() {
                self.dom.get( 0 ).contentWindow.setController( self.module.controller );
                self.dom.get( 0 ).contentWindow.setView( self );
            });

            //this.onReady = $.Deferred();
            this._highlights = this._highlights || [];


	 	},

	 	inDom: function() {

            var self = this ;

            this.dom.bind('load', function() {
                self.dom.get( 0 ).contentWindow.setInDom( self.module.inDom,Jmol );
            });

	 	},

	 	onResize: function(w, h) {
            this.dom.height(h).width(w);


            if( this.dom.get( 0 ).contentWindow.setSize ) {
                this.dom.get( 0 ).contentWindow.setSize( w, h );
            }
	 	},

	 	blank: function() {
	 		
	 		
	 	},

        update: {

            data: function(data) {

                var self = this ;

                self.dom.get( 0 ).contentWindow.setMolFile(data);

                var cfg = $.proxy(this.module.getConfiguration, this.module);
                if (cfg('script')) {
                    self.dom.get( 0 ).contentWindow.executeScript([cfg('script')]);
                }

            }
        },


		getDom: function() {
			return this.dom;
		},

		onActionReceive:  {
			jsmolscript : function(a) {
				self = this;

				self.module.controller.onJSMolScriptRecieve(a);
			}
		},

		executeScript : function(src){


            var self = this;


            self.dom.get( 0 ).contentWindow.executeScript([src]);
            /*
			if(this.applet){
    			Jmol.script(this.applet, src); 
    		}
    		*/
		},

		typeToScreen: {

		}
	});

	return view;
});