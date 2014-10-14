define(['modules/types/display/jqgrid/controller'], function(controller) {

	var controllerExtended = function() {};

	controllerExtended.prototype = new controller();

	/*
		Information about the module
	*/
	controllerExtended.prototype.moduleInformation = {
		moduleName: 'Slick Grid',
		description: 'Table editor based on SlickGrid',
		author: 'Daniel Kostro',
		date: '14.10.2014',
		license: 'MIT',
		cssClass: 'slickgrid'
	};
	
	controller.prototype.references.showList = {
		label: 'Array of display flags',
		type: 'array'
	};
	
	controller.prototype.variablesIn.push("showList");
	return controllerExtended;
});