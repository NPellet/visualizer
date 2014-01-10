define(['modules/default/defaultview','src/util/util'], function(Default, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			this.domWrapper = $('<div class="ci-display-grid-selector"></div>');
			this.module.getDomContent().html(this.domWrapper);
			this.dom = $("<form></form>").appendTo(this.domWrapper);
			var self = this;
		},

		
		blank: function() {
			this.domTable.empty();
			this.table = null;
		},

		update: {

			preferences: function(moduleValue) {
				
				if(!moduleValue)
					return;
				moduleValue = moduleValue.value;
				if(!moduleValue)
					return;
				var cols = moduleValue.categories;
				var lines = moduleValue.variables;

				this.cols = cols;
				this.lines = lines;

				this._selectors = {};
				
				html = '<table cellpadding="0" cellspacing="0">';
				for(var i = -2, l = lines.length; i < l; i++) {
					html += '<tr data-lineid="' + i + '" ' + (i > -1 ? ('style="background-color: ' + (lines[i].color) + '"') : '') + '>';

					if(i == -1) // First line
						html += '<td></td>';
					else if(i == -2)
						html += '<th>All</th>';
					else
						html += '<td>' + lines[i].label + '</td>';

					for(var j = 0, k = cols.length; j < k; j++) {
						if(i == -2)
							html += '<th width="' + (cols[j].selectorType == 'checkbox' ? '100' : '') + '" data-colid="' + j + '">' + cols[j].label + '</th>';
						else if(i == -1) {
							html += '<td data-colid="' + j + '">' + this.getSelector(cols[j], null, j, i) + '</td>';
						} else {
							value = undefined;
							if(this.module.getConfiguration()._data !== undefined && this.module.getConfiguration()._data[cols[j].name] !== undefined && this.module.getConfiguration()._data[cols[j].name][lines[i].name] !== undefined)
								value = this.module.getConfiguration()._data[cols[j].name][lines[i].name];
							html += '<td data-colid="' + j + '" ' + (i > -1 ? ('data-lineid="' + i + '"') : '') + '>' + this.getSelector(cols[j], lines[i], j, i, value) + '</td>';
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
			$(this.dom).find('input[type="checkbox"]').bind('click', function(event, data) {
				var $this = $(this);
				var checked = (data !== undefined) ? data : $(this).is(':checked');
				var colId = $this.data('colid'), lineId = $this.data('lineid');
				if(lineId == undefined)
					self.changeSelectors(colId, checked);
				else
					self.module.controller.selectorChanged(self.cols[colId].name, self.lines[lineId].name, checked);
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

						if(lineId == undefined) {
							self.changeSelectors(colId, ui.values);
						}
							
						self.sliderUpdateValue($this, ui.values, colId, lineId);
					}
				});
			});
		},

		sliderUpdateValue: function(el, value, colId, lineId) {
			var self = this;
			el.prev().html(Math.round(value[0] * 100) + " %");
			el.next().html(Math.round(value[1] * 100) + " %");

			if(lineId !== undefined) 
				self.module.controller.selectorChanged(self.cols[colId].name, self.lines[lineId].name, value);
			
		},

		changeSelectors: function(colId, values) {
			var self = this;
			var dom = this.dom.children('table').find('td[data-colid="' + colId + '"][data-lineid]');
			if(values instanceof Array) {
				var el = dom.find('.ci-rangebar').slider('values', values);
				el.each(function() {
					self.sliderUpdateValue($(this), values, colId, $(this).data('lineid'))
				});
			} else if(values)
				dom.find('input[type="checkbox"]').not(':checked').trigger('click', true);
			else
				dom.find('input[type="checkbox"]:checked').trigger('click', false);
		},

		getSelector: function(col, line, colId, lineId, value) {
			this._selectors[col.name] = this._selectors[col.name] || {};
			if(col.selectorType == 'checkbox') {
				var id = Util.getNextUniqueId();
				var defaultVal = value !== undefined ? value : col.defaultValue;

				if(line)
					this._selectors[col.name][line.name] = defaultVal;
				return '<input type="checkbox" id="' + id + '" ' + (defaultVal ? 'checked="checked"' : '') + '" data-colid="' + colId + '" ' + (line ? ('data-lineid="' + lineId + '"') : '') + ' /><label for="' + id + '">&nbsp;</label>';
			} else if(col.selectorType == 'range') {
				var _val = [];
				_val[0] = (value ? value[0] : col.defaultMinValue);
				_val[1] = (value ? value[1] : col.defaultMaxValue);

				if(line)
					this._selectors[col.name][line.name] = _val;
				return '<div class="ci-rangebar-wrapper"><div class="ci-rangebar-min">' + Math.round((_val[0] * 100)) + ' %</div><div class="ci-rangebar" data-minvalue="' + col.minValue + '" data-maxvalue="' + col.maxValue + '" data-defaultmin="' + _val[0] + '" data-defaultmax="' + _val[1] + '" data-colid="' + colId + '" ' + (line ? ('data-lineid="' + lineId + '"') : '') + ' ></div><div class="ci-rangebar-max">' + (Math.round(_val[1] * 100)) + ' %</div></div>';
			}
		},

		getDom: function() {
			return this.dom;
		},

		typeToScreen: { }
	});
	return view;
});
