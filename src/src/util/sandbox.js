'use strict';

define(function () {
  function Sandbox() {
    this.contextData = [];
    this.contextString = '';
    this.scriptID = 0;
  }

  Sandbox.prototype.setContext = function (context) {
    let ctxString = '';
    let ctxData = [];
    for (const [i, key] of Object.keys(context).entries()) {
      ctxString += `var ${key} = __ctx__[${i}]; `;
      ctxData.push(context[key]);
    }
    this.contextString = ctxString;
    this.contextData = ctxData;
  };

  Sandbox.prototype.run = function (script, sourceURL) {
    if (sourceURL) {
      script += `//# sourceURL=${sourceURL}@${this.scriptID++}`;
    }
    script = this.contextString + script;
    return safeEval(script, this.contextData.slice());
  };

  return Sandbox;

  // eslint-disable-next-line no-unused-vars
  function safeEval(script, __ctx__, Sandbox, safeEval) {
    return eval(script);
  }
});
