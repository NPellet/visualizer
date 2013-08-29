define(['util/datatraversing'], function(Traversing) {

	var allScripts = [];
	function setVar(name, element, jpath) {
		var self = this;
		if(!jpath) {
			this.getRepositoryData().set(name, element);
			return;
		}

		Traversing.getValueFromJPath(element, jpath).done(function(returned) {
			self.repositoryData.set(name, returned);
		});
	}

	return {

		getRepositoryData: function() {
			return this.repositoryData;
		},

		setRepositoryData: function(repo) {
			this.repositoryData = repo;
		},

		getRepositoryHighlights: function() {
			return this.repositoryHighlights;
		},

		setRepositoryHighlights: function(repo) {
			this.repositoryHighlights = repo;
		},

		getRepositoryActions: function() {
			return this.repositoryActions;
		},

		setRepositoryActions: function(repo) {
			this.repositoryActions = repo;
		},

		setVar: setVar,
		setVariable: setVar,

		getVar: function(name) {
			var data = this.repositoryData.get(name);
			if(data && data[1])
				return data[1];
			return;
		},

		listenHighlight: function() {
			this.repositoryHighlights.listen.apply(this.repositoryHighlights, arguments);
		},

		killHighlight: function() {
			this.repositoryHighlights.kill.apply(this.repositoryHighlights, arguments);
		},

		highlight: function(key, value) {
			this.repositoryHighlights.set(key, value);
		},

		doAction: function(key, value) {
			this.repositoryActions.set(key, value);	
		},

		setEvaluatedScripts: function(allScripts) {
			this.allScripts = allScripts;
		},

		executeAction: function(name, value) {
			if(allScripts[name])
				allScripts[name](value);
		}
	}
});