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
		}
	}
});
