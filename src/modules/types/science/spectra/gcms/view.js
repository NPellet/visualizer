'use strict';

define([
    'modules/default/defaultview',
    'src/util/datatraversing',
    'lib/gcms/gcms'
], function (Default,
             Traversing,
             GCMS) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {

        init: function () {

            this.namedSeries = {};

            var div1 = document.createElement('div');
            var div2 = document.createElement('div');

            var domGraph = document.createElement('div');

            domGraph.appendChild(div1);
            domGraph.appendChild(div2);

            div2.style.width = '100%';
            div2.style.height = '100px';

            div1.style.width = '100%';
            div1.style.height = '250px';

            this.div1 = div1;
            this.div2 = div2;

            this.dom = domGraph;
            this.module.getDomContent().html(domGraph);
            this.resolveReady();
        },

        inDom: function () {

            var that = this;

            var gcmsinstance = new GCMS(this.div1, this.div2, {


                AUCCreated: function (auc) {

                    var pos = Math.round(auc.data.pos.x);
                    var pos2 = Math.round(auc.data.pos2.x);
//					var color = rgbToHex.apply( this, auc.data.color );


                },

                AUCChange: function (auc) {

                    var pos = Math.round(auc.data.pos.x);
                    var pos2 = Math.round(auc.data.pos2.x);

                    if (auc.msFromAucSerie) {
                        auc.msFromAucSerie.setLineColor('rgba(255, 0, 0, 1)');
                        auc.msFromAucSerie.applyLineStyles();

//									auc.msFromAucSerie.showPeakPicking();
                    }

                    if (auc.data._originalSource) {

                        auc.data._originalSource.set('from', pos);
                        auc.data._originalSource.set('to', pos2);

                        auc.data._originalSource.triggerChange();
                    }
                },

                onMsFromAUCChange: function (ms) {

                    that.module.controller.createDataFromEvent('onMSChange', 'ms', ms);

                },


                AUCSelected: function (auc) {

                    /*	if( auc.msFromAucSerie ) {
                     auc.msFromAucSerie.setLineColor( 'rgba(255, 0, 0, 1)' );
                     auc.msFromAucSerie.applyLineStyles();

                     auc.msFromAucSerie.showPeakPicking( true );
                     }*/
                    if (auc.data) {

                        that.module.controller.createDataFromEvent('onIntegralSelect', 'GCIntegration', auc.data._originalSource);

                        that.module.controller.sendActionFromEvent('onIntegralSelect', 'GCIntegration', auc.data._originalSource);

                    } else {
                        //console.trace();
                    }


                },

                AUCUnselected: function (auc) {

                    var rgb = auc.data.color;

                    auc.set('fillColor', 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 0.3)');
                    auc.set('strokeColor', 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 1)');

                    auc.setFillColor();
                    auc.setStrokeColor();

                    if (auc.msFromAucSerie) {
                        auc.msFromAucSerie.setLineColor('rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 0.3)');
                        auc.msFromAucSerie.applyLineStyles();
                        auc.msFromAucSerie.hidePeakPicking(true);
                    }

                },

                AUCRemoved: function (auc) {


                    if (auc.msFromAucSerie) {
                        auc.msFromAucSerie.kill();
                    }

                },

                MZChange: function (ms) {

                    that.module.controller.sendActionFromEvent('onMZSelectionChange', 'mzList', ms);
                },

                MSChangeIndex: function (msIndex, ms) {
                    that.module.controller.sendActionFromEvent('onMSIndexChanged', 'msIndex', msIndex);
                    that.module.controller.createDataFromEvent('onMSIndexChanged', 'msMouse', ms);

                },

                onZoomGC: function (from, to) {

                    that.module.controller.sendActionFromEvent('onZoomGCChange', 'fromtoGC', [from, to]);
                    that.module.controller.sendActionFromEvent('onZoomGCChange', 'centerGC', (to + from) / 2);
                },

                ingredientSelected: function (ingredient) {

                    that.module.controller.sendActionFromEvent('onIngredientSelected', 'selectedIngredient', ingredient);
                },

                onlyOneMS: true

            });

            this.gcmsInstance = gcmsinstance;
        },

        unload: function () {
            this.dom.remove();
            //this.gcmsInstance = false;
        },

        onResize: function () {
            this.gcmsInstance.resize(this.width, this.height);
        },

        blank: {
            jcamp: function (varname) {
                //	this.gcmsInstance.blank();
            }
        },

        update: {
            'jcamp': function (moduleValue) {
                var that = this;

                moduleValue = String(moduleValue.get());
                require(['jcampconverter'], function (tojcamp) {

                    tojcamp.convert(moduleValue, true).then(function (jcamp) {

                        if (jcamp.gcms) {

                            that.gcmsInstance.setGC(jcamp.gcms.gc);
                            that.gcmsInstance.setMS(jcamp.gcms.ms);

                            that.module.controller.createDataFromEvent('onJCampParsed', 'msdata', jcamp.gcms.ms);
                            that.module.controller.createDataFromEvent('onJCampParsed', 'gcdata', jcamp.gcms.gc);

                            that.jcamp = jcamp;
                        }
                    });

                });
            },

            'annotationgc': function (value) {
                if (!value) {
                    return;
                }

                this.resetAnnotationsGC();
                this.addAnnotations(value);
            },

            'gcms': function (moduleValue) {
                this.gcmsInstance.setGC(moduleValue.gc);
                this.gcmsInstance.setMS(moduleValue.ms);
            },

            'gc': function (moduleValue) {
                var that = this;
                if (!this.gcmsInstance || !moduleValue)
                    return;

                require(['jcampconverter'], function (tojcamp) {
                    var jcamp = tojcamp(moduleValue.get()).done(function (jcamp) {
                        if (jcamp.spectra) {
                            that.gcmsInstance.setExternalGC(jcamp.spectra[0].data[0]);
                        }
                    });
                });
            },


            'ms': function (moduleValue, name, cont) {
                if (!this.gcmsInstance || !moduleValue)
                    return;

                this.gcmsInstance.setExternalMS(moduleValue, {});
            },

            'mscont': function (moduleValue, name) {
                this.update.ms(moduleValue, name, true);
            },

            'ingredientList': function (value, varName) {

                var that = this;

                if (!value) {
                    return;
                }


                this.ingredientList = value;

                this.ingredientList.map(function (source) {
                    that.gcmsInstance.addIngredient(source);
                });
            },

            'RIComponents': function (value) {

                if (value) {
                    this.gcmsInstance.setRIComponents(value);
                }

            }
        },

        getDom: function () {
            return this.dom;
        },

        resetAnnotationsGC: function () {


            if (!this.gcmsInstance) {
                return;
            }

            this.gcmsInstance.killAllAUC();
        },

        addAnnotations: function (a) {

            var that = this;
            a.map(function (source) {

                var shapeData = that.gcmsInstance.addAUC(source.from, source.to, source);
                shapeData._originalSource = source;
            });

            this.annotations = a;
        },


        onActionReceive: {
            fromtoGC: function (value, name) {

                var from = value.from - Math.abs(value.to - value.from) * 0.1;
                var to = value.to + Math.abs(value.to - value.from) * 0.1;

                this.gcmsInstance.getGC().getBottomAxis()._doZoomVal(from, to, true);
                this.gcmsInstance.getGC().redraw(true, true, false);
                this.gcmsInstance.getGC().drawSeries();

                this.module.controller.sendActionFromEvent('onZoomGCChange', 'centerGC', (to + from) / 2);

                this.gcmsInstance.updateIngredientPeaks();

            },

            fromtoMS: function (value, name) {
                this.gcmsInstance.getMS().getBottomAxis()._doZoomVal(value.from, value.to, true);
            },

            externalMS: function (value, name) {

                var that = this;
                if (!this.gcmsInstance || !value) {
                    return;
                }

                this.gcmsInstance.setExternalMS(value, {});

                that.module.controller.createDataFromEvent('onMSChange', 'ms', value);
            },

            zoomOnAnnotation: function (value, name) {
                if (!value.pos && !value.pos2) {
                    return;
                }
                this.gcmsInstance.zoomOn(value.pos.x, value.pos2.x, value._max || false);
                this.module.controller.sendActionFromEvent('onZoomGCChange', 'centerGC', (value.pos.x + value.pos2.x) / 2);
                this.gcmsInstance.updateIngredientPeaks();

            },

            centerGC: function (value) {


                var a = this.gcmsInstance.getGC().getBottomAxis();

                var mi = a.getActualMin();
                var ma = a.getActualMax();

                var interval = Math.abs(ma - mi) / 2;

                a._doZoomVal(value - interval, value + interval, true);
                this.gcmsInstance.getGC().redraw(true, true, false);
                this.gcmsInstance.getGC().drawSeries();
            },

            setMSIndexData: function (x) {
                this.gcmsInstance.setMSIndexData(x);
            }
        }
    });

    return View;

});
