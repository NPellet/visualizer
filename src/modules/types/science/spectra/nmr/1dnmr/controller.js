define(['modules/default/defaultcontroller', 'src/util/datatraversing'], function(Default, Traversing) {


	function controller() {

	};

	// Extends the default properties of the default controller
	controller.prototype = $.extend( true, {}, Default );


	controller.prototype.moduleInformation = {
		moduleName: '1D NMR',
		description: 'Displays NMR jcamp files in the style of standard NMRs',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: '1dnmr'
	};
	

	controller.prototype.references = {
		'jcamp': {
			label: 'The jcamp file',
			type: 'jcamp'
		},

		'plot': {
			label: 'The Plot object',
			type: 'object'
		}
	};

	controller.prototype.events = {

	};
	
	controller.prototype.variablesIn = [ 'jcamp' ];
		

	controller.prototype.actionsIn = {

	};
	
	controller.prototype.configurationStructure = function(section) {

	}

	return controller;
});
