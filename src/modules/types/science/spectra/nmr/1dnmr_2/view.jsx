'use strict';


define([
    'jquery',
    'react-dom',
    'react',
    'modules/default/defaultview',
    './app_1d',
    'jcampconverter',
    'src/util/api'

], function ($, ReactDOM, React, Default, NMR1DModule, JcampConverter, API ) {

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
            newSeriesObject.map( ( serie ) => {
                if( serie.name == 'master' ) {
                    newIntegrals = serie.integrals;
                    
                    this.module.model.dataTriggerChange( newIntegrals );


                    //this.module.controller.createDataFromEvent('onIntegralsChanged', 'integrals', newIntegrals );
                    //this.module.controller.sendActionFromEvent('onIntegralsChanged', 'integrals', newIntegrals );
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

            ReactDOM.render(
              <div className="jsNMR"><NMR1D width={ this.width } height={ this.height } options={ options } molecule={ this.moleculeSVG } series={ this.series } onChanged={ this.changed }></NMR1D></div>,
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

        async _update_molecule( molfile ) {

            var OCLE = await API.require('https://www.lactame.com/lib/openchemlib-extended/2.5.0/openchemlib-extended.js');
            
            var molecule = OCLE.Molecule.fromMolfile( molfile );
            var svg = molecule.toDiastereotopicSVG({
                width: 400,
                height: 300
            });

            //API.createData('svg', svg);
            
            molecule.addImplicitHydrogens();
            var svgH=molecule.toDiastereotopicSVG({
                width: 400,
                height: 300
            });
            //API.createData('svgH', svgH);
            

            this.moleculeSVG = svg;
            this.moleculeSVGH = svgH;
        }   

        _blank_molecule() {

            this.moleculeSVG = null;
            this.moleculeSVGH = null;
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
