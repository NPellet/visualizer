'use strict';

define([
    'jquery',
    'modules/default/defaultview',
    './app_1d',
    'json-chart',
    'src/util/datatraversing',
    'src/util/api',
    'src/util/color',
    'src/util/debug',
    'react',
    'react-dom'

], function ( 
    $, 
    Default, 
    NMRApp, 
    JSONChart, 
    DataTraversing, 
    API, 
    Color, 
    Debug, 
    React, 
    ReactDOM ) {

  
    class View extends Default {

        constructor() {
            super( ...arguments );
        }

        init() {

        }

        inDom() {


        }

        onResize() {

        }

        render() {

            let options = {
                minThresholdPeakToPeak: 0.01,
                toolbar: true,
                legend: true
            };

            let serieChanged = () => {};

            ReactDOM.render(

                React.createElement(NMRApp, 
                    {
                        width: 800,
                        height: 600,
                        options: options,
                        molecule: this.molecule,
                        series: [ this.serie ],
                        onChanged: serieChanged
                    }
                ),
                this.dom.get(0)
            );
        }
    };

    View.prototype.blank = {
       
        jcamp(varName) {
            this.removeSerie(varName);
        }
    };

    View.prototype.update = {

        serie( moduleValue, varName ) {

            this.serie = moduleValue.get();
        },

        molecule( moduleValue, varName ) {

            this.molecule = moduleValue.get();
        }
    };

    return View;
} );
