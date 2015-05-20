'use strict';

define(function () {

    var globals = [
        'DataObject',
        'DataArray',
        'DataString',
        'DataBoolean',
        'DataNumber',
        'Promise',
        'require',
        'setImmediate'
    ];

    function Sandbox() {
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        this._win = iframe.contentWindow;
        var win = this._win;
        this._frame = iframe;
        this._originalKeys = Object.keys(win);
        Object.defineProperty(win, 'parent', {value: null});
        globals.forEach(function (global) {
            Object.defineProperty(win, global, {
                value: window[global]
            });
        });
        this._closed = false;
    }

    Sandbox.prototype.close = function () {
        document.body.removeChild(this._frame);
        this._closed = true;
    };

    Sandbox.prototype.setContext = function (context) {
        var win = this._win;
        Object.keys(context).forEach(function (key) {
            win[key] = context[key];
        });
    };

    Sandbox.prototype.getContext = function () {
        var context = {};
        var orig = this._originalKeys;
        var win = this._win;
        Object.keys(win).forEach(function (key) {
            if (orig.indexOf(key) === -1) {
                context[key] = win[key];
            }
        });
        return context;
    };

    Sandbox.prototype.run = function (script) {
        if (this._closed) {
            throw new Error('cannot run in closed sandbox');
        }
        return this._win.eval(script);
    };

    return Sandbox;

});
