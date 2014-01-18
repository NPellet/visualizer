define(['modules/default/defaultview', 'jquery', 'src/util/api', 'src/util/util', 'components/jit/Jit/jit'], function(Default, $, API, Util, $jit) {

    function view() {
        this._id = Util.getNextUniqueId();
    }
    ;
    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            if (!this.dom) {
                this.dom = $('<div id="' + this._id + '"></div>').css({
                    height: '100%',
                    width: '100%'
                });
                this.module.getDomContent().html(this.dom);
            }
            this.onReady = $.Deferred();
            
            var labelColorRGB = this.module.getConfiguration('labelColor');
            var labelColor;
            if(labelColorRGB && labelColorRGB[3]!==0) {
                labelColor = Util.rgbToHex(labelColorRGB[0],labelColorRGB[1],labelColorRGB[2]);
                console.log(labelColor)
            }
            this.chartOptions = {
                injectInto: this._id,
                animate: false,
                showLabels: this.module.getConfiguration('showLabels'),
                labelOffset: 20,
                offset: 30,
                hoveredColor: false,
                updateHeights: this.module.getConfiguration('updateHeights'),
                sliceOffset: this.module.getConfiguration('sliceOffset'),
                Label : {
                    color: labelColor
                }
            };
        },
        inDom: function() {
        },
        onResize: function() {
            this.dom.empty();
            this.chart = new $jit.PieChart(this.chartOptions);
            if (this._data)
                this.setData(this._data);
            this.onReady.resolve();
        },
        update: {
            'chart': function(moduleValue) {
                var chartJson = convertChartToJson(moduleValue.get());
                this._data = chartJson;
                this.setData(chartJson);
            },
            'yArray': function(moduleValue) {
                var arrayJson = convertSingleArrayToJson(moduleValue.get());
                this._data = arrayJson;
                this.setData(arrayJson);
            }
        },
        setData: function(dataJson) {
            this.chart.loadJSON(dataJson);
        }
    });

    function convertChartToJson(chart) {
        var data = chart.data;
        var json;
        if (data.length === 1) { // simple chart
            data = data[0];
            var arr = data.y;
            var ii = arr.length;
            json = {values: new Array(ii)};

            var info = data.info || [];
            var colors, labels;
            if (info[0]) {
                if (info[0].color) {
                    colors = new Array(ii);
                    for (var i = 0; i < ii; i++)
                        colors[i] = info[i].color;
                    json.color = colors;
                }
                if (info[0].name) {
                    labels = new Array(ii);
                    for (var i = 0; i < ii; i++)
                        labels[i] = info[i].name;
                }
            }
            for (var i = 0; i < ii; i++) {
                json.values[i] = {values: [arr[i]], label: (labels[i] || "label_" + i)};
            }
        } else { // stacked chart
            json = {};
            var ii = data.length;
            var jj = data[0].y.length;
            json.values = new Array(jj);
            json.label = new Array(jj);
            for (var i = 0; i < ii; i++) {
                for (var j = 0; j < jj; j++) {
                    var serie = data[i];
                    var arr = serie.y;
                    if (i === 0) {
                        json.values[j] = {values: new Array(ii), label: "label2 " + j};
                        json.label[j] = serie.label;
                    }
                    json.values[j].values[i] = arr[j];
                }
            }
        }
        return json;
    }

    function convertSingleArrayToJson(array) {
        var ii = array.length;
        var json = {values: new Array(ii)};
        for (var i = 0; i < ii; i++) {
            json.values[i] = {values: [array[i]], label: "label_" + i};
        }
        return json;
    }

    /*function convertArrayToJson(array) {
        var json = {};
        var ii = array.length;
        var jj = array[0].length;
        json.values = new Array(jj);
        json.label = new Array(jj);
        for (var i = 0; i < ii; i++) {
            for (var j = 0; j < jj; j++) {
                if (i === 0) {
                    json.values[j] = {values: new Array(ii), label: "label2 " + j};
                    json.label[j] = "label " + j;
                }
                json.values[j].values[i] = array[i][j];
            }
        }
        return(json);
    }*/

    return view;
});