'use strict';

define(['lib/semver/semver'], function (semver) {

    /* DO NOT MODIFY THE FOLLOWING LINES MANUALLY */
    var MAJOR = 2;
    var MINOR = 21;
    var PATCH = 2;
    var PRERELEASE = false;
    var IS_RELEASE = true;
    var BUILD_TIME = null;
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
        version: version,
        buildTime: buildTime,
        isBuild: buildTime != null
    };

});
