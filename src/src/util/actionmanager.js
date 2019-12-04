'use strict';

define(['./versioning', './sandbox'], function (Versioning, Sandbox) {
  let API;
  let evaluatedScripts;

  function doScripts() {
    const data = getActionScripts();

    if (!data || evaluatedScripts) {
      return;
    }

    const evalSandbox = new Sandbox();
    evalSandbox.setContext({ API });
    const evaled = {};

    for (let i = 0; i < data.length; i++) {
      const action = data[i].groups.action[0];
      evaled[action.name[0]] = evalSandbox.run(
        `(function(value) { ${action.script[0]} })`
      );
    }

    evaluatedScripts = evaled;
  }

  function getActionScripts() {
    return Versioning.getView().actionscripts || [];
  }

  function setActionScripts(form) {
    evaluatedScripts = undefined;
    Versioning.getView().actionscripts = form; // Keeps track of the scripts in the view
    doScripts(form);
  }

  let actionsFiles;

  function setActionFiles(form) {
    Versioning.getView().actionfiles = form;
    doFiles();
  }

  function doFiles() {
    const files = Versioning.getView().actionfiles;

    actionsFiles = {};

    if (!files) {
      return;
    }

    for (let i = 0, l = files[0].groups.action[0].length; i < l; i++) {
      actionsFiles[files[0].groups.action[0][i].name] =
                actionsFiles[files[0].groups.action[0][i].name] || [];
      actionsFiles[files[0].groups.action[0][i].name].push({
        file: files[0].groups.action[0][i].file,
        mode: files[0].groups.action[0][i].mode
      });
    }
  }

  function executeActionFile(file, value) {
    switch (file.mode) {
      case 'amd': {
        require([file.file], function (File) {
          File(value);
        });
        break;
      }
      case 'worker': {
        const worker = new Worker(file.file);

        worker.postMessage({ method: 'actionValue', value: value });

        worker.onmessage = function (event) {
          if (!event.data.method) {
            return;
          }

          switch (event.data.method) {
            case 'getVar': {
              if (!Array.isArray(event.data.variables)) {
                return;
              }

              const variables = {};
              const varArray = event.data.variables;
              for (let i = 0; i < varArray.length; i++) {
                variables[varArray[i]] = API.getVar(
                  varArray[i]
                );
              }

              worker.postMessage({
                method: 'getVar',
                variables: variables
              });
              break;
            }
            case 'setVar': {
              if (!event.data.variables) {
                return;
              }

              for (const i in event.data.variables) {
                API.setVar(i, event.data.variables[i]);
              }
              break;
            }
            case 'terminate': {
              worker.terminate();
              break;
            }
            case 'sendAction': {
              if (!event.data.actionName) {
                return;
              }

              API.doAction(
                event.data.actionName,
                event.data.actionValue
              );
              break;
            }
            case 'highlight': {
              if (!event.data.highlightId) {
                return;
              }

              API.highlightId(
                event.data.highlightId,
                event.data.highlightValue || false
              );
              break;
            }
          }
        };

        break;
      }
    }
  }

  return {
    setScriptsFromForm(form) {
      setActionScripts(form);
    },

    setFilesFromForm(form) {
      setActionFiles(form);
    },

    viewHasChanged(view) {
      setActionScripts(view.actionscripts);
      doFiles();
    },

    getScriptsForm() {
      return Versioning.getView().actionscripts || [];
    },

    getFilesForm() {
      return Versioning.getView().actionfiles || [];
    },

    listActions() {
      let actions = [];
      if (actionsFiles) {
        actions.push(...Object.keys(actionsFiles));
      }
      if (evaluatedScripts) {
        actions.push(...Object.keys(evaluatedScripts));
      }
      return actions;
    },

    execute(actionName, actionValue) {
      if (evaluatedScripts && evaluatedScripts[actionName]) {
        setImmediate(function () {
          evaluatedScripts[actionName](actionValue);
        });
      }

      if (actionsFiles && actionsFiles[actionName]) {
        for (let i = 0; i < actionsFiles[actionName].length; i++) {
          executeActionFile(actionsFiles[actionName][i], actionValue);
        }
      }
    },

    setAPI(value) {
      API = value;
    }
  };
});
