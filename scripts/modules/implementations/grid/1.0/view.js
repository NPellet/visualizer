 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.grid == 'undefined')
	CI.Module.prototype._types.grid = {};

CI.Module.prototype._types.grid.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.grid.View.prototype = {
	
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
		this._highlights = this._highlights || [];

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
		
			CI.RepoHighlight.kill(this.module.id);
/*
			for(var i = 0; i < this._highlights.length; i++) {
				if(!this._highlights[i][0])
					continue;
				CI.RepoHighlight.unListen(this._highlights[i][0], this._highlights[i][1]);
			}
			this._highlights = [];
*/
			if(!moduleValue)
				return;
			var view = this;
			var jpaths = this.module.getConfiguration().colsjPaths;
			var colorJPath = this.module.getConfiguration().colorjPath;
			
			var Table = new CI.Tables.Table({
				
				onLineHover: function(element) {
					var source = element._source;
					view.module.controller.lineHover(source);
				},

				onLineOut: function(element) {
					var source = element._source;
					view.module.controller.lineOut(source);
				},
				
				onLineClick: function(element) {
					var source = element._source;
					view.module.controller.lineClick(source);
				},

				onPageChanged: function(newPage) {
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
				Columns[j] = Column;
			}
		
			var list = CI.DataType.getValueIfNeeded(moduleValue);
			var Content = new CI.Tables.Content();
			var elements = [];
			view.buildElement(list, elements, jpaths, colorJPath);
			for(var i = 0, length = elements.length; i < length; i++)
				Content.addElement(elements[i]);

			this.elements = elements;
			Table.setContent(Content);
			Table.init(view.domTable);

			CI.Util.ResolveDOMDeferred(Table.getDom());

			
		}
	},

	buildElement: function(source, arrayToPush, jpaths, colorJPath) {
		var jpath;
		var box = this.module;
		var self = this;

		for(var i = 0, length = source.length; i < length; i++) {
			var element = {};
			element.data = {};
			element._color;

			if(colorJPath)
				element._color = CI.DataType.asyncToScreenAttribute(source[i], 'bgcolor', colorJPath).done(function(val) {
					element._colorVal = val;
				});


			for(var j in jpaths) {
				jpath = jpaths[j];
				if(jpath.jpath)
					jpath = jpath.jpath;
				
					async = CI.DataType.asyncToScreenHtml(source[i], box, jpath);
					async.done(function(val) {
						element.data[j] = val;
					});
					if(element.data[j] == undefined)
						element.data[j] = async.html;
			}
			
			if(!source[i])
				continue;
			
			if(source[i].children) {
				element.children  = [];
				this.buildElement(source[i].children, element.children, jpaths, colorJPath);
			}

			var execFunc, id;
			(function(myElement) {
				if(source[i]._highlight) {
					execFunc = function(value, what) {
						myElement._highlight = value;
						self.table.highlight(myElement);
					};
					id = CI.RepoHighlight.listen(source[i]._highlight, execFunc, false, box.id);
				}
			}) (element);
			this._highlights.push([source[i]._highlight, id]);
			element._source = source[i];
			arrayToPush.push(element);
		}
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	}
}

 
