 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.grid_selector == 'undefined')
	CI.Module.prototype._types.grid_selector = {};

CI.Module.prototype._types.grid_selector.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.grid_selector.View.prototype = {
	
	init: function() {	
		this.domWrapper = $('<div class="ci-display-grid-selector"></div>');
		this.module.getDomContent().html(this.domWrapper);
		this.dom = $("<form></form>").appendTo(this.domWrapper);
		var self = this;
	},

	inDom: function() {},
	
	onResize: function() {
	},
	
	blank: function() {
		this.domTable.empty();
		this.table = null;
	},

	update2: {

		preferences: function(moduleValue) {
			
			if(!moduleValue)
				return;
			moduleValue = moduleValue.value;
			if(!moduleValue)
				return;
			var cols = moduleValue.categories;
			var lines = moduleValue.variables;
			this._selectors = {};
			
			html = '<table cellpadding="0" cellspacing="0">';
			for(var i = -1, l = lines.length; i < l; i++) {
				html += '<tr data-lineid="' + i + '" ' + (i > -1 ? ('style="background-color: ' + (lines[i].color) + '"') : '') + '>';

				if(i == -1) // First line
					html += '<th></th>';
				else
					html += '<td>' + lines[i].label + '</td>';
				
				for(var j = 0, k = cols.length; j < k; j++) {

					if(i == -1)
						html += '<th width="' + (cols[j].selectorType == 'checkbox' ? '100' : '') + '" data-colid="' + j + '">' + cols[j].label + '</th>';
					else {
						value = undefined;
						if(this.module.getConfiguration()._data !== undefined && this.module.getConfiguration()._data[cols[j].name] !== undefined && this.module.getConfiguration()._data[cols[j].name][lines[i].name] !== undefined)
							value = this.module.getConfiguration()._data[cols[j].name][lines[i].name];
						html += '<td data-colid="' + j + '">' + this.getSelector(cols[j], lines[i], j, i, value) + '</td>';
					}
				}
				html += '</tr>';
			}
			html += '</table>';
			
			this.module.controller.setSelector(this._selectors);
			this.dom.html(html);
			this.setEvents();
		}
	},

	setEvents: function() {
		var self = this;
		$(this.dom).find('input[type="checkbox"]').bind('click', function() {
			var $this = $(this);
			var colId = $this.data('colid'), lineId = $this.data('lineid');
			self.module.controller.selectorChanged(colId, lineId, $(this).is(':checked'));
		});

		$(this.dom).find('.ci-rangebar').each(function() {
			var $this = $(this);
			var min = $this.data('defaultmin');
			var max = $this.data('defaultmax');
			$this.slider({
				range: true,
				min: $(this).data('minvalue'),
				max: $(this).data('maxvalue'), 
				step: 0.01,
				values: [min, max],
				slide: function(event, ui) {
					var $this = $(this);
					var colId = $this.data('colid'), lineId = $this.data('lineid');

					self.module.controller.selectorChanged(colId, lineId, ui.values);
				}
			});
		});
	},

	getSelector: function(col, line, colId, lineId, value) {
		this._selectors[col.name] = this._selectors[col.name] || {};
		if(col.selectorType == 'checkbox') {
			var id = CI.Util.getNextUniqueId();
			var defaultVal = value !== undefined ? value : col.defaultValue;
			this._selectors[col.name][line.name] = defaultVal;
			return '<input type="checkbox" id="' + id + '" ' + (defaultVal ? 'checked="checked"' : '') + '" data-colid="' + col.name + '" data-lineid="' + line.name + '" /><label for="' + id + '">&nbsp;</label>';
		} else if(col.selectorType == 'range') {
			var _val = [];
			_val[0] = (value ? value[0] : col.defaultMinValue);
			_val[1] = (value ? value[1] : col.defaultMaxValue);
			this._selectors[col.name][line.name] = _val;
			return '<div class="ci-rangebar" data-minvalue="' + col.minValue + '" data-maxvalue="' + col.maxValue + '" data-defaultmin="' + _val[0] + '" data-defaultmax="' + _val[1] + '" data-colid="' + col.name + '" data-lineid="' + line.name + '"></div>';
		}
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	
	}
}

 