define(['jquery', 'src/util/api', 'src/util/datatraversing'], function($, API, Traversing) {
	return {

		setModule: function(module) { this.module = module; },

		init: function() {
			if(this.initimpl)
				this.initimpl();
		},

		inDom: function() {

		},

		sendAction: function(rel, value, event) {

			var actionsOut = this.module.actions_out(),
				i,
				jpath;

			if( ! actionsOut ) {
				return;
			}

			i = actionsOut.length - 1;
 
			for( ; i >= 0; i-- ) {

				if( actionsOut[i].rel == rel && ((event && event == actionsOut[i].event) || !event)) {

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


		setVarFromEvent: function( event, element, rel, callback ) {

			var actions, i = 0, first;

			if( ! ( actions = this.module.vars_out() ) ) {
				return;
			}
			
			for( ; i < actions.length; i++ ) {
				
				if( actions[ i ].event == event  && ( actions[ i ].rel == rel || ! rel ) ) {

					if( first && callback ) {
						callback.call( this );
					}

					if( typeof element == "function" ) {
						element = element.call( this, actions[ i ].name, actions[ i ].jpath );
					}

					API.setVar( actions[ i ].name, element, actions[ i ].jpath, actions[ i ].filter );
				}
			}
		},

		"export": function() {},
		configurationStructure:  {},
		configFunctions: {},
		configAliases: {},
		events: {},
		variablesIn: []
	}
});
