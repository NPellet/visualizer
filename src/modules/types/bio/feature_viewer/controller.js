'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    /**
     * Creates a new empty controller
     * @class Controller
     * @name Controller
     * @constructor
     */
    function controller() {
    }

    // Extends the default properties of the default controller
    controller.prototype = $.extend(true, {}, Default);


    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        name: 'Protein Feature Viewer',
        description: 'Displays Protein Annotations',
        author: 'Daniel Kostro',
        date: '15.06.2014',
        license: 'MIT',
        cssClass: 'protein_viewer'
    };


    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        feature: {
            label: 'An object describing a feature'
        }
    };

    controller.prototype.events = {
        onFeatureClicked: {
            label: 'A feature was clicked',
            refVariable: ['feature']
        },

        onFeatureMouseOver: {
            label: 'The mouse is over a feature',
            refVariable: ['feature']
        }
    };

    controller.prototype.onFeatureClicked = function (val) {
        this.createDataFromEvent('onFeatureClicked', 'feature', DataObject.check(val, true));
    }

    controller.prototype.onFeatureMouseOver = function (val) {
        this.createDataFromEvent('onFeatureMouseOver', 'feature', DataObject.check(val, true));
    }


    /*
     Configuration of the module for receiving events, as a static object
     In the form of
     */
    controller.prototype.variablesIn = ['feature'];

    /*
     Received actions
     In the form of

     {
     actionRef: 'actionLabel'
     }
     */
    controller.prototype.actionsIn = {};


    controller.prototype.configurationStructure = function (section) {

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },

                    fields: {}
                }
            }
        };
    };


    controller.prototype.configAliases = {};

    return controller;
});
