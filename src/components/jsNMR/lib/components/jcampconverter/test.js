requirejs.config({
    paths: {
        'jquery': './lib/components/jquery/dist/jquery.min',
        'qunit': './lib/components/qunit/build/release.js'
    }
});



function checkJcamp(filename, label, data) {
    require( [ './src/jcampconverter'], function (Convert) {
        $.get(filename).done(
            function(jcamp) {
                Convert(jcamp).done(function (result) {
                    console.log(result);
                    QUnit.test(label, function( assert ) {
                        assert.equal(result.spectra.length, data.nbSpectra, "Number of spectra present" );
                        assert.equal(result.xType, data.xType, "xAxis type" );

                        var spectrum=result.spectra[0];

                        assert.equal(spectrum.observeFrequency, data.observeFrequency, "Observed frequency" );
                        assert.equal(spectrum.nbPoints, data.nbPoints, "Number of points" );
                        assert.equal(spectrum.firstX, data.firstX, "First X" );
                        assert.equal(spectrum.lastX, data.lastX, "Last X" );
                        assert.equal(spectrum.data[0].reduce(function(a,b) {return a+b}), data.total , "Sum of points" );

                    });
                });
            }
        )
    });

}

checkJcamp('data/ethylvinylether/1h.jdx', "1H NMR Ethyl vinyl ether",
    {
        nbSpectra: 2,
        xType: "1H",
        observeFrequency: 400.112,
        nbPoints: 16384,
        firstX: 11.00659,
        lastX: -1.009276326659311,
        total: 10199322812.993612
    }
);

// All those compressions should give exactly the dame result

var options={
    nbSpectra: 1,
    xType: "1H",
    observeFrequency: 400.1321303162,
    nbPoints: 16384,
    firstX: 12.31284,
    lastX: -1.6646457842364946,
    total: 11044828778.007011
}

checkJcamp('data/compression/jcamp-fix.dx', "Compression fixed", options);
checkJcamp('data/compression/jcamp-packed.dx', "Compression packed", options);
checkJcamp('data/compression/jcamp-squeezed.dx', "Compression squeezed", options);
checkJcamp('data/compression/jcamp-difdup.dx', "Compression difdup", options);


checkJcamp('data/indometacin/1h.dx', "1H NMR Indometacin",
    {
        nbSpectra: 1,
        xType: "1H",
        observeFrequency: 399.682468187609,
        nbPoints: 32768,
        firstX: 16.46138,
        lastX: -4.114164000759506,
        total: 34968303169.78704
    }
);

checkJcamp('data/indometacin/cosy.dx', "COSY Indometacin",
    {
        nbSpectra: 1024,
        xType: "1H",
        observeFrequency: 399.682944878731,
        nbPoints: 1024,
        firstX: 13.42727,
        lastX: 1.3052585346869103,
        total: 543213.05460976
    }
);

checkJcamp('data/indometacin/hsqc.dx', "HSQC Indometacin",
    {
        nbSpectra: 1024,
        xType: "1H",
        observeFrequency: 399.682944878731,
        nbPoints: 1024,
        firstX: 13.42727,
        lastX: 1.3052585346869103,
        total: 8546795.054609755
    }
);

checkJcamp('data/indometacin/hmbc.dx', "HMBC Indometacin",
    {
        nbSpectra: 1024,
        xType: "1H",
        observeFrequency: 399.682956295637 ,
        nbPoints: 1024,
        firstX: 13.35119,
        lastX: 1.4369847858490203,
        total: 24130609.545490365
    }
);
