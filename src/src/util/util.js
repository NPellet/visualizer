'use strict';

/**
 * Global utility methods
 * @module src/util/util
 */
define(['src/util/debug', 'src/util/color', 'lodash'], function (Debug, Color, _) {

    var months = ['January', 'February', 'March', 'April', 'Mai', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function noop() {
    }

    var regQuote = /"/g,
        regJpath = /^element\./;

    function makejPathFunction(jpath) {
// comment
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
            ifElement += '["' + splitted[i].replace(regQuote, '\\"') + '"]';
            ifArray.push(ifElement + ' != undefined');
        }

        ifString = ifArray.join(' && ');
        if (!ifString) {
            ifString = 'true';
        }

        var functionEvaled = noop;
        eval('functionEvaled = function( el ) { if (el && ' + ifString + ') return ' + ifElement + '["' + splitted[l].replace(regQuote, '\\"') + '"]' + '; };');
        return functionEvaled;

    }

    function getCSS(ruleName, deleteFlag) {

        ruleName = ruleName.toLowerCase();

        if (!document.styleSheets) {
            return;
        }

        var i = 0, stylesheet, ii, cssRule;

        for (; i < document.styleSheets.length; i++) {
            stylesheet = document.styleSheets[i];
            ii = 0;
            cssRule = false;
            do {                                             // For each rule in stylesheet
                cssRule = stylesheet.cssRules ? stylesheet.cssRules[ii] : stylesheet.rules[ii];
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
                iframe.before($('<div />').css({
                    position: 'absolute',
                    width: width,
                    height: height,
                    top: pos.top,
                    left: pos.left,
                    background: 'white',
                    opacity: 0.5
                }).addClass('iframemask'));
            });
        },
        unmaskIframes: function () {
            $('.iframemask').remove();
        },
        formatSize: function (size) {

            var i = 0;
            while (size > 1024) {
                size = size / 1024;
                i++;
            }
            var units = ['o', 'Ko', 'Mo', 'Go', 'To'];
            return (Math.round(size * 10) / 10) + ' ' + units[i];
        },
        pad: function (val) {
            return val < 10 ? '0' + val : val;
        },
        getMonth: function (month) {
            return months[month];
        },
        getDay: function (day) {
            return days[day];
        },
        loadCss: function (url) {
            var self = this;
            return new Promise(function (resolve, reject) {
                url = require.toUrl(url);

                self.loadedCss = self.loadedCss || {};

                if (self.loadedCss[url]) { // element is already loaded
                    self.loadedCss[url].disabled = false;
                    return resolve(self.loadedCss[url]);
                }

                var link = document.createElement('link');
                link.type = 'text/css';
                link.rel = 'stylesheet';
                link.href = url;
                link.onload = function () {
                    self.loadedCss[url] = link;
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
                .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
            )[1];
            return '-' + pre + '-';
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
                {title: 'Arial', key: 'Arial'},
                {title: 'Arial Black', key: 'Arial Black'},
                {title: 'Comic Sans MS', key: 'Comic Sans MS'},
                {title: 'Courier', key: 'Courier'},
                {title: 'Courier new', key: 'Courier New'},
                {title: 'Georgia', key: 'Georgia'},
                {title: 'Helvetica', key: 'Helvetica'},
                {title: 'Impact', key: 'Impact'},
                {title: 'Palatino', key: 'Palatino'},
                {title: 'Times new roman', key: 'Times New Roman'},
                {title: 'Trebuchet MS', key: 'Trebuchet MS'},
                {title: 'Verdana', key: 'Verdana'}
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
                    document.styleSheets[0].insertRule(ruleName + ' { }', 0);
                }

                return getCSS(ruleName);
            }

            return rule;
        },

        // http://stackoverflow.com/questions/9318674/javascript-number-currency-formatting
        formatMoney: function (n, decPlaces, thouSeparator, decSeparator) {

            decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces;
            decSeparator = decSeparator == undefined ? '.' : decSeparator;
            thouSeparator = thouSeparator == undefined ? ',' : thouSeparator;

            var sign = n < 0 ? '-' : '',
                i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + '',
                j = i.length;
            j = j > 3 ? j % 3 : 0;
            return sign + (j ? i.substr(0, j) + thouSeparator : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : '');
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
    exports.noop = function noop() {
    };

    var uniqueid = 0;
    /**
     * Returns a unique id.
     * @param {boolean} [absolute]
     * @returns {string}
     */
    exports.getNextUniqueId = function getNextUniqueId(absolute) {
        if (absolute) {
            return 'id_' + Date.now() + Math.round(Math.random() * 100000);
        }
        return 'uniqid_' + (++uniqueid);
    };

    /**
     * Mark that a method should not be used. Returns a modified function which warns once when called.
     * @param {Function} method - the deprecated method
     * @param {string} [message] - optional message to log
     */
    exports.deprecate = function deprecate(method, message) {
        var warned = false;
        return function deprecated() {
            if (!warned) {
                Debug.warn('Method ' + method.name + ' is deprecated. ' + (message || ''));
                warned = true;
            }
            return method.apply(this, arguments);
        };
    };

    /*
     TODO remove when Set API is supported in more browsers
     */
    var warnOnceMap, warnOnceCheck;
    if (typeof Set === 'undefined') {
        warnOnceMap = {};
        warnOnceCheck = function (name) {
            if (warnOnceMap[name]) {
                return true;
            } else {
                warnOnceMap[name] = true;
                return false;
            }
        };
    } else {
        warnOnceMap = new Set();
        warnOnceCheck = function (name) {
            if (warnOnceMap.has(name)) {
                return true;
            } else {
                warnOnceMap.add(name);
                return false;
            }
        };
    }

    /**
     * Prints a warning message only once per id
     * @param id
     * @param message
     */
    exports.warnOnce = function warnOnce(id, message) {
        if (!warnOnceCheck(id)) {
            Debug.warn(message);
        }
    };

    /**
     * Make a constructor's prototype inherit another one, while adding optionally new methods to it. Also sets a `super_`
     * property to access the super constructor
     * @param {Function} ctor - New constructor
     * @param {Function} superCtor - Super constructor
     * @param {Object} [methods] - Methods to add to the new constructor
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
        return $('\
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="black">\
            <path transform="translate(2)" d="M0 12 V20 H4 V12z">\
                <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z" dur="1.2s" repeatCount="indefinite" begin="0" keytimes="0;.2;.5;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8" calcMode="spline"  />\
            </path>\
            <path transform="translate(8)" d="M0 12 V20 H4 V12z">\
                <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z" dur="1.2s" repeatCount="indefinite" begin="0.2" keytimes="0;.2;.5;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8" calcMode="spline"  />\
            </path>\
            <path transform="translate(14)" d="M0 12 V20 H4 V12z">\
                <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z" dur="1.2s" repeatCount="indefinite" begin="0.4" keytimes="0;.2;.5;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8" calcMode="spline" />\
            </path>\
            <path transform="translate(20)" d="M0 12 V20 H4 V12z">\
                <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z" dur="1.2s" repeatCount="indefinite" begin="0.6" keytimes="0;.2;.5;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8" calcMode="spline" />\
            </path>\
            <path transform="translate(26)" d="M0 12 V20 H4 V12z">\
                <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z" dur="1.2s" repeatCount="indefinite" begin="0.8" keytimes="0;.2;.5;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8" calcMode="spline" />\
            </path>\
        </svg>').attr({
            width: size,
            height: size,
            fill: color
        });
    };

    exports.moduleIdFromUrl = function (url) {
        var reg = /([^\/]+)(\/)?$/;
        var res = url.match(reg);
        return res[1];
    };

    exports.requireNeedsExtension = function (url) {
        return /^https?:\/\/|^\.|^\//.test(url);
    };

    var utilReqPaths = {};
    exports.rewriteRequirePath = function (url) {
        if (!this.requireNeedsExtension(url)) {
            // return same url without trailing backslash
            return url.replace(/\/$/, '');
        }
        var reqPathStr = exports.getNextUniqueId(true);
        url = url.replace(/\/$/, '');
        if (utilReqPaths[url]) return utilReqPaths[url];
        utilReqPaths[url] = reqPathStr;
        var paths = {};
        paths[reqPathStr] = url;
        requirejs.config({
            paths: paths
        });

        return reqPathStr;
    };

    // Deprecated color methods. Moved to src/util/color
    exports.getDistinctColors = exports.deprecate(Color.getDistinctColors, 'use Color.getDistinctColors');
    exports.getNextColorRGB = exports.deprecate(Color.getNextColorRGB, 'use Color.getNextColorRGB');
    exports.hsl2rgb = exports.deprecate(Color.hsl2rgb, 'use Color.hsl2rgb');
    exports.hueToRgb = exports.deprecate(Color.hue2rgb, 'use Color.hue2rgb');
    exports.hexToRgb = exports.deprecate(Color.hex2rgb, 'use Color.hex2rgb');
    exports.rgbToHex = exports.deprecate(Color.rgb2hex, 'use Color.rgb2hex');
    exports.getColor = exports.deprecate(Color.getColor, 'use Color.getColor');

    return exports;

});
