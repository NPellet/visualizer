define(["lib/chemistry/gc-generator"], function(GC) {

    return function(gc) {

        var generator = new GC();
        generator.appendPeaks(gc);
        return new DataArray(generator.getSpectrum());

    };

});