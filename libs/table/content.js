if(!window[_namespaces['table']].Tables) window[_namespaces['table']].Tables = {};

window[_namespaces['table']].Tables.Content = function() {
	
	this.elements = [];
	this.table;
	this.seach;
	this.pagination;
	this.page;
	this.entryCount = 0;
	this.reIndexedElements = {};

	this.domDeferred = [];
}


window[_namespaces['table']].Tables.Content.prototype = {
	
	setTable: function(table) {
		this.table = table;
	},
	
	addElement: function(elJson) {
		this.elements.push(elJson);
		this.entryCount++;
	},
	
	build: function() {
		var j = -1;
		var html = "";
		
		this.reIndexedElements = {};
		this.index = 0;
		this.supNav = [];
		this.entryCount = 0;

		for(var i = 0; i < this.elements.length; i++) {
			if(!this.doSearch(this.elements[i]))
				continue;
			this.entryCount++;
			j++;
			if(j < (this.page - 1) * this.pagination || j >= this.page * this.pagination)
				continue;
			this.elements[i].index = j;
			html += this.buildElement(this.elements[i], 0, 0, this.elements.length == i + 1);
		}
		var jqHtml = $(html);
		this.table.setContentHtml(jqHtml);
	},

	exportToTextWith: function(delimiter, showColumns) {
		var html = "";
		var columns = this.table.getColumns(), element;
		if(showColumns)
			for(var i = 0; i < columns.length; i++) {
				html += columns[i].getName();
				html += delimiter;
			}
		html += "\n";
		for(var i = 0; i < this.elements.length; i++) {
			if(!this.doSearch(this.elements[i]))
				continue;
			element = this.elements[i];
			element.index = i;
			for(var j = 0; j < columns.length; j++) {
				var name = columns[j].getName();
				var elVal = element.data[name];
				html += elVal;
				html += delimiter;
			}
			html += "\n";
		}
		return html;
	},
	
	buildElement: function(element, parent, level, last) {
		
		this.index++;
		var html = [];
		var columns = this.table.getColumns();
		html.push('<tr data-element-id="');
		html.push(this.index);
		var index = this.index;
		html.push('" data-parent-id="');
		html.push(parent);
		html.push('" class="');
		html.push(parent !== 0 ? 'ci-table-hidden' : '');
		if(!element._colorVal)
			html.push(" " + element._color);
		html.push('"');
		if(element._highlight)
			html.push(' style="background-color: #ff0000"');
		else if(element._colorVal)
			html.push(' style="background-color: ' + element._colorVal + '"');
		html.push(">");
		var hasChildren = false;
		this.reIndexedElements[index] = element;
		if(level > 0)
			this.supNav[level] = last ? 'corner' : 'cross';
		for(var i = 0; i < columns.length; i++) {
			var name = columns[i].getName();
			
			hasChildren = false;
			if(element.children)
				hasChildren = true;
			var elVal = element.data[name];
			var elHtml = columns[i].buildElement(((typeof elVal != "undefined") ? elVal : ''), i == 0, this.supNav, hasChildren, level);
			html.push(elHtml);
		}
		html.push('</tr>');
		if(element.children) {
			if(level > 0)
				this.supNav[level] = last ? 'space' : 'barre';
			for(var i = 0, len = element.children.length; i < len; i++) {
				html.push(this.buildElement(element.children[i], index, level + 1, i == len - 1));		
			}
		}
		if(level > 0)
			delete this.supNav[level]; 
		return html.join('');
	},
	
	doSearch: function(element, term) {
	
		if(typeof this.search == "undefined" || this.search == null)
			return true;
		
		var columns = this.table.getColumns();
		for(var i = 0; i < columns.length; i++) {
			if(typeof(val = element.data[columns[i].getName()]) !== "undefined") {
				if(this.search.test(val))
					return true;
			}
		}
		return false;
	},
	
	setPagination: function(pagination) {
		this.pagination = pagination;
	},
	
	setPage: function(page) {
		this.page = page;
	},
	
	setSearch: function(search) {
		
		this.search = null;
		if(search == null)
			return;
		
		var metachars = ["[", "\\", "^", "$", ".", "|", "?", "*", "+", "(", ")"];
		for(var i = 0; i < metachars.length; i++)
			search.replace(metachars[i], "\\" + metachars[i]);
		search = search.toLowerCase();
		
		this.search = new RegExp(search, "gi");
	},
	
	sort: function(col, asc) {
		
		var elName = col.getName();
		this.elements.sort(function(a, b) {
			if(a.data[elName] === false) return 1;
			if(b.data[elName] === false) return -1;
			return a.data[elName] > b.data[elName] ? 1 : -1;
		});

		if(!asc)
			this.elements.reverse();
	},
	
	getElementById: function(id) {
		return this.reIndexedElements[id];
	},


	exportToTabDelimited: function() {
		return this.exportToTextWith("\t", true);
	}
}