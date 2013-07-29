define([], function() {

	var Content = function() {
		
		this.elements = [];
		this.table;
		this.seach;
		this.pagination;
		this.page;
		this.entryCount = 0;
		this.reIndexedElements = {};

		this.domDeferred = [];

		this.rows = [];
	}


	Content.prototype = {
		
		setTable: function(table) {
			this.table = table;
		},
		
		addElement: function(elJson) {
			this.elements.push(elJson);
			this.entryCount++;
		},

		removeElement: function(elJson) {
			for(var i = 0, l = this.elements.length; i < l; i++) {
				if(this.elements[i] == elJson)
					this.elements.splice(i, 1);
			}
		},

		addRow: function(Row) {
			this.setMode = 'rows';
			this.rows.push(Row);
			Row.init();
			Row.setContent(this);
		},

		getTable: function() {
			return this.table;
		},

		toggleAllOff: function() {
			for(var i = 0, l = this.elements.length; i < l; i++) {
				if(this.elements[i].selected) {
					this.table.getDom().find('tr[data-elementid="' + this.elements[i].index + '"]').trigger('click', true);
					this.elements[i].selected = false;
				}
			}
		},
		
		build: function() {
			var self = this, j = -1;
			if(this.setMode && this.setMode == 'rows') {
				
				var html = $("<tbody />");			
				this.reIndexedElements = {};
				this.index = 0;
				this.supNav = [];
				this.entryCount = 0;

				for(var i = 0; i < this.rows.length; i++) {
					if(!this.doSearch(this.rows[i]))
						continue;
					this.entryCount++;
					j++;
					if(j < (this.page - 1) * this.pagination || j >= this.page * this.pagination)
						continue;
					this.rows[i].index = j;
					html.append(this.rows[i].build(j));
					this.reIndexedElements[j] = this.rows[i];
				}

				this.table.setContentHtml(html.children());

			} else {

				var defs = [];
				var html = "";
				this.jqHtml = $("<table></table>");

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
					defs.push(this.buildElement(this.elements[i], 0, 0, this.elements.length == i + 1));
				}
				

				$.when.apply($, defs).then(function() {
					self.jqHtml.append.apply(self.jqHtml, arguments);
					self.table.setContentHtml(self.jqHtml.children().children());
				});
				
			}
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

			if(this.setMode == 'rows') {

				for(var i = 0; i < this.rows.length; i++) {


					for(var j = 0; j < columns.length; j++) {
						var elVal = CI.DataType.getValueFromJPath(this.rows[i]._source, columns[j].jpath).done(function(elVal) {
							html += elVal;
						});
						html += delimiter;

					}
					html += "\n";


				}
				
			} else {
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
			}
			return html;
		},
		
		buildElement: function(element, parent, level, last) {
			
			var defs = [], def = $.Deferred();
			this.index++;
			
			var columns = this.table.getColumns();
			var tr = $("<tr />");
			tr.attr('data-elementid', this.index);
			tr.attr('data-parent-id', parent);

			if(parent)
				tr.addClass('ci-table-hidden');

			if(element._color)
				tr.addClass(element._color);

			if(element._highlight)
				html.css('backgroundColor', '#ff0000');
			else if(element._color)
				html.css('backgroundColor', element._color);

			this.reIndexedElements[this.index] = element;

			if(level > 0)
				this.supNav[level] = last ? 'corner' : 'cross';

			for(var i = 0; i < columns.length; i++) {
				var elVal = element.data[columns[i].getName()];
				defs.push(columns[i].buildElement(elVal, i == 0, this.supNav, !!element.children, level));
			}

			$.when.apply($, defs).then(function() {
				tr.append.apply(tr, arguments);
				def.resolve(tr);
			});

			if(element.children) {
				if(level > 0)
					this.supNav[level] = last ? 'space' : 'barre';
				for(var i = 0, len = element.children.length; i < len; i++)
					tr.after(this.buildElement(element.children[i], index, level + 1, i == len - 1));		
			}
			if(level > 0)
				delete this.supNav[level]; 

			return def;
		},
		
		doSearch: function(element, term) {
		
			if(typeof this.search == "undefined" || this.search == null)
				return true;
			
			var columns = this.table.getColumns();

			if(this.setMode && this.setMode == 'rows') {
				var row = element;
				return row.doSearch(term);

			} else {
				for(var i = 0; i < columns.length; i++) {
					if(typeof(val = element.data[columns[i].getName()]) !== "undefined") {
						if(this.search.test(val))
							return true;
					}
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

			var colId = col.getId();
			if(this.setMode && this.setMode == 'rows') {
				this.rows.sort(function(a, b) {

					if(a._dataCols[colId].searchTerm === false) return 1;
					if(b._dataCols[colId].searchTerm === false) return -1;
					return a._dataCols[colId].searchTerm > b._dataCols[colId].searchTerm ? 1 : -1;
				});
				if(!asc)
					this.rows.reverse();
				

			} else {
				var elName = col.getName();
				this.elements.sort(function(a, b) {
					if(a.data[elName] === false) return 1;
					if(b.data[elName] === false) return -1;
					return a.data[elName] > b.data[elName] ? 1 : -1;
				});

				if(!asc)
					this.elements.reverse();
			}	
		},
		
		getElementById: function(id) {

			return this.reIndexedElements[id];
		},

		exportToTabDelimited: function() {
			return this.exportToTextWith("\t", true);
		}
	}

	return Content;
});