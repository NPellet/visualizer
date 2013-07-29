define(['modules/defaultview', 'forms/formfactory', 'util/datatraversing', 'util/api'], function(Default, FormFactory, DataTraversing, API) {
	
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
			var json = cfg.json || cfg.xml || {};

			try {
				json = JSON.parse(json);
			} catch(e) {
				console.log(e);
				return;
			}
		
			var xmlTransl = FormFactory.newform(this.domWrapper, json, function() {

			}, {
				onFieldChange: function(elJPath, value, index) {

					if(self.changing)
						return;
					if(!self.source)
						self.source = {};
					DataTraversing.setValueFromJPath(self.source, elJPath, value);
					console.log(self.source);
					API.setVariable(self.varname, self.source, true);
				},

				labels: cfg.labels
			});
		
			//this._inDom.resolve();
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
 
