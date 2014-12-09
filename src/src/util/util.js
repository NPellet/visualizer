'use strict';

/**
 * Global utility methods
 * @module src/util/util
 */
define(['src/util/debug'], function (Debug) {

    var uniqueid = 0;

    var months = ['January', 'February', 'March', 'April', 'Mai', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    var noop = function () {
    };

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
        getDistinctColors: function (numColors) {

            var colors = [], j = 0;
            for (var i = 0; i < 360; i += 360 / numColors) {
                j++;
                var color = this.hsl2rgb(i, 100, 30 + j % 4 * 15);
                colors.push([Math.round(color.r * 255), Math.round(color.g * 255), Math.round(color.b * 255)]);
            }
            return colors;
        },
        getNextColorRGB: function (colorNumber, numColors) {
            return this.getDistinctColors(numColors)[colorNumber];
        },
        hsl2rgb: function (h, s, l) {
            var m1, m2, hue, r, g, b;
            s /= 100;
            l /= 100;

            if (s === 0)
                r = g = b = (l * 255);
            else {
                if (l <= 0.5)
                    m2 = l * (s + 1);
                else
                    m2 = l + s - l * s;

                m1 = l * 2 - m2;
                hue = h / 360;
                r = this.hueToRgb(m1, m2, hue + 1 / 3);
                g = this.hueToRgb(m1, m2, hue);
                b = this.hueToRgb(m1, m2, hue - 1 / 3);
            }
            return {r: r, g: g, b: b};
        },
        hueToRgb: function (p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        },
        hexToRgb: function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)

            ] : [0, 0, 0];
        },
        rgbToHex: function (r, g, b) {
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },
        getColor: function (color) {

            if (Array.isArray(color)) {
                switch (color.length) {
                    case 3:
                        return 'rgb(' + color.join(',') + ')';
                        break;
                    case 4:
                        return 'rgba(' + color.join(',') + ')';
                        break;
                }
            } else if (typeof(color) == 'object') {
                return 'rgb(' + Math.round(color.r * 255) + ', ' + Math.round(color.g * 255) + ', ' + Math.round(color.b * 255) + ')';
            }

            return color;
        },

        getCssVendorPrefix: function() {
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
        }

    };

    /**
     * No-op function
     */
    exports.noop = function () {
    };

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

    return exports;

});
