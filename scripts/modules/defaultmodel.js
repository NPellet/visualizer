define(['jquery', 'main/entrypoint', 'util/datatraversing', 'util/api'], function($, Entry, Traversing, API) {

	return {

		setModule: function(module) { this.module = module; },

		init: function() {
			var sourceName, sourceAccepts;
			this.module.model = this;
			this.data = [ ];
			this.resetListeners();
		},

		resetListeners: function() {
			this.sourceMap = null;

			if( this._varlisten && this._actionlisten ) {
				API.getRepositoryData( ).unListen( this.getVarNameList(), this._varlisten );
				API.getRepositoryActions( ).unListen( this.getActionNameList(), this._actionlisten );
			}

			this._varlisten = API.getRepositoryData().listen(this.getVarNameList(), $.proxy(this.onVarGet, this));
			this._actionlisten = API.getRepositoryActions().listen(this.getActionNameList(), $.proxy(this.onActionTrigger, this));
		},

		getVarNameList: function() {
			var list = this.module.vars_in( ),
				listFinal = [],
				keyedMap = {};

			if( ! list ) {
				return [];
			}

			for(var l = list.length, i = l - 1; i >= 0; i--) {
				listFinal.push( list[ i ].name );
				keyedMap[ list[i].name ] = list[ i ];
			}

			this.sourceMap = keyedMap;
			return listFinal;
		},

		getActionNameList: function() {

			var list = this.module.actions_in(), 
				names = [],
				i,
				l;

			if( ! list ) {
				return names;
			}

			l = list.length,
			i = l - 1;

			for( ; i >= 0; i--) {
				names.push( list[ i ].name );
			}

			return names;
		},

		onVarGet: function(varValue, varName) {
			var self = this,
				i,
				l,
				rel;

			$.when(this.module.ready, this.module.view.onReady).then(function() {

				if( varName instanceof Array ) {
					varName = varName[ 0 ];
				}

				if( !self.sourceMap ) {
					return;
				}

				self.data[ varName ] = self.buildData( varValue, self.module.controller.configurationReceive[ self.sourceMap[ varName ].rel ].type );
				rel = self.module.getDataRelFromName( varName );

				i = 0, l = rel.length;

				for( ; i < l; i++) {


					if (  self.module.view.blank[ rel[ i ] ] ) {

					/*
					  && varValue === null
					  has been removed. We need to clear the module even for the true variable value.
					  This is to account for asynchronous fetching that may come back in between two clearing elements
					  DO NOT ADD THIS BACK !!!
					*/

						self.module.view.blank[ rel[ i ] ].call( self.module.view, varName );

					}
					
					if( self.module.view.update[ rel[ i ] ] && varValue !== null ) {

						self.module.view.update[ rel[ i ] ].call( self.module.view, self.data[ varName ], varName );

					}
				}
			});		
 		},

		onActionTrigger: function(value, actionName) {

			var actionRel = this.module.getActionRelFromName(actionName[0]);
			if(this.module.view.onActionReceive && this.module.view.onActionReceive[actionRel]) {
				this.module.view.onActionReceive[actionRel].call(this.module.view, value, actionName);
			}
 		},

 		buildData: function(data, sourceTypes) {

 			if(!data)
 				return false;
 			
			var dataRebuilt = {};
			if(!sourceTypes)
				return;
			if(!(sourceTypes instanceof Array))
				sourceTypes = [sourceTypes];

			var dataType = data.getType(),
				mustRebuild = false;

			// If no in type is defined, the module accepts anything
			if( sourceTypes.length == 0) {
				return data;
			}

			for(var i = 0; i < sourceTypes.length; i++) {
				if(sourceTypes[i] == dataType) {
					return data;
				}
			}

			if(mustRebuild)
				return dataRebuilt;
			
			return false;
		},

		getValue: function() {
			return this.data;
		},
				
		getjPath: function(rel, accepts) {
			var data = this.module.getDataFromRel(rel);
			return Traversing.getJPathsFromElement(data); // (data,jpaths)
		}

	};
});