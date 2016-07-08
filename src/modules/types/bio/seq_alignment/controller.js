'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Sequence alignment displayer',
        description: 'Displays DNA sequence with annotations',
        author: 'Daniel Kostro',
        date: '12.06.2014',
        license: 'MIT',
        cssClass: 'sequence_display'
    };

    Controller.prototype.references = {
        sequences: {
            label: 'Array of sequences to align'
        }
    };

    Controller.prototype.variablesIn = ['sequences'];

    return Controller;

});
