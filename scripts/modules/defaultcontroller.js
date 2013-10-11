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

					if(!jpath) {

						console.log(actionname, value);

						API.executeAction(actionname, value);
						API.doAction(actionname, value);
						continue;
					} else if(value.getChild) {
						value.getChild(jpath).done(function(returned) {
								API.executeAction(actionname, returned);
								API.doAction(actionname, returned);
						});
					}
				}
			}
		},

		setVarFromEvent: function(event, element, rel) {

			var actions, i = 0;
			if( ! ( actions = this.module.definition.dataSend ) )	
				return;
			
			for( ; i < actions.length; i++ ) {
				
				if( actions[i].event == event  && ( actions[i].rel == rel || !rel ) ) {

					API.setVar(actions[i].name, element, actions[i].jpath);

				}
			}
		}
	}
});