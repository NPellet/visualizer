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

	 		this.onReady = $.Deferred();

	 	},

	 	inDom: function() {


			var colNames = [];
			var colModel = [];
			var jpaths = this.module.getConfiguration().colsjPaths
			if(typeof jpaths == 'object') {
				for(var j in jpaths) {
					colNames.push(j);
					colModel.push({
						name: j, 
						index: j, 
						title: false, 
						editable: jpaths[j].editable || false,
						_jpath: jpaths[j].jpath
					});
				}
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
			   	forceFit: true,
			   	autoWidth: true,
			   	shrinkToFit: true,
			   	cellsubmit: 'clientArray',
			   	cellEdit: true,
			   	rowList: [10,20,30,100],
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
			this.onReady.resolve();
	 	},

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
	 		
	 			var jpaths = this.module.getConfiguration().colsjPaths

	 			var self = this;
	 			this.module.data = moduleValue;

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

		buildElements: function(source, arrayToPush, jpaths, colorJPath, muteListen) {
			var jpath;
			
			var self = this;
			self.done = 0;

			for(var i = 0, length = source.length; i < length; i++) {
				arrayToPush.push(this.buildElement(source[i], i, jpaths, arrayToPush));
			}
		},

		buildElement: function(s, i, jp, a) {
			var element = {};
			this.listenFor(s, jp, i);
			for(var j in jp) {
				var jpath = jp[j]; jpath = jpath.jpath || jpath;
				element[j] = 'Loading';
				self.done++;
				element["_" + j] = this.renderElement(element, s, jpath, i, j);
			}

			Traversing.getValueFromJPath(s, this.module.getConfiguration().colorjPath).done(function(value) {
				element._backgroundColor = value;
			});
			
			return element;
		},

		listenFor: function(source, jpaths, id) {
			var self = this;
			
			Traversing.listenDataChange(source, function(data) {
				var element = {};
				
				for(var j in jpaths) {
					jpath = jpaths[j]; jpath = jpath.jpath || jpath;
					element[j] = 'Loading';
					console.log('Render from Listen');
					element["_" + j] = self.renderElement(element, data, jpath, id, j);
				}
				self.jqGrid('setRowData', id, element);
				var scroll = $("body").scrollTop();
				var target = $("tr#" + id, self.domTable).effect('highlight', {}, 1000).get(0).scrollIntoView();
				$("body").scrollTop(scroll);
			});
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
				
				this.elements = this.elements || [];
				this.elements.push(source);
				this.module.data = this.elements;

				var jpaths = this.module.getConfiguration().colsjPaths;
				var l = this.elements.length - 1;
				var el = this.buildElement(source, l, jpaths);

				this.jqGrid('addRowData', l, el);
				
			//	API.setVariable(this.module.getNameFromRel('list'), this.module.data, false, true);
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