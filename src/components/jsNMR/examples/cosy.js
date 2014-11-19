



requirejs.config({

	baseUrl: '../',
	paths: {
		'jquery': './lib/components/jquery/dist/jquery.min',
		'jqueryui': './lib/components/jquery-ui/ui/minified/jquery-ui.min',
		'highlightjs': './lib/lib/highlight/highlight.pack',
		'forms': './lib/lib/forms/form',
		'components': './lib/components',
		'graph': './lib/components/graph/dist/jsgraph',
		'assignation': './src/assignation',
		'jcampconverter': './lib/components/jcampconverter/src/jcampconverter',
		'graphs': './lib/components/graph/src'
	}
});



require([ '../src/nmr.js' ], function( NMRHandler ) {
/*
	var nmr = new NMRHandler({
				
		dom: $("#nmr2"),
		mode: '1d',
		symmetric: false,
	});
*/

/*
	nmr.load( {

		urls: {
			twoD: '../lib/components/jcampconverter/data/indometacin/cosy.dx',
			x: '../lib/components/jcampconverter/data/indometacin/1h.dx', 
		},

		molecule: '../lib/components/VisuMol/moleculeA.json',


		lineColor: 'green'

	})


	nmr.load( {

		urls: {
			x: '../test/sqzdec1.jdx', 
		},

		lineColor: 'blue'

	});


*/



  // http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
  /**
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param   Number  h       The hue
   * @param   Number  s       The saturation
   * @param   Number  l       The lightness
   * @return  Array           The RGB representation
   */
  function hslToRgb(h, s, l){
      var r, g, b;

      if(s == 0){
          r = g = b = l; // achromatic
      }else{
          function hue2rgb(p, q, t){
              if(t < 0) t += 1;
              if(t > 1) t -= 1;
              if(t < 1/6) return p + (q - p) * 6 * t;
              if(t < 1/2) return q;
              if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
          }

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }





	var nmr = new NMRHandler({
				
			dom: $("#nmr2"),
			mode: '2d',
			symmetric: true,
			minimap: false
	});

	nmr.load( {

		urls: {
			twoD: '../test/cosy/84-74-2_cosygpppqf.jdx',
			x: '../test/cosy/84-74-2_zg.jdx'

		},

		lineColor: 'rgb(' + hslToRgb( 100 / 360, 0.8, 0.4 ).join() + ')',
		twoDColor: {

			fromPositive: { h: 100, s: 0.3, l: 0.7 },
			toPositive: { h: 100, s: 1, l: 0.5},

			fromNegative: { h: 100, s: 0.3, l: 0.5  },
			toNegative: { h: 100, s: 1, l: 0.3 }
		},
		label: 'Chemical 1'
	});
/*
	nmr.load( {

		urls: {
			twoD: '../test/cosy/121-97-1_cosygpppqf.jdx',
			x: '../test/cosy/121-97-1_zg.jdx'

		},

		lineColor: 'rgb(' + hslToRgb( 220 / 360, 0.8, 0.4 ).join() + ')',

		twoDColor: {

			fromPositive: { h: 220, s: 0.3, l: 0.7 },
			toPositive: { h: 220, s: 1, l: 0.5},

			fromNegative: { h: 220, s: 0.3, l: 0.5  },
			toNegative: { h: 220, s: 1, l: 0.3 }
		},
		label: 'Chemical 2'
	});*/


});




