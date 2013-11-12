define(['util/datatraversing'], function(Traversing) {

	var allScripts = [];
	function setVar(name, element, jpath) {
//console.log('sfgs');
		var self = this;
		if( ! jpath || ! element.getChild ) {
			this.getRepositoryData().set(name, element);
			return;
		}

		self.repositoryData.set(name, null);

		element.getChild(jpath).done(function(returned) {

			self.repositoryData.set(name, returned);
			
		});
	}

	function setHighlight(key, value) {
		this.repositoryHighlights.set(key, value);
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
		resetVariables: function() {
			this.repositoryData.reset();
		},

		getVar: function(name) {
			var data = this.repositoryData.get(name);
			if(data && data[1]) {
				return data[1];
			}
			return;
		},

		listenHighlight: function() {
			this.repositoryHighlights.listen.apply(this.repositoryHighlights, arguments);
		},

		killHighlight: function() {
			this.repositoryHighlights.kill.apply(this.repositoryHighlights, arguments);
		},

		highlight: setHighlight,
		setHighlight: setHighlight,

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