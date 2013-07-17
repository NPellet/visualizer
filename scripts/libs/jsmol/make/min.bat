@echo off
echo JSmol.min.js
type ..\js\JSmoljQuery.js > min.js
type ..\js\JSmolCore.js >> min.js
type ..\js\JSmol.js >> min.js
type ..\js\JSmolApplet.js >> min.js
type ..\js\JSmolControls.js >> min.js
type ..\js\JSmolApi.js >> min.js
type ..\js\j2sjmol.js >> min.js
java -jar closure_compiler.jar --js min.js --js_output_file ..\JSmol.min.js


@echo off
echo JSmol.min.nojq.js
type ..\js\JSmolCore.js > min.js
type ..\js\JSmol.js >> min.js
type ..\js\JSmolApplet.js >> min.js
type ..\js\JSmolControls.js >> min.js
type ..\js\JSmolApi.js >> min.js
type ..\js\j2sjmol.js >> min.js
java -jar closure_compiler.jar --js min.js --js_output_file ..\JSmol.min.nojq.js


echo JSmol.min.core.js
type ..\JSmol.min.js > ..\JSmol.min.core.js
type coretop2.js >> ..\JSmol.min.core.js
type ..\j2s\core\core.z.js  >> ..\JSmol.min.core.js 
del ../JSmol.min.core.js.gz
c:\"program files\7-zip\7z.exe" a -tgzip ../JSmol.min.core.js.gz ../JSmol.min.core.js


echo JSmol.lite.js
echo This version includes jQuery
type ..\js\JSmoljQuery.js > min.js
type ..\js\JSmolCore.js >> min.js
type ..\js\JSmolTM.js >> min.js
del ..\JSmol.lite.js.gz
java -jar closure_compiler.jar --js min.js --js_output_file ..\JSmol.lite.js
c:\"program files\7-zip\7z.exe" a -tgzip ../JSmol.lite.js.gz ../JSmol.lite.js

echo JSmol.lite.nojq.js
echo YOU MUST PROVIDE YOUR OWN VERSION OF JQUERY FOR JSmol.lite.nojq.js
type ..\js\JSmolCore.js > min.js
type ..\js\JSmolTM.js >> min.js
del ..\JSmol.lite.nojq.js.gz
java -jar closure_compiler.jar --js min.js --js_output_file ..\JSmol.lite.nojq.js
c:\"program files\7-zip\7z.exe" a -tgzip ../JSmol.lite.nojq.js.gz ../JSmol.lite.nojq.js


pause
del min.js
call zip.bat
