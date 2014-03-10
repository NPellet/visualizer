/* 
 * This class can simulate a GC trace using Gaussian curves.
 * Data needs to be in the following format : [[time1,intensity1],[time2,intensity2], ...]
 */
define(function() {
    
    var gaussian = [];
    var gaussianFactor = 5;   // after 5 the value is nearly 0, nearly no artefacts
    var gaussianWidth = 1000; // half height peak Width in point
    
    // init gaussian
    function initGaussian() {
        if (gaussian.length > 0)
            return;
        var ratio = Math.sqrt(2 * Math.log(2) / Math.log(Math.E));
        for (var i = 0; i <= gaussianWidth * gaussianFactor; i++) {
            gaussian[i] = 1 / Math.sqrt(2 * Math.PI) * Math.exp(-1 / 2 * Math.pow((i - (gaussianFactor * gaussianWidth / 2)) * 2 / gaussianWidth * ratio, 2));
        }
    }
    
    var getWidth = function(time) {
        return 1 + 3 * time / 1000;
    };

    function GCGenerator(options) {
        
        initGaussian();
        
        options = options || {};
        this.maxTime = options.maxTime || 3600;
        this.nbPointsPerSecond = options.nbPointsPerSecond || 5;
        this.getWidth = options.getWidth || getWidth;
        this.annotations = [];
        this.spectrum = []; // we will create 10 points per second
        for (var i = this.maxTime * this.nbPointsPerSecond * 2; i >= 0; i = i - 2) {
            this.spectrum[i] = i / this.nbPointsPerSecond / 2;
            this.spectrum[i + 1] = 0;
        }

        this.appendPeaks = function(peaks, id) {
            for (var i = 0; i < peaks.length; i++) {
                this.appendPeak(peaks[i], id);
            }
        };


        this.appendAnnotation = function(from, to, id, info) {
            var annotation = {};
            annotation.type = "rect";
            annotation._highlight = [id];
            annotation.pos = {x: from, y: 30 + "px"};
            annotation.pos2 = {x: to, y: 60 + "px"}; // can be specified also as x and y or dx and dy
            annotation.fillColor = "#EEEEEE";
            annotation.strokeColor = "#CC0000";
            annotation.strokeWidth = "0px";

            annotation.info = info;
            this.annotations.push(annotation);
        };

        this.random = function(nbGroups, maxNbPeaks) {
            // We generate randomly a peaks
            var annotations = [];
            var maxNbPeaks = maxNbPeaks || 1;
            for (var i = 0; i < nbGroups; i++) {
                var random = Math.random() * maxNbPeaks + 1;
                for (var j = 0; j < random; j++) {
                    var annotation = {};
                    var time = Math.floor(Math.random() * this.maxTime);
                    var height = Math.random();
                    this.appendPeak([time, height], i);
                }
            }
            return peaksDescription;
        };

        this.appendPeak = function(peak, id) {
            var time = peak[0];
            var height = peak[1];
            var width = this.getWidth(time);
            var firstTime = time - (width / 2 * gaussianFactor);
            var lastTime = time + (width / 2 * gaussianFactor);
            var firstAnnotationTime = time - (width);
            var lastAnnotationTime = time + (width);

            var firstPoint = Math.max(Math.ceil(firstTime * this.nbPointsPerSecond), 0);
            var lastPoint = Math.min(Math.floor(lastTime * this.nbPointsPerSecond), this.spectrum.length / 2 - 1);
            var middlePoint = (firstPoint + lastPoint) / 2;
            for (var j = firstPoint; j <= lastPoint; j++) {
                var gaussianIndex = Math.floor(gaussianWidth / width * (j - middlePoint) / this.nbPointsPerSecond + gaussianFactor * gaussianWidth / 2);
                if (gaussianIndex >= 0 && gaussianIndex < gaussian.length) {
                    this.spectrum[j * 2 + 1] += gaussian[gaussianIndex] * height;
                }
            }
            if (id) {
                this.appendAnnotation(firstAnnotationTime, lastAnnotationTime, id);
            }
        };
        this.getSpectrum = function() {
            return this.spectrum;
        };
        this.getAnnotations = function() {
            return this.annotations;
        };
    }

    return GCGenerator;

});