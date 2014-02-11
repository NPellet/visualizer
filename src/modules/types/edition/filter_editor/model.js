define(['modules/types/client_interaction/code_editor/model'], function(CodeEditor) {
	function model() {};
	model.prototype = Object.create(CodeEditor.prototype);
	return model;
});