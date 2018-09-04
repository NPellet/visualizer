'use strict';

define(['src/main/entrypoint', 'src/util/datatraversing', 'src/util/api', 'src/util/debug', 'src/util/util'], function (Entry, Traversing, API, Debug, Util) {
  const model = {
    setModule(module) {
      this.module = module;
    },

    init() {
      this.module.model = this;
      this.data = {};

      this.triggerChangeCallbacksByRels = {};
      this.mapVars();

      this.resetListeners();
      this.initImpl();
    },

    initImpl() {
      this.resolveReady();
    },

    inDom: Util.noop,

    resetListeners() {
      this.sourceMap = null;
      this.mapVars();
      API.getRepositoryActions().unListen(this.getActionNameList(), this._actionlisten);

      var list = this.getVarNameList();
      for (var i = 0, l = list.length; i < l; i++) {
        API.getVar(list[i]).listen(this.module, this.onVarChange.bind(this));
      }
      this._actionlisten = API.getRepositoryActions().listen(this.getActionNameList(), this.onActionTrigger.bind(this));
    },

    mapVars() {
      const list = this.module.vars_in();
      const listNames = [];
      const listRels = [];
      const varsKeyedName = {};

      if (Array.isArray(list)) {
        for (let i = list.length - 1; i >= 0; i--) {
          listNames.push(list[i].name);
          listRels.push(list[i].rel);
          varsKeyedName[list[i].name] = list[i];
        }
      }

      this.sourceMap = varsKeyedName;
      this.listNames = listNames;
      this.listRels = listRels;
    },

    getVarNameList() {
      return this.listNames;
    },

    getActionNameList() {
      const list = this.module.actions_in();
      if (!list) {
        return [];
      }

      const names = [];
      for (let i = list.length - 1; i >= 0; i--) {
        names.push(list[i].name);
      }

      return names;
    },

    onVarChange(variable) {
      return Promise.all([this.module.onReady(), variable.onReady()]).then(() => {
        const varName = variable.getName();
        this.module.blankVariable(varName);

        const varValue = variable.getValue();

        if (!varName || !this.sourceMap || !this.sourceMap[varName] || !this.module.controller.references[this.sourceMap[varName].rel]) {
          return null;
        }

        let data = this.buildData(varValue, this.module.controller.references[this.sourceMap[varName].rel].type);
        if (!data) {
          return null;
        }

        const vars = this.module.vars_in();
        let proms = [];
        for (let i = 0; i < vars.length; i++) {
          if (vars[i].name == varName && (this.module.view.update[vars[i].rel] || this.module.view[`_update_${vars[i].rel}`]) && varValue !== null) {
            proms.push(new Promise((resolve, reject) => { // todo clean this mess
              if (vars[i].filter) {
                require([vars[i].filter], function (filterFunction) {
                  if (filterFunction.filter) {
                    return filterFunction.filter(varValue, resolve, reject);
                  }
                  reject(new Error('No filter function defined'));
                });
              } else {
                resolve(varValue);
              }
            }).then((varValue) => {
              this.setData(vars[i].rel, varName, varValue);
              this.removeAllChangeListeners(vars[i].rel);
              return this.module.updateView(vars[i].rel, varValue, varName);
            }, (err) => {
              Debug.error('Error while filtering the data : ', err.message, err.stack);
            }).catch((err) => {
              Debug.error('Error while updating module : ', err.message, err.stack);
            }));
          }
        }
        return proms;
      }, function () {
        // ignore
      }).catch(function (err) {
        Debug.error('Error while updating variable : ', err.message, err.stack);
      });
    },

    async onActionTrigger(value, actionName) {
      await this.module.onReady();
      const actionRel = this.module.getActionRelFromName(actionName[0]);
      if (this.module.view.onActionReceive && this.module.view.onActionReceive[actionRel]) {
        this.module.view.onActionReceive[actionRel].call(this.module.view, value, actionName[0]);
      }
    },

    buildData(data, sourceTypes) {
      if (!data) {
        return false;
      }

      var dataRebuilt = {};
      if (!sourceTypes) { // Accepts everything
        return data;
      }

      if (!Array.isArray(sourceTypes)) {
        sourceTypes = [sourceTypes];
      }

      var dataType = data.getType(),
        mustRebuild = false;

      // If no in type is defined, the module accepts anything
      if (sourceTypes.length == 0) {
        return data;
      }

      for (var i = 0; i < sourceTypes.length; i++) {
        if (sourceTypes[i] == dataType) {
          return data;
        }
      }

      if (mustRebuild) {
        return dataRebuilt;
      }

      return false;
    },

    getValue() {
      return this.data;
    },

    setData(rel, name, value) {
      if (!this.data[rel]) {
        this.data[rel] = {};
      }
      this.data[rel][name] = value;
    },

    getData(rel, name) {
      if (!this.data[rel]) {
        return;
      }
      return this.data[rel][name];
    },

    getAllDataFromRel(rel) {
      return this.data[rel];
    },

    getjPath(rel, subjPath) {
      return this._getjPath(rel, subjPath);
    },

    _getjPath(rel, subjPath) {
      var data = this.module.getDataFromRel(rel);

      if (data && subjPath !== undefined) {
        data = data.getChildSync(subjPath);
      }

      return Traversing.getJPathsFromElement(data); // (data,jpaths)
    },

    resolveReady() {
      this.module._resolveModel();
    },

    dataListenChange(data, callback, bindToRel) {
      if (!data) {
        return;
      }

      const proxiedCallback = (target, moduleId) => {
        if (moduleId == this.module.getId()) {
          return;// Do not update itself;
        }
        callback.call(data, target);
      };

      if (this.addChangeListener(bindToRel, data, proxiedCallback)) {
        data.onChange(proxiedCallback);
      } else {
        Debug.setDebugLevel(1);
        Debug.error('Adding the change callback is forbidden as no rel has been defined ! Aborting callback binding to prevent leaks');
      }
    },

    highlightId(key, onOff) {
      API.highlightId(key, onOff, this.module.getId());
    },

    dataTriggerChange(data) { // self is not available
      data.triggerChange(false, [this.module.getId()]);
    },

    dataSetChild(data, jpath, value) {
      return data.setChild(jpath, value, this.module.getId());
    },

    dataSetChildSync(data, jpath, value) {
      return data.setChildSync(jpath, value, this.module.getId());
    },

    addChangeListener(rel, data, callback) {
      if (!rel) {
        return false;
      }

      if (this.listRels.indexOf(rel) === -1) {
        return false;
      }

      this.triggerChangeCallbacksByRels[rel] = this.triggerChangeCallbacksByRels[rel] || [];
      this.triggerChangeCallbacksByRels[rel].push({ data: data, callback: callback });

      return true;
    },

    removeAllChangeListeners(rel) {
      if (!this.triggerChangeCallbacksByRels[rel]) {
        return;
      }

      for (var i = 0, l = this.triggerChangeCallbacksByRels[rel].length; i < l; i++) {
        this.removeChangeListener(this.triggerChangeCallbacksByRels[rel][i].data, this.triggerChangeCallbacksByRels[rel][i].callback);
      }
    },

    removeChangeListener(data, callback) {
      data.unbindChange(callback);
    }
  };

  model.setHighlightId = model.highlightId;
  return model;
});
