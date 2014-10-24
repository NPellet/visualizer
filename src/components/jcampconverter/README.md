JCAMP converter
===============

Installation
---------------

### Node JS
```
npm install jcampconverter
```

### Bower
```
bower install jcampconverter
```

Methods
---------------

### convert(jcamp, [options], [useWorker])

Converts the `jcamp` using `options`.

__Arguments__

* `jcamp` - String containing the JCAMP data
* `options` - Object with options to pass to the converter
* `useWorker` - Browser only: convert in a web worker (default: false). If this option is set to true, it will return a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### Use as a module

####Node JS
```javascript
var converter = require('jcampconverter');
var jcamp = require('fs').readFileSync('path/to/jcamp.dx').toString();

var result = converter.convert(jcamp);
```

#### AMD
```javascript
require(['jcampconverter'], function(JcampConverter) {
    // Use the worker
    JcampConverter.convert(jcamp, true).then(function (result) {
        // Do something with result
    });
});
```

Testing and build
---------------
```
npm install
grunt
```
