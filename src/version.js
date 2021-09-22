'use strict';

define(['lib/semver/semver'], function (semver) {
  /* DO NOT MODIFY THE FOLLOWING LINES MANUALLY */
  const MAJOR = 2;
  const MINOR = 131;
  const PATCH = 2;
  const PRERELEASE = 0;
  const IS_RELEASE = false;
  const BUILD_TIME = null;
  const INCLUDED_MODULE_CSS = [];
  /* END */

  let version = `${MAJOR}.${MINOR}.${PATCH}`;
  if (PRERELEASE !== false) {
    version += `-${PRERELEASE}`;
  }

  if (!semver.valid(version)) {
    throw new Error(`Version number is invalid: ${version}`);
  }

  let isModernBrowser;
  try {
    // eslint-disable-next-line no-eval
    eval('(async function() {})()');
    isModernBrowser = true;
  } catch (e) {
    isModernBrowser = false;
  }

  let buildTime = null;
  let head = false;
  if (BUILD_TIME) {
    const date = new Date(BUILD_TIME);
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
    head = true;
    if (!isModernBrowser) {
      // eslint-disable-next-line no-alert
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
    isBuild: buildTime != null,
    head: head,
    isModernBrowser: isModernBrowser
  };
});
