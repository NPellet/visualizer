#ES6 Promise polyfill

To use the Promise polyfill, just drop two JavaScript files into your page:
```html
<script src="setimmediate.js"></script>
<script src="promise.js"></script>
```
or load as the Node.js module:
```javascript
var Promise = require('es6-promises');
```

Download the [latest Promise polyfill from GitHub](https://raw.githubusercontent.com/Octane/Promise/master/promise.js).

**npm**
```shell
npm install es6-promises
```
**Bower**
```shell
bower install promises
```

##Dependencies

 - The Promise polyfill requieres `setImmediate` ([msdn](http://msdn.microsoft.com/en-us/library/ie/hh773176(v=vs.85).aspx), [nodejs](http://nodejs.org/api/timers.html#timers_setimmediate_callback_arg), [polyfill](https://github.com/Octane/setImmediate/)).
 - To support IE8 plug any [`forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach), [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) and [`every`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every) polyfills.

##License

The Promise polyfill is released under the [MIT license](https://github.com/Octane/Promise/blob/master/LICENSE).
