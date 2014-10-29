/*
 */
define(function() {

    function parse(sdf) {
        // we will find the delimiter in order to be much faster and not use regular expression
        var header=sdf.substr(0,1000);
        var crlf="\n";
        if (header.indexOf("\r\n")>-1) {
            crlf="\r\n";
        } else if (header.indexOf("\r")>-1) {
            crlf="\r";
        }

        var sdfParts=sdf.split(crlf+"$$$$"+crlf);
        var molecules=[];
        var labels={};

        var start=(new Date()).getTime();

        for (var i=0; i<sdfParts.length; i++) {
            var sdfPart=sdfParts[i];
            var parts=sdfPart.split(crlf+">");
            if (parts.length>0 && parts[0].length>10) {
                var molecule={};
                molecules.push(molecule);
                molecule.molfile={type: 'mol2d', value:parts[0]+crlf};
                for (var j=1; j<parts.length; j++) {
                    var lines=parts[j].split(crlf);
                    var from=lines[0].indexOf("<");
                    var to=lines[0].indexOf(">");
                    var label=lines[0].substring(from+1,to);
                    if (labels[label]) {
                        labels[label]++;
                    } else {
                        labels[label]=1;
                    }
                    for (var k=1; k<lines.length-1; k++) {
                        if (molecule[label]) {
                            molecule[label]+=crlf+lines[k];
                        } else {
                            molecule[label]=lines[k];
                        }
                    }
                }
            }
        }

        var statistics=[];

        for (var key in labels) {
            var statistic={
                label: key,
                number: labels[key]
            }
            statistics.push(statistic);
        }

        console.log((new Date()).getTime()-start);


        return {
            molecules: molecules,
            labels: Object.keys(labels),
            statistics: statistics
        };
    }

    return parse;

});