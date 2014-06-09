define(['src/util/datatraversing', 'src/util/actionmanager', 'src/main/variables'], function(Traversing, ActionManager, Variables) {

	var allScripts = [];
	var variableFilters;
	var viewLocked = false;

	function setVarFilter( name, element, filter ) {

		var self = this;

/*		if( ! filter ) {
			self.getRepositoryData().set( name, element );
			return;
		}

		require( [ filter ], function( filterFunction ) {
*/
			Variables.setVariable( name, element );

//			self.getRepositoryData( ).set( name, filterFunction( element ) );
//		} );
	}

	function setVar( name, sourceVariable, jpath, filter ) {

		var self = this,
			jpathNewVar = ( ! sourceVariable ) ? jpath : sourceVariable.getjPath().concat( jpath );

			if( sourceVariable ) {
				sourceVariable.getData().trace( jpath );		
			}
//console.log( sourceVariable );
		//

		Variables.setVariable( name, jpathNewVar, false, filter );
	}

	function getVar(name) {
		
		return Variables.getVariable( name );
	}

	function createData( name, data, filter ) {

		Variables.setVariable( name, false, data, filter );
	}

	function setHighlight( element, value ) {
            
            if(!element)
                return;
            
            if(element instanceof Array) {
                element = {_highlight:element};
            }

		if( typeof element._highlight == "undefined" ) {
			return;	
		}
		
		this.repositoryHighlights.set( element._highlight, value );
	}

	function setHighlightId( id, value ) {
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

			Variables.eraseAll();

		},

		getVar: getVar,
		getVariable: getVar,
		createData: createData,

		listenHighlight: function() {

			if( ! arguments[ 0 ] || typeof arguments[ 0 ]._highlight == "undefined" ) {
				return;
			}

			arguments[ 0 ] = arguments[ 0 ]._highlight;
			this.repositoryHighlights.listen.apply(this.repositoryHighlights, arguments);
		},

		killHighlight: function() {
			this.repositoryHighlights.kill.apply( this.repositoryHighlights, arguments );
		},

		highlight: setHighlight,
		highlightId: setHighlightId,
		setHighlight: setHighlight,

		doAction: function(key, value) {
			this.repositoryActions.set(key, value);	
		},

		executeAction: function(name, value) {

			ActionManager.execute( name, value );
		},

		getAllFilters: function( ) {

			return variableFilters;
		},

		setAllFilters: function( filters ) {

			variableFilters = filters;
			variableFilters.unshift({ file: "", name: "No filter"});
		},

		viewLock: function() {
			viewLocked = true;
		},

		isViewLocked: function() {
			return viewLocked;
		}
	}
});