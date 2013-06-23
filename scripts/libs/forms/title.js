define(['util/util'], function(Util) {

	function getIconUrl(icon) {
		if(!icon)
			return;

		return icon.getUrl();
	}

	function getIconTag() {

	}

	var title = function(text, icon) {
		this.labels = {}, this.icon;
		if(text)
			this.setLabel(text);
		if(icon)
			this.setIcon(icon);
	}

	title.prototype = {
		setIcon: function(icon) { 
			var self = this;
			require(['form/icon'], function(Icon) {
				if(!(icon instanceof Icon))
					icon = new Icon(icon);
					self.icon 
			});
		},
		setLabel: function(label, lang) {
			if(!lang)
				lang = Util.getCurrentLang();
			this.labels[lang] = label;
		},
		getIconTag: function() {
			if(!this.icon)
				return;
			return ['<img src="', getIconUrl(this.icon), '" alt="', this.getLabel(), '" />'].join('')
		},
		getLabel: function(lang) {
			if(!lang)
				lang = Util.getCurrentLang();
			return this.labels[lang] || "";
		},

		duplicate: function() {
			var title = new title();
			for(var i in this.labels)
				title.setLabel(this.labels[i], i);
			title.setIcon(this.icon);
			return title;
		},

		getIconUrl: getIconUrl
	}

	return title;
});
