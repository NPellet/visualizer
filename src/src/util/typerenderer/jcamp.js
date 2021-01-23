'use strict';

define(['../util'], function (Util) {
  let Graph;
  let JcampConverter;
  let _;

  async function loadJcamp() {
    Graph = await Util.require('jsgraph');
    JcampConverter = await Util.require('jcampconverter');
    _ = await Util.require('lodash');
  }


  const defaultChart = {
    axes: {
      x: {
        label: 'X axis',
      },
      y: {
        label: 'Y axis',
      }
    },
    series: [
      {
        data: {
          x: [1, 2, 3],
          y: [2, 3, 4]
        },
        style: {
          line: {
            color: 'black'
          }
        }
      }
    ]
  };

  async function renderJcamp(el, value, rootVal, _options) {
    let jcamp = await rootVal.get();

    el.empty();
    let chart = JSON.parse(JSON.stringify(defaultChart));
    let parsed = JcampConverter.convert(String(jcamp));

    if (parsed.flatten[0] && parsed.flatten[0].spectra && parsed.flatten[0].spectra[0]) {
      let spectrum = parsed.flatten[0].spectra[0];
      let options = JSON.parse(JSON.stringify(_options));
      _.merge(chart, {
        axes: {
          x: {
            label: spectrum.xUnits,
          },
          y: {
            label: spectrum.yUnits,
          }
        }
      }, options.chart);


      chart.series[0].data = spectrum.data;
      const graph = Graph.fromJSON(chart, el.get(0), () => { });
      graph.resize(Math.max(el.width() - 15, 20), Math.max(el.height() - 15, 20));
      graph.draw();
    }


    return el;
  }

  return {
    init: loadJcamp,
    toscreen: renderJcamp,
  };
});
