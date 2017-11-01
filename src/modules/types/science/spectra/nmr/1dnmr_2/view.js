'use strict';


define([
    'jquery',
    'react-dom',
    'react',
    'modules/default/defaultview',
    './app_1d',
    'jcampconverter'
], function ($, ReactDOM, React, Default, NMR1DModule, JcampConverter ) {

      class DefaultClass {};
    Object.assign( DefaultClass.prototype, Default );

    class View extends DefaultClass {


        constructor() {
            super();
            this.series = [];
            this.changed = this.changed.bind( this );
        }

        init() {

            this.dom = document.createElement("div");
            this.module.getDomContent().html(this.dom);
            
        }

        changed( newSeriesObject ) {

            let newIntegrals;
//            this.module.controller.sendAction('mousetrack', val);
            newSeriesObject.map( ( serie ) => {
                if( serie.name == 'master' ) {
                    newIntegrals = serie.integrals;
                    
                    this.module.controller.createDataFromEvent('onIntegralsChanged', 'integrals', newIntegrals );
                    this.module.controller.sendActionFromEvent('onIntegralsChanged', 'integrals', newIntegrals );
                }
            } );

            
        }

        inDom() {
            this.resolveReady();
        }

        onResize() {

            this.render();
        }

        render() {

            const NMR1D = NMR1DModule.default;

            if( ! this.dom ) {
                return;
            }

            const molecule = this.molecule;             
            const options = {
                minThresholdPeakToPeak: 0.01,
                toolbar: true,
                legend: true
            };

            this.series.map( serieObj => {

                if( serieObj.name == 'master' ) {
                    serieObj.integrals = this.integrals;
                } else {
                    serieObj.integrals = [];
                }

            } );

            console.log( this.series );

            ReactDOM.render(
              React.createElement(NMR1D, {width:  this.width, height:  this.height, options:  options, molecule:  molecule,  series:  this.series, onChanged:  this.changed}),
              this.dom
            );
        }

        setSerie( name, val ) {

            const series = []; // React objects should be immutable. Let's create a new one

            for( var i = 0; i < this.series.length; i ++ ) {

                if( this.series[ i ].name !== name ) {

                    series.push( this.series[ i ] );
                }
            }  

            let dataX = [];
            let dataY = [];

            for( var i = 0; i < val.data[ 0 ].length; i += 2 ) {
                dataX.push( val.data[ 0 ][ i ] );
                dataY.push( val.data[ 0 ][ i + 1 ] );
            }

            series.push( { 
                name: name,
                shift: 0,
                data: [ dataX, dataY ],
                color: "green",
                integrals: []
            } );

            this.series = series;
        }

         removeSerie( name ) {

            for( var i = 0; i < this.series.length; i ++ ) {
                if( this.series[ i ].name == name ) {
                    this.series.splice( i, 1 );
                    return;
                }
            }
        }


        _update_integrals( value ) {

            this.integrals = value;
            this.render();
        }

        _update_jcampMaster( value, varname ) {

            this._update_jcamp( value, 'master' );
        } 


        _update_jcamp( value, varname ) {

            JcampConverter.convert( String( value ), {}, true).then( ( converted ) => {

                this.setSerie( varname, converted.spectra[ 0 ] );
                this.render();
            });
        } 

        _blank_jcampMaster( varname ) {
            
            this._blank_jcamp( 'master' );    
        }

        _blank_jcamp( varname ) {
        
            if( this && this.removeSerie ) {
                this.removeSerie(varname);
            }
        }

        _blank_integrals() {
            this.integrals = [];
        }
    };

    return View;
});
