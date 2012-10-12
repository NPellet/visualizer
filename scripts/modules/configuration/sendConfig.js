// Javascript


$(document).bind('configModule', function(event, module) {
	
	$('<div id="cfgModule"></div>').dialog({ modal: true, width: '80%', title: "Edit module preferences"}).biForm({}, function() {
		
		var inst = this;
		// General configuration	
		var section = new BI.Forms.Section('general', { multiple: false });
		this.addSection(section);
		section.setTitle(new CI.Title('General Configuration'));
		
		var groupfield = new BI.Forms.GroupFields.List('general');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'moduletitle'
		});
		field.setTitle(new CI.Title('Module title'));
		
		var field = groupfield.addField({
			type: 'Color',
			name: 'bgcolor'
		});
		field.setTitle(new CI.Title('Background color'));
		
		// Self configuration
		var section = new BI.Forms.Section('module', { multiple: false });
		section.setTitle(new CI.Title('Module Configuration'));
		this.addSection(section);
		
		if(typeof module.controller.doConfiguration == "function")
			module.controller.doConfiguration(section);
				
		// Send configuration
		var availCfg = module.controller.configurationSend;
		var sendjpaths = [];
		for(var i in availCfg.rels) {
			sendjpaths[i] = module.model.getjPath(i)
		}
		
		var allEvents = [];
		for(var i in availCfg.events)
			allEvents.push({title: availCfg.events[i].label, key: i});
		
		var allRels = [];
		for(var i in availCfg.rels)
			allRels.push({ title: availCfg.rels[i].label, key: i})
	
		var section = new BI.Forms.Section('send', { multiple: false });
		this.addSection(section);
		section.setTitle(new CI.Title('Variables sent'));
		
		var groupfield = new BI.Forms.GroupFields.Table('sentvars');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'event'
		});
		field.implementation.setOptions(allEvents);
		field.setTitle(new CI.Title('Event'));
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'rel'
		});
		field.implementation.setOptions(allRels);
		field.onChange(function(index) {
			var value = this.getValue(index);
			this.group.getField('jpath').implementation.setOptions(sendjpaths[value], index);
		});
		
		
		field.setTitle(new CI.Title('Internal reference'));
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'jpath'
		});
		field.setTitle(new CI.Title('jPath'));
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'name'
		});
		field.setTitle(new CI.Title('Variable to store in'));
		
		// Receive configuration
		var availCfg = module.controller.configurationReceive;
		
		var allRels = [];
		for(var i in availCfg)
			allRels.push({ key: i, title: availCfg[i].label });
		
		
		var section = new BI.Forms.Section('receive', { multiple: false });
		this.addSection(section);
		section.setTitle(new CI.Title('Variables received'));
		
		var groupfield = new BI.Forms.GroupFields.Table('receivedvars');
		section.addFieldGroup(groupfield);
		
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'rel'
		});
		field.implementation.setOptions(allRels);
		field.setTitle(new CI.Title('Internal reference'));
		
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'name'
		});
		field.setTitle(new CI.Title('Stored in variable'));
		



		
		var save = new CI.Buttons.Button('Save', function() {
			
			
			inst.dom.trigger('stopEditing');
			var value = inst.getValue();

			module.setTitle(value.general[0].general[0].moduletitle[0]);
			module.definition.bgColor = value.general[0].general[0].bgcolor[0];

			module.setSendVars(value.send[0].sentvars[0]);
			module.setSourceVars(value.receive[0].receivedvars[0]);
			
			if(module.controller.doSaveConfiguration) 
				module.controller.doSaveConfiguration(value.module);
			
			Entry.save();
			if(module.view.erase)
				module.view.erase();
			module.view.init();
			
			module.view.inDom();
			module.updateAllView();
			
			module.model.resetListeners();
			CI.API.resendAllVars();
			
			inst.getDom().dialog('close');
		});
		
		save.setColor('blue');
		this.addButtonZone().addButton(save);
			
	}, function() {
		
		var sentVars = { event: [], rel: [], jpath: [], name: []};
		
		if(module.definition.dataSend) {
			var currentCfg = module.definition.dataSend;
			for(var i = 0; i < currentCfg.length; i++) {
				sentVars.event.push(currentCfg[i].event);
				sentVars.rel.push(currentCfg[i].rel);
				sentVars.jpath.push(currentCfg[i].jpath);
				sentVars.name.push(currentCfg[i].name);
			}
		}
		
		
		var receivedVars = { rel: [], name: []};
		
		if(module.definition.dataSource) {
			var currentCfg = module.definition.dataSource;
			for(var i = 0; i < currentCfg.length; i++) {
				receivedVars.rel.push(currentCfg[i].rel);
				receivedVars.name.push(currentCfg[i].name);
			}
		}
		
		
		var fill = {
			sections: {
				general: [ { groups: { general: [{ moduletitle: [module.getTitle()], bgcolor: [ module.definition.bgColor ] }] } } ],
				module: [ /*{ groups: */module.controller.doFillConfiguration ? module.controller.doFillConfiguration() : []/* } */],
				send: [ { groups: {sentvars: [sentVars]}} ],
				receive: [ { groups: {receivedvars: [receivedVars]}} ]
			}
		}
		
		this.fillJson(fill);
		

		this.getDom().dialog('option', 'position', 'center');
	});
	
	
	
	
});


