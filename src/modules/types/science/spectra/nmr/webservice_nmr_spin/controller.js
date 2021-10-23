'use strict';

define([
  'jquery',
  'modules/default/defaultcontroller',
  'nmr-simulation'
], function ($, Default, simulation) {
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'NMR spin system simulation',
    description: 'Allows to enter coupling constant',
    author: 'Luc Patiny',
    date: '30.12.2013',
    license: 'MIT',
    cssClass: 'webservice_nmr_spin'
  };

  var regDelta = /^delta_(\d+)/;
  var regCoupling = /^coupling_(\d+)_(\d+)/;

  Controller.prototype.doAnalysis = function () {
    var data = this.module.view.system.serializeArray();

    var chemicalShifts = [];
    var multiplicity = [];
    var options = {};

    var name, res, i, j;
    for (i = 0; i < data.length; i++) {
      if (isNaN(data[i].value)) throw new Error('not a number');
      name = data[i].name;
      if ((res = regDelta.exec(name))) {
        chemicalShifts[res[1]] = +data[i].value;
        multiplicity[res[1]] = 2;
      }
    }

    var coupling = new Array(chemicalShifts.length);
    for (i = 0; i < chemicalShifts.length; i++) {
      coupling[i] = new Array(chemicalShifts.length);
      for (j = 0; j < chemicalShifts.length; j++) {
        coupling[i][j] = 0;
      }
    }

    for (i = 0; i < data.length; i++) {
      name = data[i].name;
      if (regDelta.test(name)) {
        // already handled
      } else if ((res = regCoupling.exec(name))) {
        coupling[res[1]][res[2]] = +data[i].value;
        coupling[res[2]][res[1]] = +data[i].value;
      } else {
        options[name] = +data[i].value;
      }
    }

    var spinSystem = new simulation.SpinSystem(
      chemicalShifts,
      coupling,
      multiplicity
    );
    var spectrum = simulation.simulate1D(spinSystem, options);

    var chart = {
      data: [
        {
          x: getX(options.from, options.to, options.nbPoints),
          y: spectrum
        }
      ]
    };

    this.createDataFromEvent('onSearchReturn', 'results', chart);
  };

  function getX(from, to, nbPoints) {
    const result = new Array(nbPoints);
    const step = (to - from) / nbPoints;
    var value = from;
    for (var i = 0; i < nbPoints; i++) {
      result[i] = value;
      value += step;
    }
    return result;
  }

  Controller.prototype.references = {
    results: {
      label: 'Spectrum'
    }
  };

  Controller.prototype.events = {
    onSearchReturn: {
      label: 'An analysis has been completed',
      refVariable: ['results']
    }
  };

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            systemSize: {
              type: 'combo',
              title: 'Spin system',
              default: '2',
              options: [
                { key: '2', title: 'AB' },
                { key: '3', title: 'ABC' },
                { key: '4', title: 'ABCD' },
                { key: '5', title: 'ABCDE' },
                { key: '6', title: 'ABCDEF' },
                { key: '7', title: 'ABCDEFG' },
                { key: '8', title: 'ABCDEFGH' }
              ]
            },
            button: {
              type: 'checkbox',
              title: 'Process button',
              default: 'button',
              options: { button: '' }
            },
            buttonlabel: {
              type: 'text',
              default: 'Calculate',
              title: 'Button text'
            },
            buttonlabel_exec: {
              type: 'text',
              default: 'Calculating',
              title: 'Button text (executing)'
            },
            onloadanalysis: {
              type: 'checkbox',
              title: 'Make one process on load',
              default: 'onload',
              options: { onload: '' }
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    button: ['groups', 'group', 0, 'button', 0],
    systemSize: ['groups', 'group', 0, 'systemSize'],
    buttonlabel: ['groups', 'group', 0, 'buttonlabel', 0],
    buttonlabel_exec: ['groups', 'group', 0, 'buttonlabel_exec', 0],
    onloadanalysis: ['groups', 'group', 0, 'onloadanalysis', 0, 0]
  };

  return Controller;
});
