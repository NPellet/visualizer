define(['require', 'modules/defaultview', 'util/util', 'util/api', 'util/domdeferred', 'util/datatraversing', 'util/typerenderer', 'libs/jqgrid/js/jqgrid'], function(require, Default, Util, API, DomDeferred, Traversing, Renderer, JQGrid) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

	 	init: function() {	

	 		var self = this;
			this.unique = Util.getNextUniqueId();
    		Util.loadCss(require.toUrl('libs/jqgrid/css/ui.jqgrid.css'));

	 		this.dom = $('<div class="ci-displaylist-list"></div>');
	 		this.domTable = $("<table />").attr('id', this.unique).css({width: '100%'});


	 		this.dom.on('mouseover', '.jqgrow', function() {
				self.module.controller.lineHover(self.elements[$(this).attr('id')]);
	 		}).on('mouseout', '.jqgrow', function() {
				self.module.controller.lineOut(self.elements[$(this).attr('id')]);
	 		});

	 		//this.domPaging = $('<div id="#pager' + this.unique + '"></div>');
	 		//this.domSearch = $("<div />").addClass('ci-grid-search');
	 		
			var filter = this.module.getConfiguration().filterRow || '';

			eval("self.filter = function(jqGrid, source, rowId) { try { \n " + filter + "\n } catch(_) { console.log(_); } }");


	 		var inst = this;
	 		/*if(this.module.getConfiguration().displaySearch) {
	 			var searchInput = $("<input />").bind('keyup', function() {
	 				if(inst.table)
	 					inst.table.doSearch($(this).val());
	 			});
	 			this.domSearch.append(searchInput);
	 			this.domSearch.prepend("<span>Search : </span>");
	 		}*/
	 		this.dom.//append(this.domSearch).append(this.domPaging).
				append(this.domTable);

	 		this.module.getDomContent().html(this.dom);
	 		this._highlights = this._highlights || [];

	 		this.onReady = $.Deferred();

	 	},

	 	unload: function() {
	 		this.jqGrid('GridDestroy');
	 		this.module.getDomContent().empty();
	 	},

	 	inDom: function() {

			var self = this, 
				colNames = [], 
				colModel = [], 
				jpaths = this.module.getConfiguration().colsjPaths;

			if(typeof jpaths == 'object') {
				for(var j in jpaths) {
					colNames.push(j);
					colModel.push({
						name: j, 
						index: j, 
						title: false, 
						editable: jpaths[j].editable || false,
						_jpath: jpaths[j].jpath,
						sortable: true,
						sorttype: jpaths[j].number ? 'float' : 'text'
					});
				}
			}


			//colModel[colModel.length - 1].width = "*";
			var nbLines = this.module.getConfiguration().nbLines || 10;	

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
			   	sortable: true,
			   	sortname: j,
			   	
			   	width: '100%',
				datatype: "local",
			   	//forceFit: true,
			   	autowidth: true,
			   	
			   	forceFit: true,
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
			   		self.elements[rowId].setChild(colModel[colNum]._jpath, value, { moduleid: self.module.getId() });
			   		self.applyFilterToRow(rowId);
			   	},
			    viewrecords: true,
			    onSelectRow: function(rowid, status) {
			    	//rowid--; // ?? Plugin mistake ?
			    	if(status) {
			    		self.module.controller.onToggleOn(self.elements[rowid]);
			    	} else {
			    		self.module.controller.onToggleOff(self.elements[rowid]);
			    	}
					self.module.controller.lineClick(self.elements[rowid]);
			    },
			});


			this.jqGrid = $.proxy($(this.domTable).jqGrid, $(this.domTable));
			this.onReady.resolve();
	 	},


	 	applyFilterToRow: function(rowId) {
			if(this.filter)
			   	this.filter(this.jqGrid, this.elements[rowId], rowId);
	 	},

	 	onResize: function(w, h) {

	 		if(!this.jqGrid)
	 			return;
	 		this.jqGrid('setGridWidth', w);
	 		this.jqGrid('setGridHeight', h);
	 	},

	 	blank: function() {
	 		this.domTable.empty();
	 		this.table = false;
	 	},

	 	update: {

	 		list: function(moduleValue) {

	 			if(!moduleValue)
	 				return;

	 			var self = this, 
	 				jpaths = this.module.getConfiguration().colsjPaths, 
	 				list = moduleValue.get(),
	 				elements = []


	 			this.elements = list;
	 			this.module.data = moduleValue;

				this.buildElements(list, elements, jpaths);
				this.gridElements = elements;
				this.jqGrid('clearGridData');
				for(var i = 0; i < elements.length; i++) {
					this.jqGrid('addRowData', i, elements[i]);
					this.applyFilterToRow(i);
				}
				this.onResize(this.width || this.module.getWidthPx(), this.height || this.module.getHeightPx());
			}
		},

		buildElements: function(source, arrayToPush, jpaths, colorJPath, muteListen) {
			var self = this,
				jpath;
			self.done = 0;
			for(var i = 0, length = source.length; i < length; i++) {
				arrayToPush.push(this.buildElement(source[i], i, jpaths));
			}
		},

		buildElement: function(s, i, jp, m) {
			var element = {};
			if(!m)
				this.listenFor(s, jp, i);
			for(var j in jp) {
				var jpath = jp[j]; jpath = jpath.jpath || jpath;
				element[j] = 'Loading';
				self.done++;
				element["_" + j] = this.renderElement(element, s, jpath, i, j);
			}

			s.getChild(this.module.getConfiguration().colorjPath).done(function(value) {
				element._backgroundColor = value;
			});
			return element;
		},

		listenFor: function(source, jpaths, id) {
			var self = this;

			source.onChange(function(data) {
				var element = self.buildElement(source, id, jpaths, true);
				self.jqGrid('setRowData', id, element);
				var scroll = $("body").scrollTop();
				var target = $("tr#" + id, self.domTable).effect('highlight', {}, 1000).get(0).scrollIntoView();
				$("body").scrollTop(scroll);
			}, self.module.getId());
		},

		renderElement: function(element, source, jpath, k, l) {
			var self = this, box = self.module;
			return Renderer.toScreen(source, box, {}, jpath).then(function(value) {
				element[l] = value;
				self.done--;
				self.jqGrid('setCell', k, l, value);
				if(self.done == 0)
					self.onResize(self.width || self.module.getWidthPx(), self.height || self.module.getHeightPx());
			}, function() {
				self.done--;
				source.set(jpath, 'N/A', { mute: true });
				self.jqGrid('setCell', k, l, 'N/A');
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
			},

			addColumn: function(jpath) {
				var module = this.module;
				var jpath2 = jpath.split('.');
					jpath2 = jpath2.pop();

				module.getConfiguration().colsjPaths[jpath2] = { editable: false, jpath: jpath, number: false };
				this.reloadModule();
			},

			removeColumn: function(jpath) {
				var module = this.module;
				var jpaths = module.getConfiguration().colsjPaths;
				for(var i in jpaths) {
					if(jpaths[i].jpath == jpath)
						delete jpaths[i];
				}
				this.reloadModule();

			}
		},

		reloadModule: function() {
			var module = this.module;
			if(module.view.unload)
				module.view.unload();
			module.view.init();
			module.view.inDom();
			module.view.onResize(module.view.width || module.getWidthPx(), module.view.height || module.getHeightPx());
			module.model.resetListeners();	
			module.updateAllView();
		},


		typeToScreen: {

		}
	});

	return view;
});