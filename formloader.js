
$(document).ready(function() {

	var form = new BI.Forms.Form();

	var sectionMain = form.addSection(new BI.Forms.Section('Experiment', {}, new BI.Title('test')));
	var group  = sectionMain.addFieldGroup(new BI.Forms.GroupFields.List('main', {}));
	group.addField({ type: 'Text', title: new BI.Title('Your name'), name: 'name', multiple: false });	

	group.addField({ type: 'Text', title: new BI.Title('Experiment name'), name: 'expname', multiple: false });		
	group.addField({ type: 'Text', title: new BI.Title('Comment 1'), name: 'comment1', multiple: false });		
	group.addField({ type: 'Text', title: new BI.Title('Comment 2'), name: 'comment2', multiple: false });		

	var sectionMain = form.addSection(new BI.Forms.Section('Cell', { multiple: true}, new BI.Title('Cell to measure')));
	var group  = sectionMain.addFieldGroup(new BI.Forms.GroupFields.Table('main', {}));
	group.addField({ type: 'Text', title: new BI.Title('Slot number'), name: 'number', multiple: false });	
	group.addField({ type: 'Text', title: new BI.Title('Cell ID'), name: 'id', multiple: false });	
	group.addField({ type: 'Text', title: new BI.Title('Cell area'), name: 'area', multiple: false });	
	var meas = group.addField({ type: 'Combo', title: new BI.Title('Measurement type'), name: 'type', multiple: false });	
	meas.implementation.setOptions([{title: 'Inactive', key: 0}, {title: 'IV curve', key: 1}, {title: 'Uoc', key: 2}, {title: 'Jsc', key: 3}]);


	var between = group.addField({ type: 'Combo', title: new BI.Title('Between measurements'), name: 'type', multiple: false });	
	between.implementation.setOptions([{title: 'Max Power Point', key: 0}, {title: 'Uoc', key: 1}, {title: 'Jsc', key: 2}]);



	var sectionMain = form.addSection(new BI.Forms.Section('Gen', { multiple: true}, new BI.Title('General parameters')));
	var group  = sectionMain.addFieldGroup(new BI.Forms.GroupFields.List('main', {}));
	group.addField({ type: 'Datetime', title: new BI.Title('Measurement start'), name: 'date', multiple: false });	
		
	group.addField({ type: 'Text', title: new BI.Title('Number of measurements'), name: 'nb', multiple: false });	
	group.addField({ type: 'Text', title: new BI.Title('Measurement interval'), name: 'nb', multiple: false });	
	group.addField({ type: 'Text', title: new BI.Title('CAN Adress (meas)'), name: 'can', multiple: false });	
	group.addField({ type: 'Text', title: new BI.Title('CAN Adress (soaking)'), name: 'can_ls', multiple: false });	
	group.addField({ type: 'Text', title: new BI.Title('CAN Adress (SD card)'), name: 'can_sd', multiple: false });	


	var sectionMain = form.addSection(new BI.Forms.Section('CellCond', { multiple: true}, new BI.Title('Cell conditioning')));
	var group  = sectionMain.addFieldGroup(new BI.Forms.GroupFields.List('main', {}));
	
	group.addField({ type: 'Text', title: new BI.Title('Settling time (ms)'), name: 'settling', multiple: false });	
	group.addField({ type: 'Text', title: new BI.Title('Settling sun intensity'), name: 'settlingint', multiple: false });	
	var cond_before = group.addField({ type: 'Combo', title: new BI.Title('Condition before'), name: 'cond_before', multiple: false });	
	cond_before.implementation.setOptions([{key: 1, title: "Open circuit"}, {key: 3, title: "Short circuit"}, {key: 4, title: "Maximum power point"},{key: 5, title: "Compliance (Umax, Imin)"}]);

	var cond_after = group.addField({ type: 'Combo', title: new BI.Title('Condition after'), name: 'cond_after', multiple: false });	
	cond_after.implementation.setOptions([{key: 1, title: "Open circuit"}, {key: 3, title: "Short circuit"}, {key: 4, title: "Maximum power point"},{key: 5, title: "Compliance (Umax, Imin)"},{key: 10, title: "No modification"}]);
	

	var sectionMain = form.addSection(new BI.Forms.Section('CellCond', { multiple: true}, new BI.Title('Measurement')));
	var group  = sectionMain.addFieldGroup(new BI.Forms.GroupFields.List('main', {}));
	var f = group.addField({ type: 'Combo', title: new BI.Title('Measurement type'), name: 'meastype', multiple: false });	
	f.implementation.setOptions([{key: 0, title: 'IV curve'}]);
	
	var f = group.addField({ type: 'Combo', title: new BI.Title('Measurement param'), name: 'measdir', multiple: false });	
	f.implementation.setOptions([{key: 0, title: 'Backward scan'}, {key: 1, title: 'Forward scan'}, {key: 3, title: "Backward - Forward"}]);
	
	group.addField({ type: 'Text', title: new BI.Title('Umin'), name: 'umin', multiple: false });	
	group.addField({ type: 'Text', title: new BI.Title('Umax'), name: 'umax', multiple: false });	
	
	

	form.init($('body'));
});
