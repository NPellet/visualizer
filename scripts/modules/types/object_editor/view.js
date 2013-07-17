define(['modules/defaultview', 'libs/forms/formfactory'], function(Default, FormFactory) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {


		init: function() {	
			this.domWrapper = $('<div class="ci-display-form"></div>');
			this.module.getDomContent().html(this.domWrapper);
			var self = this;
			
			this.callback = null;
			var self = this;
			
		},

		inDom: function() {
			var self = this;
			var cfg = this.module.getConfiguration();
			var xml = cfg.xml;

			var xmlTransl = FormFactory.newForm(this.domWrapper, json, function() {



			}, {
				onFieldChange: function(elJPath, value, index) {
					if(self.changing)
						return;
					if(!self.source)
						self.source = {};
					CI.DataType.setValueFromJPath(self.source, elJPath, value);
					CI.Repo.set(self.varname, self.source, true);
				},

				labels: cfg.labels
			});
			
			this._inDom.resolve();
		},
		
		onResize: function() {
		},
		
		blank: function() {
			//this.domTable.empty();
			this.table = null;
		},

		update: {
			source: function(moduleValue, varName) {
	
				this.source = moduleValue;
				this.varname = varName;
				if(!moduleValue)
					return;

				var self = this;

				(function(value) {

					$.when(self._inDom).done(function() {

						self.changing = true;
						self.source = value;
						
						var fields = self.formBuilder.getFieldsByJPath();
						for(var jpath in fields) {
							CI.DataType.getValueFromJPath(value, jpath).done(function(val) {
								fields[jpath].implementation.setValue(0, val);
							});
						}
						self.changing = false;
					});
				}) (moduleValue);
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
 
