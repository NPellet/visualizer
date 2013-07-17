define(['modules/defaultview', 
		"libs/jsmol/js/JSmolCore",
		"libs/jsmol/js/JSmolApplet",
		"libs/jsmol/js/JSmolApi",
		"libs/jsmol/js/JSmolControls",
		"libs/jsmol/js/j2sjmol",
		"libs/jsmol/js/JSmol",	
		"libs/jsmol/js/JSmolThree",
		"libs/jsmol/js/JSmolGLmol"
		], 

function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

	 	init: function() {	
	 		this.dom = $('<div id="jmolApplet0"></div>');
	 		this.module.getDomContent().html(this.dom);
	 		this._highlights = this._highlights || [];
	 	},

	 	inDom: function() {
	 		var useSignedApplet = false;
			Info = {
				width: 700,
				height: 300,
				debug: false,
				color: "0xF0F0F0",
				addSelectionOptions: false,
				serverURL: "http://chemapps.stolaf.edu/jmol/jsmol/jsmol.php",
				use: "WEBGL HTML5",
			  //language: "fr", // NOTE: LOCALIZATION REQUIRES <meta charset="utf-8"> (see JSmolCore Jmol.featureDetection.supportsLocalization)
				jarPath: "java",
				j2sPath: "scripts/libs/jsmol/j2s",

				jarFile: (useSignedApplet ? "JmolAppletSigned.jar" : "JmolApplet.jar"),
				isSigned: useSignedApplet,
				disableJ2SLoadMonitor: true,
				disableInitialConsole: true,
				readyFunction: function() {

					

				},
			    allowjavascript: true,
				script: "set antialiasDisplay"
				//,defaultModel: ":dopamine"
			  //,noscript: true
				//console: "none", // default will be jmolApplet0_infodiv
				//script: "set antialiasDisplay;background white;load data/caffeine.mol;"
			  //delay 3;background yellow;delay 0.1;background white;for (var i = 0; i < 10; i+=1){rotate y 3;delay 0.01}"
			};

			Jmol._XhtmlElement = document.getElementById("jmolApplet0");
			Jmol._XhtmlAppendChild = true;
			this.applet = Jmol.getApplet("jmolApplet0", Info);
			console.log(this.applet);

			Jmol.loadFile(this.applet,'scripts/libs/jsmol/data/caffeine.mol')


	 	},

	 	onResize: function() {
	 	},

	 	blank: function() {
	 		this.domTable.empty();
	 		this.table = false;
	 	},

	 	update: {

	 		list: function(moduleValue) {
	 			
	 		}
		},


		getDom: function() {
			return this.dom;
		},

		onActionReceive:  {

		},

		typeToScreen: {

		}
	});

	return view;
});