function buildGeneralConfig(module) {
	
	var html = [];
	html.push('<div><ul>');
	
	html.push('<li><label>Module name</label><input type="text" name="modulename" value="');
	html.push(module.getTitle());
	html.push('"></li>');
	html.push('</ul></div>');
	
	var html = $(html.join(''));
	
	html.append(CI.SaveButton.clone(true).bind('click', function() {
		module.setTitle($("input[name=modulename]").val());
		Entry.save();
	}).after('<div class="ci-spacer"></div>'));
	
	
	$("#ci-right").append('<h3><span class="triangle-down"></span>General Configuration</h3>').append(html);
}

function buildSendConfig(module) {
	
	var availCfg = module.controller.getConfigurationSend();
	var currentCfg = module.definition.dataSend;
	
	var jpaths = [];
	for(var i in availCfg.rels) {
		jpaths[i] = CI.Types._jPathToOptions(module.model.getjPath(i));
	}
	
	var allEvents = [];
	allEvents.push('<option></option>');
	for(var i in availCfg.events) {
		allEvents.push('<option value="');
		allEvents.push(i);
		allEvents.push('">');
		allEvents.push(availCfg.events[i].label);
		allEvents.push('</option>');
	}
	
	var allRels = [];
	allRels.push('<option></option>');
	for(var i in availCfg.rels) {
		allRels.push('<option value="');
		allRels.push(i);
		allRels.push('">');
		allRels.push(availCfg.rels[i].label);
		allRels.push('</option>');
	}
	
	var cfgLine = [];
	cfgLine.push('<li class="CfgSendEl"><ul><li><label>Event: </label><select class="_eventname">');
	cfgLine.push(allEvents.join(''));
	cfgLine.push('</select></li><li><label>Element: </label><select class="_eventrel">');
	cfgLine.push(allRels.join(''));
	cfgLine.push('</select></li><li><label>Fields to send: </label><select class="_eventkeys"></select></li><li><label>Store in: </label><input type="text" class="_eventvarname" /></li></ul></li>');
	
	var cfg = $(cfgLine.join(''));
	cfg.find('select._eventrel').bind('change', function(event) {
		var rel = $(this).val();
		var keys;
		var cfg = $(this).parents('.CfgSendEl');
		var options = jpaths[rel];
		cfg.find('select._eventkeys').html(options);
	});
	
	function fillLine(currentCfg, line) {
		line.find('select._eventname').val(currentCfg.event);
		line.find('select._eventrel').val(currentCfg.rel);
		line.find('select._eventrel').trigger('change');
		line.find('input._eventvarname').val(currentCfg.name);
		line.find('select._eventkeys').val(currentCfg.jpath);
	}
	
	var wrapper = $("<div />").addClass('ci-send');
	var html = $("<ul />");
	
	
	for(var i = 0; currentCfg && i < currentCfg.length; i++) {
		var line = cfg.clone(true);
		fillLine(currentCfg[i], line);
		html.append(line);
	}

	if(!currentCfg || currentCfg.length == 0) {
		var line = cfg.clone(true);
		html.append(line);
	}
	
	
	wrapper.append(html);
	html.after(CI.AddButton.clone(true)).next().after(CI.SaveButton.clone(true).bind('click', function() {
		var vars = [];
		$(".ci-send").children('ul').children('li').each(function() {
			vars.push({ event: $(this).find('._eventname').val(), name: $(this).find('._eventvarname').val(), rel: $(this).find('._eventrel').val(), jpath: $(this).find('._eventkeys').val() });
		});
		
		module.setSendVars(vars);
		Entry.save();
		
	})).next().after('<div class="ci-spacer"></div>');
	
	$("#ci-right").append('<h3><span class="triangle-down"></span>Sending</h3>').append(wrapper);
}


