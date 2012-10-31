 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.editable_grid == 'undefined')
	CI.Module.prototype._types.editable_grid = {};

CI.Module.prototype._types.editable_grid.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.editable_grid.View.prototype = {
	
	init: function() {	
		this.dom = $('<div class="ci-displaylist-list"></div>');
		this.domTable = $("<div />");
		this.domSearch = $("<div />").addClass('ci-grid-search');
		this.domExport = $("<div />");
		var inst = this;
		if(this.module.getConfiguration().displaySearch) {
			var searchInput = $("<input />").bind('keyup', function() {
				if(inst.table)
					inst.table.doSearch($(this).val());;
			});
			this.domSearch.append(searchInput);
			this.domSearch.prepend("<span>Search : </span>");
		}
		this.dom.append(this.domSearch).append(this.domExport).append(this.domTable);
		this.module.getDomContent().html(this.dom);
		this._highlights = this._highlights || [];

		var self = this;
	},

	inDom: function() {},
	
	onResize: function() {
	},
	
	blank: function() {
		this.domTable.empty();
		this.table = null;
	},

	update2: {

		list: function(moduleValue) {
		

			for(var i = 0; i < this._highlights.length; i++) {
				if(!this._highlights[i][0])
					continue;
				CI.RepoHighlight.unListen(this._highlights[i][0], this._highlights[i][1]);
			}
			this._highlights = [];

			if(!moduleValue)
				return;
			var view = this;
			var jpaths = this.module.getConfiguration().colsjPaths;
			var Table = new CI.Tables.Table({
				
				onLineHover: function(element) {
					return;
					var source = element._source;
					view.module.controller.lineHover(source);
				},

				onLineOut: function(element) {
					return;
					//var source = element._source;
					view.module.controller.lineOut(source);
				},
				
				onLineClick: function(element) {
					return;
					var source = element._source;
					view.module.controller.lineClick(source);
				},

				onPageChanged: function(newPage) {
					return;
					CI.Util.ResolveDOMDeferred(Table.getDom());
				}
			});
			this.table = Table;
			
			var nbLines;
			if(nbLines = this.module.getConfiguration().nbLines)
				Table.setPagination(nbLines);
			
			var Columns = {};

			var type = CI.DataType.getType(moduleValue);
			for(var j in jpaths) {
				var Column = new CI.Tables.Column(j);
				Column.setTitle(new BI.Title(j));
				if(jpaths[j].format)
					Column.format(jpaths[j].format);
				Table.addColumn(Column);
				Column.setJPath(jpaths[j].jpath || jpaths[j].colnewjpath);
				Column.setAdditionEditable(jpaths[j].coloptions || '');
				Column.setEditableType(jpaths[j].editable);
				Columns[j] = Column;
			}
		
			var list = CI.DataType.getValueIfNeeded(moduleValue);
			var Content = new CI.Tables.Content();

			var filter = this.module.getConfiguration().filterRow;
			
			eval("filter = function(value, oldValue, jpath, source, row, columns) { " + filter + " }");

			var elements = moduleValue;
			for(var i = 0, length = elements.length; i < length; i++)
				Content.addRow(new CI.Tables.Row(elements[i], Table, filter));


			this.elements = elements;
			Table.setContent(Content);
			Table.init(view.domTable);
			CI.Util.ResolveDOMDeferred(Table.getDom());
		}
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	
	}
}

 
