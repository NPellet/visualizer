
BI.Forms.Templaters.std = function () {
	
	this.mainDom = '';
	this.sections_lvl1 = '';
}
	
BI.Forms.Templaters.std.prototype = {


	buildForm: function(form) {
		
		var sections = form.getSections();
		var html = [];
		html.push(form.getTitle());
		html.push('<div class="bi-form-sections">');
		for(var i = 0; i < sections.length; i++) {
			html.push(sections[i].buildHtml());
		}
		html.push('</div>');
		return html.join('');
	},
	
	
	buildSection: function(lvl) {
		
		var html = [];
		var groups = this.getFieldGroups();
		var sections = this.getSections();
		
		html.push('<div class="bi-form-section" data-section-id="');
		html.push(this.getId());
		html.push('" data-section-absid="');
		html.push(this.getAbsId());
		html.push('">');
		
			
		html.push('<div class="bi-form-section-header"><div class="bi-form-section-displayer"><span class="bi-form-section-show"><span class="triangle-down"></span></span></div><div class="bi-form-section-sorter"><span class="bi-form-section-up"><span class="triangle-up"></span></span><span class="bi-form-section-down"><span class="triangle-down"></span></span></div><div class="bi-form-section-duplicater"><span class="bi-form-section-add">+</span><span class="bi-form-section-remove">-</span></div>')
		html.push('<label>');
		html.push(this.getTitle().getLabel());
		html.push('</label></div>');
	
		
		html.push('<div class="bi-form-section-content"><div class="bi-form-section-content-groups">');
		for(var i = 0; i < groups.length; i++)
			html.push(groups[i].buildHtml());
		html.push('</div>');
		html.push('<div class="bi-form-section-content-sections">');
		for(var i = 0; i < sections.length; i++)
			html.push(sections[i].buildHtml());
		html.push('</div></div></div>');
			
		return html.join('');
	},
	
	buildGroup: {
		
		List: function() {
			
			var html = [];
			var fields = this.getFields();
			for(var i = 0; i < fields.length; i++) {
				html.push('<div class="bi-formfield-wrapper">');
				html.push('<label class="bi-formfield-label">');
				html.push(fields[i].getTitle().getLabel());
				html.push('</label>');
				html.push(fields[i].buildHtml());
				html.push('<div class="bi-spacer"></div>');
				html.push('</div>');
			}
			
			
			return html.join('');
		},
		
		Table: function() {
			
			var html = '<div class="bi-table-groupfield"><table cellpadding="0" cellspacing="0" class="bi-table-groupfield-table"><thead><tr>';
			var fields = this.getFields();
			
			html += '<th></th>';
			
			for(var i = 0, length = fields.length; i < length; i++) {
				html += '<th data-field-id="';
				html += fields[i].getFieldId();
				html += '">';
				html += fields[i].getTitle().getLabel();
				html += '</th>';
			}
			
			html += '<th></th>';
			
			html += '</tr></thead><tbody>';
			
			
			html += '</tbody></table></div>';
			return html;
		}
	},
	
	doBuild: function() {
		
		return [this.sections_lvl1, this.mainDom].join('');
		
	}
}
