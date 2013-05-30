
var BI = {};

BI.Forms = {};

BI.Forms.Templaters = {};
BI.Forms.GroupFields = {};
BI.Forms.Fields = {};

BI.util = {};
BI.util.getCurrentLang = function() {
	return 'fr';
}

BI.icons = {};
BI.icons.iconToUrl = function(icon) {
	
	return 'http://dc-neuchatel.precidata.net/work/bi-icon.png?name=' + icon;
	
} 

BI.lang = {};

BI.lang.months = {	
	month_0: 'Janvier',
	month_1: 'Février',
	month_2: 'Mars',
	month_3: 'Avril',
	month_4: 'Mai',
	month_5: 'Juin',
	month_6: 'Juillet',
	month_7: 'Août',
	month_8: 'Septembre',
	month_9: 'Octobre',
	month_10: 'Novembre',
	month_11: 'Décembre'
}

$.extend($.support, {
	fileReader: !!(typeof FileReader),
	formData: !!(typeof FormData),
	drop: "ondrop" in document
});
