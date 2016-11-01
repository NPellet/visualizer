'use strict';

define(['lib/semver/semver'], function (semver) {

    /* DO NOT MODIFY THE FOLLOWING LINES MANUALLY */
    var MAJOR = 2;
    var MINOR = 71;
    var PATCH = 1;
    var PRERELEASE = false;
    var IS_RELEASE = true;
    var BUILD_TIME = null;
    var INCLUDED_MODULE_CSS = [];
    /* END */

    var version = MAJOR + '.' + MINOR + '.' + PATCH;
    if (PRERELEASE !== false) {
        version += '-' + PRERELEASE;
    }

    var v = semver.parse(version);
    if (!v) {
        throw new Error('Version number is invalid: ' + version);
    }

    var buildTime = null;
    if (BUILD_TIME) {
        var date = new Date(BUILD_TIME);
        if (window.Intl) {
            buildTime = new window.Intl.DateTimeFormat('en-GB', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }).format(date);
        } else {
            buildTime = date.toLocaleDateString();
        }
    } else {
        // HEAD check
        try {
            eval('(async function() {})()');
        } catch (e) {
            alert('To use the unbuilt HEAD of the visualizer, you need a browser that supports async/await features (like Chrome 55+).\nIf you are not on HEAD, please report a bug on GitHub.');
        }
    }

    return {
        major: MAJOR,
        minor: MINOR,
        patch: PATCH,
        prerelease: PRERELEASE,
        isRelease: IS_RELEASE,
        includedModuleCss: INCLUDED_MODULE_CSS,
        version: version,
        buildTime: buildTime,
        isBuild: buildTime != null
    };

});
