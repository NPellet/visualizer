'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Sequence displayer',
        description: 'Displays DNA sequence with annotations',
        author: 'Daniel Kostro',
        date: '12.06.2014',
        license: 'MIT',
        cssClass: 'sequence_display'
    };

    Controller.prototype.references = {
        sequence: {
            label: 'An Amino Acid Sequence'
        }
    };

    Controller.prototype.events = {
        onSequenceSelectionChanged: {
            label: 'A sequence was selected',
            refVariable: ['sequence']
        }
    };

    Controller.prototype.onSequenceSelectionChanged = function (val) {
        this.createDataFromEvent('onSequenceSelectionChanged', 'sequence', DataObject.check(val, true));
    };

    Controller.prototype.variablesIn = ['sequence'];

    return Controller;

});
