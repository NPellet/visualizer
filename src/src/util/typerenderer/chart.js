'use strict';

define(['jsgraph'], function (Graph) {

    const defaultOptions = {
        close: {
            top: false,
            right: false,
            bottom: false,
            left: false
        }
    };

    const close = {
        top: true,
        right: true,
        bottom: true,
        left: true
    };

    function renderChart(el, val, rootVal, _options) {
        el.empty();

        const options = Object.assign({}, defaultOptions, val, _options);

        if (options.close === true) {
            options.close = close;
        }

        const graph = new Graph(el, options);

        const axes = val.axis;
        const count = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };
        const theAxes = [];
        let xAxis, yAxis;
        if (Array.isArray(axes)) {
            for (let i = 0; i < axes.length; i++) {
                let axis = axes[i];
                const type = axis.type;
                if (!count.hasOwnProperty(type)) {
                    throw new Error('invalid axis type: ' + type);
                }
                const theType = type[0].toUpperCase() + type.substring(1);

                const theAxis = graph[`get${theType}Axis`](count[type]++);
                if (!xAxis && (type === 'top' || type === 'bottom')) {
                    xAxis = theAxis;
                }
                if (!yAxis && (type === 'left' || type === 'right')) {
                    yAxis = theAxis;
                }

                theAxis
                    .flip(axis.flip)
                    .setPrimaryGrid(false)
                    .setSecondaryGrid(false)
                    .setGridLinesStyle()
                    .setLabel(axis.label || '')
                    .forceMin(axis.min || false)
                    .forceMax(axis.max || false)
                    .setAxisDataSpacing(0);

                theAxes.push(theAxis);
            }
        }

        if (!xAxis) {
            xAxis = graph.getXAxis();
            xAxis
                .setPrimaryGrid(false)
                .setSecondaryGrid(false)
                .setGridLinesStyle()
                .setAxisDataSpacing(0);
        }

        if (!yAxis) {
            yAxis = graph.getYAxis();
            yAxis
                .setPrimaryGrid(false)
                .setSecondaryGrid(false)
                .setGridLinesStyle()
                .setAxisDataSpacing(0);
        }

        if (_options.legend) {
            const legendOptions = Object.assign({}, {

            }, _options.legend);
            const legend = graph.makeLegend(legendOptions);
        }

        const series = val.data;
        if (!series) return;
        const jsgraphOptions = _options.series || [];
        for (let i = 0; i < series.length; i++) {
            const serieData = series[i];

            const serieOptions = getSerieOptions(serieData, jsgraphOptions[i] || {});
            const serie = graph.newSerie(serieData.label || `serie_${i}`, serieOptions, serieOptions.type);
            setSerieParameters(serie, serieData, jsgraphOptions[i] || {});

            const finalData = new Array(serieData.x.length * 2);
            for (let j = 0; j < serieData.x.length; j++) {
                finalData[j * 2] = serieData.x[j];
                finalData[j * 2 + 1] = serieData.y[j];
            }
            serie.setXAxis(serieData.xAxis ? theAxes[serieData.xAxis] : xAxis);
            serie.setYAxis(serieData.yAxis ? theAxes[serieData.yAxis] : yAxis);
            serie.setData(finalData);
        }

        graph.resize(Math.max(el.width() - 15, 20), Math.max(el.height() - 15, 20));
        graph.draw();
    }

    function getSerieOptions(serie, jsgraphOptions) {
        const result = {
            type: serie.type || 'line',
            lineToZero: false
        };

        if (result.type === 'bar') {
            result.type = 'line';
            result.lineToZero = true;
        }

        if (jsgraphOptions.peakPicking) {
            result.autoPeakPicking = true;
        }

        return result;
    }

    const serieStyle = {
        lineWidth: 1,
        lineColor: '#000',
        lineStyle: 1
    };
    function setSerieParameters(serie, data) {
        const defaultStyle = Object.assign({}, serieStyle, data.defaultStyle);
        serie.setLineWidth(defaultStyle.lineWidth);
        serie.setLineColor(defaultStyle.lineColor);
        serie.setLineStyle(defaultStyle.lineStyle);
    }

    return {toscreen: renderChart};

});
