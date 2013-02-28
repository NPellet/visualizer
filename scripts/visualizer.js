CI.ConfigVisualizer = function() {

	var self = this;
	var vars = Entry.getEntryDataVariables();	
	var allSharedVars = CI.API.getAllSharedVariables();
		
	function configureVisualizer() {
		var now = Date.now();
		$("<div />").dialog({ modal: true, width: '80%', title: "Edit Vizualizer"}).biForm({}, function() {
			
			var inst = this;			
			var section = new BI.Forms.Section('cfg', { multiple: false });
			this.addSection(section);
			var title = new BI.Title();
			title.setLabel('General configuration');
			section.setTitle(title);
			
			var groupfield = new BI.Forms.GroupFields.List('general');
			section.addFieldGroup(groupfield);
			
			var field = groupfield.addField({
				type: 'Text',
				name: 'title'
			});
			field.setTitle(new BI.Title('Title'));
			
			
			var field = groupfield.addField({
				type: 'Checkbox',
				name: 'moduleheaders'
			});
			field.setTitle(new BI.Title('Module headers'));
			field.implementation.setOptions({ 'showonhover': 'Only show module headers on mouseover'})
			
			
			var field = groupfield.addField({
				type: 'Checkbox',
				name: 'menubar'
			});
			field.setTitle(new BI.Title('Menu bar'));
			
			field.implementation.setOptions({ 'display': 'Display menu bar on start'})
			
			
			var field = groupfield.addField({
				type: 'Color',
				name: 'modulebg'
			});
			field.setTitle(new BI.Title('Modules background'));
			
			
		
			var save = new BI.Buttons.Button('Save', function() {
				
				inst.dom.trigger('stopEditing');
				var value = inst.getValue();
				var data = value.cfg[0].general[0];
				
				var config = Entry.getConfiguration();
			
				config.showMenuBarOnStart = data.menubar[0][0] == 'display';
				config.showModuleHeaderOnHover = data.moduleheaders[0][0] == 'showonhover';
				config.title = data.title[0];
				config.moduleBackground = data.modulebg[0];
				
				Entry.setConfiguration(config);
				Entry.save();
				inst.getDom().dialog('close');
			});
			
			save.setColor('blue');
			this.addButtonZone().addButton(save);
			
		}, function() {
			
			var config = Entry.getConfiguration();
			
			var title = config.title || 'Visualizer title';
			var menubar = config.showMenuBarOnStart ? ['display'] : [false];
			var moduleheader = config.showModuleHeaderOnHover ? ['showonhover'] : [false];
			var modulebg = config.moduleBackground || '';
			
			
			var vars = { title: [title], menubar: [menubar], modulebg: [modulebg], moduleheaders: [moduleheader] };
				
			var fill = { 
				sections: {
					cfg: [
						{
							groups: {
								general: [vars]
							}
						}
					]
				}
			};

			this.fillJson(fill);
		});
	}


	function configSharedVariable(event, element) {

		var varname = element.getTitle();

		$("<div />").dialog({ modal: true, width: '80%', title: "Edit Shared Variables"}).biForm({}, function() {

			var inst = this;			
			var section = new BI.Forms.Section('filters', { multiple: false });
			this.addSection(section);
			var title = new BI.Title();
			title.setLabel('Variable filters');
			section.setTitle(title);
			
			var groupfield = new BI.Forms.GroupFields.List('general');
			section.addFieldGroup(groupfield);


			var allOptions = [];			
			for(var i in CI.VariableFilters) {
				allOptions.push({ title: CI.VariableFilters[i].name, key: i });
			}


			var field = groupfield.addField({
				type: 'Combo',
				name: 'filters',
				multiple: true
			});
			field.setTitle(new BI.Title('Filter'));
			field.implementation.setOptions(allOptions);


			var save = new BI.Buttons.Button('Save', function() {
				
				inst.dom.trigger('stopEditing');
				var value = inst.getValue();
				var data = value.filters[0].general[0].filters;

				inst.getDom().dialog('close');

				Entry.getConfiguration().variableFilters[varname] = data;
				Entry.save();
				inst.getDom().dialog('close');
			});
			
			save.setColor('blue');
			this.addButtonZone().addButton(save);
		

		}, function() {

			var config = Entry.getConfiguration();
			var filters = config.variableFilters;

			if(filters[varname])
				filters = filters[varname];
			else
				filters = [];

			var fill = { 
				sections: {
					filters: [
						{
							groups: {
								general: [{
									filters: filters
								}]
							}
						}
					]
				}
			};

			this.fillJson(fill);
		});

	}

	function exportView() {
		$('<div />').css('text-align', 'center').dialog({'modal': true, title: 'Export view', width: '80%', height: '300'}).html($('<textarea />').css({width: '95%', height: '200'}).val(JSON.stringify(Entry.getStructure())));
	}
}


