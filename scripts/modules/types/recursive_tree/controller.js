define(['modules/defaultcontroller','util/datatraversing'], function(Default,Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		lineHover: function(element) {
			
			var actions;
			if(!(actions = this.module.vars_out()))	
				return;	
			for(var i = 0; i < actions.length; i++)
				if(actions[i].event == "onHover")
					CI.API.setSharedVarFromJPath(actions[i].name, element, actions[i].jpath);
			
			CI.RepoHighlight.set(element._highlight, 1);
		},

		lineOut: function(element) {
			CI.RepoHighlight.set(element._highlight, 0);
		},

		lineClick: function(element) {
			
			var actions;
			if(!(actions = this.module.vars_out()))	
				return;
					
			for(var i = 0; i < actions.length; i++) {
				if(actions[i].event == "onSelect") {
					(function(element, actionName, jpath) {
						CI.API.setSharedVarFromJPath(actionName, element, jpath);
					}) (element, actions[i].name, actions[i].jpath)
				}
			}
		},
		
		configurationSend: {

			events: {

				onSelect: {
					label: 'Select a line',
					description: 'Click on a line to select it'
				},
				
				onHover: {
					label: 'Hovers a line',
					description: 'Pass the mouse over a line to select it'
				}
			},
			
			rels: {
				'element': {
					label: 'Row',
					description: 'Returns the selected row in the list'
				}
			}
			
		},
		
		configurationReceive: {
			list: {
				type: ["array", "arrayXY"],
				label: 'List',
				description: 'Any list of displayable element'
			}		
		},
		
		
		moduleInformations: {
			moduleName: 'Table'
		},
		
		
		
		
		doConfiguration: function(section) {
			
			
			var groupfield = new BI.Forms.GroupFields.List('gencfg');
			
			section.addFieldGroup(groupfield);
			
			var field = groupfield.addField({
				type: 'Text',
				name: 'nblines'
			});
			field.setTitle(new BI.Title('Lines per page'));
			
			var data = this.module.getDataFromRel('list');
			var jpaths = [];
			
			if(Traversing.getType(data) == 'array') 
				Traversing.getJPathsFromElement(data[0], jpaths);
			else if(Traversing.getType(data) == 'arrayXY')
				Traversing.getJPathsFromElement(data, jpaths);

			var field = groupfield.addField({
				type: 'Combo',
				name: 'colorjpath'
			});
			
			field.setTitle(new BI.Title('Color jPath'));
			field.implementation.setOptions(jpaths);
			

			var field = groupfield.addField({
				type: 'Checkbox',
				name: 'displaySearch'
			});
			field.implementation.setOptions({ 'allow': 'Allow searching'});
			field.setTitle(new BI.Title('Searching'));
			
			var groupfield = new BI.Forms.GroupFields.Table('cols');

			section.addFieldGroup(groupfield);
			
			var field = groupfield.addField({
				type: 'Text',
				name: 'coltitle'
			});
			field.setTitle(new BI.Title('Columns title'));
			
			var field = groupfield.addField({
				type: 'Combo',
				name: 'coljpath'
			});
			field.implementation.setOptions(jpaths);
			field.setTitle(new BI.Title('Value jPath'));
			
			return true;
		},
		
		doFillConfiguration: function() {
			
			var cols = this.module.getConfiguration().colsjPaths;
			var nblines = this.module.getConfiguration().nbLines || 20;
			var colorjPath = this.module.getConfiguration().colorjPath || '';
			var search = this.module.getConfiguration().displaySearch || false;
			
			var titles = [];
			var jpaths = [];

			for(var i in cols) {
				titles.push(i);
				jpaths.push(cols[i].jpath);
			}

			return {	

				groups: {
					gencfg: [{
						nblines: [nblines],
						colorjpath: [colorjPath],
						displaySearch: [[search ? 'allow' : '']]
					}],
					
					cols: [{
						coltitle: titles,
						coljpath: jpaths
					}]
				}
			}
		},
		
		doSaveConfiguration: function(confSection) {
			var group = confSection[0].cols[0];
			var cols = {};
			for(var i = 0; i < group.length; i++)
				cols[group[i].coltitle] = { jpath: group[i].coljpath };
			this.module.getConfiguration().colsjPaths = cols;
			this.module.getConfiguration().nbLines = confSection[0].gencfg[0].nblines[0];
			this.module.getConfiguration().colorjPath = confSection[0].gencfg[0].colorjpath[0];
			this.module.getConfiguration().displaySearch = !!confSection[0].gencfg[0].displaySearch[0][0];
		}	
	});

	return controller;
});



