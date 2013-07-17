copy core.js full\%1.js
java -jar closure_compiler.jar --js core.js --js_output_file ../j2s/core/%1.z.js
echo pause
del core.js
