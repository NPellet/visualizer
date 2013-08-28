define(function() {

	var uniqueid = 0;

	var months = ['January', 'February', 'March', 'April', 'Mai', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
	
		
		getNextUniqueId: function() {
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
		    var link = document.createElement("link");
		    link.type = "text/css";
		    link.rel = "stylesheet";
		    link.href = url;
		    document.getElementsByTagName("head")[0].appendChild(link);
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
        }

	}
});
