define(['modules/default/defaultcontroller'], function(Default) {

	function controller() {
	}
	;

	controller.prototype = $.extend(true, {}, Default);

	controller.prototype.moduleInformation = {
		moduleName: 'Rich text editor',
		description: 'Edit rich text in a wysiwyg interface.',
		author: 'Michaël Zasso',
		date: '21.05.2014',
		license: 'MIT',
		cssClass: 'rich_text'
	};

	controller.prototype.references = {
		html: {
			label: 'Content as HTML'
		}
	};

	controller.prototype.events = {
		onEditorChange: {
			label: 'The value in the editor has changed',
			refVariable: ['html']
		}
	};

	controller.prototype.valueChanged = function(value) {
			this.module.definition.richtext = value;
		this.setVarFromEvent('onEditorChange', DataObject.check(value));
	};

	return controller;
});