var configureEntryPoint = function() {
	var now = Date.now();
	$("<div />").dialog({ modal: true, width: '80%', title: "Edit Entry Variables"}).biForm({}, function() {
		
		var inst = this;			
		var section = new BI.Forms.Section('cfg', { multiple: false });
		this.addSection(section);
		var title = new BI.Title();
		title.setLabel('Entry variables');
		section.setTitle(title);
		
		var groupfield = new BI.Forms.GroupFields.Table('tablevars');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'varname'
		});
		field.setTitle(new BI.Title('Variable name'));
		
		var options = [];
		var data = Entry.getDataFromSource();

		for(var i in data)
			options.push({title: i, key: i});
			
				
		/*var field = groupfield.addField({
			type: 'Combo',
			name: 'sourcename'
		});
		field.setTitle(new BI.Title('Source name'));
		field.implementation.setOptions(options);
		field.onChange(function(index) {
			var fieldIndex = index;
			var value = this.getValue(fieldIndex);
			var data = Entry.getDataFromSource(value);
			var jpath = [];
			CI.DataType.getJPathsFromElement(data, jpath);
			var field = this.group.getField('jpath')
			
			this.group.getField('jpath').implementation.setOptions(jpath, index);
			
		});
		*/
		var field = groupfield.addField({
			type: 'Combo',
			name: 'jpath'
		});
		field.setTitle(new BI.Title('JPath'));
		
	
		var data = Entry.getDataFromSource();
		var jpath = [];
		
		CI.DataType.getJPathsFromElement(data, jpath);
		field.implementation.setOptions(jpath);	

		var field = groupfield.addField({
			type: 'Text',
			name: 'url'
		});
		field.setTitle(new BI.Title('URL'));
	

		var inst = this;
		var save = new BI.Buttons.Button('Save', function() {
			inst.dom.trigger('stopEditing');
			var value = inst.getValue();
			var data = value.cfg[0].tablevars[0];
			Entry.setEntryDataVariables(data);
			/*Entry.save();*/

			inst.getDom().dialog('close');
		});
		
		
		save.setColor('blue');
		this.addButtonZone().addButton(save);
		
	}, function() {
		
		
		var vars = { varname: [], jpath: [], sourcename: [], url: [] };
		var entryVars = Entry.getEntryDataVariables();
		
		for(var i = 0; i < entryVars.length; i++) {
			vars.varname.push(entryVars[i].varname);
	//		vars.sourcename.push(entryVars[i].sourcename);
			vars.jpath.push(entryVars[i].jpath);
			vars.url.push(entryVars[i].url || '');
			
		}
			
		var fill = { 
			sections: {
				cfg: [
					{
						groups: {
							tablevars: [vars]
						}
					}
				]
			}
		};
		
		this.fillJson(fill);
		
	
		
	});
}





var configureActions = function() {
	var now = Date.now();
	$("<div />").dialog({ modal: true, width: '80%', title: "Configure actions"}).biForm({}, function() {
		
		var inst = this;			
		var section = new BI.Forms.Section('cfg', { multiple: true });
		this.addSection(section);
		section.setTitle(new BI.Title('Execute script on actions'));
		
		var groupfield = new BI.Forms.GroupFields.List('action');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'actionname'
		});
		field.setTitle(new BI.Title('Action name'));
		



		var field = groupfield.addField({
			type: 'JSCode',
			name: 'script'
		});
		field.setTitle(new BI.Title('Script to execute'));
		
	
		var inst = this, actions = [];
		var save = new BI.Buttons.Button('Save', function() {
			inst.dom.trigger('stopEditing');
			var value = inst.getValue(), data = value.cfg, evalscripted;
			var actionScripts = {};
			for(var i = 0; i < data.length; i++) {
				eval("evalscripted = function(value) { " + data[i].action[0].script[0] + " } ");
				actions.push({name: data[i].action[0].actionname[0], script: data[i].action[0].script[0] });
				actionScripts[data[i].action[0].actionname[0]] = evalscripted;
			}

			Entry.setActionScripts(actions, actionScripts);
			inst.getDom().dialog('close');
		});
		
		save.setColor('blue');
		this.addButtonZone().addButton(save);
		
	}, function() {
		
		var vars = [], action;
		var scripts = Entry.getActionScripts();
		for(var i = 0; i < scripts.length; i++) {
			action = { groups: { action: [{actionname: [ scripts[i].name ], script: [ scripts[i].script ] }]}};
			vars.push(action);
		}
		var fill = { 
			sections: {
				cfg: vars
			}
		};
		this.fillJson(fill);		
	});
}




