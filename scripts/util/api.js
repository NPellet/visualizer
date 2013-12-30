define(['util/datatraversing', 'util/actionmanager'], function(Traversing, ActionManager) {

	var allScripts = [];
	function setVar(name, element, jpath) {

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
		
		if( ! ( key._highlight instanceof Array ) ) {
			return;	
		}

		this.repositoryHighlights.set(key._highlight, value);
		
	}


	function setHighlightId(id, value) {
		this.repositoryHighlights.set(id, value);
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
		highlightId: setHighlightId,
		setHighlight: setHighlight,

		doAction: function(key, value) {
			this.repositoryActions.set(key, value);	
		},

		executeAction: function(name, value) {

			ActionManager.execute( name, value );
		}
	}
});