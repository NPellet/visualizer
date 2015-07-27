'use strict';

define(function () {

    function Sandbox() {
        this.contextData = [];
        this.contextString = '';
    }

    Sandbox.prototype.setContext = function (context) {
        var ctxString = '';
        var ctxData = [];
        Object.keys(context).forEach(function (key, i) {
            ctxString += 'var ' + key + ' = __ctx__[' + i + ']; ';
            ctxData.push(context[key]);
        });
        this.contextString = ctxString;
        this.contextData = ctxData;
    };

    Sandbox.prototype.run = function (script, sourceURL) {
        if (sourceURL) {
            script += '//# sourceURL=' + sourceURL;
        }
        return safeEval(script, this.contextString, this.contextData.slice());
    };

    return Sandbox;

    function safeEval(script, ctxString, __ctx__, Sandbox) {
        return eval(ctxString + script);
    }

});
