'use strict';

define(['lib/semver/semver'], function (semver) {

    /* DO NOT MODIFY THE FOLLOWING LINES MANUALLY */
    var MAJOR = 2;
    var MINOR = 49;
    var PATCH = 1;
    var PRERELEASE = 1;
    var IS_RELEASE = false;
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
