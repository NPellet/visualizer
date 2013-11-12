define(['jquery', 'util/api', 'util/datatraversing'], function($, API, Traversing) {
	return {

		setModule: function(module) { this.module = module; },

		init: function() {
			if(this.initimpl)
				this.initimpl();
		},

		sendAction: function(rel, value, event) {

			var actionsOut = this.module.actions_out();

			if(!actionsOut)
				return;

			var i = actionsOut.length - 1,
				jpath;

			for( ; i >= 0; i-- ) {

				if(actionsOut[i].rel == rel && ((event && event == actionsOut[i].event) || !event)) {

					actionname = actionsOut[ i ].name,
					jpath = actionsOut[ i ].jpath;	

					if(!jpath) {

						API.executeAction( actionname, value );
						API.doAction( actionname, value );

						continue;

					} else if(value.getChild) {

						value.getChild(jpath).done( function( returned ) {

							API.executeAction( actionname, returned );
							API.doAction( actionname, returned );

						});

					}
				}
			}
		},


		setVarFromEvent: function(event, element, rel) {

			var actions, i = 0;
			if( ! ( actions = this.module.vars_out() ) ) {
				return;
			}
			
			for( ; i < actions.length; i++ ) {
				
				if( actions[i].event == event  && ( actions[i].rel == rel || !rel ) ) {

					API.setVar( actions[i].name, element, actions[i].jpath );

				}
			}
		},

		"export": function() {},
		configurationStructure:  {},
		configFunctions: {},
		configAliases: {}
	}
});
