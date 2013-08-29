define(['require', 'modules/defaultview', 'util/util', 'util/api', 'util/domdeferred', 'util/datatraversing', 'libs/jqgrid/js/jqgrid'], function(require, Default, Util, API, DomDeferred, Traversing, JQGrid) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

	 	init: function() {	

	 		var self = this;
			this.unique = Util.getNextUniqueId();
    		Util.loadCss(require.toUrl('libs/jqgrid/css/ui.jqgrid.css'));
    
	 		
	 		this.dom = $('<div class="ci-displaylist-list"></div>');
	 		this.domTable = $("<table />");

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
				var colNames = [];
				var colModel = [];
				for(var j in jpaths) {
					colNames.push(j);
					colModel.push({name: j, index: j, width: 100, title: false });
				}
				//colModel[colModel.length - 1].width = "*";
				nbLines = this.module.getConfiguration().nbLines || 10;	
				$(this.domTable).jqGrid({		 			
				   	colNames: colNames,
				   	colModel: colModel,
				   	rowNum: nbLines,
				   	rowList:[10,20,30,100],
				   	pager: '#pager' + this.unique,
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
				this.module.data = moduleValue;
				var view = this;
				var list = Traversing.getValueIfNeeded(moduleValue);
				this.elements = list;

				var elements = [];
				view.buildElement(list, elements, jpaths);
				for(var i = 0; i < elements.length; i++) {
					this.jqGrid('addRowData', i, elements[i]);
				}

				this.onResize(this.width || this.module.getWidthPx(), this.height || this.module.getHeightPx());
			}
		},

		buildElement: function(source, arrayToPush, jpaths, colorJPath) {
			var jpath;
			var box = this.module;
			var self = this;

			for(var i = 0, length = source.length; i < length; i++) {
				var element = {};

				for(var j in jpaths) {
					jpath = jpaths[j]; jpath = jpath.jpath || jpath;
					element[j] = 'Loading';

					element["_" + j] = Traversing.toScreen(source[i], box, {}, jpath).done(function(value) {
						console.log(value);
						element[j] = value;
						console.log(value);
						self.jqGrid('setCell', i, j, value);
						//self.jqGrid('getLocalRow', i)[j] = value;
					});
				}

				arrayToPush.push(element)
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