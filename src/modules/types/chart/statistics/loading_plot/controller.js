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
		moduleName: 'Loading plot',
		description: 'Display a loading plot',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'loading_plot'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		// Input
		loading: {
			label: 'Loading variable',
			type: "loading"
		},

		preferences: {
			label: 'Preferences',
			type: "object"
		},

		// Output
		element: {
			label: 'Selected element',
			type: 'object'
		},

		// Mixed
		zoom: {
			label: 'Zoom',
			type: 'string'
		},

		center: {
			label: 'Coordinates of the center',
			type: 'array'
		},

		viewport: {
			label: 'Viewport',
			type: 'object'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {


		onHover: {
			label: 'Hovers an element',
			refVariable: [ 'element' ]
		},

		onMove: {
			label: 'Move the map',
			refVariable: [ 'center', 'zoom', 'viewport' ]
		},

		onZoomChange: {
			label: 'Change the zoom',
			refVariable: [ 'center', 'zoom', 'viewport' ]
		},

		onViewPortChange: {
			label: 'Viewport has changed',
			refVariable: [ 'center', 'zoom', 'viewport' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'loading' ];

	/*
		Received actions
		In the form of

		{
			actionRef: 'actionLabel'
		}
	*/
	controller.prototype.actionsIn = {
		addElement: 'Add an element'
	};
	
		
	controller.prototype.configurationStructure = function(section) {
/*		
		var jpaths = this.module.model.getjPath();
		

			var groupfield = new BI.Forms.GroupFields.List('general');
			section.addFieldGroup(groupfield);
			var field = groupfield.addField({
				type: 'Checkbox',
				name: 'navigation'
			});
			field.setTitle(new BI.Title('Navigation'));
			field.implementation.setOptions({'navigation': 'Navigation only'});
			
			var section2 = new BI.Forms.Section('_module_layers', {multiple: true});
			section2.setTitle(new BI.Title('Layer'));
			section.addSection(section2, 1);

			var groupfield = new BI.Forms.GroupFields.List('config');
			section2.addFieldGroup(groupfield);


			var opts = [];
			var data = this.module.getDataFromRel('loading');
			var jpaths = [];
			if(data && data.value)
				for(var i = 0; i < data.value.series.length; i++) 
					opts.push({title: data.value.series[i].label, key: data.value.series[i].category });
			var field = groupfield.addField({
				type: 'Combo',
				name: 'el'
			});
			field.implementation.setOptions(opts);
			field.setTitle(new BI.Title('Layer'));



			var field = groupfield.addField({
				type: 'Combo',
				name: 'type'
			});
			field.implementation.setOptions([{key: 'ellipse', title: 'Ellipse / Circle'}, {key: 'pie', title: 'Pie Chart'}, {key: 'img', title: 'Image'}]);
			field.setTitle(new BI.Title('Display as'));


			
			if(data.value)
				Traversing.getJPathsFromElement(data.value.series[0].data[0], jpaths);

			var field = groupfield.addField({
				type: 'Color',
				name: 'color'
			});
			field.setTitle(new BI.Title('Color (default)'));
			


			var sectionLabels = new BI.Forms.Section('_loading_labels', {}, new BI.Title('Labels'));
			section2.addSection(sectionLabels);
			var groupfieldlabels = sectionLabels.addFieldGroup(new BI.Forms.GroupFields.List('_loading_labels_grp'));
			var field = groupfieldlabels.addField({
				type: 'Checkbox',
				name: 'labels'
			});
			field.setTitle(new BI.Title('Labels'))
			
			field.implementation.setOptions({'display_labels': 'Display', 'forcefield': 'Activate force field', 'blackstroke': 'Add a black stroke around label', 'scalelabel': 'Scale label with zoom'});


			var field = groupfieldlabels.addField({
				type: 'Text',
				name: 'labelsize'
			});
			field.setTitle(new BI.Title('Label size'));



			var field = groupfieldlabels.addField({
				type: 'Text',
				name: 'labelzoomthreshold'
			});
			field.setTitle(new BI.Title('Zoom above which labels are displayed'));


			var sectionHighlights = new BI.Forms.Section('_loading_highlight', {}, new BI.Title('Highlight'));
			section2.addSection(sectionHighlights);
			var groupfieldHighlight = sectionHighlights.addFieldGroup(new BI.Forms.GroupFields.List('_loading_highlight_grp'));


			groupfieldHighlight.addField({type: 'Text', name: 'highlightmag', title: new BI.Title('Magnification')});


			var field = groupfieldHighlight.addField({
				type: 'Checkbox',
				name: 'highlighteffect'
			});

			field.setTitle(new BI.Title('Highlight effects'));
			field.implementation.setOptions({ 'stroke': 'Thick yellow stroke'});
*/
	};

	controller.prototype.hover = function(data) {
            this.setVarFromEvent( 'onHover', data );
		/*var actions;
		if(!(actions = this.module.vars_out()))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onHover") {
				CI.API.setSharedVarFromJPath(actions[i].name, data, actions[i].jpath);
			}*/
	};

	controller.prototype.onZoomChange = function(zoom) {
            this.setVarFromEvent( 'onZoomChange', zoom, 'zoom' );
            /*
		var actions;
		if(!(actions = this.module.vars_out()))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onZoomChange") {
				CI.API.setSharedVarFromJPath(actions[i].name, zoom, actions[i].jpath);
			}*/
	};

	controller.prototype.onMove = function(x, y) {
            this.setVarFromEvent( 'onMove', [x,y], 'center' );
            /*
		var actions;
		if(!(actions = this.module.vars_out()))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onMove") {
				CI.API.setSharedVarFromJPath(actions[i].name, [x,y], actions[i].jpath);
			}*/
	};


	controller.prototype.onChangeViewport = function(vp) {
            this.setVarFromEvent( 'onChangeViewport', vp, 'viewport' );
            /*
		var actions;
		if(!(actions = this.module.vars_out()))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onViewPortChange") {
				CI.API.setSharedVarFromJPath(actions[i].name, vp, actions[i].jpath);
			}*/
	};


		
	controller.prototype.configAliases = {
		'colnumber': [ 'groups', 'group', 0, 'colnumber', 0 ],
		'colorjpath': [ 'groups', 'group', 0, 'colorjPath', 0 ],
		'valjpath': [ 'groups', 'group', 0, 'valjPath', 0 ]
	};


	return controller;
});
