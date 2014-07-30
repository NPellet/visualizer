define(['src/util/datatraversing', 'src/util/actionmanager', 'src/main/variables'], function(Traversing, ActionManager, Variables) {

	var allScripts = [];
	var variableFilters;
	var viewLocked = false;

	var loadingHtml = $('<div id="loading-visualizer"><div class="title">Loading</div><div class="animation"><div /><div /><div /><div /></div><div class="subtitle" id="loading-message"></div></div>');
	var loading = {};
	var loadingNumber = 0;

	function setVar( name, sourceVariable, jpath, filter ) {

		var self = this,
			jpathNewVar = ( ! sourceVariable ) ? jpath : sourceVariable.getjPath().concat( jpath );

			if( sourceVariable ) {
				sourceVariable.getData().trace( jpath );		
			}

		Variables.setVariable( name, jpathNewVar, false, filter );
	}

	function getVar(name) {
		return Variables.getVariable( name );
	}

	function createData( name, data, filter ) {
		Variables.setVariable( name, false, data, filter );
	}


	function createDataJpath( name, data, jpath, filter ) {
		
		data = DataObject.check( data, true );
		
		if(data && data.getChild) {

			data.getChild( jpath ).then( function( data ) {

				Variables.setVariable( name, false, data, filter );	
			});
			
		} else {
			Variables.setVariable( name, false, data, filter );	
		}
		
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
		createDataJpath: createDataJpath,

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
			$("body").addClass('locked');
			viewLocked = true;
		},

		isViewLocked: function() {
			return viewLocked;
		},

		loading: function( message ) {

			if( loadingNumber == 0) {
				$("#ci-visualizer").append( loadingHtml );	
			}

			if( ! loading[ message ] ) {
				loading[ message ] = $("<div>" + message + "</div>");
				loadingNumber++;
				
				$("#loading-message").append( loading[ message ] );
			}

		},

		stopLoading: function( message ) {
			
			if( loading[ message ] ) {
				
				loadingNumber--;
				loading[ message ].detach();
				loading[ message ] = null;

				if( loadingNumber == 0) {
					loadingHtml.detach();
				}
			}
		},

		/* Extra functions used in filter testsuite. Allows compatibility of filters */
		dev_fctCalled: function( fct ) {},
		dev_fctUncalled: function( fct ) {},
		dev_assert: function( family, script, value ) {}

	}
});