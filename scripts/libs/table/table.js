define(['require', 'util/util', './row', './content', './element', './column'], function(require, Util) {

	Util.loadCss(require.toUrl("./style.css"));

	var defaults = {
		cssPrefix: 'ci',
		onLineHover: null,
		onLineOut: null,
		onLineSelect: null,
		onPageChanged: null
	};

	var Table = function(options) {	
		this.options = $.extend(true, {}, defaults, options);
		this.pagination = 20;
		this.page = 1;
		this.search = null;
		this.content;
		this.cols = [];
	}

	Table.prototype = {
		
		
		addColumn: function(col) {
			this.cols.push(col);
			col.setId(this.cols.length - 1);
			col.setTable(this);
		},
		
		removeCol: function(col) {
			
			if(typeof col == "number")
				this.cols.splice(col, 1);
			else
				for(var i = 0; i < this.cols.length; i++) 
					if(this.cols[i] == col)
						this.cols.splice(i, 1);
		},

		
		setContent: function(content) {
			this.content = content;
			this.content.setTable(this);
			this.content.setPagination(this.pagination);
			this.content.setPage(this.page);
			this.content.setSearch(this.search);
		},

		getContent: function() {
			return this.content;
		},
		
		setContentHtml: function(html) {
			this.contentHtml = html;
			this.body.html(html);
		},
		
		setPagination: function(elPerPage) {
			this.pagination = elPerPage;
			this.execFuncContent('setPagination', [this.pagination]);
		},
		
		setPage: function(page) {
			this.page = page;
			this.execFuncContent('setPage', [this.page]);
			this.commitContent();
			if(typeof this.options.onPageChanged)
				this.options.onPageChanged(this.page);
		},
		
		execFuncContent: function(funcName, vars) {
			if(typeof this.content !== "undefined")
				this.content[funcName].apply(this.content, vars);
		},

		highlight: function(element) {
			// Acount for initial tr
			this.dom.find('tr').eq(element.index + 1).css('background-color', (element._highlight ? '#f5f48d' : ''));
		},
		
		buildTable: function() {
			
			if(this.dom) {
				this.body.empty();
				return this.dom;
			}
			
			var html = [];
			html.push('<table cellpadding="0" cellspacing="0" class="');
			html.push(this.options.cssPrefix);
			html.push('-table">');
			html.push('<thead><tr>');
			for(var i = 0; i < this.cols.length; i++)
				html.push(this.cols[i].buildHeader());
			html.push('</tr></thead>');
			html.push('<tbody>');
			html.push('</tbody>');
			html.push('</table>');
			this.dom = $(html.join(''));
			this.body = this.dom.children('tbody');
			return this.dom;
		},
		
		afterInit: function() {
			var inst = this;
			
			this.dom.on('click', '.ci-table-expand', function() {
				var el = $(this);
				var tr = el.parents('tr').eq(0);
				var id = tr.data('element-id');
				var html = el.children().html();
				el[html == '+' ? 'addClass' : 'removeClass']('bottom').children().html(html == '+' ? '-' : '+'); 
				tr.siblings('[data-parent-id="' + id + '"]').toggleClass('ci-table-hidden').find('.ci-table-expand').each(function() {
					if($(this).children().html() == '-')
						$(this).trigger('click');
				});
			})
			
			this.dom.on('click', 'th', function() {
				var col = inst.getColumn($(this).data('colname'));
				for(var i = 0, length = inst.cols.length; i < length; i++)
					inst.cols[i].cancelSort(false);
				var asc = col.doSort(asc);
				inst.content.sort(col, asc);
				inst.commitContent();
			});

			this.dom.children('tbody').on('mouseenter', 'tr', function(event, parameters) {
				
				if($(this).hasClass('ci-table-pagination'))
					return;

				if(typeof inst.options.onLineHover == "function")
					inst.options.onLineHover(inst.content.getElementById($(this).attr('data-elementid')), $(this), parameters);
			}).on('click', 'tr', function(event, parameters) {
				
				if($(this).hasClass('ci-table-pagination'))
					return;
				if(typeof inst.options.onLineClick == "function")
					inst.options.onLineClick(inst.content.getElementById($(this).attr('data-elementid')), $(this), parameters);
			}).on('mouseleave', 'tr', function(event, parameters) {
				if($(this).hasClass('ci-table-pagination'))
					return;

				if(typeof inst.options.onLineOut == "function")
					inst.options.onLineOut(inst.content.getElementById($(this).attr('data-elementid')), $(this), parameters);
			});
			
			for(var i = 0; i < this.cols.length; i++) {
				this.cols[i].afterInit();
			}
		},
		
		getColumn: function(name) {
			for(var i = 0; i < this.cols.length; i++)
				if(this.cols[i].getName() == name)
					return this.cols[i];
		},
		
		getColumns: function() {
			return this.cols;
		},
		
		commitContent: function() {
			if(this.content) {
				this.content.build();
				this.addPagination();
			}
		},
		
		init: function(dom) {
			this.buildTable();
			this.commitContent();
			dom.html(this.dom);
			this.afterInit();
		},

		toggleAllOff: function() {
			if(this.content)
				this.content.toggleAllOff();
		},
		
		getDom: function() {
			return this.dom;
		},

		doSearch: function(term) {
			this.content.setSearch(term);
			this.commitContent();
		},

		addPagination: function() {
			
			if(this.paginationDOM)
				this.paginationDOM.remove();
			var inst = this;
			var pages = Math.ceil(this.content.entryCount / this.pagination);
			var page = this.page;
			if(pages == 1)
				return;
			var html = "";
			html += '<tr class="ci-table-pagination"><td colspan="';
			html += this.cols.length;
			html += '">';		
			for(var i = 1; i <= pages; i++) {	
				html += '<span data-page="';
				html += i;
				html += '" class="';
				html += i == page ? 'ci-selected' : '';
				html += '">';
				html += i;
				html += '</span>';
			}
			
			html += '</td></tr>';
			this.paginationDOM = $(html).on('click', 'span', function() {
				inst.setPage($(this).data('page'));
			});
			this.body.append(this.paginationDOM);
		},

		exportToTabDelimited: function() {
			return this.content.exportToTabDelimited();
		},

		setModule: function(module) {
			this.module = module;
		},

		sendBack: function() {
			var inst = this;
			if(typeof inst.options.onChange == "function")
				inst.options.onChange();
		}
	}

	return Table;
});