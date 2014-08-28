window.onload = function(){
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
        // open json
        // json_spectrum is the JSON string
        var spectrum = JSON.parse(json_spectrum);
    
        // y: original spectra data
        var y = spectrum.y;
    
        // x0: original first point
        var x0 = spectrum.x;
    
        // dx: change in x value
        var dx = float(spectrum.dx);
    
        // fill original frecuency axis
        var x = new Array();
        for (i = 0; i < y.length; i++)
            x.push(x0 + i*dx);
    
        // fill convolution frecuency axis
        var X = x[2:(len(x)-2)];
    
        // fill Savitzky-Golay 0th
        var Y = new Array();
        for (j = 2; j < x.length -2; j++)
            var Y.push((1/35.0)*(-3*y[j-2] + 12*y[j-1] + 17*y[j] + 12*y[j+1] - 3*y[j+2]));
    
        // fill Savitzky-Golay 1st
        var dY = new Array();
        for (j = 2; j < x.length -2; j++)
            dY.push((1/(12*dx))*(y[j-2] - 8*y[j-1] + 8*y[j+1] - y[j+2]));
    
        // fill Savitzky-Golay 2nd
        var ddY = new Array();
        for (j = 2; j < x.length -2; j++)
            ddY.push((1/(7*dx**2))*(2*y[j-2] - y[j-1] - 2*y[j] - y[j+1] + 2*y[j+2]));
        
        // pushs max and min points in convolution functions
        var maxY = new Array();
        var stackInt = new Array();
        var intervals = new Array();
        var minddY = new Array();
        for (i = 1; i < Y.length -1 ; i++)
        {
            if ((Y[i] > Y[i-1]) && (Y[i] > Y[i+1]))
            {
                maxY.push(X[i]);
            }
            if ((dY[i] < dY[i-1]) && (dY[i] < dY[i+1]))
            {
                stackInt.push(X[i]);
            }
            if ((dY[i] > dY[i-1]) && (dY[i] > dY[i+1]))
            {
                try:
                    intervals.push( (X[i] , stackInt.pop()) );
                except IndexError:
                    pass
            }
            if ((ddY[i] < ddY[i-1]) && (ddY[i] < ddY[i+1]))
            {
                minddY.push( [X[i], Y[i]] );
            }
        }
        
        // creates a list with (frecuency, linewith, height)
        var signals = new Array();
        for (f of minddY)
        {
            frecuency = f[0];
            possible = new Array();
            for (i of intervals)
                if (frecuency > i[0] && frecuency < i[1])
                    possible.push(i);
            if (len(possible) > 0)
                if (len(possible) == 1)
                {
                    var inter = possible[0];
                    var linewith = inter[1] - inter[0];
                    var height = f[1];
                    var points = Y;
                    points.sort(function(a, b){return a-b});
                    if ((linewith > 2*dx) && (height > 0.0001*points[0]))
                        signals.push( [frecuency, linewith, height] );
                }
                else
                {
                    //TODO: nested peaks
                    console.log(possible);
                }
        }
    }
    else
    {
        alert('The File APIs are not fully supported in this browser.');
    }
}
