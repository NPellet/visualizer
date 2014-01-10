define( [ 'modules/default/defaultcontroller' ], function( Default ) {
	
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
		moduleName: 'Two dimensional list',
		description: 'Display an array of data in 2 dimensions using a table',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'button_url'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		'label': {
			type: 'string',
			label: 'Label'
		},

		'color': {
			type: 'string',
			label: 'Color'
		},

		'disabled': {
			type: ["boolean", "number"],
			label: 'Disabled'
		},

		'url': {
			type: 'string',
			label: 'URL'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events
		'onClick': {
			label: 'Button is clicked'
		}
	};
	


	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'label', 'color', 'disabled', 'url' ];

	/*
		Received actions
	*/
	controller.prototype.actionsIn = { };
	
		
	controller.prototype.configurationStructure = function(section) {
		
		var jpaths = this.module.model.getjPath();
		
		return {
			groups: {
				group: {
					options: {
						type: 'list'
					},

					fields: {

						label: {
							type: 'Text',
							title: 'Button label'
						},

						color: {
							type: 'Combo',
							title: 'Background color',
							options: [
								{ title: 'Grey', key: 'grey'}, 
								{ title: 'Blue', key: 'blue'}, 
								{ title: 'Green', key: 'green'},
								{ title: 'Red', key: 'red'}
							]
						},

						disabled: {
							type: 'Checkbox',
							title: 'Disabled',
							options: {'disabled': ''}
						},

						defaultUrl: {
							type: 'Text',
							title: 'Default URL'
						}
					}
				}
			}
		}
	};


	/**
	 *	Triggers when the button has been clicked
	 *	And changes tu URL to the configured URL
	 */
	controller.prototype.onClick = function() {
		
		var url = this.getUrl(),
			popup = this.module.getConfiguration( 'popup' );

		if( ! url ) {
			return;
		}

		if( popup ) {
			window.open( url );
		} else {
			window.document.location.href = url;
		}
	};

	/**
	 *	Gets the URL to point to
	 *
	 *	@return url Url to point to
	 */
	controller.prototype.getUrl = function() {

		return ( this.module.getDataFromRel( 'url' ) || this.module.getConfiguration( 'url' ) );
	}

	controller.prototype.configAliases = {
		'url': [ 'groups', 'group', 0, 'defaultUrl', 0 ]
	};

 	return controller;
});
