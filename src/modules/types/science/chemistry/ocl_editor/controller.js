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

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        prefs: {
                            type: 'checkbox',
                            title: 'Options',
                            default: [],
                            options: {
                                queryFeatures: 'Enable query features'
                                // inPlace: 'In-place modification of input'
                            }
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        prefs: ['groups', 'group', 0, 'prefs', 0]
    };

    Controller.prototype.onChange = function (actid) {
        actid = actid || ' ';
        var split = actid.split(' ');
        if (split[0] !== this.currentMol.idcode || split[1] !== this.currentMol.coordinates) {
            this.currentMol.idcode = split[0];
            this.currentMol.coordinates = split[1];
            var mol = OCL.Molecule.fromIDCode(split[0], split[1]);
            var molfile = mol.toMolfile();
            var smiles = mol.toSmiles();
            this.createDataFromEvent('onStructureChange', 'mol', {
                type: 'mol2d',
                value: molfile
            });
            this.createDataFromEvent('onStructureChange', 'smiles', {
                type: 'smiles',
                value: smiles
            });
            this.createDataFromEvent('onStructureChange', 'actid', {
                type: 'oclID',
                value: split[0],
                coordinates: split[1]
            });
            // inplace modification is disabled for now because of unexpected change events
            /*if (this.module.getConfigurationCheckbox('prefs', 'inPlace') &&
                this.module.view._currentType) {
                var currentValue = this.module.view._currentValue;
                switch (this.module.view._currentType) {
                    case 'mol':
                        currentValue.setValue(molfile);
                        break;
                    case 'smiles':
                        currentValue.setValue(smiles);
                        break;
                    case 'oclid':
                        if (currentValue.value) {
                            currentValue.coordinates = split[1];
                        }
                        currentValue.setValue(split[0]);
                        break;
                }
                this.module.model.dataTriggerChange(currentValue);
            }*/
        }
    };

    return Controller;

});
