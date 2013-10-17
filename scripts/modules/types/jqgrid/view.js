define(['require', 'modules/defaultview', 'util/util', 'util/api', 'util/domdeferred', 'util/datatraversing', 'util/typerenderer', 'libs/jqgrid/js/jqgrid'], function(require, Default, Util, API, DomDeferred, Traversing, Renderer, JQGrid) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

	 	init: function() {	

	 		var self = this, lastTr;

	 		this.uniqId = Util.getNextUniqueId();
			this.unique = Util.getNextUniqueId();
    	

	 		this.dom = $('<div class="ci-displaylist-list"></div>');
	 		this.domTable = $("<table />").attr('id', this.unique).css({width: '100%'});


	 		this.dom.on('mouseover', 'tr.jqgrow', function() {

	 			if(this !== lastTr)
					self.module.controller.lineHover(self.elements[$(this).attr('id').replace(self.uniqId, '')]);

				lastTr = this;

	 		}).on('mouseout', 'tr.jqgrow', function() {

	 			if(this == lastTr) {
					self.module.controller.lineOut(self.elements[$(this).attr('id').replace(self.uniqId, '')]);
					lastTr = this;
	 			}

				
	 		});

			var filter = this.module.getConfiguration().filterRow || '';
			eval("self.filter = function(jqGrid, source, rowId) { try { \n " + filter + "\n } catch(_) { console.log(_); } }");
	 		var inst = this;
	 		this.module.getDomContent().html(this.dom);
	 		this._highlights = this._highlights || [];

	 		this.onReady = $.Deferred();

	 	},

	 	unload: function() {
	 		this.jqGrid('GridDestroy');
	 		this.jqGrid = false;
	 		this.module.getDomContent().empty();
	 	},

	 	inDom: function() {

			var self = this, 
				colNames = [], 
				colModel = [], 
				j,
				editable,
				jpaths = this.module.getConfiguration().colsjPaths;


			if( typeof jpaths == 'object' ) {

				for( j in jpaths ) {

					editable = ( jpaths[j].editable !== 'none' && jpaths[j].editable !== 'false' && jpaths[j].editable !== '' );

					colNames.push(j);
					colModel.push({
						name: j, 
						index: j, 
						title: false, 
						editable: editable,
						editoptions: jpaths[j].editable == 'select' ? { value: jpaths[j].options } : {},
						edittype: editable ? jpaths[j].editable : false,
						_jpath: jpaths[j].jpath,
						sortable: true,
						sorttype: jpaths[j].number ? 'float' : 'text'
					});
				}
			}



			var nbLines = this.module.getConfiguration().nbLines || 20;	

			this.domTable = $("<table />").attr('id', this.unique).appendTo(this.dom);
			this.domPaging = $('<div />', { id: "pager" + this.unique }).appendTo(this.dom);
			

			$(this.domTable).jqGrid({		 			
			   	colNames: colNames,
			   	colModel: colModel,
			   	
			   	editable: true,
			   	sortable: true,
			  // 	sortname: j,
			   	loadonce: false,
			   	//width: '100%',
				datatype: "local",
			  //forceFit: true,
			//   	autowidth: true,
			   	gridview: true,
			   	scrollerbar: true,
			   	height: "100%",
			   	forceFit: true,
			   	shrinkToFit: true,
			   	cellsubmit: 'clientArray',
			   	cellEdit: true,
			   	rowNum: nbLines,
			   	rowList: [2, 10,20,30,100],
			  	pager: '#pager' + this.unique,
			//   	height: '100%',

			   	rowattr: function() {
			   		if(arguments[1]._backgroundColor)
			   			return {'style': 'background-color: ' + arguments[1]._backgroundColor };
			   	},
			   	afterSaveCell: function(rowId, colName, value, rowNum, colNum) {
			   	
			   		if(jpaths[colModel[colNum].name].number)
			   			value = parseFloat(value);
			   		self.elements[rowId.replace(self.uniqId, '')].setChild(colModel[colNum]._jpath, value, { moduleid: self.module.getId() });
			   		
			   		self.applyFilterToRow(rowId.replace(self.uniqId, ''), rowId);
			   	},

			   	loadComplete: function() {

			   		if(!self.jqGrid)
			   			return;
					var ids = self.jqGrid('getDataIDs');
					for(var i = 0; i < ids.length; i++) {
						//console.log(ids[i], ids[i].replace(self.uniqId, ''), self.elements);
						var id = ids[i].replace(self.uniqId, '');
						self.applyFilterToRow(id, ids[i]);
						self.tableElements[id]._inDom.resolve();
					}


			   	},

			    viewrecords: true,
			    onSelectRow: function( rowid, status ) {
			    	//rowid--; // ?? Plugin mistake ?

			    	if ( status ) {

			    		self.module.controller.onToggleOn(self.elements[rowid.replace(self.uniqId, '')]);

			    	} else {

			    		self.module.controller.onToggleOff(self.elements[rowid.replace(self.uniqId, '')]);

			    	}

					self.module.controller.lineClick(self.elements[rowid.replace(self.uniqId, '')]);
			    },
			});


			this.jqGrid = $.proxy( $( this.domTable ).jqGrid, $( this.domTable ) );
			this.onReady.resolve();
	 	},


	 	applyFilterToRow: function(elId, rowId) {

			if( this.filter )
			   	this.filter( this.jqGrid, this.elements[ elId ], rowId );
	 	},

	 	onResize: function(w, h) {
	 		this.w = w;
	 		this.h = h;

	 		if(!this.jqGrid)
	 			return;
	 		this.jqGrid('setGridWidth', w);
	 		this.jqGrid('setGridHeight', h - 26 - 27);
	 	},

	 	blank: {

	 		list: function() {
				this.jqGrid('clearGridData');
				$(this.domTable).trigger("reloadGrid");
	 		}
	 	
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
			//	this.jqGrid('clearGridData');
				
				this.tableElements = elements;

				var allEls = [];
				for(var i = 0; i < elements.length; i++) {
					allEls.push(elements[i]);
					
/*					this.applyFilterToRow(elements[i].id);
					elements[i]._inDom.resolve();*/
				}


				this.jqGrid('setGridParam', { datatype: 'local', data:allEls });
				$(this.domTable).trigger("reloadGrid");

				this.onResize(this.w, this.h);
				//this.jqGrid('sortGrid');
			}
		},

		inDomEl: function(el) {
			if(el.build)
				el.build();
		},

		buildElements: function(source, arrayToPush, jpaths, colorJPath, muteListen) {
			var self = this,
				jpath;
			self.done = 0;
			for(var i = 0, length = source.length; i < length; i++) {
				arrayToPush.push(this.buildElement(source[i], self.uniqId + i, jpaths));
			}
		},

		buildElement: function(s, i, jp, m) {

			var self = this,
				element = {};

			if(!m)
				this.listenFor(s, jp, i);

			element['id'] = String(i);
			element['__source'] = s;

			if(s._highlight) {
				API.listenHighlight(s._highlight, function(onOff, key) {
					$("#" + i)[onOff ? 'addClass' : 'removeClass']('ci-highlight');
				});
			}

			element._inDom = $.Deferred();
			for(var j in jp) {
				var jpath = jp[j]; jpath = jpath.jpath;
				element[j] = 'Loading';
				self.done++;
				element[";" + j] = this.renderElement(element, s, jpath, j);
			}
			
			s.getChild(this.module.getConfiguration().colorjPath).done(function(value) {
				element._backgroundColor = value;
			});
			return element;
		},

		listenFor: function(source, jpaths, id) {
			var self = this;
			source.onChange(function( data ) {

	
				var element = self.buildElement( data, id, jpaths, true );
				self.jqGrid( 'setRowData', id, element );
				var scroll = $("body").scrollTop();

				//console.log(self.jqGrid('getLocalRow', id));
//console.log(self.elements);
//				self.jqGrid( 'setSelection', id );


				var target = $("tr#" + id, self.domTable).effect('highlight', {}, 1000).get(0);
				if(target)
					target.scrollIntoView();

				$("body").scrollTop(scroll);
			}, self.module.getId());
		},

		renderElement: function(element, source, jpath, l) {
			var self = this, box = self.module;
			var defScreen = Renderer.toScreen(source, box, {}, jpath);

			$.when(element._inDom, defScreen).then(function(something, value) {
				element[l] = value;
				self.done--;
				self.jqGrid('setCell', element.id, l, value);

				if(defScreen.build)
					defScreen.build();
				
				if(self.done == 0) {
					self.onResize(self.w, self.h);
				}
			}, function(value) {

				element[l] = value;
				self.done--;
				
				if(self.done == 0) {
					self.onResize(self.w, self.h);
				}
				
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
				var el = this.buildElement(source, this.uniqId + l, jpaths);
				this.gridElements.push(el);

				this.jqGrid('addRowData', el.id, el);

			//	API.setVariable(this.module.getNameFromRel('list'), this.module.data, false, true);
			},

			removeRow: function(el) {
				this.elements = this.elements || [];
				var id, index;
				console.log(this.gridElements);
				for(var i = 0, l = this.gridElements.length; i < l; i++) {
					if(this.gridElements[i].__source == el) {

						id = this.gridElements[i].id;
						index = i;
						break;
					}
				}

				this.jqGrid('delRowData', id);
				
				this.elements.splice(index, 0, 1);
				this.gridElements.splice(index, 0, 1);

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
			module.view.onResize(this.w, this.h);
			module.model.resetListeners();	
			module.updateAllView();
		},


		typeToScreen: {

		}
	});

	return view;
});