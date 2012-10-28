
BI.Title = function(text, icon) {
	this.labels = {};
	this.icon;
	
	if(typeof text !== "undefined")
		this.setLabel(text);
		
	if(typeof icon !== "undefined")
		this.setIcon(icon);

}

BI.Title.prototype = {
	
	setIcon: function(icon) {
		this.icon = icon;
	},
	
	setLabel: function(label, lang) {


		if(lang == undefined)
			lang = BI.Util.getCurrentLang();
			
		this.labels[lang] = label;
	},
	
	getIconUrl: function() {
		if(!BI.Icons)
			return false;
		return BI.Icons.iconToUrl(this.icon);
	},
	
	getImgIcon: function() {
		return ['<img src="', this.getIconUrl(), '" alt="', this.getLabel(), '" />'].join('');
	},
	
	getLabel: function(lang) {
			
		if(!lang)
			lang = BI.Util.getCurrentLang();
		
		if(typeof this.labels[lang] !== "undefined")
			return this.labels[lang];
			
		//throw {notify: true, display: true, message: "An error has occured. No label exists for the lang " + lang}; 
	},
	
	duplicate: function() {
		var title = new BI.Title();
		for(var i in this.labels)
			title.setLabel(this.labels[i], i);
		title.setIcon(this.icon);
		return title;
	}
}; 	