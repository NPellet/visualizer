'use strict';

define([
    'jquery',
    'modules/default/defaultview',
    './app_1d'
], function ($, Default, NMR1D ) {


    class View {

        constructor() {
            this.series = [];
            this.serieChanged = this.serieChanged.bind( this );
        }

        init() {

        }

        serieChanged() {

        }

        inDom() {

        }

        onResize() {

        }

        render() {

            const molecule = this.molecule;
            ReactDOM.render(
              React.createElement(NMR1D, {width: "800", height: "600", options:  options, molecule:  molecule,  series:  this.series, onChanged:  this.serieChanged}),
              document.getElementById('root')
            );
        }

        setSerie( name, val ) {

            const series = []; // React objects should be immutable. Let's create a new one

            for( var i = 0; i < this.series.length; i ++ ) {

                if( this.series[ i ].name !== name ) {

                    series.push( this.series[ i ] );
                }
            }

            series.push( { 
                name: name,
                shift: 0,
                data: val,
                color: "green"
            } );
        }
    };

    Object.assign( View.prototype, Default );
    

    View.prototype.blank = {
       
        jcamp(varName) {
            this.removeSerie(varName);
        }
    };

    View.prototype.update = {

        jcamp: (value, varname) => {

            JcampConverter.convert( String( value ), options, true).then( ( converted ) => {

                this.setSerie( varname, converted );
                this.render();
            });
        },

        molecule: (moduleValue, varname) => {

        }
    }

    console.log( View );

    return View;
});
