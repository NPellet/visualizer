'use strict';

define([
    'jquery',
    'modules/default/defaultview',
    'jsgraph',
    'json-chart',
    'src/util/datatraversing',
    'src/util/api',
    'src/util/color',
    'src/util/debug'

], function ($, Default, Graph, JSONChart, DataTraversing, API, Color, Debug) {

  
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

            ReactDOM.render(
              <NMR1D width="800" height="600" options={ options } molecule={ molecule } series={ json } onChanged={ serieChanged }></NMR1D>,
              document.getElementById('root')
            );

        }
    };

    View.prototype.blank = {
       
        jcamp(varName) {
            this.removeSerie(varName);
        }
    };

    View.prototype.update = {
        chart(moduleValue, varname) {

        }
    }



            jcamp(moduleValue, varname) {
                var that = this;
                var serie;

                if (!this.graph) {
                    return;
                }

                if (this.deferreds[varname]) {
                    this.deferreds[varname].reject();
                }

                this.deferreds[varname] = $.Deferred();
                var def = this.deferreds[varname];

                var options = moduleValue._options || {};

                var value = moduleValue.get();
                var valueType = DataObject.getType(value);
                if (valueType === 'string') {
                    require(['jcampconverter'], JcampConverter => {
                        JcampConverter.convert(String(value), options, true).then(displaySpectra);
                    });
                } else {
                    displaySpectra(value);
                }

                function displaySpectra(spectra) {
                    if (def.state() == 'rejected') {
                        return;
                    }

                    that.deferreds[varname] = false;
                    that.series[varname] = that.series[varname] || [];
                    that.series[varname] = [];

                    if (spectra.contourLines) {
                        serie = that.graph.newSerie(varname, that.getSerieOptions(varname).options, 'contour');

                        serie.setData(spectra.contourLines);
                        that.setSerieParameters(serie, varname);
                        that.series[varname].push(serie);
                    } else {
                        spectra = spectra.spectra;
                        for (var i = 0, l = spectra.length; i < l; i++) {
                            var data = spectra[i].data[spectra[i].data.length - 1];
                                
                            let dataX = [], dataY = [];
                            for( var i = 0; i < data.length; i += 2 ) {
                                dataX.push( data[ i ] );
                                dataY.push( data[ i + 1 ] );
                            }


                            let serieOptions = that.getSerieOptions(varname, null, data);
                            serie = that.graph.newSerie(varname, serieOptions.options );


                            if( serieOptions.others.peakPicking ) {
                                this.graph.getPlugin('peakPicking').setSerie( serie );
                            }


                            var waveform = Graph.newWaveform();
                            waveform.setData( dataY, dataX );
                            that.normalize( waveform, varname );
                            if( serieOptions.useSlots ) {
                                waveform.aggregate();
                            }

                            serie.setWaveform( waveform );

                            that.setSerieParameters(serie, varname);
                            that.series[varname].push(serie);
                            break;
                        }
                    }
                    that.redraw(false, varname);
                }
            };


    return View;

});
