'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'JSME',
        description: 'Displays and interacts with the JSME plugin',
        author: 'Norman Pellet, Luc Patiny',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: 'jsme'
    };

    Controller.prototype.references = {
        mol: {
            label: 'Molfile V2 2D',
            type: ['mol2d', 'molfile2d', 'string']

        },
        jme: {
            label: 'JME file format',
            type: 'jme'
        },
        smiles: {
            label: 'Smiles'
        },
        molV3: {
            label: 'Molfile V3 2D',
            type: ['mol2d', 'molfile2d', 'string']
        }
    };

    Controller.prototype.events = {
        onStructureChange: {
            label: 'Molecular structure has changed',
            refVariable: ['mol', 'smiles', 'jme', 'molV3']
        }
    };

    Controller.prototype.variablesIn = ['mol', 'jme'];

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
                            'default': ['oldlook'],
                            options: {
                                noxbutton: 'Hide X button',
                                rbutton: 'Show R button',
                                nohydrogens: 'Hide hydrogens',
                                query: 'Enable query features',
                                autoez: 'Automatic generation of SMILES with E,Z stereochemistry',
                                nocanonize: 'Prevent canonicalization and detection of aromaticity',
                                nostereo: 'No stereochemistry in SMILES',
                                reaction: 'Enable reaction input',
                                multipart: 'Allow multipart structures',
                                polarnitro: "Don't convert automatically nitro to unpolar form",
                                number: 'Allow to number atoms',
                                depict: 'Only display structure (no editing)',
                                nopaste: 'Remove the paste menu',
                                border: 'With depict option, display the border around the molecule',
                                star: 'Display star button allowing highlight of atoms (placed in the smiles)',
                                oldlook: 'Use the old look'
                            }
                        },
                        labelsize: {
                            type: 'combo',
                            title: 'Label size',
                            options: [
                                {title: '6pt', key: '6'},
                                {title: '7pt', key: '7'},
                                {title: '8pt', key: '8'},
                                {title: '9pt', key: '9'},
                                {title: '10pt', key: '10'},
                                {title: '11pt', key: '11'},
                                {title: '12pt', key: '12'},
                                {title: '13pt', key: '13'},
                                {title: '14pt', key: '14'},
                                {title: '16pt', key: '16'},
                                {title: '18pt', key: '18'},
                                {title: '24pt', key: '24'}
                            ],
                            'default': 14
                        },
                        bondwidth: {
                            type: 'combo',
                            title: 'Bond width',
                            options: [
                                {title: '1px', key: '1'},
                                {title: '1.5px', key: '1.5'},
                                {title: '2px', key: '2'}
                            ],
                            'default': 1
                        },
                        highlightColor: {
                            type: 'combo',
                            title: 'Atom highlight color',
                            options: [
                                {title: 'red', key: '1'},
                                {title: 'orange', key: '2'},
                                {title: 'yellow', key: '3'},
                                {title: 'cyan', key: '4'},
                                {title: 'blue', key: '5'},
                                {title: 'purple', key: '6'}
                            ],
                            'default': '3'
                        },
                        outputResult: {
                            type: 'checkbox',
                            title: 'Modify Input Variable',
                            options: {yes: 'Yes'},
                            default: []
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.onChange = function (mol, molV3, smiles, jme, action) {

        if (action != null && action != 'readMolFile' && action != 'reset' && this.module.view._currentValue && this.module.getConfigurationCheckbox('outputResult', 'yes')) {

            if (this.module.view._currentValue.type === 'mol2d') {
                this.module.view._currentValue.setValue(mol, true);
            }
            else if (this.module.view._currentValue.type === 'jme') {
                this.module.view._currentValue.setValue(jme, true);
            }
            this.module.model.dataTriggerChange(this.module.view._currentValue);
        }


        // Always create smiles because smiles is not a possible input variable
        this.createDataFromEvent('onStructureChange', 'smiles', smiles);
        this.createDataFromEvent('onStructureChange', 'mol', {
            type: 'mol2d',
            value: mol
        });
        this.createDataFromEvent('onStructureChange', 'molV3', {
            type: 'mol2d',
            value: molV3
        });
        this.createDataFromEvent('onStructureChange', 'jme', {
            type: 'jme',
            value: jme
        });

    };

    Controller.prototype.configAliases = {
        prefs: ['groups', 'group', 0, 'prefs', 0],
        labelsize: ['groups', 'group', 0, 'labelsize', 0],
        bondwidth: ['groups', 'group', 0, 'bondwidth', 0],
        highlightColor: ['groups', 'group', 0, 'highlightColor', 0],
        outputResult: ['groups', 'group', 0, 'outputResult', 0]
    };

    Controller.prototype.onRemove = function () {
        this.module.view.remove(this.module.getId());
    };

    return Controller;

});
