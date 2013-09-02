define(['require', 'modules/defaultview', 'util/util', 'util/api', 'util/domdeferred', 'util/datatraversing', 'util/typerenderer', 'libs/jqgrid/js/jqgrid'], function(require, Default, Util, API, DomDeferred, Traversing, Renderer, JQGrid) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

	 	init: function() {	

	 		var self = this;
			this.unique = Util.getNextUniqueId();
    		Util.loadCss(require.toUrl('libs/jqgrid/css/ui.jqgrid.css'));
    
	 		
	 		this.dom = $('<div class="ci-displaylist-list"></div>');
	 		this.domTable = $("<table />").attr('id', this.unique);

	 		this.dom.on('mouseover', '.jqgrow', function() {

				self.module.controller.lineHover(self.elements[$(this).attr('id')]);
	 		}).on('mouseout', '.jqgrow', function() {
				self.module.controller.lineOut(self.elements[$(this).attr('id')]);
	 		});

	 		this.domPaging = $('<div id="#pager' + this.unique + '"></div>');
	 		this.domSearch = $("<div />").addClass('ci-grid-search');
	 		
	 		var inst = this;
	 		if(this.module.getConfiguration().displaySearch) {
	 			var searchInput = $("<input />").bind('keyup', function() {
	 				if(inst.table)
	 					inst.table.doSearch($(this).val());
	 			});
	 			this.domSearch.append(searchInput);
	 			this.domSearch.prepend("<span>Search : </span>");
	 		}
	 		this.dom.append(this.domSearch).append(this.domPaging).append(this.domTable);
	 		this.module.getDomContent().html(this.dom);
	 		this._highlights = this._highlights || [];
	 	},

	 	inDom: function() {},

	 	onResize: function(w, h) {

	 		if(!this.jqGrid)
	 			return;
	 		this.jqGrid('setGridWidth', w-30);
	 		this.jqGrid('setGridHeight', h - 40);
	 	},

	 	blank: function() {
	 		this.domTable.empty();
	 		this.table = false;
	 	},

	 	update: {

	 		list: function(moduleValue) {
	 		
	 			var jpaths = this.module.getConfiguration().colsjPaths, self = this;
	 			this.module.data = moduleValue;

	 			if(jpaths[''])
	 				return;

	 			if(jpaths.length == 0)
	 				return;
				var colNames = [];
				var colModel = [];
				for(var j in jpaths) {
					colNames.push(j);
					colModel.push({name: j, index: j, width: 100, title: false , editable: true, _jpath: jpaths[j].jpath});
				}
				//colModel[colModel.length - 1].width = "*";
				nbLines = this.module.getConfiguration().nbLines || 10;	

				if(self.jqGrid) {
					self.jqGrid('GridDestroy');
					self.jqGrid = undefined;
					this.domTable = $("<table />").attr('id', this.unique).appendTo(this.dom);
				}

				$(this.domTable).jqGrid({		 			
				   	colNames: colNames,
				   	colModel: colModel,
				   	rowNum: nbLines,
				   	editable: true,
				   	cellsubmit: 'clientArray',
				   	cellEdit: true,
				   	rowList:[10,20,30,100],
				   	pager: '#pager' + this.unique,
				   	rowattr: function() {
				   		if(arguments[1]._backgroundColor)
				   			return {'style': 'background-color: ' + arguments[1]._backgroundColor };
				   	},
				   	afterSaveCell: function(rowId, colName, value, rowNum, colNum) {
				   		if(jpaths[colModel[colNum].name].number)
				   			value = parseFloat(value);
				   		

				   		Traversing.setValueFromJPath(self.elements[rowId], colModel[colNum]._jpath, value);
				   	},
				    viewrecords: true,
				    onSelectRow: function(rowid, status) {
				    	if(status)
				    		self.module.controller.onToggleOn(self.elements[rowid]);
				    	else
				    		self.module.controller.onToggleOff(self.elements[rowid]);
						self.module.controller.lineClick(self.elements[rowid]);
				    },
				});


				this.jqGrid = $.proxy($(this.domTable).jqGrid, $(this.domTable));
				
				var view = this;
				var list = Traversing.getValueIfNeeded(moduleValue);
				this.elements = list;

				var elements = [];
				view.buildElement(list, elements, jpaths);
				this.gridElements = elements;

				for(var i = 0; i < elements.length; i++) {
					this.jqGrid('addRowData', i, elements[i]);
				}

				this.onResize(this.width || this.module.getWidthPx(), this.height || this.module.getHeightPx());
			}
		},

		buildElement: function(source, arrayToPush, jpaths, colorJPath) {
			var jpath;
			
			var self = this;
			self.done = 0;
			for(var i = 0, length = source.length; i < length; i++) {
				var element = {};

				Traversing.listenDataChange(source[i], function(data) {

					var id = source.indexOf(data);
					var element = {};
					for(var j in jpaths) {
						jpath = jpaths[j]; jpath = jpath.jpath || jpath;
						element[j] = 'Loading';
						element["_" + j] = self.renderElement(element, data, jpath, id, j);
					}
					
					self.jqGrid('setRowData', id, element);
					var scroll = $("body").scrollTop();
					var target = $("tr#" + id, self.domTable).effect('highlight', {}, 1000).get(0).scrollIntoView();
					$("body").scrollTop(scroll);
					
				});
					
				for(var j in jpaths) {
					jpath = jpaths[j]; jpath = jpath.jpath || jpath;
					element[j] = 'Loading';
					(function(k, l) {
						self.done++;
						element["_" + l] = self.renderElement(element, source[k], jpath, k, l);
					}) (i, j);
				}
				Traversing.getValueFromJPath(source[i], this.module.getConfiguration().colorjPath).done(function(value) {

					element._backgroundColor = value;
				});
				
				arrayToPush.push(element);
			}
		},

		renderElement: function(element, source, jpath, k, l) {
			var self = this, box = self.module;
			return Renderer.toScreen(source, box, {}, jpath).done(function(value) {
				element[l] = value;
				self.done--;
				self.jqGrid('setCell', k, l, value);
				if(self.done == 0)
					self.onResize(self.width || self.module.getWidthPx(), self.height || self.module.getHeightPx());
			});
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