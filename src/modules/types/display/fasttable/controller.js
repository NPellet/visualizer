define(['modules/types/display/jqgrid/controller'], function(controller) {

	var controllerExtended = function() {};

	controllerExtended.prototype = new controller();

	/*
		Information about the module
	*/
	controllerExtended.prototype.moduleInformation = {
		moduleName: 'Fast table',
		description: 'Displays a fast grid',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'fasttable'
	};
	
	controller.prototype.references.showList = {
		label: 'Array of display flags',
		type: 'array'
	};
	
	controller.prototype.variablesIn.push("showList");
	controller.prototype.actionsIn.toggleOff = "Toggle row off";

	return controllerExtended;
});