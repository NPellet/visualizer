

if(!BI.Forms.Fields.List)
	BI.Forms.Fields.List = {};
	

BI.Forms.Fields.List.Options = function(main) {

	this.main = main;
	this.OptionsLoaded = false;
	this.domReady = false;
}

BI.Forms.Fields.List.Options.prototype = new BI.Forms.Fields.Options();

