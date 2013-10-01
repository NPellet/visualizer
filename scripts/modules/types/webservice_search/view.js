define(['modules/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this;
			this.dom = $('<div></div>');
			this.search = $('<div class="Search"></div>');
			this.dom.append(this.search);
			this.module.getDomContent().html(this.dom);

			if(searchparams = this.module.getConfiguration().searchparams) {
				for(var i in searchparams) {
					if(!i)
						continue;
					this.search.append('<div><label>' + searchparams[i].label + '</label>' + this._makeFormEl(searchparams[i], i));
				}
				
				var url = self.module.getConfiguration().url;
				var button = self.module.getConfiguration().button || false;

				if(button) {
					require(['forms/button'], function(Button) {
						self.search.append(new Button('Search', function() {
								self.module.controller.doSearch();
							})
						.render());
					});
				} else {
					this.search.on('keyup', 'input[type=text]', function() {
						var searchTerm = $(this).val();
						var searchName = $(this).attr('name');
						self.module.controller.doSearch(searchName, searchTerm);
					});

					this.search.on('change', 'select', function() {
						var searchTerm = $(this).val();
						var searchName = $(this).attr('name');
						self.module.controller.doSearch(searchName, searchTerm);
					});

					this.search.on('change', 'input[type=checkbox]', function() {
						var searchTerm = $(this).is(':checked');
						var searchName = $(this).attr('name');
						self.module.controller.doSearch(searchName, searchTerm);
					});
				}
			}			
		},

		_makeFormEl: function(spec, name) {

			switch(spec.fieldtype) {

				case 'combo':
					var opts = (spec.fieldoptions || '').split(';'),
						opt, html = '';
					html += '<option ' + (spec.defaultvalue == '' ? 'selected="selected" ' : '') + 'value=""></option>';
					for(var i = 0, l = opts.length; i < l; i++) {
						opt = opts[i].split(':');
						html += '<option ' + (spec.defaultvalue == opt[0] ? 'selected="selected" ' : '') + 'value="' + opt[0] + '">' + (opt[1] || opt[0]) + '</option>';
					}
					return '<select name="' + name + '">' + html + '</select>';
				break;

				case 'checkbox':
					return '<input type="checkbox" ' + (spec.defaultvalue ? 'checked="checked"' : '') + ' value="1" offvalue="0" name="' +  name +'" /></div>';
				break;
				
				default:
				case 'text':
					return '<input type="text" value="' + spec.defaultvalue + '" name="' +  name +'" /></div>';
				break;
			}	
		},

		inDom: function() {
			this.search.find('input:last').trigger('change');
		},
		
		onResize: function() {
			
		},
		
		blank: function() {
			
		},
		
		update: {
			'vartrigger': function(variable) {			
				if(variable == undefined)
					return;
				this.module.controller.doSearch();
			}
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		}

	});
	return view;
});
 
