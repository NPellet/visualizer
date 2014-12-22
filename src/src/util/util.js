'use strict';

/**
 * Global utility methods
 * @module src/util/util
 */
define(['src/util/debug', 'src/util/color', 'lodash'], function (Debug, Color, _) {

    var uniqueid = 0;

    var months = ['January', 'February', 'March', 'April', 'Mai', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function noop() {
    }

    var regQuote = /"/g,
        regJpath = /^element\./;

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
            return
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
        getNextUniqueId: function (absolute) {

            if (absolute) {
                return 'id_' + Date.now() + Math.round(Math.random() * 100000);
            }

            return 'uniqid_' + (++uniqueid);
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
                    return resolve(self.loadedCss[url]);
                }

                self.loadedCss[url] = true;

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
            stack[jpath] = makejPathFunction(jpath)
        },

        jpathToArray: function (val) {
            if (val) {
                var val2 = val.split('.');
                val2.shift();
                return val2;
            }
            else {
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
            if (!( rule = getCSS(ruleName) )) {

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
                if (!( access = access[arguments[i]] )) {
                    return false;
                }
            }

            return access;
        },

        // Deprecated color methods. Moved to src/util/color
        getDistinctColors: deprecate(Color.getDistinctColors, 'use Color.getDistinctColors'),
        getNextColorRGB: deprecate(Color.getNextColorRGB, 'use Color.getNextColorRGB'),
        hsl2rgb: deprecate(Color.hsl2rgb, 'use Color.hsl2rgb'),
        hueToRgb: deprecate(Color.hue2rgb, 'use Color.hue2rgb'),
        hexToRgb: deprecate(Color.hex2rgb, 'use Color.hex2rgb'),
        rgbToHex: deprecate(Color.rgb2hex, 'use Color.rgb2hex'),
        getColor: deprecate(Color.getColor, 'use Color.getColor')

    };

    /**
     * No-op function
     */
    exports.noop = noop;

    function isInt(str) {
        return isNaN(str) ? NaN : parseInt(str);
    }

    /**
     * An object describing a version number in semantic versioning
     * @typedef {Object} VersionNumber
     * @property {number} major
     * @property {number} minor
     * @property {number} patch
     * @property {string} [prerelease] - defined only if the version is identified as prerelease
     */

    /**
     * Converts a semver string to a {@link VersionNumber} object
     * @param versionStr - semver string
     * @returns {VersionNumber}
     * @example
     * var semver = util.semver('v1.4.7-2');
     * console.log(semver);
     * {
     *   major: 1,
     *   minor: 4,
     *   patch: 7,
     *   prerelease: '2'
     * }
     */
    exports.semver = function semver(versionStr) {

        if (!versionStr) {
            return Debug.error('no version');
        }

        if (versionStr[0] === 'v') {
            versionStr = versionStr.substr(1);
        }

        var version = versionStr.split('.');
        if (version.length > 3) {
            return Debug.error('version number is invalid: ' + versionStr);
        }

        switch (version.length) {
            case 1:
                version[1] = '0';
            case 2:
                version[2] = '0';
        }

        var semver = {
            major: isInt(version[0]),
            minor: isInt(version[1]),
            patch: isInt(version[2]),
            prerelease: false
        };

        var split = version[2].split('-');
        if (split.length > 1) {
            semver.patch = parseInt(split[0]);
            semver.prerelease = split[1];
        }

        if (semver.major >= 0 && semver.minor >= 0 && semver.patch >= 0) {
            return semver;
        } else {
            return Debug.error('version number is invalid: ' + versionStr);
        }

    };

    /**
     * Compare two semver strings or {@link VersionNumber} objects
     * @param {string|VersionNumber} v1 - First version to compare
     * @param {string|VersionNumber} v2 - Second version to compare
     * @returns {number} - -1 if v1 is greater, 1 if v2 is greater, 0 if versions are identical
     */
    exports.semverCompare = function semverCompare(v1, v2) {
        if (typeof v1 === 'string') {
            v1 = exports.semver(v1);
        }
        if (typeof v2 === 'string') {
            v2 = exports.semver(v2);
        }
        if (!v1 || !v2) {
            return Debug.error('Invalid version number:' + v1 ? v2 : v1);
        }
        if (v1.major < v2.major) {
            return -1;
        } else if (v2.major < v1.major) {
            return 1;
        } else if (v1.minor < v2.minor) {
            return -1;
        } else if (v2.minor < v1.minor) {
            return 1;
        } else if (v1.patch < v2.patch) {
            return -1;
        } else if (v2.patch < v1.patch) {
            return 1;
        } else if (v1.prerelease && !v2.prerelease) {
            return -1;
        } else if (v2.prerelease && !v1.prerelease) {
            return 1;
        } else if (v1.prerelease && v2.prerelease) {
            if (v1.prerelease < v2.prerelease) {
                return -1;
            } else if (v2.prerelease < v1.prerelease) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    };

    /**
     * Mark that a method should not be used. Returns a modified function which warns once when called.
     * @param {Function} method - the deprecated method
     * @param {string} [message] - optional message to log
     */
    exports.deprecate = deprecate;
    function deprecate(method, message) {
        var warned = false;
        return function deprecated() {
            if (!warned) {
                if (Debug.getDebugLevel() >= Debug.Levels.WARN) {
                    Debug.warn('Method ' + method.name + ' is deprecated. ' + (message || ''));
                    console.trace();
                }
                warned = true;
            }
            return method.apply(this, arguments);
        }
    }

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

    return exports;

});
