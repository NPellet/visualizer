'use strict';

/**
 * Global utility methods
 * @module src/util/util
 */
define([
  'bluebird',
  'lodash',
  './debug',
  './color',
  '../data/structures',
  'web-animations'
], function (Promise, _, Debug, Color, structures) {
  var months = [
    'January',
    'February',
    'March',
    'April',
    'Mai',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  var days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  function noop() {
    // empty
  }

  var regQuote = /"/g,
    regJpath = /^element\./;

  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];

  function makejPathFunction(jpath) {
    if (!jpath) {
      return noop;
    }

    var jpaths2 = jpath.replace(regJpath, ''),
      splitted = jpaths2.split('.'),
      l = splitted.length - 1,
      ifArray = [],
      ifString,
      ifElement = 'el';

    for (var i = 0; i < l; i++) {
      ifElement += `["${splitted[i].replace(regQuote, '\\"')}"]`;
      ifArray.push(`${ifElement} != undefined`);
    }

    ifString = ifArray.join(' && ');
    if (!ifString) {
      ifString = 'true';
    }

    var functionEvaled = noop;
    eval(
      `functionEvaled = function( el ) { if (el && ${ifString}) return ${ifElement}['${splitted[
        l
      ].replace(regQuote, '\\"')}']; };`
    );
    return functionEvaled;
  }

  function getCSS(ruleName, deleteFlag) {
    ruleName = ruleName.toLowerCase();

    if (!document.styleSheets) {
      return;
    }

    var i = 0,
      stylesheet,
      ii,
      cssRule;

    for (; i < document.styleSheets.length; i++) {
      stylesheet = document.styleSheets[i];
      ii = 0;
      cssRule = false;
      do {
        // For each rule in stylesheet
        cssRule = stylesheet.cssRules
          ? stylesheet.cssRules[ii]
          : stylesheet.rules
            ? stylesheet.rules[ii]
            : null;
        if (!cssRule || !cssRule.selectorText) {
          ii++;
          continue;
        }

        if (cssRule.selectorText.toLowerCase() == ruleName) {
          if (deleteFlag) {
            if (stylesheet.cssRules) {
              stylesheet.deleteRule(ii);
            } else {
              stylesheet.removeRule(ii);
            }
            return true;
          } else {
            return cssRule;
          }
        }

        ii++;
      } while (cssRule);
    }

    return false;
  }

  var exports = {
    getCurrentLang: function () {
      return 'en';
    },
    maskIframes: function () {
      $('iframe').each(function () {
        var iframe = $(this);
        var pos = iframe.position();
        var width = iframe.width();
        var height = iframe.height();
        iframe.before(
          $('<div />')
            .css({
              position: 'absolute',
              width: width,
              height: height,
              top: pos.top,
              left: pos.left,
              background: 'white',
              opacity: 0.5
            })
            .addClass('iframemask')
        );
      });
    },
    unmaskIframes: function () {
      $('.iframemask').remove();
    },
    formatSize: function (size) {
      let i = 0;
      while (size > 1024) {
        size = size / 1024;
        i++;
      }
      return `${Math.round(size * 100) / 100} ${units[i]}`;
    },
    pad: function (val) {
      return val < 10 ? `0${val}` : val;
    },
    getMonth: function (month) {
      return months[month];
    },
    getDay: function (day) {
      return days[day];
    },
    loadCss: function (url) {
      var that = this;
      return new Promise(function (resolve, reject) {
        url = require.toUrl(url);

        that.loadedCss = that.loadedCss || {};

        if (that.loadedCss[url]) {
          // element is already loaded
          that.loadedCss[url].disabled = false;
          return resolve(that.loadedCss[url]);
        }

        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = function () {
          that.loadedCss[url] = link;
          resolve(link);
        };

        try {
          document.getElementsByTagName('head')[0].appendChild(link);
        } catch (e) {
          reject(e);
        }
      });
    },
    unloadCss: function (url) {
      var that = this;
      url = require.toUrl(url);
      if (that.loadedCss[url]) {
        that.loadedCss[url].disabled = true;
      }
    },

    getCssVendorPrefix: function () {
      var styles = window.getComputedStyle(document.documentElement, '');
      var pre = (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms)-/) ||
        (styles.OLink === '' && ['', 'o']))[1];
      return `-${pre}-`;
    },

    makejPathFunction: makejPathFunction,

    addjPathFunction: function (stack, jpath) {
      stack[jpath] = makejPathFunction(jpath);
    },

    jpathToArray: function (val) {
      if (val) {
        var val2 = val.split('.');
        val2.shift();
        return val2;
      } else {
        return [];
      }
    },

    jpathToString: function (val) {
      val = val || [];
      val = val.slice();
      val.unshift('element');
      return val.join('.');
    },

    getWebsafeFonts: function () {
      return [
        { title: 'Arial', key: 'Arial' },
        { title: 'Arial Black', key: 'Arial Black' },
        { title: 'Comic Sans MS', key: 'Comic Sans MS' },
        { title: 'Courier', key: 'Courier' },
        { title: 'Courier new', key: 'Courier New' },
        { title: 'Georgia', key: 'Georgia' },
        { title: 'Helvetica', key: 'Helvetica' },
        { title: 'Impact', key: 'Impact' },
        { title: 'Palatino', key: 'Palatino' },
        { title: 'Times new roman', key: 'Times New Roman' },
        { title: 'Trebuchet MS', key: 'Trebuchet MS' },
        { title: 'Verdana', key: 'Verdana' }
      ];
    },

    // CSS rules
    // Modified version
    // See http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
    // for original source

    getCSS: getCSS,

    removeCSS: function (ruleName) {
      return getCSS(ruleName, true);
    },

    addCSS: function (ruleName) {
      if (!document.styleSheets) {
        return;
      }

      var rule;
      if (!(rule = getCSS(ruleName))) {
        if (document.styleSheets[0].addRule) {
          document.styleSheets[0].addRule(ruleName, null, 0);
        } else {
          document.styleSheets[0].insertRule(`${ruleName} { }`, 0);
        }

        return getCSS(ruleName);
      }

      return rule;
    },

    // http://stackoverflow.com/questions/9318674/javascript-number-currency-formatting
    formatMoney: function (n, decPlaces, thouSeparator, decSeparator) {
      decPlaces = isNaN((decPlaces = Math.abs(decPlaces))) ? 2 : decPlaces;
      decSeparator = decSeparator == undefined ? '.' : decSeparator;
      thouSeparator = thouSeparator == undefined ? ',' : thouSeparator;

      var sign = n < 0 ? '-' : '',
        i = `${parseInt((n = Math.abs(+n || 0).toFixed(decPlaces)), 10)}`,
        j = i.length;
      j = j > 3 ? j % 3 : 0;
      return (
        sign +
        (j ? i.substr(0, j) + thouSeparator : '') +
        i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${thouSeparator}`) +
        (decPlaces
          ? decSeparator +
            Math.abs(n - i)
              .toFixed(decPlaces)
              .slice(2)
          : '')
      );
    },

    safeAccess: function () {
      var access = arguments[0];

      for (var i = 1; i < arguments.length; i++) {
        if (!(access = access[arguments[i]])) {
          return false;
        }
      }

      return access;
    }
  };

  /**
   * No-op function
   */
  exports.noop = noop;

  let uniqueid = 0;
  /**
   * Returns a unique id.
   * @param {boolean} [absolute]
   * @return {string}
   */
  exports.getNextUniqueId = function getNextUniqueId(absolute) {
    if (absolute) {
      return `id_${Date.now()}${Math.round(Math.random() * 100000)}`;
    }
    return `uniqid_${++uniqueid}`;
  };

  /**
   * Mark that a method should not be used. Returns a modified function which warns once when called.
   * @param {function} method - the deprecated method
   * @param {string} [message] - optional message to log
   * @return {*}
   */
  exports.deprecate = function deprecate(method, message) {
    var warned = false;
    return function deprecated() {
      if (!warned) {
        Debug.warn(`Method ${method.name} is deprecated. ${message || ''}`);
        warned = true;
      }
      return method.apply(this, arguments);
    };
  };

  const warnOnceMap = new Set();
  const warnOnceCheck = function (name) {
    if (warnOnceMap.has(name)) {
      return true;
    } else {
      warnOnceMap.add(name);
      return false;
    }
  };

  /**
   * Prints a warning message only once per id
   * @param {string} id
   * @param {string} message
   */
  exports.warnOnce = function warnOnce(id, message) {
    if (!warnOnceCheck(id)) {
      Debug.warn(message);
    }
  };

  /**
   * Make a constructor's prototype inherit another one, while adding optionally new methods to it. Also sets a `super_`
   * property to access the super constructor
   * @param {function} ctor - New constructor
   * @param {function} superCtor - Super constructor
   * @param {object} [methods] - Methods to add to the new constructor
   */
  exports.inherits = function (ctor, superCtor, methods) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (methods) {
      _.assign(ctor.prototype, methods);
    }
  };

  exports.getLoadingAnimation = function (size, color) {
    if (size === undefined) size = 32;
    if (color === undefined) color = 'black';
    // Image taken from https://github.com/jxnblk/loading (loading-bars.svg)
    var $elem = $(`
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="black">
               <style>
                 @keyframes ci-loading-rectangles {
                   0% {transform: none}
                   25% { transform: matrix(1,0,0,2,0,-16) }
                   50% { transform: none}
                 }
                 .ci-loading-rectanim {
                   animation: ci-loading-rectangles 1s infinite
                 }
                 #ci-loading-rectanim-2 {
                   animation-delay: 0.16s;
                 }
                 #ci-loading-rectanim-3 {
                   animation-delay: 0.32s;
                 }
                 #ci-loading-rectanim-4 {
                   animation-delay: 0.48s;
                 }
                 #ci-loading-rectanim-5 {
                   animation-delay: 0.64s;
                 }
               </style>
               <rect class="ci-loading-rectanim" id="ci-loading-rectanim-1" x="0" y="12" width="4" height="8"></rect>
               <rect class="ci-loading-rectanim" id="ci-loading-rectanim-2" x="7" y="12" width="4" height="8"></rect>
               <rect class="ci-loading-rectanim" id="ci-loading-rectanim-3" x="14" y="12" width="4" height="8"></rect>
               <rect class="ci-loading-rectanim" id="ci-loading-rectanim-4" x="21" y="12" width="4" height="8"></rect>
               <rect class="ci-loading-rectanim" id="ci-loading-rectanim-5" x="28" y="12" width="4" height="8"></rect>
            </svg>
        `).attr({
      width: size,
      height: size,
      fill: color
    });
    return $elem;
  };

  exports.moduleIdFromUrl = function (url) {
    var reg = /([^/]+)(\/)?$/;
    var res = url.match(reg);
    return res[1];
  };

  exports.requireNeedsExtension = function (url) {
    return /^https?:\/\/|^\.|^\/|^\/\//.test(url);
  };

  var utilReqPaths = {};
  exports.rewriteRequirePath = function (url) {
    var rewrittenUrl = require.toUrl(url);
    if (!this.requireNeedsExtension(url)) {
      // return original url without trailing slash
      return url;
    }
    var reqPathStr = exports.getNextUniqueId(true);
    if (utilReqPaths[rewrittenUrl]) return utilReqPaths[url];
    utilReqPaths[rewrittenUrl] = reqPathStr;
    var paths = {};
    paths[reqPathStr] = rewrittenUrl;
    require.config({
      paths: paths
    });

    return reqPathStr;
  };

  var objToString = Object.prototype.toString;
  exports.objectToString = function objectToString(obj) {
    return objToString.call(obj).slice(8, -1);
  };

  exports.isArray = function isArray(arr) {
    return exports.objectToString(arr).slice('-5') === 'Array';
  };

  // Deprecated color methods. Moved to src/util/color
  exports.getDistinctColors = exports.deprecate(
    Color.getDistinctColors,
    'use Color.getDistinctColors'
  );
  exports.getNextColorRGB = exports.deprecate(
    Color.getNextColorRGB,
    'use Color.getNextColorRGB'
  );
  exports.hsl2rgb = exports.deprecate(Color.hsl2rgb, 'use Color.hsl2rgb');
  exports.hueToRgb = exports.deprecate(Color.hue2rgb, 'use Color.hue2rgb');
  exports.hexToRgb = exports.deprecate(Color.hex2rgb, 'use Color.hex2rgb');
  exports.rgbToHex = exports.deprecate(Color.rgb2hex, 'use Color.rgb2hex');
  exports.getColor = exports.deprecate(Color.getColor, 'use Color.getColor');

  exports.evalOptions = function (options) {
    var result;
    if (typeof options !== 'string') {
      return options;
    }
    if (!options) return undefined;
    if (!options.match(/^\s*\{/)) {
      options = `{${options}}`;
    }
    try {
      eval(`result = ${options}`);
      return result;
    } catch (e) {
      Debug.warn('could not eval options');
      return undefined;
    }
  };

  const isEmail = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
  exports.isEmail = function (str) {
    return isEmail.test(str);
  };

  // Taken from http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
  exports.b64toBlob = function (b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  exports.toB64 = function (str) {
    return btoa(unescape(encodeURIComponent(String(str))));
  };

  exports.getStructuresComboOptions = function () {
    var typeList = [];
    typeList.push({ key: '', title: 'none' });
    var types = structures._getList();
    for (var i = 0; i < types.length; i++) {
      typeList.push({ key: types[i], title: types[i] });
    }

    return typeList;
  };

  exports.hexToBase64 = function (str) {
    return btoa(
      String.fromCharCode.apply(
        null,
        str
          .replace(/\r|\n/g, '')
          .replace(/([\da-fA-F]{2}) ?/g, '0x$1 ')
          .replace(/ +$/, '')
          .split(' ')
      )
    );
  };

  exports.base64ToHex = function (str) {
    for (
      var i = 0, bin = atob(str.replace(/[ \r\n]+$/, '')), hex = [];
      i < bin.length;
      ++i
    ) {
      var tmp = bin.charCodeAt(i).toString(16);
      if (tmp.length === 1) tmp = `0${tmp}`;
      hex[hex.length] = tmp;
    }
    return hex.join('');
  };

  exports.contentTypeToType = function (contentType) {
    switch (contentType) {
      case 'image/gif':
        return 'gif';
      case 'image/tif':
      case 'image/tiff':
        return 'tiff';
      case 'image/jpg':
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/svg':
        return 'svg';
      case 'chemical/x-jcamp-dx':
        return 'jcamp';
      case 'chemical/x-mdl-sdfile':
        return 'sdf';
      case 'chemical/x-mdl-molfile':
        return 'mol2d';
      case 'text/html':
        return 'html';
      case 'text/plain':
        return 'string';
      default:
        return null;
    }
  };

  exports.hashCode = function (str) {
    var hash = 0,
      i,
      chr,
      len = str.length;
    if (len === 0) return hash;
    for (i = 0; i < len; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash;
  };

  exports.stringsToAutocomplete = function (arr) {
    return arr.map((str) => ({ title: str, label: str }));
  };

  exports.require = function asyncRequire(libs) {
    let onlyOne = false;
    if (typeof libs === 'string') {
      libs = [libs];
      onlyOne = true;
    }
    return new Promise((resolve, reject) => {
      require(libs, function (...result) {
        if (onlyOne) resolve(result[0]);
        else resolve(result);
      }, reject);
    });
  };

  return exports;
});
