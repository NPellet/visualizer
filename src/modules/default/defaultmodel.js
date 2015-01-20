'use strict';

define(['src/main/entrypoint', 'src/util/datatraversing', 'src/util/api', 'src/util/debug', 'src/util/util'], function (Entry, Traversing, API, Debug, Util) {

    return {

        setModule: function (module) {
            this.module = module;
        },

        init: function () {

            this.module.model = this;
            this.data = {};

            this.triggerChangeCallbacksByRels = {};
            this.mapVars();

            this.resetListeners();
            this.initImpl();

        },

        initImpl: function () {
            this.resolveReady();
        },


        inDom: Util.noop,

        resetListeners: function () {

            this.sourceMap = null;
            this.mapVars();
            //API.getRepositoryData( ).unListen( this.getVarNameList(), this._varlisten );
            API.getRepositoryActions().unListen(this.getActionNameList(), this._actionlisten);

            var list = this.getVarNameList();
            for (var i = 0, l = list.length; i < l; i++) {
                API.getVar(list[i]).listen(this.module, this.onVarChange.bind(this));
            }
            this._actionlisten = API.getRepositoryActions().listen(this.getActionNameList(), this.onActionTrigger.bind(this));
        },

        mapVars: function () {
            // Indexing all variables in
            var list = this.module.vars_in(),
                listNames = [],
                listRels = [],
                varsKeyedName = {};

            if (Array.isArray(list)) {

                for (var l = list.length, i = l - 1; i >= 0; i--) {

                    listNames.push(list[i].name);
                    listRels.push(list[i].rel);
                    varsKeyedName[list[i].name] = list[i];
                }
            }

            this.sourceMap = varsKeyedName;
            this.listNames = listNames;
            this.listRels = listRels;
        },

        getVarNameList: function () {
            return this.listNames;
        },

        getActionNameList: function () {

            var list = this.module.actions_in(),
                names = [],
                i,
                l;

            if (!list) {
                return names;
            }

            l = list.length;
            i = l - 1;

            for (; i >= 0; i--) {
                names.push(list[i].name);
            }

            return names;
        },

        onVarChange: function (variable) {

            var self = this,
                i,
                l,
                k,
                m,
                rel;

            var varName = variable.getName();

            if (this.stopVarChange) {
                this.stopVarChange();
            }

            this.module.onReady().then(function () {
                self.module.blankVariable(varName);
            });

            // Show loading state if it takes more than 500ms to get the data
            var rejectLatency;
            var latency = new Promise(function (resolve, reject) {
                var timeout = setTimeout(resolve, 500);
                rejectLatency = function () {
                    clearTimeout(timeout);
                    self.module.endLoading(varName);
                    reject();
                };
            });

            // Start loading
            Promise.all([this.module.onReady(), latency]).then(function () {
                self.module.startLoading(varName);
            }, function (err) {
                // Fail silently (onReady is already covered and reject latency is expected)
            });

            Promise.all([this.module.onReady(), variable.onReady()]).then(function () {

                // Gets through the input filter first
                var varValue = variable.getValue();

                // Then validate
                if (!varName || !self.sourceMap || !self.sourceMap[varName] || !self.module.controller.references[self.sourceMap[varName].rel]) {
                    return rejectLatency();
                }

                var data = self.buildData(varValue, self.module.controller.references[self.sourceMap[varName].rel].type);

                if (!data) {
                    return rejectLatency();
                }

                rel = self.module.getDataRelFromName(varName);

                i = 0;
                l = rel.length;
                k = 0;

                var vars = self.module.vars_in();

                rejectLatency();

                m = vars.length;

                for (; k < m; k++) {

                    if (vars[k].name == varName && self.module.view.update[vars[k].rel] && varValue !== null) {

                        (function (j) {

                            new Promise(function (resolve, reject) {

                                if (vars[j].filter) {

                                    require([vars[j].filter], function (filterFunction) {

                                        if (filterFunction.filter) {
                                            return filterFunction.filter(varValue, resolve, reject);
                                        }

                                        reject("No filter function defined");

                                    });

                                } else {
                                    resolve(varValue);
                                }
                            }).then(function (varValue) {
                                    self.setData(vars[j].rel, varName, varValue);
                                    self.removeAllChangeListeners(vars[j].rel);
                                    self.module.view.update[vars[j].rel].call(self.module.view, varValue, varName);

                                }, function (err) {
                                    Debug.error("Error while filtering the data : ", err.message, err.stack);
                                }).catch(function (err) {
                                    Debug.error("Error while updating module : ", err.message, err.stack);
                                });

                        })(k);

                    }

                }


            }, function () {
                rejectLatency();
            }).catch(function (err) {
                rejectLatency();
                Debug.error("Error while updating variable : ", err.message, err.stack);
            });

        },

        onActionTrigger: function (value, actionName) {
            var that = this;
            this.module.onReady().then(function() {
                var actionRel = that.module.getActionRelFromName(actionName[0]);
                if (that.module.view.onActionReceive && that.module.view.onActionReceive[actionRel]) {
                    that.module.view.onActionReceive[actionRel].call(that.module.view, value, actionName[0]);
                }
            });

        },

        buildData: function (data, sourceTypes) {

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

        getValue: function () {
            return this.data;
        },

        setData: function (rel, name, value) {
            if (!this.data[rel]) {
                this.data[rel] = {};
            }
            this.data[rel][name] = value;
        },

        getData: function (rel, name) {
            if (!this.data[rel]) {
                return;
            }
            return this.data[rel][name];
        },

        getAllDataFromRel: function (rel) {
            return this.data[rel];
        },

        getjPath: function (rel, subjPath) {
            return this._getjPath(rel, subjPath);
        },

        _getjPath: function (rel, subjPath) {
            var data = this.module.getDataFromRel(rel);

            if (data && subjPath !== undefined) {
                data = data.getChildSync(subjPath);
            }

            return Traversing.getJPathsFromElement(data); // (data,jpaths)
        },

        resolveReady: function () {
            this.module._resolveModel();
        },

        dataListenChange: function (data, callback, bindToRel) {

            if (!data) {
                return;
            }

            var self = this,
                proxiedCallback = function (target, moduleId) {

                    if (moduleId == self.module.getId()) {
                        return;// Do not update itself;
                    }

                    callback.call(data, target);
                };

            if (this.addChangeListener(bindToRel, data, proxiedCallback)) {

                data.onChange(proxiedCallback);

            } else {
                Debug.setDebugLevel(1);
                Debug.error("Adding the change callback is forbidden as no rel has been defined ! Aborting callback binding to prevent leaks");
            }
        },

        dataTriggerChange: function (data) { // self is not available

            data.triggerChange(false, [this.module.getId()]);
        },

        dataSetChild: function (data, jpath, value) {

            return data.setChild(jpath, value, this.module.getId());
        },

        dataSetChildSync: function (data, jpath, value) {

            return data.setChildSync(jpath, value, this.module.getId());
        },

        addChangeListener: function (rel, data, callback) {

            if (!rel) {
                return false;
            }

            if (this.listRels.indexOf(rel) === -1) {
                return false;
            }

            this.triggerChangeCallbacksByRels[rel] = this.triggerChangeCallbacksByRels[rel] || [];
            this.triggerChangeCallbacksByRels[rel].push({data: data, callback: callback});

            return true;
        },

        removeAllChangeListeners: function (rel) {

            if (!this.triggerChangeCallbacksByRels[rel]) {
                return;
            }

            for (var i = 0, l = this.triggerChangeCallbacksByRels[rel].length; i < l; i++) {
                this.removeChangeListener(this.triggerChangeCallbacksByRels[rel][i].data, this.triggerChangeCallbacksByRels[rel][i].callback);
            }
        },

        removeChangeListener: function (data, callback) {
            data.unbindChange(callback);
        }
    };

});