'use strict';

define(['modules/default/defaultcontroller', 'x2js'], function (Default, X2JS) {
  function Controller() {
    this.running = false;
    this.runners = [];
    this.variables = new DataObject();
    this.converter = new X2JS();
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Webservice Cron',
    description: 'Cron service allowing to fetch data from the server',
    author: 'Norman Pellet, Luc Patiny, Michaël Zasso',
    date: '11.01.2014',
    license: 'MIT',
    cssClass: 'webservice_cron'
  };

  Controller.prototype.start = function () {
    if (this.running)
      this.stop();
    this.doVariables();
  };

  Controller.prototype.stop = function () {
    if (!this.running)
      return;
    for (var i = 0, ii = this.runners.length; i < ii; i++) {
      window.clearInterval(this.runners[i]);
    }
    this.runners = [];
    this.variables = new DataObject();
    this.running = false;
  };

  Controller.prototype.references = {
    // ouput
    result: {
      label: 'Global result',
      type: 'object'
    }
  };

  Controller.prototype.events = {
    // List of all possible events
    onUpdateResult: {
      label: 'Updated result',
      refVariable: ['result']
    }
  };

  Controller.prototype.doVariables = function () {
    var cfg = this.module.getConfiguration('cronInfos'),
      variable, time, url, datatype;

    if (!cfg)
      return;

    for (var i = 0, l = cfg.length; i < l; i++) {
      variable = cfg[i].variable;
      time = cfg[i].repeat;
      url = cfg[i].url;
      datatype = cfg[i].datatype;

      this.doAjax(this, variable, url, datatype);
      this.runners[i] = window.setInterval(this.doAjax, time * 1000, this, variable, url, datatype);
    }

    this.running = true;
  };

  Controller.prototype.doAjax = function (self, variable, url, datatype) {
    var ajax = {
      url: url,
      dataType: 'text'
    };

    ajax.success = function (data) {
      var dataobj;
      if (datatype === 'json') {
        dataobj = JSON.parse(data);
      } else if (datatype === 'xml') {
        dataobj = self.converter.xml_str2json(data);
      }
      self.addVar(variable, DataObject.check(dataobj, true));
      self.createDataFromEvent('onUpdateResult', 'result', dataobj);
      self.module.view.log(true, variable);
    };

    ajax.method = 'get';
    ajax.type = 'get';

    ajax.error = function () {
      self.module.view.log(false, variable);
    };

    $.ajax(ajax);
  };

  Controller.prototype.addVar = function (variable, data) {
    this.variables[variable] = data;
  };

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            max: {
              type: 'float',
              title: 'Max number of logs',
              default: 10
            }
          }
        },
        cronInfos: {
          options: {
            type: 'table',
            multiple: true
          },
          fields: {
            variable: {
              type: 'text',
              title: 'Variable',
              default: ''
            },
            url: {
              type: 'text',
              title: 'URL',
              default: ''
            },
            datatype: {
              type: 'combo',
              title: 'Data type',
              options: [
                {
                  title: 'Text',
                  key: 'text'
                }, { title: 'JSON', key: 'json' }, {
                  title: 'XML',
                  key: 'xml'
                }
              ],
              default: 'json'
            },
            repeat: {
              type: 'text',
              title: 'Repetition time (s)',
              default: '60'
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    cronInfos: ['groups', 'cronInfos', 0],
    maxLogs: ['groups', 'group', 0, 'max', 0]
  };

  Controller.prototype.onRemove = function () {
    this.stop();
  };

  return Controller;
});
