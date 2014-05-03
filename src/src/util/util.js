define(['src/util/api'], function(API) {

	var uniqueid = 0;

	var months = ['January', 'February', 'March', 'April', 'Mai', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	function makejPathFunction( jpath ) {

		if( ! jpath ) {
			return function() {};
		}

		var jpaths2 = jpath.replace(/^element\./, ''),
			splitted = jpaths2.split('.'),
			i = 0,
			l = splitted.length - 1,
			ifArray = [],
			ifString,
			ifElement = '',
			regNum = /\.([0-9]+)(\.?)/g;

		for( ; i < l ; i ++ ) {
			ifElement += splitted[ i ];
			ifArray .push ('el.' + ifElement + ' !== undefined ');
			ifElement += '.';
		}

		ifString = ifArray.join(" && ").replace(regNum,"[$1]$2");
		if (! ifString ) {
			ifString = "true";
		}

		eval( 'var functionEvaled = function( el ) { if (' + ifString + ') return el.' + jpaths2.replace(regNum, "[$1]$2") + '; else return "" }');	
		return functionEvaled;
	}

	function getCSS(ruleName, deleteFlag) {

		ruleName = ruleName.toLowerCase();

		if ( ! document.styleSheets) {
			return 
		}

		var i = 0, stylesheet, ii, cssRule;

		for ( ; i < document.styleSheets.length; i ++ ) {
     		styleSheet = document.styleSheets[ i ];
     		ii = 0;         
     		cssRule = false;
  		   	do {                                             // For each rule in stylesheet
            	cssRule = styleSheet.cssRules ? styleSheet.cssRules[ ii ] : styleSheet.rules[ ii ];
            	if( ! cssRule || ! cssRule.selectorText ) {
            		ii ++;
            		continue;
            	}

                if( cssRule.selectorText.toLowerCase() == ruleName) {
                  if( deleteFlag ) {
                     if(styleSheet.cssRules) {       
                        styleSheet.deleteRule(ii);      
                     } else {                         
                        styleSheet.removeRule(ii);       
                     }
                     return true;
                                      
                  } else {
                     return cssRule;
                  }           
               }              
                              
	           ii++;  

	        } while (cssRule);
  		} 

  		return false;
  	}


	return {

		getCurrentLang: function() {
			return 'en';
		},

		maskIframes: function() {
			$("iframe").each(function() {
				var iframe = $(this);
				var pos = iframe.position();
				var width = iframe.width();
				var height = iframe.height();		
				iframe.before($('<div />').css({
					position: 'absolute',
					width: width,
					height: height,
					top: pos.top,
					left: pos.left,
					background: 'white',
					opacity: 0.5
				}).addClass('iframemask'));
			});
		},


		unmaskIframes: function() {
			$(".iframemask").remove();
		},
	
		
		getNextUniqueId: function( absolute ) {

			if( absolute ) {
				return "id_" + Date.now() + Math.round(Math.random() * 100000);
			}

			return 'uniqid_' + (++uniqueid);
		},

		formatSize: function(size) {

			var i = 0;
			while(size > 1024) {
				size = size / 1024;	
				i++;
			}
			var units = ['o', 'Ko', 'Mo', 'Go', 'To'];
			return (Math.round(size * 10) / 10) + ' ' + units[i];	
		},

		pad: function(val) {
			return val < 10 ? '0' + val : val;	
		},

		getMonth: function(month) {
			return months[month];
		},

		getDay: function(day) {
			return days[day]
		},

		loadCss: function(url) {

			this.loadedCss = this.loadedCss || {};

			if( this.loadedCss[ url ] ) { // element is already loaded
				return;
			}

			this.loadedCss[ url ] = true;

		    var link = document.createElement("link");
		    link.type = "text/css";
		    link.rel = "stylesheet";
		    link.href = url;

		    try {
		    	document.getElementsByTagName("head")[0].appendChild(link);
		    } catch( e ) {}
		},

		getDistinctColors: function(numColors) {
			
			var colors=[], j = 0;
			for(var i = 0; i < 360; i += 360 / numColors) {
				j++;
				var color = this.hsl2rgb(i,  100, 30 + j%4*15);
				colors.push([Math.round(color.r * 255), Math.round(color.g * 255), Math.round(color.b * 255)]);
			}
			return colors;
		},

		getNextColorRGB: function(colorNumber, numColors) {
			return this.getDistinctColors(numColors)[colorNumber];
		},

		/**
		* @function	hsl2rgb(h,s,l)
		* Returns an object after conversion of from hsl color space to rgb
		* @param	h	Hue
		* @param	s	Saturation
		* @param	l	lightness
		* @return	object	an object in the form: {r: r, g: g, b: b}
		* @example	Color.hsl2rgb(150,100,50)
		*/
		hsl2rgb: function(h, s, l) {
			var m1, m2, hue, r, g, b
			s /=100;
			l /= 100;

			if (s == 0)
				r = g = b = (l * 255);
			else {
				if (l <= 0.5)
					m2 = l * (s + 1);
				else
					m2 = l + s - l * s;

				m1 = l * 2 - m2;
				hue = h / 360;
				r = this.hueToRgb(m1, m2, hue + 1/3);
				g = this.hueToRgb(m1, m2, hue);
				b = this.hueToRgb(m1, m2, hue - 1/3);
			}
			return {r: r, g: g, b: b};
		},

		hueToRgb: function(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        },

        hexToRgb: function(hex) {
		    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		    return result ? [
		        parseInt(result[1], 16),
		        parseInt(result[2], 16),
		        parseInt(result[3], 16)
		     
		    ] : [0, 0, 0];
		},

		rgbToHex: function(r, g, b) {
    		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		},

		getColor: function(color) {

			if(Array.isArray(color)) {
				switch(color.length) {
					case 3:
						return 'rgb(' + color.join(',') + ')';
					break;	
					case 4:
						return 'rgba(' + color.join(',') + ')';
					break;
				}
			}
			return color;
		},

		makejPathFunction: makejPathFunction,
		addjPathFunction: function( stack, jpath ) {
			stack[ jpath ] = makejPathFunction( jpath )
		},
                
        getWebsafeFonts: function() {
            return [
                {title: "Arial", key: "Arial"},
                {title: "Arial Black", key: "'Arial Black'"},
                {title: "Comic Sans MS", key: "'Comic Sans MS'"},
                {title: "Courier", key: "Courier"},
                {title: "Courier new", key: "'Courier New'"},
                {title: "Georgia", key: "Georgia"},
                {title: "Helvetica", key: "Helvetica"},
                {title: "Impact", key: "Impact"},
                {title: "Palatino", key: "Palatino"},
                {title: "Times new roman", key: "'Times New Roman'"},
                {title: "Trebuchet MS", key: "'Trebuchet MS'"},
                {title: "Verdana", key: "Verdana"}
            ];
        },

        // CSS rules
        // Modified version
        // See http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
        // for original source


        getCSS: getCSS,

  		removeCSS: function(ruleName) {
   			return getCSSRule( ruleName, true );
		},                                                   

		addCSS: function(ruleName) {

   			if( ! document.styleSheets) {
   				return;
   			}

   			var rule;
      		if( ! ( rule = getCSS( ruleName ) ) )  {
		        
		        if (document.styleSheets[0].addRule) { 
		           document.styleSheets[0].addRule(ruleName, null,0);
		        } else {
		           document.styleSheets[0].insertRule(ruleName+' { }', 0);
		        }

		        return getCSS(ruleName);
		    }

		    return rule;
        }
   }
});
	