function buildReceiveConfig(module) {
	
	var availCfg = module.controller.getConfigurationReceive();
	var currentCfg = module.definition.dataSource;
	
	var allRels = [];
	allRels.push('<option></option>');
	for(var i in availCfg) {
		allRels.push('<option value="');
		allRels.push(i);
		allRels.push('">');
		allRels.push(availCfg[i].label);
		allRels.push('</option>');
	}
	
	var cfgLine = [];
	cfgLine.push('<li class="CfgReceiveEl"><ul>');
	cfgLine.push('<li><label>Element: </label><select class="_eventrel">');
	cfgLine.push(allRels.join(''));
	cfgLine.push('</select>');
	cfgLine.push('<li><label>Stored in: </label><input type="text" class="_eventvarname" />')
	cfgLine.push('</ul></li>')
	
	var cfg = $(cfgLine.join(''));
	cfg.find('select._eventrel').bind('change', function(event) {
	//	var rel = $(this).val();
	//	var types = availCfg.rel.accepts;
	//	var options = CI.Types._jPathToOptions(module.model.getjPath(rel, types));
	
	});
	
	function fillLine(currentCfg) {
		//line.find('select._eventname').val(eventName);
		line.find('select._eventrel').val(currentCfg.rel);
		//line.find('select._eventrel').trigger('change');
		line.find('input._eventvarname').val(currentCfg.name);
		//line.find('select._eventkeys').val(currentCfg.keys);
	}
	
	var wrapper = $("<div />").addClass('ci-receive');
	var html = $("<ul />");
	
	if(currentCfg)
		for(var i = 0; i < currentCfg.length; i++) {
			
			/*if(!currentCfg[i] instanceof Array)
				currentCfg[i] = [currentCfg[i]];
			*/
			//for(var j = 0; j < currentCfg[i].length; j++) {
				var line = cfg.clone(true);
				fillLine(currentCfg[i], line, i);
				html.append(line);
			//}
		}
		
	if(!currentCfg || currentCfg.length == 0) {
		var line = cfg.clone(true);
		html.append(line);
	}
	wrapper.append(html);
	html.after(CI.AddButton.clone(true)).next().after(CI.SaveButton.clone(true).bind('click', function() {
		
		var vars = [];
		$(".ci-receive").children('ul').children('li').each(function() {
			vars.push({ name: $(this).find('._eventvarname').val(), rel: $(this).find('._eventrel').val() });
		});
		
		module.setSourceVars(vars);
		Entry.save();
		
	})).next().after('<div class="ci-spacer"></div>');
	
	$("#ci-right").append('<h3><span class="triangle-down"></span>Receiving</h3>').append(wrapper);
}
