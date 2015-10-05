'use strict';

define(['modules/default/defaultcontroller', 'openchemlib/openchemlib-full'], function (Default, OCL) {

    function Controller() {
        this.currentMol = {
            idcode: '',
            coordinates: ''
        };
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'OCL Molecule editor',
        description: 'Molecule editor using the openchemlib javascript library',
        author: 'Michael Zasso',
        date: '11.05.2015',
        license: 'BSD',
        cssClass: 'ocl_editor'
    };

    Controller.prototype.references = {
        mol: {
            label: 'Molfile 2D'
        },
        smiles: {
            label: 'Smiles'
        },
        actid: {
            label: 'OCL molecule ID'
        }
    };

    Controller.prototype.variablesIn = ['mol', 'smiles', 'actid'];

    Controller.prototype.events = {
        onStructureChange: {
            label: 'Molecular structure has changed',
            refVariable: ['mol', 'smiles', 'actid']
        }
    };

    Controller.prototype.onChange = function (actid) {
        actid = actid || ' ';
        var split = actid.split(' ');
        if (split[0] !== this.currentMol.idcode || split[1] !== this.currentMol.coordinates) {
            this.currentMol.idcode = split[0];
            this.currentMol.coordinates = split[1];
            var mol = OCL.Molecule.fromIDCode(split[0], split[1]);
            this.createDataFromEvent('onStructureChange', 'mol', {
                type: 'mol2d',
                value: mol.toMolfile()
            });
            this.createDataFromEvent('onStructureChange', 'smiles', {
                type: 'smiles',
                value: mol.toSmiles()
            });
            this.createDataFromEvent('onStructureChange', 'actid', {
                type: 'oclID',
                value: split[0],
                coordinates: split[1]
            });
        }
    };

    return Controller;

});
