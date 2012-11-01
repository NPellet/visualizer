if(!window[_namespaces['table']].Tables) window[_namespaces['table']].Tables = {};

window[_namespaces['table']].Tables.Row = function(jsonElement, Table, filter) {
	
	this._source = jsonElement;
	this.table = Table;
	this.filter = filter;
	this._dataCols = [];
}


window[_namespaces['table']].Tables.Row.prototype = {
	
	defaults: {
		sortable: false,
		display: true,
		searchable: true
	},

	setContent: function(Content) {
		this.Content = Content;
	},

	init: function() {
		var self = this;
		var cols = this.table.getColumns();
		var defs = [];
		for(var i in cols)
			defs.push(cols[i].buildRowCol(this._source, this));
		
		var self = this;
		this._mainDef = $.when.apply($, defs).then(function() {
			var j = 0;
			for(var i in cols) {
				self._dataCols[i] = arguments[j];

				j++;
			}

		});

	},

	build: function() {
		var tr = $("<tr />");
		this.tds = {};
		var cols = this.Content.getTable().getColumns();
		var self = this;
		this._mainDef.then(function() {
			for(var i in cols) {
				var td = $("<td />").append(self._dataCols[i].displayTerm);
				self.tds[i] = td;
				tr.append(td);
			}
		});
		this.tr = tr;
		return tr;
	},

	doSearch: function(term) {
		var val;
		var cols = this.table.getColumns();
		for(var i in cols) {
			val = this._dataCols[i].searchTerm;
			if(this.table.getContent().search.test(val))
				return true;
		}
		return false;
	},

	setBackgroundColor: function(color) {
		this.tr.css('backgroundColor', color);
	},

	hasChanged: function(value, jpath) {

		if(this.filter)
			this.filter(value, '', jpath, this._source, this, this.Content.getTable().getColumns());
	},

	reloadColFromJPath: function(jpath) {

		var cols = this.Content.getTable().getColumns();
		var self = this;
		for(var i in cols) {
			if(cols[i].jpath == jpath)
				cols[i].buildRowCol(this._source, this).done(function(value) {
					self.tds[i].html(value);
				});
		}


	}
}