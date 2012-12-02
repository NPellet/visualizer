
$(document).ready(function() {

	var form = new BI.Forms.Form();
	var sectionMain = form.addSection(new BI.Forms.Section('main', {}, new BI.Title('test')));
	var group  = sectionMain.addFieldGroup(new BI.Forms.GroupFields.List('maingroup', {}));
	group.addField({ type: 'Text', title: new BI.Title('test de champ'), name: 'testfield', multiple: true });	
	section = sectionMain.addSection(new BI.Forms.Section('main2', {}, new BI.Title('Labels')))

	var group  = section.addFieldGroup(new BI.Forms.GroupFields.List('maingroup', {}));
	group.addField({ type: 'Text', title: new BI.Title('test de champ93'), name: 'testfield', multiple: true });

	section = sectionMain.addSection(new BI.Forms.Section('main3', {}, new BI.Title('Highlighting')))
	var group  = section.addFieldGroup(new BI.Forms.GroupFields.List('maingroup', {}));
	group.addField({ type: 'Text', title: new BI.Title('test de champ13'), name: 'testfield', multiple: true });

	section = section.addSection(new BI.Forms.Section('main6', {}, new BI.Title('Highlighting')))
	var group  = section.addFieldGroup(new BI.Forms.GroupFields.List('maingroup', {}));
	group.addField({ type: 'Text', title: new BI.Title('test de champ13'), name: 'isfjh', multiple: true });

	var sectionMain = form.addSection(new BI.Forms.Section('main5', {}, new BI.Title('test')));
	var group  = sectionMain.addFieldGroup(new BI.Forms.GroupFields.List('maingroup', {}));
	group.addField({ type: 'Text', title: new BI.Title('test de champ'), name: 'testfield', multiple: true });

	form.init($('body'));
});
