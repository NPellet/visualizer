// Javascript


$(document).bind('configModule', function(event, module) {
	
	$('<div id="cfgModule"></div>').dialog({ modal: true, width: '80%', title: "Edit module preferences"}).biForm({}, function() {
		
		var inst = this;
		// General configuration	
		
		var section = this.addSection(new BI.Forms.Section('general', { multiple: false }));

		section.setTitle(new BI.Title('General Configuration'));
		
		var groupfield = new BI.Forms.GroupFields.List('general');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'moduletitle',
			multiple: true
		});
		field.setTitle(new BI.Title('Module title'));
		
		var field = groupfield.addField({
			type: 'Color',
			name: 'bgcolor'
		});
		field.setTitle(new BI.Title('Background color'));
		


		var field = groupfield.addField({
			type: 'Checkbox',
			name: 'modulewrapper'
		});
		field.setTitle(new BI.Title('Display module boundaries'));
		field.implementation.setOptions({'display': ''});
		
		// Self configuration
		var section = new BI.Forms.Section('module', { multiple: false });
		section.setTitle(new BI.Title('Module Configuration'));
		this.addSection(section);
		
		if(typeof module.controller.doConfiguration == "function")
			module.controller.doConfiguration(section);
				
		// Send configuration
		var availCfg = module.controller.configurationSend;
		var sendjpaths = [];
		for(var i in availCfg.rels) {
			sendjpaths[i] = module.model.getjPath(i);
		}
		
		var allEvents = [];
		for(var i in availCfg.events)
			allEvents.push({title: availCfg.events[i].label, key: i});
		
		var allRels = [];
		for(var i in availCfg.rels)
			allRels.push({ title: availCfg.rels[i].label, key: i})
	
		

		var actionsCfg = module.controller.actions;
		var allActionsRels = [];
		if(actionsCfg)
			for(var i in actionsCfg.rel)
				allActionsRels.push({ title: actionsCfg.rel[i], key: i});


		var actionsReceive = module.controller.actionsReceive || {};
		var allActionsReceive = [];	
		for(var i in actionsReceive)
			allActionsReceive.push({ title: actionsReceive[i], key: i});
		

		var section = new BI.Forms.Section('send', { multiple: false });
		this.addSection(section);
		section.setTitle(new BI.Title('Variables sent'));
		
		var groupfield = new BI.Forms.GroupFields.Table('sentvars');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'event'
		});

		field.implementation.setOptions(allEvents);
		field.setTitle(new BI.Title('Event'));
		
		var fieldRel = groupfield.addField({
			type: 'Combo',
			name: 'rel'
		});
		fieldRel.implementation.setOptions(allRels);


		fieldRel.onChange(function(index) {
			var value = this.getValue(index), 
				jpath = this.group.getField('jpath');

			if(!jpath)
				return;
			jpath.implementation.setOptions(sendjpaths[value], index);
		});
		
		
		fieldRel.setTitle(new BI.Title('Internal reference'));
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'jpath'
		});
		field.setTitle(new BI.Title('jPath'));
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'name'
		});
		field.setTitle(new BI.Title('Variable to store in'));
		
		// Receive configuration
		var availCfg = module.controller.configurationReceive;
		
		var allRels2 = [];
		for(var i in availCfg)
			allRels2.push({ key: i, title: availCfg[i].label });
		
		
		var section = new BI.Forms.Section('receive', { multiple: false });
		this.addSection(section);
		section.setTitle(new BI.Title('Variables received'));
		
		var groupfield = new BI.Forms.GroupFields.Table('receivedvars');
		section.addFieldGroup(groupfield);
		
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'rel'
		});

		field.implementation.setOptions(allRels2);
		field.setTitle(new BI.Title('Internal reference'));
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'name'
		});
		field.setTitle(new BI.Title('Stored in variable'));
		
		var objs = [];
		for(var i in CI.API.getAllSharedVariables()) {
			objs.push({title: i, label: i});
		}
		field.implementation.setAutocompleteOptions(objs);


		/****************************************************************/
		/** ACTIONS *****************************************************/
		/** SEND ********************************************************/
		/****************************************************************/
		
		var section = this.addSection(new BI.Forms.Section('actionsout', {}, new BI.Title('Send Actions')));
		var groupfield = new BI.Forms.GroupFields.Table('actions');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'event',
			title: new BI.Title('Event')
		});
		field.implementation.setOptions(allEvents);

		var field = groupfield.addField({
			type: 'Combo',
			name: 'rel',
			title: new BI.Title('Internal reference')
		});
		
		field.implementation.setOptions(allActionsRels);
		
		field.onChange(function(index) {
			var value = this.getValue(index), 
				jpath = this.group.getField('jpath');

			if(!jpath)
				return;
			
			jpath.implementation.setOptions(sendjpaths[value], index);
		});

		var fieldJ = groupfield.addField({
			type: 'Combo',
			name: 'jpath',
			title: new BI.Title('JPath')
		});
		
		

		var field = groupfield.addField({
			type: 'Text',
			name: 'name',
			title: new BI.Title('Action name')
		});
		
		
		/****************************************************************/
		/** ACTIONS *****************************************************/
		/** RECEIVE *****************************************************/
		/****************************************************************/
		


		var section = this.addSection(new BI.Forms.Section('actionsin', {}, new BI.Title('Receive Actions')));
		var groupfield = new BI.Forms.GroupFields.Table('actions');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'rel',
			title: new BI.Title('Reference')
		});
		field.implementation.setOptions(allActionsReceive);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'name',
			title: new BI.Title('Action name')
		});
		
		
		/****************************************************************/
		/****************************************************************/


		// Er ?
		// Used ?
		if(module.controller.addToReceivedVars)
			module.controller.addToReceivedVars(groupfield);

		
		var save = new BI.Buttons.Button('Save', function() {
			
			
			inst.dom.trigger('stopEditing');
			var value = inst.getValue();

			
			module.setTitle(value.general[0].general[0].moduletitle[0]);
			module.definition.bgColor = value.general[0].general[0].bgcolor[0];
			module.definition.displayWrapper = !!value.general[0].general[0].modulewrapper[0][0];
			module.setBackgroundColor(value.general[0].general[0].bgcolor[0]);
			
			module.setDisplayWrapper();
				
			module.setSendVars(value.send[0].sentvars[0]);
			module.setSourceVars(value.receive[0].receivedvars[0]);

			module.setActionsIn(value.actionsin[0].actions[0]);
			module.setActionsOut(value.actionsout[0].actions[0]);

			if(module.controller.processReceivedVars)
				module.controller.processReceivedVars(value.receive[0].receivedvars[0]);

		//	console.time('SaveConf');
			if(module.controller.doSaveConfiguration) 
				module.controller.doSaveConfiguration(value.module);
		//	console.timeEnd('SaveConf');
			if(module.view.erase)
				module.view.erase();

		//	console.time('ReInit');
			module.view.init();
		//	console.timeEnd('ReInit');

		//	console.time('DOM');
			module.view.inDom();
		//	console.timeEnd('DOM');

		//	console.time('Update All');
			module.model.resetListeners();	
			module.updateAllView();
		//	console.timeEnd('Update All');

		//	console.time('UpdateAll2');
			

			//	
			//	CI.API.resendAllVars();


		//	console.timeEnd('UpdateAll2');			
			inst.getDom().dialog('close');

			document.getElementById('ci-header').scrollIntoView(true);
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

				if(module.controller.fillReceivedVars)
					module.controller.fillReceivedVars(receivedVars, currentCfg[i], i);
			}
		}

		var actionsin = { rel: [], name: []};
		if(module.definition.actionsIn) {
			var currentCfg = module.definition.actionsIn;
			for(var i = 0; i < currentCfg.length; i++) {
				actionsin.rel.push(currentCfg[i].rel);
				actionsin.name.push(currentCfg[i].name);
			}
		}


		var actionsout = { event: [], rel: [], name: [], jpath: []};
		if(module.definition.actionsOut) {
			var currentCfg = module.definition.actionsOut;
			for(var i = 0; i < currentCfg.length; i++) {
				actionsout.rel.push(currentCfg[i].rel);
				actionsout.name.push(currentCfg[i].name);
				actionsout.jpath.push(currentCfg[i].jpath);
				actionsout.event.push(currentCfg[i].event);
			}
		}
		
		
		var fill = {
			sections: {
				general: [ { groups: { general: [{ moduletitle: [module.getTitle()], bgcolor: [ module.definition.bgColor ],  modulewrapper: [[ (module.definition.displayWrapper === true || module.definition.displayWrapper == undefined) ? 'display' : '' ]] }] } } ],
				module: [ /*{ groups: */module.controller.doFillConfiguration ? module.controller.doFillConfiguration() : []/* } */],
				send: [ { groups: {sentvars: [sentVars]}} ],
				receive: [ { groups: {receivedvars: [receivedVars]}} ],
				actionsin: [ { groups: {actions: [actionsin]}} ],
				actionsout: [ { groups: {actions: [actionsout]}} ]
			}
		}
		
		this.fillJson(fill);
		

		this.getDom().dialog('option', 'position', 'center');
	});
	
	
	
	
});

