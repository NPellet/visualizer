define([], function() {

	var Row = function(jsonElement, Table, filter) {
		
		this._source = jsonElement;
		this.table = Table;
		this.filter = filter;
		this._dataCols = [];
		this.tds = {};
	}


	Row.prototype = {
		
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
			
			this.tr = $("<tr />");
			var self = this;
			this._mainDef = $.when.apply($, defs).then(function() {
				var j = 0;
				for(var i in cols) {
					self._dataCols[i] = arguments[j];
					j++;
				}

			});

		},

		removeDom: function() {
			this.tr.remove();
		},

		overlay: function(message, color, fontcolor) {

			var div = $("<div>").css({
				position: 'absolute',
				width: this.tr.outerWidth(),
				height: this.tr.outerHeight(),
				textAlign: 'center',
				lineHeight: this.tr.outerHeight() + "px",
				backgroundColor: color || 'white',
				color: fontcolor || 'black',
				marginLeft: "-" + this.tds[0].css('padding-left'),
				marginTop: "-" + this.tds[0].css('margin-top'),
				fontWeight: 'bold'

			}).html(message).hide().show('slow');
			this.tds[0].prepend(div).css('vertical-align', 'top');
		},

		build: function(index) {
			this.tr.attr('data-elementid', index);	
			var cols = this.Content.getTable().getColumns();
			var self = this;

			if(!this.built) {
				this._mainDef.then(function() {
					for(var i in cols) {
						if(!self.tds[i]) {
							self.tds[i] = $("<td />").append(self._dataCols[i].displayTerm); 
							self.tr.append(self.tds[i]);
						}
					}
				});
				
				for(var i in cols) {
					if(cols[i].getEditableType() != 'button')
						this.hasChanged(self._dataCols[i], cols[i].jpath);
				}
				this.built = true;
			}
			return this.tr;
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

		hasChanged: function(obj, jpath) {
			if(!obj)
				return;

			if(this.filter)
				this.filter(obj.value, obj.oldValue, jpath, this._source, this, this.Content.getTable().getColumns());

		},

		reloadColFromJPath: function(jpath) {

			var cols = this.Content.getTable().getColumns();
			var self = this;
			for(var i in cols) {
				if(cols[i].jpath == jpath) {

					cols[i].buildRowCol(this._source, this).done(function(value) {
						self.tds[i].html(value.displayTerm);
					});
				}
			}
		},


		setBackgroundColor: function(color) {
			this.tr.css('backgroundColor', color);
		},

		getBackgroundColor: function() {
			return this.tr.css('backgroundColor');
		},

		setFontColor: function(color) {
			this.tr.css('color', color);
		},

		setItalic: function(bln) {
			this.tr.css('font-style', bln ? 'italic' : 'normal');
		},

		setBold: function(bln) {
			this.tr.css('font-weight', bln ? 'bold' : 'normal');
		}
	}

	return Row;
});