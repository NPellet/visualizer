if(!window[_namespaces['table']].Tables) window[_namespaces['table']].Tables = {};

window[_namespaces['table']].Tables.Column = function(name, options) {
	
	this.title;
	this.options = $.extend(true, {}, window[_namespaces['table']].Tables.Column.prototype.defaults, options);
	this.name = name;
	this.asc = false;
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
		console.log('there');
		this.select(true);
		this.sort.filter('.triangle-up, .triangle-down').addClass('ci-table-hidden').filter('.triangle-' + (!this.asc ? 'up' : 'down')).removeClass('ci-table-hidden');
		return this.asc = !this.asc;			
	}
}