define(['jquery', 'util/api', 'util/datatraversing'], function($, API, Traversing) {
	return {

		setModule: function(module) { this.module = module; },

		init: function() {
			if(this.initimpl)
				this.initimpl();
		},

		sendAction: function(rel, value, event) {
			var actionsOut = this.module.definition.actionsOut;
			if(!actionsOut)
				return;
			var i = actionsOut.length - 1;
			for(; i >= 0; i--) {

				if(actionsOut[i].rel == rel && ((event && event == actionsOut[i].event) || !event)) {
					actionname = actionsOut[i].name;
					var jpath = actionsOut[i].jpath;

					value = Traversing.getValueFromJPath(value, jpath || '').done(function(value) {
						API.executeAction(actionname, value);
						API.doAction(actionname, value);
					});
				}
			}
		},

		setVarFromEvent: function(event, element) {
			var actions;
			
			if(!(actions = this.module.definition.dataSend))	
				return;
			
			for(var i = 0; i < actions.length; i++) {
				if(actions[i].event == event) {
					API.setVar(actions[i].name, element, actions[i].jpath);
				}
			}
		}
	}
});