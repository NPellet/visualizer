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
            this.serieChanged = this.serieChanged.bind( this );
        }

        init() {

            this.dom = document.createElement("div");
            this.module.getDomContent().html(this.dom);
            
        }

        serieChanged() {

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
            ReactDOM.render(
              <NMR1D width={ this.width } height={ this.height } options={ options } molecule={ molecule } series={ this.series } onChanged={ this.serieChanged }></NMR1D>,
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
    };

    //Object.assign( View.prototype, Default );
    
    View.prototype.blank = {
       
        jcamp(varName) {

            if( this && this.removeSerie ) {
                this.removeSerie(varName);
            }
        }
    };

    View.prototype.update = {

        jcamp: (value, varname, view ) => {
            // "this" doesn't seem to be referenced to the view...
            console.log('in', this, view );
            JcampConverter.convert( String( value ), {}, true).then( ( converted ) => {

                view.setSerie( varname, converted.spectra[ 0 ] );
                view.render();
            });
        },

        jcampMaster: (value, varname, view ) => {
            // "this" doesn't seem to be referenced to the view...
            view.update.jcamp( value, "master", view );
        },

        molecule: (moduleValue, varname) => {

        }
    }

    return View;
});
