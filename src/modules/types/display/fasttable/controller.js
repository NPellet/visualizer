define(['modules/types/display/jqgrid/controller'], function(controller) {

	var controllerExtended = function() {};

	controllerExtended.prototype = new controller();

	/*
		Information about the module
	*/
	controllerExtended.prototype.moduleInformation = {
		moduleName: 'Fast grid',
		description: 'Displays a fast grid',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'fasttable'
	};
	

	return controllerExtended;
});