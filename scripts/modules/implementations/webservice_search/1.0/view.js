 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.webservice_search == 'undefined')
	CI.Module.prototype._types.webservice_search = {};

CI.Module.prototype._types.webservice_search.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.webservice_search.View.prototype = {
	
	init: function() {	
		var self = this;
		this.dom = $('<div></div>');
		this.search = $('<div class="Search"><input type="text" /></div>');
		this.domtable = $('<div class="Table"></div>');
		this.dom.append(this.search).append(this.domtable);
		this.module.getDomContent().html(this.dom);
		this.search.children().bind('keyup', function() {
			var searchTerm = $(this).val();
			var url = self.module.getConfiguration().url;
			$.getJSON(url.replace('%TERM%', searchTerm), {}, function(data) {
				self.onSearchDone(data);
			});
		});
	},

	inDom: function() {


		var Table = new CI.Tables.Table({
			onLineClick: function(element) {
				var source = element._source;
				view.module.controller.lineClick(source);
			}
		});
		
		this.table = Table;
		this.table.setModule(this.module);


		var jpaths = this.module.getConfiguration().colsjPaths;
		var Columns = {};
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

		Table.init(this.domtable);
		this.table = Table;
	},
	
	onResize: function() {
	},
	
	blank: function() {
		this.domTable.empty();
	},

	onSearchDone: function(elements) {
		var self = this;
		CI.DataType.getValueFromJPath(elements, this.module.getConfiguration().jpatharray).done(function() {

			if(!self.table)
				return;

			var Content = new CI.Tables.Content();		
			for(var i = 0, length = elements.length; i < length; i++) {
				var row = new CI.Tables.Row(elements[i], self.table);
				Content.addRow(row);
			}
			self.elements = elements;
			self.table.setContent(Content);
			CI.Util.ResolveDOMDeferred(self.table.getDom());
			self.table.commitContent();			
		});
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	}
}

 
