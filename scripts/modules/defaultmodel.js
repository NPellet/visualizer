define(['jquery', 'main/entrypoint', 'util/datatraversing', 'util/api'], function($, Entry, Traversing, API) {

	return {

		setModule: function(module) { this.module = module; },

		init: function() {
			var sourceName, sourceAccepts;
			this.module.model = this;
			this.data = [];
			this.resetListeners();
		},

		resetListeners: function() {
			this.sourceMap = null;
			if(this._varlisten && this._actionlisten) {
				API.getRepositoryData().unListen(this.getVarNameList(), this._varlisten);
				API.getRepositoryActions().unListen(this.getActionNameList(), this._actionlisten);
			}

			this._varlisten = API.getRepositoryData().listen(this.getVarNameList(), $.proxy(this.onVarGet, this));
			this._actionlisten = API.getRepositoryActions().listen(this.getActionNameList(), $.proxy(this.onActionTrigger, this));
		},

		getVarNameList: function() {
			var list = this.module.definition.dataSource, listFinal = [], keyedMap = {};
			if(!list)
				return [];
			for(var l = list.length, i = l - 1; i >= 0; i--) {
				listFinal.push(list[i].name)
				keyedMap[list[i].name] = list[i];
			}

			this.sourceMap = keyedMap;
			return listFinal;
		},

		getActionNameList: function() {
			var list = this.module.definition.actionsIn, 
				names = [];

			if(!list)
				return names;

			for(var l = list.length, i = l - 1; i >= 0; i--)
				names.push(list[i].name);

			return names;
		},

		onVarGet: function(varValue, varName) {

			if(!this.sourceMap)
				return;

			var value = this.buildData(varValue, this.module.controller.configurationReceive[this.sourceMap[varName].rel].type);

			this.data[varName] = varValue;
			var rel = this.module.getDataRelFromName(varName);
			
			if(rel && this.module.view.update && this.module.view.update[rel])
				this.module.view.update[rel].call(this.module.view, varValue, varName[0]);
 		},

		onActionTrigger: function(value, actionName) {

			var actionRel = this.module.getActionRelFromName(actionName[0]);
			if(this.module.view.onActionReceive && this.module.view.onActionReceive[actionRel]) {
				this.module.view.onActionReceive[actionRel].call(this.module.view, value, actionName);
			}
 		},

 		buildData: function(data, sourceTypes) {

			var dataRebuilt = {};
			if(!sourceTypes)
				return;
			if(!(sourceTypes instanceof Array))
				sourceTypes = [sourceTypes];

			var dataType = Traversing.getType(data);
			var mustRebuild = false;
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
			return this.dataValue;
		},
				
		getjPath: function(rel, accepts) {
			var data = this.module.getDataFromRel(rel);
			return Traversing.getJPathsFromElement(data, jpaths);
		}

	};
});