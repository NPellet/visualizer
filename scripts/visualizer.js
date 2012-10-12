CI.ConfigVisualizer = function() {

	var allSharedVars = [];
	var vars = Entry.getEntryDataVariables();
	
	for(var i = 0; i < vars.length; i++) {
		
		if(typeof allSharedVars[vars[i].varname] == "undefined")
			allSharedVars[vars[i].varname] = {send: [], receive: []};
			
		allSharedVars[vars[i].varname].send.push({
			moduleName: '<em>entry point</em>'
		});
	}

	for(var i in CI.modules) {
		var def = CI.modules[i].definition;
		
	
		for(var j = 0; def.dataSource && j < def.dataSource.length; j++) {
			var source = def.dataSource[j];
			
			if(typeof allSharedVars[source.name] == "undefined")
				allSharedVars[source.name] = {send: [], receive: []};
			
			allSharedVars[source.name].receive.push({
				rel: source.rel,
				moduleName: def.title
			});
		}
		
		for(var j = 0; def.dataSend && j < def.dataSend.length; j++) {
		
			if(typeof allSharedVars[def.dataSend[j].name] == "undefined")
				allSharedVars[def.dataSend[j].name] = {send: [], receive: []};
				
			allSharedVars[def.dataSend[j].name].send.push({
				rel: def.dataSend[j].rel,
				moduleName: def.title
			});
		}
	}
	
		
	var html = $("<div />");
	var configurationElement = new CI.ConfMenuSupElement({ title: 'Configuration' });

	var btnzone = new CI.Buttons.Zone({
		vAlign: 'vertical',
		hAlign: 'center'
	});
	
	var btn = new CI.Buttons.Button('Configure entry point', function() {
		configureEntryPoint();
	});
	btnzone.addButton(btn);
	
	
	var btn = new CI.Buttons.Button('Configure visualizer', function() {
		configureVisualizer();
	});
	btnzone.addButton(btn);
	
	
	var btn = new CI.Buttons.Button('Save', function() {
		Entry.save();
	});
	btn.setColor('blue');
	btnzone.addButton(btn);
	
	configurationElement.addElement(btnzone);
	html.append(configurationElement.render());

	var menuvars = new CI.ConfMenuSupElement({ title: 'Shared Variables' });
	for(var i in allSharedVars)
		menuvars.addElement(new CI.ConfMenuElement({ title: i, dblclickhandler: configSharedVariable }));

	html.append(menuvars.render());

	var addModuleElement = new CI.ConfMenuSupElement({ title: 'Add a module' });
	for(var i in CI.Module.prototype._types) {
		var moduleInfos = CI.Module.prototype._types[i].Controller.prototype.moduleInformations;
		addModuleElement.addElement(new CI.ConfMenuElement({ title: moduleInfos.moduleName, key: i, dblclickhandler: function(event, element) { 

				var module = {
					type: element.get('key'),
					title: "Untitled module",
					position: {
						left: 1,
						right: 1	
					},
					
					size: {
						width: 30,
						height: 30
					}
				};
				
				Entry.addModuleFromJSON(module, true);



		 }  }));
	}

	html.append(addModuleElement.render());

	$("#ci-left").html(html);
	
	/*
	(function() {
	
		var vars = Entry.getEntryDataVariables();
		var model = $('<li><ul><li><label>Variable name</label><input type="text" class="_ci-varname" /></li><li><label>Source</label><select class="_ci-varsource"></select></li><li><label>jPath</label><select class="_ci-varjpath"></select></li></ul></li>')
				.find('select._ci-varsource').change(function() {
					
					var data = Entry.getDataFromSource($(this).val());
					var jpath = {};
					CI.Types._getjPath(data, jpath)
					$(this).parent().parent().find('._ci-varjpath').html(CI.Types._jPathToOptions(jpath));
					
				}).each(function() {
					var html = [];
					var data = Entry.getDataFromSource();
					
					html.push('<option disabled="disabled" selected="selected">Select a variable</option>');
					
					for(var i in data) {
						html.push('<option value="');
						html.push(i);
						html.push('">');
						html.push(i);
						html.push('</option>');
					}
					
					$(this).html(html.join(''));
					
				}).end();
		
		
		var ul = $("<ul />").addClass('ci-cfg-entrypoint');
		
		var vars = Entry.getEntryDataVariables();
		for(var i in vars) {
			model.clone(true).find('._ci-varname').val(vars[i].varname).end().find('._ci-varsource').val(vars[i].sourcename).trigger('change').end().appendTo(ul);
		}
		
		
		$("#ci-entrypoint-cfg").html(ul);
		
		ul.after(CI.AddButton.clone(true));
		
		ul.next().after(CI.SaveButton.clone(true).bind('click', function() {
			
			var vars = [];
			ul.children().each(function() {
				vars.push({ varname: $(this).find('._ci-varname').val(), sourcename: $(this).find('._ci-varsource').val(), jpath: $(this).find('._ci-varjpath').val()  });
			});
			
			Entry.setEntryDataVariables(vars);
			Entry.save();
			
		})).next().after('<div class="ci-spacer"></div>');
	})();
	
	*/
	
	
	$("#ci-entrypoint-cfg").bind('click', function() {
		configureEntryPoint();
	});
	
	
	
	$("#ci-left").next().bind('click', function() {
		$("#ci-left").toggle();	
	});
	
	
	function configureEntryPoint() {
		var now = Date.now();
		$("<div />").dialog({ modal: true, width: '80%', title: "Edit Entry Variables"}).biForm({}, function() {
			
			var inst = this;			
			var section = new BI.Forms.Section('cfg', { multiple: false });
			this.addSection(section);
			var title = new CI.Title();
			title.setLabel('Entry variables');
			section.setTitle(title);
			
			var groupfield = new BI.Forms.GroupFields.Table('tablevars');
			section.addFieldGroup(groupfield);
			
			var field = groupfield.addField({
				type: 'Text',
				name: 'varname'
			});
			field.setTitle(new CI.Title('Variable name'));
			
			var options = [];
			var data = Entry.getDataFromSource();
			for(var i in data)
				options.push({title: i, key: i});
				
					
			var field = groupfield.addField({
				type: 'Combo',
				name: 'sourcename'
			});
			field.setTitle(new CI.Title('Source name'));
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
			
			var field = groupfield.addField({
				type: 'Combo',
				name: 'jpath'
			});
			field.setTitle(new CI.Title('JPath'));
			
			
			var inst = this;
			var save = new CI.Buttons.Button('Save', function() {
				var value = inst.getValue();
				var data = value.cfg[0].tablevars[0];
				Entry.setEntryDataVariables(data);
				Entry.save();

				inst.getDom().dialog('close');
			});
			
			
			save.setColor('blue');
			this.addButtonZone().addButton(save);
			
		}, function() {
			
			
			var vars = { varname: [], jpath: [], sourcename: [] };
			var entryVars = Entry.getEntryDataVariables();
			
			for(var i = 0; i < entryVars.length; i++) {
				vars.varname.push(entryVars[i].varname);
				vars.sourcename.push(entryVars[i].sourcename);
				vars.jpath.push(entryVars[i].jpath);
				
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




	
	
	function configureVisualizer() {
		var now = Date.now();
		$("<div />").dialog({ modal: true, width: '80%', title: "Edit Vizualizer"}).biForm({}, function() {
			
			var inst = this;			
			var section = new BI.Forms.Section('cfg', { multiple: false });
			this.addSection(section);
			var title = new CI.Title();
			title.setLabel('General configuration');
			section.setTitle(title);
			
			var groupfield = new BI.Forms.GroupFields.List('general');
			section.addFieldGroup(groupfield);
			
			var field = groupfield.addField({
				type: 'Text',
				name: 'title'
			});
			field.setTitle(new CI.Title('Title'));
			
			
			var field = groupfield.addField({
				type: 'Checkbox',
				name: 'moduleheaders'
			});
			field.setTitle(new CI.Title('Module headers'));
			field.implementation.setOptions({ 'showonhover': 'Only show module headers on mouseover'})
			
			
			var field = groupfield.addField({
				type: 'Checkbox',
				name: 'menubar'
			});
			field.setTitle(new CI.Title('Menu bar'));
			
			field.implementation.setOptions({ 'display': 'Display menu bar on start'})
			
			
			var field = groupfield.addField({
				type: 'Color',
				name: 'modulebg'
			});
			field.setTitle(new CI.Title('Modules background'));
			
			
		
			var save = new CI.Buttons.Button('Save', function() {
				
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
			var modulebg = config.moduleBackground || '#ffffff';
			
			
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
			var title = new CI.Title();
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
			field.setTitle(new CI.Title('Filter'));
			field.implementation.setOptions(allOptions);


			var save = new CI.Buttons.Button('Save', function() {
				
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
}


