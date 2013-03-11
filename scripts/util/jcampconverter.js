var CI=CI?CI:{};
CI.converter=CI.converter?CI.converter:{};

CI.converter.jcampToSpectra=(function() {
    // the following RegExp can only be used for XYdata, some peakTables have values with a "E-5" ...
    var xyDataSplitRegExp=/[,\t \+-]*(?=[^\d,\t \.])|[ \t]+(?=[\d+\.-])/;
    var removeCommentRegExp=/\$\$.*/;
    var peakTableSplitRegExp=/[,\t ]+/
    var DEBUG=false;

    function convertToFloatArray(stringArray) {
        var floatArray=[];
        for (var i=0, ii = stringArray.length; i<ii; i++) {
            floatArray[i]=parseFloat(stringArray[i]);
        }
        return floatArray;
    };

    function convert(jcamp, options) {
        var ntuples={},
            ldr,
            dataLabel,
            dataValue,
            ldrs,
            i, ii, position, endLine, infos;


        var spectra = [];
        var spectrum = {};

        console.time("start");

        ldrs=jcamp.split(/[\r\n]+ *##/);
        if (ldrs[0]) ldrs[0]=ldrs[0].replace(/^[\r\n ]*##/,"");

        for (i=0, ii=ldrs.length; i<ii; i++) {
            ldr=ldrs[i];
            // This is a new LDR
            position=ldr.indexOf("=");
            if (position>0) {
                dataLabel=ldr.substring(0,position);
                dataValue=ldr.substring(position+1).trim();
            } else {
                dataLabel=ldr;
                dataValue="";
            }
            dataLabel=dataLabel.replace(/[_ -]/g,'').toUpperCase();

            if (dataLabel=='DATATABLE') {
                // ##DATA TABLE= (X++(I..I)), XYDATA
                // We need to find the variable, we currently deal only with some specific case
                endLine=dataValue.indexOf("\n");
                if (endLine==-1) endLine=dataValue.indexOf("\r");
                if (endLine>0) {
                    infos=dataValue.substring(0,endLine).split(/[ ,;\t]+/);
                    if (ntuples.first) {
                        spectrum.firstX=ntuples.first[0];
                        spectrum.firstY=ntuples.first[1];
                    }
                    if (ntuples.last) {
                        spectrum.lastX=ntuples.last[0];
                        spectrum.lastY=ntuples.last[1];
                    }
                    if (ntuples.vardim) {
                        spectrum.nbPoints=ntuples.vardim[0];
                    }
                    if (ntuples.factor) {
                        spectrum.xFactor=ntuples.factor[0];
                        spectrum.yFactor=ntuples.factor[1];
                    }
                    if (ntuples.units) {
                        spectrum.xUnit=ntuples.units[0];
                        spectrum.yUnit=ntuples.units[1];
                        spectrum.deltaX=(spectrum.lastX-spectrum.firstX)/(spectrum.nbPoints-1);
                    }
                    
                    if (infos[1] && infos[1]=="PEAKS") dataLabel="PEAKTABLE";
                    else if (infos[1] && infos[1]=="XYDATA") dataLabel="XYDATA";
                    else if (infos[0] && infos[0].indexOf("++")>0) dataLabel="XYDATA";
                }
            }


            if (dataLabel=='TITLE') {
                spectrum.title = dataValue;
            } else if (dataLabel=='XUNITS') {
                spectrum.xUnit = dataValue;
            } else if (dataLabel=='YUNITS') {
                spectrum.yUnit = dataValue;
            } else if (dataLabel=='FIRSTX') {
                spectrum.firstX = parseFloat(dataValue);
            } else if (dataLabel=='LASTX') {
                spectrum.lastX = parseFloat(dataValue);
            } else if (dataLabel=='FIRSTY') {
                spectrum.firstY = parseFloat(dataValue);
            } else if (dataLabel=='NPOINTS') {
                spectrum.nbPoints = parseFloat(dataValue);
            } else if (dataLabel=='XFACTOR') {
                spectrum.xFactor = parseFloat(dataValue);
            } else if (dataLabel=='YFACTOR') {
                spectrum.yFactor = parseFloat(dataValue);
            } else if (dataLabel=='DELTAX') {
                spectrum.deltaX = parseFloat(dataValue);
            } else if (dataLabel=='.OBSERVEFREQUENCY') {
                spectrum.observeFrequency=parseFloat(dataValue);
            } else if (dataLabel=='$OFFSET') {   // OFFSET for Bruker spectra
                shiftOffsetNum = 0;
                shiftOffsetVal = parseFloat(dataValue);
            } else if (dataLabel=='$REFERENCEPOINT') {   // OFFSET for Varian spectra
        

            } else if (dataLabel=='.SHIFTREFERENCE') {   // OFFSET FOR Bruker Spectra
                    var parts = dataValue.split(/ *, */);
                    shiftOffsetNum = parseInt(parts[2].trim());
                    shiftOffsetVal = parseFloat(parts[3].trim());
            } else if (dataLabel=='VARNAME') {
                ntuples.varname=dataValue.split(/[, \t]+/);
            } else if (dataLabel=='SYMBOL') {
                ntuples.symbol=dataValue.split(/[, \t]+/);
            } else if (dataLabel=='VARTYPE') {
                ntuples.vartype=dataValue.split(/[, \t]+/);
            } else if (dataLabel=='VARFORM') {
                ntuples.varform=dataValue.split(/[, \t]+/);
            } else if (dataLabel=='VARDIM') {
                ntuples.vardim=convertToFloatArray(dataValue.split(/[, \t]+/));
            } else if (dataLabel=='UNITS') {
                ntuples.units=dataValue.split(/[, \t]+/);
            } else if (dataLabel=='FACTOR') {
                ntuples.factor=convertToFloatArray(dataValue.split(/[, \t]+/));
            } else if (dataLabel=='FIRST') {
                ntuples.first=convertToFloatArray(dataValue.split(/[, \t]+/));
            } else if (dataLabel=='LAST') {
                ntuples.last=convertToFloatArray(dataValue.split(/[, \t]+/));
            } else if (dataLabel=='MIN') {
                ntuples.min=convertToFloatArray(dataValue.split(/[, \t]+/));
            } else if (dataLabel=='MAX') {
                ntuples.max=convertToFloatArray(dataValue.split(/[, \t]+/));
            } else if (dataLabel=="XYDATA") {
                prepareSpectrum(spectrum);
                parseXYData(spectrum, dataValue);
                spectra.push(spectrum);
                spectrum={};
            } else if (dataLabel=="PEAKTABLE") {
                prepareSpectrum(spectrum);
                parsePeakTable(spectrum, dataValue);
                spectra.push(spectrum);
                spectrum={};
            }
        }
        console.timeEnd("start");
        console.time("lowres");
        if (options && options.lowRes) addLowRes(spectra,options);
        console.timeEnd("lowres");

        return spectra;

    }


    function prepareSpectrum(spectrum) {
        if (spectrum.observeFrequency) {
            if (spectrum.xUnit && spectrum.xUnit.toUpperCase()=='HZ') {
                spectrum.xUnit='PPM';
            } else {
                spectrum.observeFrequency=1;
            }
        } else {
            spectrum.observeFrequency=1;
        }
    }

    function parsePeakTable(spectrum, value) {
        spectrum.continuous=false;
        spectrum.data=[];
        spectrum.currentData=[];
        spectrum.data.push(spectrum.currentData);
        var lines=value.split(/[\r\n]+/);


        for (var i=1, ii=lines.length; i<ii; i++) {
            var values=lines[i].trim().replace(removeCommentRegExp,"").split(peakTableSplitRegExp);
            if (values.length==2) {
                spectrum.data.push(parseFloat(values[0]));
                spectrum.data.push(parseFloat(values[1]));
            } else {
                console.log("Format error: "+values);
            }
            
        }
    }

    function parseXYData(spectrum, value) {
        spectrum.continuous=true;
        spectrum.data=[];
        spectrum.currentData=[];
        spectrum.data.push(spectrum.currentData);
        var currentX = spectrum.firstX;
        var currentY = spectrum.firstY;
        var lines=value.split(/[\r\n]+/);
        var lastDif, values, ascii;
        for (var i=1, ii=lines.length; i<ii; i++) {
            values=lines[i].trim().replace(removeCommentRegExp,"").split(xyDataSplitRegExp);
            if (values.length>0) {
                if (DEBUG) {
                    if (! spectrum.firstPoint) {
                        spectrum.firstPoint=parseFloat(values[0]);
                    }
                    var expectedCurrentX=parseFloat(values[0]-spectrum.firstPoint)*spectrum.xFactor+spectrum.firstX;
                    if ((lastDif || lastDif==0)) {
                        expectedCurrentX+=spectrum.deltaX;
                    }
                    console.log("Checking X value: currentX: "+currentX+" - expectedCurrentX: "+expectedCurrentX);
                    console.log(values);
                }

                
                for (var j=1, jj=values.length; j<jj; j++) {
                    if (j==1 && (lastDif || lastDif==0)) {
                        lastDif = undefined; // at the beginning of each line there should be the full value X / Y so the diff is always undefined
                        // we could check if we have the expected Y value
                    } else {
                        if (values[j].length>0) {
                            ascii=values[j].charCodeAt(0);
                            // + - . 0 1 2 3 4 5 6 7 8 9
                            if ((ascii==43) || (ascii==45) || (ascii==46) || ((ascii>47) && (ascii<58))) {
                                currentY=parseInt(values[j]);
                                addPoint(spectrum,currentX,currentY);
                                currentX+=spectrum.deltaX;
                            } else
                            // positive SQZ digits @ A B C D E F G H I (ascii 64-73)
                            if ((ascii>63) && (ascii<74)) {
                                currentY=parseInt(String.fromCharCode(ascii-16)+values[j].substring(1));
                                addPoint(spectrum,currentX,currentY);
                                currentX+=spectrum.deltaX;
                            } else
                            // negative SQZ digits a b c d e f g h i (ascii 97-105)
                            if ((ascii>96) && (ascii<106)) {
                                currentY=- parseInt(String.fromCharCode(ascii-48)+values[j].substring(1));
                                addPoint(spectrum,currentX,currentY);
                                currentX+=spectrum.deltaX;
                           } else 



                            // DUP digits S T U V W X Y Z s (ascii 83-90, 115)
                            if  ((ascii>82) && ((ascii==115) || (ascii<91))) {
                                var dup = parseInt(String.fromCharCode(ascii-34)+values[j].substring(1))-1;
                                if (ascii==115) {
                                    dup = parseInt("9"+values[j].substring(1))-1;
                                }
                                for ( var l=0; l<dup; l++) {
                                    if (lastDif) {
                                        currentY=currentY+lastDif;
                                    }
                                    addPoint(spectrum,currentX,currentY);
                                    currentX+=spectrum.deltaX;
                                }
                            } else
                            // positive DIF digits % J K L M N O P Q R (ascii 37, 74-82)
                            if  (ascii==37) {
                                lastDif=parseInt("0"+values[j].substring(1));
                                currentY+=lastDif;
                                addPoint(spectrum,currentX,currentY);
                                currentX+=spectrum.deltaX;
                            } else if ((ascii>73) && (ascii<83)) {
                                lastDif=parseInt(String.fromCharCode(ascii-25)+values[j].substring(1));
                                currentY+=lastDif;
                                addPoint(spectrum,currentX,currentY);
                                currentX+=spectrum.deltaX;
                           } else
                            // negative DIF digits j k l m n o p q r (ascii 106-114)
                            if ((ascii>105) && (ascii<115)) {
                                lastDif=-parseInt(String.fromCharCode(ascii-57)+values[j].substring(1));
                                currentY+=lastDif;
                                addPoint(spectrum,currentX,currentY);
                                currentX+=spectrum.deltaX;
                           }
                        }
                    }
                }  
            }  
        }
    }

    function addPoint(spectrum,currentX,currentY) {
 //       console.log(currentX+" - "+currentY+" - "+currentX/spectrum.observeFrequency+" - "+currentY*spectrum.yFactor);
        spectrum.currentData.push(currentX/spectrum.observeFrequency*spectrum.xFactor, currentY*spectrum.yFactor);
    }

    function addLowRes(spectra, options) {
        var spectrum;
        var averageX, averageY;
        var targetNbPoints=options.lowRes;
        var highResData;
        for (var i=0; i<spectra.length; i++) {
            spectrum=spectra[i];
            // we need to find the current higher resolution
            if (spectrum.data.length>0) {
                highResData=spectrum.data[0];
                for (var j=1; j<spectrum.data.length; j++) {
                    if (spectrum.data[j].length>highResData.length) {
                        highResData=spectrum.data[j];
                    }
                }

                if (targetNbPoints>(highResData.length/2)) return;
                var i, ii;
                var lowResData=[];
                var modulo=Math.ceil(highResData.length/(targetNbPoints*2));
                for (i=0, ii=highResData.length; i<ii; i=i+2) {
                    if (i%modulo==0) {
                        lowResData.push(highResData[i], highResData[i+1])
                    }
                }
                spectrum.data.push(lowResData);
            }
        }
    }

    return convert;
})();


