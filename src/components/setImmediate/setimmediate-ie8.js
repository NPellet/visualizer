/**
 * IE8 setImmediate polyfill v1.0.0
 * © 2014 Dmitry Korobkin
 * Released under the MIT license
 * github.com/Octane/setImmediate
 */
window instanceof Object || function () {

    var uid = 0,
        storage = {},
        slice = Array.prototype.slice;

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

    function setImmediate() {
        var id = uid++,
            args = arguments;
        function onReadyStateChange() {
            this.onreadystatechange = null;
            document.removeChild(this);
            if (storage[id]) {
                delete storage[id];
                fastApply(args);
            }
        }
        storage[id] = true;
        (function () {//avoid closure
            var script = document.createElement('script');
            script.onreadystatechange = onReadyStateChange;
            document.appendChild(script);
        }());
        return id;
    }

    function clearImmediate(id) {
        delete storage[id];
    }

    window.setImmediate = setImmediate;
    window.clearImmediate = clearImmediate;

}();
