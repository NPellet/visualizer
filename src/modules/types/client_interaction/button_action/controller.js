define(['modules/default/defaultcontroller','src/util/datatraversing'], function(Default,Traversing) {
	

	/**
	 * Creates a new empty controller
	 * @class Controller
	 * @name Controller
	 * @constructor
	 */
	function controller() { };

	// Extends the default properties of the default controller
	controller.prototype = $.extend( true, {}, Default );


	/*
		Information about the module
	*/
	controller.prototype.moduleInformation = {
		moduleName: 'Button action',
		description: 'Shows a button that will trigger a text action',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'button_action'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		
		'actionText': {
			label: 'The action text to send',
			type: 'string'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events
		'onToggleOn': {
			label: 'Button is toggled on',
			refAction: [ 'actionText' ]
		},

		'onToggleOff': {
			label: 'Button is toggled off',
			refAction: [ 'actionText' ]
		},

		'onClick': {
			label: 'Button is clicked',
			refAction: [ 'actionText' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ ];


	/*
		Received actions
	*/
	controller.prototype.actionsIn = {
	};
	
		
	/**
	 *	Triggered when the button is clicked
	 *
	 *	@param {Boolean} on Button state
	 */
	controller.prototype.onClick = function( on ) {

		var text = this.module.getConfiguration( 'text' );
		this.sendAction('actionText', text, 'onClick');
		this.sendAction('actionText', text, (on ? 'onToggleOn' : 'onToggleOff'));
	};
		

	controller.prototype.configurationStructure = function(section) {
		
		return {

			groups: {

				group: {

					options: {
						type: 'list'
					},

					fields: {

						label: {
							type: 'text',								
							title: 'Button label',
							default: 'Action'
						},

						text: {
							type: 'text',
							title: 'Action text to send'
						}
					}
				}
			}
		};
	};
		
	controller.prototype.configAliases = {
		'label': [ 'groups', 'group', 0, 'label', 0 ],
		'text': [ 'groups', 'group', 0, 'text', 0 ]
	};

	return controller;
});
