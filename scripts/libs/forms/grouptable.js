define(['forms/fieldtable'], function(TableField) {

	var group = function(name) {
		this.name = name,
		this.nbRows = 0,
		this.fields = [],
		this.options = {};
	}

	group.prototype = {

		addField: function(options) {

			var field = new TableField(options, this);
			this.fields.push(field);
			field.setGroupId(this.fields.length - 1);
			return field;
		},
		
		setId: function(id) {
			this.id = id;
			if(this.dom) {
				this.dom.attr('data-groupfield-id', id);
				this.dom.data('groupfield-id', id);
			}
		},
		
		getId: function() { return this.id; },
		getName: function() { return this.name; },
		getFields: function() { return this.fields; },
		isVisible: function() { return this.options.visible; },
		setSection: function(section) { this.section = section; },
		getSection: function() { return this.section; },

		getField: function(fieldName) {
			for(var i = 0, l = this.fields.length; i < l; i++)
				if(this.fields[i].getName() == fieldName)
					return this.fields[i];
		},
		
		buildHtml: function() {
			var tpl = this.getSection().getForm().getTemplater();
			var html = [];
			html.push('<div class="bi-form-groupfields" data-group-id="');			
			html.push(this.getId());
			html.push('">');
			html.push(tpl.buildGroup.Table.call(tpl, this));
			html.push('</div>');

			return html.join('');
		},
		
		stopEditing: function(hasNew) {
			
			if(this.trEditing !== undefined && this.tdEditing !== undefined) {
				this.fields[this.tdEditing].implementation.stopEditing(this.trEditing, hasNew);
				this.tableBody.children().eq(this.trEditing).children().eq(this.tdEditing + 1).removeClass('bi-has-focus');
				this.tdEditing = undefined;
				this.trEditing = undefined;
			}
		},
		

		setStructure: function(structure) {
			var field;
			
			for(var i in structure.fields) {

				if(!structure.fields.hasOwnProperty(i))
					return;

				field = this.addField(structure.fields[i]);
				if(structure.fields[i].options)
					field.onLoad(function(field, opts) {
						field.implementation.setOptions(opts)
					}, structure.fields[i].options);

				if(structure.fields[i].autoComplete)
					field.onLoad(function(field, opts) {
						field.implementation.setAutocompleteOptions(opts)
					}, structure.fields[i].autoComplete);
			}
		},


		afterInit: function() {
			
			var inst = this;
			this.dom = this.section.getDom().find('[data-group-id=' + this.getId() + ']');
			
			this.table = this.dom.find('table');
			this.tableBody = this.table.children('tbody');
			this.tableHead = this.table.children('thead');
			
			this.tableBody.on('click', '.duplicator span', function() {
				var el = $(this);
				inst.stopEditing();
				var index = $(this).parent().parent().parent().index();
				
				if(el.hasClass('add'))
					inst.addRow(index);
				else
					inst.removeRow(index);
				
			});
			
			this.tableBody.on('click', 'td', function(event) {
				
				event.stopPropagation();
				
				var td = $(this).addClass('bi-has-focus');
				var tdIndex = td.index();
			
				if(!inst.fields[tdIndex - 1])
					return;
				
				var trIndex = td.parent().index();
				if((inst.trEditing !== undefined && inst.tdEditing !== undefined && inst.trEditing == trIndex && inst.tdEditing == (tdIndex - 1))) {
					inst.stopEditing();
					return;
				}
				
				
				inst.stopEditing(true);
				inst.tdEditing = tdIndex - 1;
				inst.trEditing = trIndex;
				
				inst.fields[inst.tdEditing].implementation.startEditing(inst.trEditing);
			});
			
			$(document).bind('click', function(event) {
				
				if($(event.target).hasClass('dynatree-expander'))
					return;
					
				if($(event.target).parents().addBack().filter('.bi-formfield-expand').length == 0)
					inst.stopEditing();
			});
			
			$(this.section.form.dom).bind('stopEditing', function() {
				inst.stopEditing();
			});
			
			for(var i = 0; i < this.fields.length; i++) {
				this.fields[i].afterInit(this.dom.children());
			}
			
			var width = this.table.width();
			var ths = this.tableHead.children().children();
			
			width -= ths.eq(0).outerWidth(true) + ths.last().outerWidth(true);
			this.fieldsWidth = width;
			width /= this.fields.length;
			ths.not(':first,:last').css('width', width + "px");
			this.addRow();
		},
		
		addRow: function(index) {
			
			if(index == undefined)
				index = this.nbRows;
			else index = index + 1;
			
			var contents = [];
			var html = '';
			html += '<tr><td></td>';
			for(var i = 0; i < this.fields.length; i++) {
				contents[i] = this.fields[i].addField(index);
				html += '<td></td>';
			}
			
			html += '<td><span class="duplicator"><span class="add">+</span><span class="remove">-</span></td>';
			html += '</tr>';
			
			var html = $(html);
			
			var tds = html.children();
			
			for(var i = 0; i < this.fields.length; i++) {
				tds.eq(i + 1).html(contents[i].html);
			}
			
			
			if(index == 0)
				this.tableBody.prepend(html);
			else {
				this.tableBody.children().eq(index - 1).after(html);
				for(var i = 0; i < this.fields.length; i++)
					this.fields[i].setValue(this.fields[i].getValue(index - 1), index);
			}
			
			this.nbRows++;
		},
		
		removeRow: function(index) {
			if(!index)
				index = 0;
			if(this.nbRows == 1)
				return;
			this.nbRows--;
			
			for(var i = 0; i < this.fields.length; i++)
				this.fields[i].removeField(index);
			
			this.tableBody.children('tr').eq(index).remove();
		},

		emptyAllRows: function() {

			var nbRows = this.nbRows;
			for(var i = 0; i < nbRows; i++)
				this.removeRow(0);
		},
		
		commitContent: function(data) {
			for(var i = 0; i < this.fields.length; i++)
				this.fields[i].commitContent(formContent);
		},
		
		commitStructure: function(data) {
			for(var i = 0; i < this.fields.length; i++)
				this.fields[i].commitStructure(formStructure);
		},
		

		duplicate: function(section) {
			
			var group = new BI.Forms.GroupFields.Table(this.name);
			section.addFieldGroup(group);
			for(var i = 0; i < this.fields.length; i++)
				var field = this.fields[i].duplicate(group);
			
			
			return group;
		},
		
		remove: function() {
			
			for(var i = 0; i < this.fields.length; i++)
				this.fields[i].remove();
			
			this.dom.remove();
			this.getSection().removeFieldGroup(this);
		},
		
		removeField: function(field) {
			this.fields[field.getGroupId()] = null;
			this.fields.splice(field.getGroupId(), 1);
			this.renumberFields();
		},
		
		renumberFields: function() {
			for(var i = 0; i < this.fields.length; i++)
				this.fields[i].getGroupId(i);
		},
		
		fill: function(group, xml) {
			
			this.emptyAllRows();
			var fieldsByName = [];
			for(var i = 0; i < group.fields.length; i++)
				fieldsByName[group.fields[i].getName()] = group.fields[i];
			
			xml.children().each(function() {
				var name = $(this).attr('name');
				var field = fieldsByName[name];
				
				field.resetDuplicate();
				$(this).children('value').each(function(i) {
					field.implementation.setValue(i, $(this).text());
				});
			});
		},
		
		fillJson: function(json) {
			
			this.emptyAllRows();
			done = false;
			var fieldsByName = [];
			for(var i = 0; i < this.fields.length; i++)
				fieldsByName[this.fields[i].getName()] = this.fields[i];
			
			for(var i in json) {
				
				if(!done) {
					for(var j = 1; j < json[i].length; j++)
						this.addRow();
				}
				
				done = true;
				var name = i;
				
				var field = fieldsByName[name];		
				//field.resetDuplicate();
				if(!field)
					continue;

				for(var j = 0; j < json[i].length; j++) {
					(function(field, k, val) {

						field.onLoad(function() {
							field.implementation.setValue(k, val);	
						});	
					}) (field, j, json[i][j]);
				}
					
			}
		},
		
		empty: function() {
			this.emptyAllRows();
		},
		
		getValue: function(values) {
			
			for(var i = 0; i < this.nbRows; i++) {
				var rowValue = {};
				for(var j = 0; j < this.fields.length; j++) {
					rowValue[this.fields[j].getName()] = this.fields[j].getValue(i);
				}
				values.push(rowValue);
			}
		},
		
		getValueFull: function(values) {
			
			for(var j = 0; j < this.fields.length; j++) {
				/*for(var i = 0; i < this.nbRows; i++) {

				}*/
				values[this.fields[j].getName()] = [];
				this.fields[j].fillValueFull(values[this.fields[j].getName()]);
			}
		}
	};
	
	return group;
});

