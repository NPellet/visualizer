define(['modules/defaultview', 'forms/title', 'util/util', 'util/api', 'util/domdeferred', 'util/datatraversing', 'libs/table/table', 'libs/table/content', 'libs/table/row', 'libs/table/column'], function(Default, Title, Util, API, DomDeferred, Traversing, Table, TableContent, TableRow, TableColumn) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

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


	 	},

	 	inDom: function() {},

	 	onResize: function() {
	 	},

	 	blank: function() {
	 		this.domTable.empty();
	 		this.table = false;
	 	},

	 	update: {

	 		list: function(moduleValue) {
	 			
	 			this.domTable.remove();
	 			var Content = new TableContent();
	 			this.Content = Content;
	 			API.killHighlight(this.module.id);
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

				this.module.data = moduleValue;

				var view = this;
				var jpaths = this.module.getConfiguration().colsjPaths;
				var colorJPath = this.module.getConfiguration().colorjPath;
				
				if(!this.table) {
					var _table = new Table({
						
						onLineHover: function(element) {
							var source = element._source;
							view.module.controller.lineHover(source);
						},

						onLineOut: function(element) {
							var source = element._source;
							view.module.controller.lineOut(source);
						},
						
						onLineClick: function(element, dom, params) {
							
							var source = element._source;
							view.module.controller.lineClick(source);

							var toggle = view.module.getConfiguration().toggle;

							if(!toggle)
								return;

							if(toggle == "single") {
								this.toggleAllOff();
							}

							element.selected = !element.selected;
							if(!element.selected) {
								view.module.controller.onToggleOff(source, element);
								dom.css('background-color', 'transparent');
							} else {
								view.module.controller.onToggleOn(source, element);
								dom.css('background-color', 'red');
							}
						},

						onPageChanged: function(newPage) {
							DomDeferred.notify(_table.getDom());
						}
					});
					this.table = _table;

					var Columns = {};
					for(var j in jpaths) {
						var Column = new TableColumn(j);
						Column.setTitle(new Title(j));
						if(jpaths[j].format)
							Column.format(jpaths[j].format);
						_table.addColumn(Column);
						Columns[j] = Column;
					}
				} else
					var _table = this.table;

				var nbLines;
				if(nbLines = this.module.getConfiguration().nbLines)
					_table.setPagination(nbLines);
				var type = Traversing.getType(moduleValue);
				var list = Traversing.getValueIfNeeded(moduleValue);

				var elements = [];
				view.buildElement(list, elements, jpaths, colorJPath);
				
				for(var i = 0, length = elements.length; i < length; i++)
					Content.addElement(elements[i]);
				this.elements = elements;
				_table.setContent(Content);
				_table.init(view.domTable);
				this.dom.append(this.domTable);
				DomDeferred.notify(_table.getDom());
			}
		},

		buildElement: function(source, arrayToPush, jpaths, colorJPath) {
			var jpath;
			var box = this.module;
			var self = this;


			for(var i = 0, length = source.length; i < length; i++) {
				var element = {};
				element.data = {};
				
				if(colorJPath)
					Traversing.getValueFromJPath(source[i], colorJPath).done(function(val) {
						element._color = val;
					});
				else
					element._color = '';

				for(var j in jpaths) {
					jpath = jpaths[j]; jpath = jpath.jpath || jpath;
					element.data[j] = Traversing.getValueFromJPath(source[i], jpath).done(function() {
					});
				}

				if(!source[i])
					continue;
				
				if(source[i].children) {
					element.children  = [];
					this.buildElement(source[i].children, element.children, jpaths, colorJPath);
				}

				var id;
				(function(myElement) {
					if(source[i]._highlight) {
						id = API.listenHighlight(source[i]._highlight, function(value, what) {
							myElement._highlight = value;
							self.table.highlight(myElement);
						}, false, box.id);
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

		onActionReceive:  {

			addRow: function(source) {
				if(!this.table)
					this.update.list.call(this, []);
				this.module.data.push(source);
				API.setVariable(this.module.getNameFromRel('list'), this.module.data);
			},

			removeRow: function(el) {
				
				for(var i = 0, l = this.module.data.length; i < l; i++) { 
					if(this.module.data[i] == el) {
						this.module.data.splice(i, 1);
						break;
					}
				}
				API.setVariable(this.module.getNameFromRel('list'), this.module.data);
			}
		},

		typeToScreen: {

		}
	});

	return view;
});