if(!window[_namespaces['table']].Tables) window[_namespaces['table']].Tables = {};

window[_namespaces['table']].Tables.Column = function(name, options) {
	
	this.title;
	this.options = $.extend(true, {}, window[_namespaces['table']].Tables.Column.prototype.defaults, options);
	this.name = name;
	this.asc = false;

	this.oldVal = [];
}


window[_namespaces['table']].Tables.Column.prototype = {
	
	defaults: {
		sortable: false,
		display: true,
		searchable: true
	},
	
	setTitle: function(title) {
		this.title = title;
	},
	
	getName: function() {
		return this.name;
	},

	getId: function() {
		return this.id;
	},

	setId: function(id) {
		this.id = id;
	},
	
	setTable: function(table) {
		this.table = table;
	},
	
	afterInit: function() {
		this.th = this.table.dom.children('thead').children('tr').children('th[data-colname="' + this.getName() + '"]');
		this.sort = this.th.children('.ci-table-sort').children('span');
		this.index = this.th.index();
	},
	
	buildHeader: function() {
		var html = [];
		html.push('<th data-colname="');
		html.push(this.name);
		html.push('">');
		
		html.push(this.title.getLabel());
		
		html.push('<div class="ci-table-sort"><span class="triangle-up ci-table-hidden"></span><span class="triangle-down ci-table-hidden"></span></div>');
		html.push('</th>');
		return html.join('');
	},
	
	select: function(bln) {
		this.selected = bln;
		var index = this.index;

		/*this.table.dom.children('tbody').children('tr').each(function() {	
			$(this).children('td:eq(' + index + ')')[bln ? 'addClass' : 'removeClass']('ci-selected');
		});*/

		this.th[bln ? 'addClass' : 'removeClass']('ci-table-selected');
	},
	
	isSelected: function() {
		return this.selected;
	},
	
	buildElement: function(element, firstCol, listEls, displayPlus, level) {
		
		var plus = '';
		
		var html = ['<td class="', (this.isSelected() ? 'ci-selected' : ''), '">'];
		
		if(firstCol) {
			for(var i in listEls)
				html.push('<span class="' + listEls[i] + '"></span>');
			if(displayPlus)
				html.push('<div class="ci-table-expand left"><span>+</span></div>');
		}


		html.push('<span class="ci-content">');
		
		if(typeof this.formatElement == "function")
			html.push(this.formatElement(element));
		else
			html.push(element);
			
		html.push('</span></td>');
		
		return html.join('');
	},
	
	format: function(mode, options) {
		
		switch(mode) {
			
			case 'imageUrl':
				this.formatElement = this._formats['imageUrl'];
			break;
					
		}
	},
	
	_formats: {
		'imageUrl': function(element) {
		//	return '<img src="' + element + '">';
			return element;
			// No much that can be done against dynamic loading. Luc has to change the chemexper json to a type image
		}
	},

	cancelSort: function() {
		this.sort.addClass('ci-table-hidden');
		this.select(false);
	},

	doSort: function() {
		this.select(true);
		this.sort.filter('.triangle-up, .triangle-down').addClass('ci-table-hidden').filter('.triangle-' + (!this.asc ? 'up' : 'down')).removeClass('ci-table-hidden');
		return this.asc = !this.asc;			
	},






	// V1.2

	setJPath: function(jpath) {
		this.jpath = jpath;
	},

	setAdditionEditable: function(add) {
		this.additional = add;
	},

	buildRowCol: function(element, row) {
		var self = this;
		return CI.DataType.getValueFromJPath(element, this.jpath).pipe(function(value) {
			return self.processRowCol(value, [element, self.jpath, row]);
		});
	},

	processRowCol: function(value, source) {
		var obj = {};
		obj.searchTerm = value; // searchTerm might be different from value
		obj.value = value;
		obj.oldValue = value;
		if(this.editableType)
			obj.displayTerm = this.edit(value, source, obj);
		else {
			return CI.DataType.toScreen(value, this.table.module).pipe(function(value) {
				obj.displayTerm = $('<div>' + value + '</div>');
				return obj;
			});
		}
		return obj;
	},

	edit: function(value, source, object) {
		var self = this;
		return this.editableTypes[this.editableType].call(this, value, function(newVal) {
			CI.DataType.setValueFromJPath(source[0], source[1], newVal);
			object.searchTerm = newVal;
			object.oldValue = object.value;
			object.value = newVal;
			source[2].hasChanged.call(source[2], object, source[1]);

			self.table.sendBack();


		}, this.additional);
	},

	setEditableType: function(type) {
		this.editableType = false;

		if(this.editableTypes[type])
			this.editableType = type;
	},

	getEditableType: function() {
		return this.editableType;
	},

	editableTypes: {

		'string': function(value, exec, additional) {
			var el = $('<input type="text" value="' + value + '" />').bind('keyup', function() {
				exec($(this).val());
			});
			return el;
		},

		'checkbox': function(value, exec, additional) {
			var el = $('<input type="checkbox" ' + (value ? ' checked="checked"' : '') + ' />').bind('click', function() {
				exec($(this).is(':checked'));
			});
			return el;
		},

		'combo': function(value, exec, additional) {
			var el = $('<select/>');
			additional = [''].concat(additional.split(','));
			for(var i = 0; i < additional.length; i++) {
				el.append('<option value="' + additional[i] + '" ' + (value == additional[i] ? ' selected="selected"' : '') + '>' + additional[i] + '</option>');
			}
			el.bind('change', function() {
				exec($(this).val());
			});
			return el;
		},

		'button': function(value, exec, additional) {
			var el = $("<button>" + additional + "</button>").bind('click', function() {
				exec();
			});
			return el;
		}
	}

}