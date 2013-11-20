define(['modules/defaultview','util/datatraversing'], function(Default,Traversing) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			this.dom = $('<div class="ci-displaylist-list"></div>');
			this.domTable = $("<div />");
			this.domSearch = $("<div />").addClass('ci-grid-search');
			this.domExport = $("<div />");
			var inst = this;
			if(this.module.getConfiguration().displaySearch) {
				var searchInput = $("<input />").bind('keyup', function(e) {
					if(e.keyCode == 16)
						return;
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

		
		blank: function() {
			this.domTable.empty();
			this.table = null;
		},

		update: {

			list: function(moduleValue) {
			console.profile('a');
				if(this.disable) {
					this.disable = false;
					return;
				}
				var colorJPath = this.module.getConfiguration().colorjPath;
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
						
						var source = element._source;
						view.module.controller.lineHover(source, element);
					},

					onLineOut: function(element) {
						
						var source = element._source;
						view.module.controller.lineOut(source);
					},
					
					onLineClick: function(element) {
						
						var source = element._source;
						view.module.controller.lineClick(source, element);
					},

					onPageChanged: function(newPage) {
						
						CI.Util.ResolveDOMDeferred(Table.getDom());
					},

					onChange: function() {

						var name = view.module.getNameFromRel('list');
						view.disable = true;
						CI.API.setSharedVar(name, moduleValue);
					}
				});
				this.table = Table;
				this.table.setModule(this.module);

				var nbLines;
				if(nbLines = this.module.getConfiguration().nbLines)
					Table.setPagination(nbLines);
				
				var Columns = {};
				moduleValue = Traversing.getValueIfNeeded(moduleValue);
				var type = Traversing.getType(moduleValue);
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
			
				var list = Traversing.getValueIfNeeded(moduleValue);
				var Content = new CI.Tables.Content();

				var filter = this.module.getConfiguration().filterRow;
				
				eval("filter = function(value, oldValue, jpath, source, row, columns) { " + filter + " }");

				var elements = moduleValue;
				for(var i = 0, length = elements.length; i < length; i++) {

					if(elements[i] == null)
						continue;
					
					var row = new CI.Tables.Row(elements[i], Table, filter);
					Content.addRow(row);
					if(colorJPath) {
						CI.DataType.getValueFromJPath(elements[i], colorJPath).done(function(color) {
							row.setBackgroundColor(color);
						});					
					}
					
				}


				this.elements = elements;
				Table.setContent(Content);
				Table.init(view.domTable);
				CI.Util.ResolveDOMDeferred(Table.getDom());

				console.profileEnd('a');
			}
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		
		}


	});

	return view;
});