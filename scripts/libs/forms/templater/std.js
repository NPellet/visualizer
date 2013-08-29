
define(['jquery'], function($) {

	var tpl = function() {
		this.labels = true;
		this.sectionsTabLvl = 3;
	}

	tpl.prototype = {

		buildForm: function(form) {
			
			var sections = form.getSections();
			var html = $('<div class="form ' + (this.labels ? 'form-has-labels' : 'form-no-labels') + '"></div>');
			html.append(form.getTitle());
			var sectionsDom = $('<div class="bi-form-sections"></div>').appendTo(html);
			for(var i = 0; i < sections.length; i++)
				sectionsDom.append(sections[i].buildHtml());
			return html;
		},

		setLabels: function(bool) {
			this.labels = bool;
		},

		buildSectionHeader: function(section, lvl) {
			if(lvl != this.sectionsTabLvl) {
				var html = '';
				html += '<div class="bi-form-section-header expanded"><div class="bi-form-section-displayer"><span class="bi-form-section-show"><span class="triangle-down"></span></span></div><div class="bi-form-section-sorter"><span class="bi-form-section-up"><span class="triangle-up"></span></span><span class="bi-form-section-down"><span class="triangle-down"></span></span></div><div class="bi-form-section-duplicater"><span class="bi-form-section-add">+</span><span class="bi-form-section-remove">-</span></div>';
				html += '<label>';
				html += section.getTitle();
				html += '</label></div>';
				return html;
			} else {
				var html = '';
				html += '<li class="bi-form-section-header" data-section-absid="' + section.getAbsId() + '"><div class="bi-form-section-displayer"><span class="bi-form-section-show"><span class="triangle-down"></span></span></div><div class="bi-form-section-sorter"><span class="bi-form-section-up"><span class="triangle-up"></span></span><span class="bi-form-section-down"><span class="triangle-down"></span></span></div><div class="bi-form-section-duplicater"><span class="bi-form-section-add">+</span><span class="bi-form-section-remove">-</span></div>';
				html += '<label>';
				html += section.getTitle();
				html += '</label></li>';
				return html;
			}
		},

		
		buildSection: function(section, lvl) {
			
			var groups = section.getFieldGroups();
			var sections = section.getSections();
			
			var html = $('<div class="bi-form-section bi-form-section-lvl-' + lvl + ' ' + (section.isVisible() ? 'bi-visible' : 'bi-hidden') + '" data-section-id="' + section.getId() + '" data-section-absid="' + section.getAbsId() + '" ></div>');
			
			if(lvl != this.sectionsTabLvl)
				html.prepend(section.getForm().getTemplater().buildSectionHeader(section, section.getLevel()));
			
			var sectionContent = $('<div class="bi-form-section-content"></div>').appendTo(html);
			var sectionContentGroups = $('<div class="bi-form-section-content-groups"></div>').appendTo(sectionContent);
			for(var i = 0; i < groups.length; i++)
				sectionContentGroups.append(groups[i].buildHtml());
			
			var sectionContentSections = $('<div class="bi-form-section-content-sections"></div>').appendTo(sectionContent);
			
			if(lvl == this.sectionsTabLvl - 1) {
				var ul = $('<ul class="bi-form-sections-tab"></ul>');
				for(var i = 0; i < sections.length; i++)
					ul.append(section.getForm().getTemplater().buildSectionHeader(sections[i], section.getLevel() + 1));

				ul.on('click', 'li', function() {
					$(this).addClass('selected').siblings().removeClass('selected');
					var sectionId = $(this).data('section-absid');
					$('.bi-form-section[data-section-absid="' + sectionId + '"]').show().siblings('.bi-form-section').hide();
				});
				sectionContentSections.append(ul);
				var sectionsContainer = $('<div class="bi-form-tab-sections-container" />').appendTo(sectionContentSections);
				for(var i = 0; i < sections.length; i++)
					sectionsContainer.append(sections[i].buildHtml().hide());


			} else {
				for(var i = 0; i < sections.length; i++)
					sectionContentSections.append(sections[i].buildHtml());
			}

			return html;
		},
		
		buildGroup: {
			
			List: function(group) {
				
				var html = [];
				var fields = group.getFields();
				for(var i = 0; i < fields.length; i++) {
					html.push('<div class="bi-formfield-wrapper' + (group.isVisible() ? 'bi-visible' : 'bi-hidden') + '">');

					if(this.labels) {
						html.push('<label class="bi-formfield-label">');
						html.push(fields[i].getTitle());
						html.push('</label>');
					}

					html.push(fields[i].buildHtml());
					html.push('<div class="bi-spacer"></div>');
					html.push('</div>');
				}
				
				
				return html.join('');
			},
			
			Table: function(group) {

				var html = '<div class="bi-table-groupfield' + (group.isVisible() ? 'bi-visible' : 'bi-hidden') + '"><table cellpadding="0" cellspacing="0" class="bi-table-groupfield-table"><thead><tr>';
				var fields = group.getFields();
				var size = Math.round(94 / fields.length) + "%";
				html += '<th></th>';
				for(var i = 0, length = fields.length; i < length; i++) {
					html += '<th data-field-id="';
					html += fields[i].getFieldId();
					html += '" width="' + size + '">';
					html += fields[i].getTitle();
					html += '</th>';
				}
				html += '<th></th>';
				html += '</tr></thead><tbody>';
				html += '</tbody></table></div>';
				return html;
			}
		},
		
		afterInit: function() {
			$(".bi-form-sections-tab").each(function() { $(this).children(':first').trigger('click'); });
		},

		setSectionsTabLvl: function(lvl) {
			this.sectionsTabLvl = parseInt(lvl);
		}

	}

	return tpl;
});