if(!window[_namespaces['table']].Tables) window[_namespaces['table']].Tables = {};

window[_namespaces['table']].Tables.Row = function(jsonElement, Table, filter) {
	
	this._source = jsonElement;
	this.table = Table;
	this.filter = filter;
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

	build: function() {
		var tr = $("<tr />");
		this.tds = {};
		var cols = this.Content.getTable().getColumns();
		var defs = [];
		for(var i in cols) {
			defs.push(cols[i].buildRowCol(this._source, this));
		}
		var self = this;
		$.when.apply($, defs).then(function() {
			var j = 0;
			for(var i in cols) {
				var td = $("<td />").append(arguments[j]);
				self.tds[i] = td;
				tr.append(td);
				j++;
			}
		});
		this.tr = tr;
		return tr;
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