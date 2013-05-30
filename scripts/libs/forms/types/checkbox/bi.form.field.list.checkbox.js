

if(!BI.Forms.Fields.List)
	BI.Forms.Fields.List = {};
	

BI.Forms.Fields.List.Checkbox = function(main) {

	this.main = main;
	this.checkboxLoaded = false;
	this.domReady = false;
}

BI.Forms.Fields.List.Checkbox.prototype = new BI.Forms.Fields.Checkbox();

