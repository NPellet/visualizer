/**
 * setImmediate polyfill v1.0.0, supports IE9+
 * © 2014 Dmitry Korobkin
 * Released under the MIT license
 * github.com/Octane/setImmediate
 */
window.setImmediate || function () {'use strict';

    var uid = 0,
        storage = {},
        firstCall = true,
        slice = Array.prototype.slice,
        message = 'setImmediatePolyfillMessage';

    function fastApply(args) {
        var func = args[0];
        switch (args.length) {
            case 1:
                return func();
            case 2:
                return func(args[1]);
            case 3:
                return func(args[1], args[2]);
        }
        return func.apply(window, slice.call(args, 1));
    }

    function callback(event) {
        var key = event.data,
            data;
        if ('string' == typeof key && 0 == key.indexOf(message)) {
            data = storage[key];
            if (data) {
                delete storage[key];
                fastApply(data);
            }
        }
    }

    window.setImmediate = function setImmediate() {
        var id = uid++,
            key = message + id;
        storage[key] = arguments;
        if (firstCall) {
            firstCall = false;
            window.addEventListener('message', callback);
        }
        window.postMessage(key, '*');
        return id;
    };

    window.clearImmediate = function clearImmediate(id) {
        delete storage[message + id];
    };

}();
