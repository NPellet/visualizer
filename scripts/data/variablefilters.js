

CI.VariableFilters = {
	

	'chemcalclookup': {

		'name': "Lookup in ChemCalc by exact mass",
		'author': 'Norman Pellet',
		'date': '2012-9-4',

		process: function(value, output) {

			dfd = $.Deferred();

			$.ajax({
				dataType: 'json',
				type: 'get',
				url: 'http://www.chemcalc.org/service?action=em2mf&mfRange=C1-20H1-40O1-10N0-10&monoisotopicMass=' + value,

				success: function(val) {
					dfd.resolve(val.results);
				}
			});

			return dfd;
		}
	},



	'round2dec': {

		'name': "Round to two decimals",
		'author': 'Norman Pellet',
		'date': '2012-9-5',

		process: function(value, output) {

			dfd = $.Deferred();
			return dfd.resolve(Math.round(value * 100) / 100);
		}
	},


	'round3dec': {

		'name': "Round to three decimals",
		'author': 'Norman Pellet',
		'date': '2012-9-5',

		process: function(value, output) {

			dfd = $.Deferred();
			return dfd.resolve(Math.round(value * 1000) / 1000);
		}
	},


	'colorfrom0to1': {

		'name': "Number (0 to 1) to color (red to green)",
		'author': 'Norman Pellet',
		'date': '2012-9-5',

		process: function(value, output) {


			function componentToHex(c) {
			    var hex = c.toString(16);
			    return hex.length == 1 ? "0" + hex : hex;
			}

			function rgbToHex(r, g, b) {
			    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
			}

			dfd = $.Deferred();
			return dfd.resolve(rgbToHex(Math.round(255 - value * 255), Math.round(value * 255), 0));
		}
	}
}

CI.VariableFiltersRow = {

	'testFilter': {

		name: 'Test filter',
		process: function(value, oldValue, jpath, source, row, columns) {

		}


	}




}