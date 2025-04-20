'use strict';

define([
  'jquery',
  './cache',
  './versionhandler',
  './debug',
  './ui',
  'forms/button',
  'src/main/variables',
  'version',
], function ($, Cache, VersionHandler, Debug, UI, Button, Variables, Version) {
  const version = Version.version;
  let originalVersion = 'none';
  let viewLocked = false;

  const dataHandler = new VersionHandler();
  const viewHandler = new VersionHandler();
  const view = new DataObject();
  const data = Variables.getData();
  const lastLoaded = {
    view: {},
    data: {},
  };
  let urlType = 'Search';

  viewHandler.version = version;
  dataHandler.setType('data');
  viewHandler.setType('view');

  dataHandler.reviver = function (l) {
    return DataObject.check(l, 1, false);
  };

  viewHandler.reviver = function (l) {
    return DataObject.check(l, 1, false);
  };

  window.onpopstate = function (event) {
    if (event.state && event.state.type === 'viewchange') {
      switchView(event.state.value, false);
    }
  };

  function switchView(value, pushstate, options) {
    options = options || {};
    let def = Promise.resolve();
    if (
      value.data &&
      (lastLoaded.data.url !== value.data.url ||
        (lastLoaded.data.urls !== value.data.urls &&
          lastLoaded.data.branch !== value.data.branch))
    ) {
      if (!options.doNotLoad) {
        def = setData(
          value.data.urls,
          value.data.branch,
          value.data.url,
          options,
        );
      }
      lastLoaded.data = value.data;
    }
    if (
      value.view &&
      (lastLoaded.view.url !== value.view.url ||
        (lastLoaded.view.urls !== value.view.urls &&
          lastLoaded.view.branch !== value.view.branch))
    ) {
      def = def.then(function () {
        lastLoaded.view = value.view;
        if (!options.doNotLoad) {
          return setView(
            value.view.urls,
            value.view.branch,
            value.view.url,
            options,
          );
        }
      });
    }
    if (pushstate) {
      require(['uri/URI.fragmentQuery'], function (URI) {
        const uri = new URI(window.location.href);
        if (value.data) {
          uri[`remove${urlType}`](['dataURL', 'dataBranch', 'results']);
          if (value.data.urls) {
            uri[`add${urlType}`]('results', value.data.urls);
            if (value.data.branch) {
              uri[`add${urlType}`]('dataBranch', value.data.branch);
            }
          } else if (value.data.url) {
            uri[`add${urlType}`]('dataURL', value.data.url);
          }
        }
        if (value.view) {
          uri[`remove${urlType}`](['viewURL', 'viewBranch', 'views']);
          if (value.view.urls) {
            uri[`add${urlType}`]('views', value.view.urls);
            if (value.view.branch) {
              uri[`add${urlType}`]('viewBranch', value.view.branch);
            }
          } else if (value.view.url) {
            uri[`add${urlType}`]('viewURL', value.view.url);
          }
        }
        window.history.pushState({ type: 'viewchange', value }, '', uri.href());
      });
    }
    return def;
  }

  function setView(url, branch, defUrl, options) {
    return viewHandler.load(url, branch, defUrl, options);
  }

  function setData(url, branch, defUrl, options) {
    return dataHandler.load(url, branch, defUrl, options);
  }

  function updateView(newView) {
    if (newView && newView.version) {
      originalVersion = newView.version;
    }
    // clear current view
    for (const i in view) {
      delete view[i];
    }
    // clear current variables
    Variables.eraseAll();
    // clear cache
    Cache.clear();

    for (const i in newView) {
      view[i] = DataObject.recursiveTransform(newView[i]);
    }
  }

  function updateData(newData) {
    for (const i in data) {
      delete data[i];
    }
    for (const i in newData) {
      const child = DataObject.check(newData[i], true);
      if (child) {
        data[i] = child;
        child.linkToParent(data, i);
      }
    }
    data.triggerChange();
  }

  function getView() {
    return view;
  }

  function getViewJSON(tab) {
    return JSON.stringify(view, null, tab);
  }

  function getData() {
    return data;
  }

  function getDataJSON(tab) {
    return JSON.stringify(data, null, tab);
  }

  const exports = {
    get version() {
      return String(version);
    },

    get originalVersion() {
      return String(originalVersion);
    },

    setView,
    setData,
    getView,
    getViewJSON,
    getData,
    getDataJSON,

    copyView,
    pasteView,
    copyData,
    pasteData,

    getViewHandler() {
      return viewHandler;
    },

    getDataHandler() {
      return dataHandler;
    },

    setViewLoadCallback(callback) {
      this.viewCallback = callback;

      viewHandler.onLoaded = (v) => {
        updateView(v);
        callback.call(this, view);
      };
      viewHandler.onReload = (v) => {
        updateView(v);
        callback.call(this, view, true);
      };
    },

    setDataLoadCallback(callback) {
      this.dataCallback = callback;
      dataHandler.onLoaded = (d) => {
        updateData(d);
        callback.call(this, data);
      };
      dataHandler.onReload = (d) => {
        updateData(d);
        callback.call(this, data, true);
      };
    },

    setViewJSON(json) {
      updateView(json);
      this.viewCallback(view, true);
      viewHandler.versionChange().notify(view);
    },

    setDataJSON(json) {
      updateData(json);
      this.dataCallback(data, true);
    },

    blankView() {
      this.setViewJSON({});
    },

    switchView,

    setURLType(type) {
      urlType = type;
    },

    viewLock() {
      viewLocked = true;
    },

    isViewLocked() {
      return viewLocked;
    },

    lastLoaded,
  };

  function copyView() {
    const str = getViewJSON('  ');
    const strlen = str.length;
    const txtarea = $('<textarea/>').text(str).css({
      width: '100%',
      height: '95%',
    });
    UI.dialog(txtarea, {
      width: '80%',
      height: $('#ci-visualizer').height() * 0.7,
    });

    const txtdom = txtarea.get(0);

    txtdom.selectionStart = 0;
    txtdom.selectionEnd = strlen;
    txtdom.focus();
  }

  function copyData() {
    const str = getDataJSON('  ');
    const strlen = str.length;
    const txtarea = $('<textarea/>').text(str).css({
      width: '100%',
      height: '200px',
    });
    UI.dialog(txtarea, { width: '80%' });
    const txtdom = txtarea.get(0);

    txtdom.selectionStart = 0;
    txtdom.selectionEnd = strlen;
    txtdom.focus();
  }

  function pasteView() {
    const txtarea = $('<textarea></textarea>').css({
      width: '100%',
      height: '200px',
    });
    const btn = new Button('Paste', function () {
      try {
        const val = JSON.parse(txtarea.val());
        for (const key of Object.keys(val)) {
          if (key.charAt(0) === '_') {
            delete val[key];
          }
        }
        exports.setViewJSON(val);
      } catch (_) {
        // do nothing
      }

      div.dialog('close');
    });

    const div = UI.dialog(txtarea, { width: '80%' }).append(btn.render());
  }

  function pasteData() {
    const txtarea = $('<textarea></textarea>').css({
      width: '100%',
      height: '200px',
    });
    const btn = new Button('Paste', function () {
      try {
        const val = JSON.parse(txtarea.val());
        for (const key of Object.keys(val)) {
          if (key.charAt(0) === '_') {
            delete val[key];
          }
        }
        exports.setDataJSON(val);
      } catch (_) {
        // do nothing
      }

      div.dialog('close');
    });

    const div = UI.dialog(txtarea, { width: '80%' }).append(btn.render());
  }

  return exports;
});
