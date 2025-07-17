'use strict';

define([
  'jquery',
  'src/util/util',
  'src/util/localdb',
  'src/util/ui',
], function ($, Util, db, UI) {
  var DataViewHandler = function () {
    this.currentPath = [];
    this._allData = {};
    this.dom = $('<div />');

    this.versionChangeDeferred = $.Deferred();
    this._data = {};
    this.structure = {
      server: {
        title: 'Server',
        children: {
          head: { title: 'Head' },
          stored: { title: 'Stored', children: true },
        },
      },

      local: {
        title: 'Local DB',
        children: {
          head: { title: 'Head' },
          stored: { title: 'Stored', children: true },
        },
      },
    };
  };

  DataViewHandler.prototype = {
    setType(type) {
      this.type = type;
    },

    get reviver() {
      return this._reviver;
    },

    set reviver(rev) {
      this._reviver = rev;
    },

    getData() {
      if (this.currentPath[1] === 'server') {
        return this._getServer().pipe(
          (data) => {
            if (this.type === 'view') {
              this._data.server = new DataObject(data, true);
            } else if (this.type === 'data') {
              this._data.server = new DataObject(data, true);
            }
            return this._data.server;
          },
          function () {
            return false;
          },
        );
      } else {
        return this._getLocal().pipe(
          (data) => {
            if (typeof data !== 'object') {
              data = JSON.parse(data);
            }

            if (this.type === 'view') {
              this._data.local = new DataObject(data, true);
            } else if (this.type === 'data') {
              this._data.local = new DataObject(data, true);
            }
            return this._data.local;
          },
          function () {
            return false;
          },
        );
      }
    },

    getBranches() {
      return $.when(this.getData()).pipe((data) => {
        var branches = {};

        for (var i in data) {
          // i is branch name
          // data.revisions is all revs || data[i].list
          branches[i] = `${i} (${
            data[i].list.length + (this.currentPath[1] === 'local' ? 1 : 0)
          })`;
        }
        return branches;
      });
    },

    getElements() {
      var branch = this.currentPath[2];
      return $.when(this.getData()).pipe((alldata) => {
        var data = alldata[branch].list;
        var all = {};

        if (this.currentPath[1] === 'local' && alldata[branch].head) {
          all.head = this.makeFilename(alldata[branch].head);
        }

        for (var i = data.length - 1; i >= 0; i--) {
          all[data[i]._time] = this.makeFilename(data[i]);
        }

        return all;
      });
    },

    makeFilename(el) {
      if (!el._time) return 'Head';

      var time = new Date(el._time);
      var str = `${time.getDate()}/${time.getMonth()}/${time.getFullYear()} `;
      str += `${Util.pad(time.getHours())}:${Util.pad(time.getMinutes())}`;
      return str;
    },

    _getLocal() {
      return db.open().pipe(() => {
        return db.getAll(this.type, this._dirUrl).pipe((all) => {
          return all;
        });
      });
    },

    _getServer() {
      var def = $.Deferred();
      $.ajax({
        url: this.getUrl(),
        type: 'get',
        dataType: 'json',
        data: {
          action: 'Dir',
        },
        success(data) {
          for (var i in data) {
            data[i].list = [];
            for (var j in data[i].revisions) {
              data[i].list.push({ _time: data[i].revisions[j] });
            }
          }

          def.resolve(data);
        },

        error() {
          def.reject();
        },
      });

      return def;
    },

    makeMenu(level) {
      var toOpen = this.structure;
      // Want to display the top level (server/local)
      if (level === 1) {
        toOpen = { server: 'Server', local: 'Local Database' };
      } else if (level === 2) {
        // (head/stored)
        toOpen = this.getBranches();
      } else if (level === 3) {
        // Display all month + years
        toOpen = this.getElements();
      }

      // When we got it !
      return $.when(toOpen).pipe((toOpen) => {
        // It's still an object
        if (!Array.isArray(toOpen)) {
          return this.objectToMenu(
            toOpen,
            level,
            this.currentPath[level - 1] || null,
            this.currentPath[level - 2] || null,
          );
        } else {
          return this.arrayToMenu(
            toOpen,
            level,
            this.currentPath[level - 1] || null,
            this.currentPath[level - 2] || null,
          );
        }
      });
    },

    arrayToMenu(array, level, parent, parentParent) {
      var html = '';
      for (var i = 0, l = array.length; i < l; i++) {
        html += `<li draggable="false" data-parent-parent="${parentParent}" data-parent="${parent}" data-el="${
          array[i][1]
        }"><a>${array[i][0]}${
          level < 3
            ? `<ul draggable="false" class="ci-dataview-menu" data-level="${
                level + 1
              }"><li><a>Fetching data...</a></li></ul>`
            : ''
        }</a></li>`;
      }
      return html;
    },

    objectToMenu(object, level, parent, parentParent) {
      var html = '';
      for (var i in object) {
        html += `<li draggable="false" data-parent-parent="${parentParent}" data-el="${i}" data-parent="${parent}"><a>${
          object[i]
        }${
          level < 3
            ? `<ul draggable="false" class="ci-dataview-menu" data-level="${
                level + 1
              }"><li><a>Fetching data...</a></li></ul>`
            : ''
        }</a></li>`;
      }
      return html;
    },

    bindEventsMenu(dom) {
      var that = this;

      dom.on('mouseenter', 'li', function () {
        var $this = $(this);
        if ($this.find('.ci-fetched').length > 0) return;

        var ul = $this.parent();
        var level = ul.data('level');
        that.currentPath[level] = $this.data('el');

        // Leaf
        if (level === 3) return;

        that.makeMenu(level + 1).then(
          function (menu) {
            menu = $(menu);
            $this.find('ul').html(menu).addClass('ci-fetched');
            if (level + 1 === 3 && that.currentPath[2] === 'head') {
              menu.find('ul').remove();
            }
            that._menu.menu('refresh');
          },
          function () {
            $this
              .find('ul')
              .html('<li><a>No element here</a></li>')
              .addClass('ci-fetched');
            that._menu.menu('refresh');
          },
        );
        return false;
      });

      dom.on('mouseup', 'li', function () {
        var $this = $(this);
        var ul = $this.parent();
        var level = ul.data('level');
        that.currentPath[level] = $this.data('el');

        if ($this.find('ul').length > 0) return;

        that.clickLeaf($this);
      });
    },

    buildDom(el) {
      var html = '<ul draggable="false" class="ci-dataview">';

      html += this._buildDomEl(1, this.currentPath[1]); // Local / Server
      html += this._buildDomEl(2, this.currentPath[2]); // Master / Branch1 / Branch2
      // Head or not head (handled by makeFilename)
      html += this._buildDomEl(3, this.makeFilename(el));

      return `${html}<li class="ci-spacer"></li></ul>`;
    },

    _buildDomEl(level, val) {
      var htmlvalue;
      var value;

      if (level === 1) {
        if (val === 'server') {
          htmlvalue = 'On Server';
          value = 'server';
        } else {
          htmlvalue = 'Local DB';
          value = 'local';
        }
      } else if (level === 2) {
        htmlvalue = val;
        value = val;
      } else {
        htmlvalue = val;
        value = val;
      }

      // this.currentPath[level] = value;

      return `<li draggable="false" class="ci-dataview-lvl ci-dataview-lvl-${level}" data-level="${level}" data-value="${escape(
        value,
      )}">${htmlvalue}</li>${level < 3 ? '<li class="inter">></li>' : ''}`;
    },

    bindEventsDom(dom) {
      var that = this;

      dom.on('mousedown', 'li', function () {
        var $this = $(this);
        var pos = $this.position();

        that.makeMenu($this.data('level')).done(function (menu) {
          menu = $(
            `<ul draggable="false" class="ci-dataview-menu" data-level="${$this.data(
              'level',
            )}"></ul>`,
          )
            .append(menu)
            .menu();
          that._menu = menu;
          that.bindEventsMenu(menu);
          menu.appendTo('#visualizer-dataviews').css({
            position: 'absolute',
            left: pos.left,
            top: pos.top + $this.outerHeight(true),
          });
        });
      });

      $(document).on('mouseup', function () {
        $('.ci-dataview-menu').remove();
      });
    },

    getDom() {
      return this.dom;
    },

    doUpdateButtons() {
      if (this.updateButtons) {
        this.updateButtons(this.type, this.currentPath[3], this.currentPath[1]);
      }
    },

    make(el) {
      this.currentElement = el;
      this.doUpdateButtons();
      var html = $(this.buildDom(el));
      this.bindEventsDom(html);

      this.dom.empty().html(html);
      this.versionChange().notify(el);
      this._html = html;
    },

    versionChange() {
      return this.versionChangeDeferred;
    },

    clickLeaf(li) {
      var i = li.data('el');
      var branch = li.data('parent');
      var mode = li.data('parent-parent');

      if (mode === 'server') {
        // fetch head from server
        var data = { branch };
        if (i !== 'head') data.revision = i;

        this.getFromServer(data).done((el) => {
          this.currentPath[1] = 'server';
          this.currentPath[2] = branch;
          this.currentPath[3] = i;
          this.make(el, branch, i);
          this._savedServer = JSON.stringify(el);
          this.onReload(el);
        });
      } else {
        $.when(this.getData()).done((el) => {
          el = el[branch];

          if (i === 'head') {
            el = el.head;
          } else {
            for (var j = 0, l = el.list.length; j < l; j++) {
              if (el.list[j]._time == i) {
                el = el.list[j];
                break;
              }
            }
          }

          this.currentPath[1] = 'local';
          this.currentPath[2] = branch;
          this.currentPath[3] = i;
          this.make(el, branch, i);
          this._savedLocal = JSON.stringify(el);
          this.onReload(el);
        });
      }
    },

    loadReadonly(def, options) {
      var url = this._defaultUrl;

      var retry = true;
      if (options && options.withCredentials) {
        retry = false;
      }

      const onSuccess = (data) => {
        data = this._reviver(JSON.parse(data));
        this.make(data);
        this._onLoaded(data);
        def.resolve();
      };

      $.ajax({
        url,
        timeout: 200000,
        dataType: 'text',
        success: onSuccess,
        error: (e) => {
          if (retry) {
            $.ajax({
              url,
              timeout: 200000,
              dataType: 'text',
              success: onSuccess,
              error: (e) => {
                UI.showNotification(
                  `Loading ${this.type} failed: ${e.statusText}`,
                );
                def.reject(e);
              },
            });
          } else {
            UI.showNotification(`Loading ${this.type} failed: ${e.statusText}`);
            def.reject(e);
          }
        },
        xhrFields: { withCredentials: true },
      });
    },

    load(dirUrl, defaultBranch, defaultUrl, options) {
      this._dirUrl = dirUrl;
      this._defaultUrl = defaultUrl;
      this.defaultBranch = defaultBranch;

      var def = $.Deferred();

      if (!this._dirUrl && this._defaultUrl) {
        this.loadReadonly(def, options);
        return def;
      }

      var branch = this.defaultBranch || 'Master';
      var defServer = this.getFromServer({
        branch,
        action: 'Load',
      });

      const doLocal = (el, branch, rev) => {
        this.currentPath[1] = 'local';
        this.currentPath[2] = branch;
        this.currentPath[3] = rev;

        this._savedLocal = JSON.stringify(el);
        this.make(el, this.currentPath[2], this.currentPath[3]);
        def.resolve(el);

        this._onLoaded(el);
      };

      const doServer = (el, branch, rev) => {
        this.currentPath[1] = 'server';
        this.currentPath[2] = branch;
        this.currentPath[3] = rev;
        this.make(el, this.currentPath[2], this.currentPath[3]);
        this._savedServer = JSON.stringify(el);
        def.resolve(el);
        this._onLoaded(el);
      };

      // First load the server
      // Needed to identify branch and revision of the file
      $.when(defServer).then(
        (server) => {
          // Success
          var branch = server._name || this.defaultBranch;
          var rev = server._time || 'head';
          var saved = server._saved || 0;

          // Always compare to the head of the local branch
          var defLocal = this._getLocalHead(branch);

          $.when(defLocal).then(
            (el) => {
              // If the corresponding head does not exist, we copy the server data
              // to the head of the corresponding local branch
              if (!el._saved) {
                // doServer(server, branch, rev);
                this.serverCopy(server, branch, 'head').done(() => {
                  doLocal(server, server._name, 'head');
                });
              } else {
                var savedLocal = el._saved || 0;
                // Loads the latest file
                el._name = branch;

                // TODO: check history of this. 1 is never equal to 0.
                if (savedLocal > saved && 1 === 0) {
                  // Prevent loading local for now
                  doLocal(el, el._name, el._time || 'head');
                } else {
                  doServer(server, branch, rev);
                }
              }
            },
            () => {
              doServer(server, branch, rev);
            },
          );
        },
        () => {
          $.when(this._getLocalHead(branch)).then((el) => {
            doLocal(el, branch, el._time || 'head');
          });
        },
      );

      return def;
    },

    getUrl() {
      return this._dirUrl;
    },

    getMonth(i) {
      return Util.getMonth(i);
    },

    getDay(i) {
      return Util.getDay(i);
    },

    /** **********************/
    /** LOCAL SIDE **********/
    /** **********************/

    _getLocalHead(branch) {
      branch = branch || 'Master';

      return db.getHead(this.type, this._dirUrl, branch).pipe(function (el) {
        if (typeof el !== 'object') {
          el = JSON.parse(el);
        }

        return el;
      });
    },

    _localSave(obj, mode, name) {
      obj._local = true;
      // IF: Already Head => Erase current head, IF: New head: Overwrite head (keep current)
      obj._time = mode === 'head' ? false : Date.now();
      obj._saved = Date.now();

      // this._savedLocal = JSON.stringify(obj);

      return db.open().pipe(() => {
        return db[mode === 'head' ? 'storeToHead' : 'store'](
          this.type,
          this._dirUrl,
          name,
          obj,
        ).pipe((element) => {
          this.currentPath[1] = 'local';
          this.currentPath[2] = name;
          this.currentPath[3] = obj._time || 'head';
          return element;
        });
      });
    },

    localSave(obj) {
      this._localSave(obj, obj._time, obj._name);
    },

    localSnapshot(data) {
      if (!data) return;

      this._localSave(data, 'stored', data._name || 'Master').pipe(
        function (element) {
          element._time = false; // We saved a snapshot, but have to reload the head (we continue working on the head)
          return element;
        },
      );
    },

    localAutosave(val, callback, done) {
      if (this._autosaveLocal) window.clearInterval(this._autosaveLocal);

      if (val) {
        this._autosaveLocal = window.setInterval(() => {
          var el = callback();
          this._localSave(el, 'head', el._name || 'Master').done(() => {
            if (done) done();
          });
        }, 10000);
      }
    },

    // When we create a branch, we switch to the branch
    localBranch(data, name) {
      data._name = name;
      data._time = false;
      return this._localSave(data, 'head', name).pipe((obj) => {
        this.make(obj, this.currentPath[2], this.currentPath[3]);
      });
    },

    // Do not change branch, just change the head
    localRevert(data) {
      data._time = false;
      this._localSave(data, 'head', data._name || 'Master').done((obj) => {
        this.make(obj, this.currentPath[2], this.currentPath[3]);
      });
    },

    /** **********************/
    /** SERVER SIDE *********/
    /** **********************/

    autosaveServer(val, callback, done) {
      if (this._autosaveServer) window.clearInterval(this._autosaveServer);

      if (val) {
        this._autosaveServer = window.setInterval(() => {
          this._saveToServer(callback()).done(() => {
            if (done) done();
          });
        }, 10000);
      }
    },

    _saveToServer(obj) {
      // obj._name = mode || 'Master';
      obj._local = false;
      obj._saved = Date.now();
      obj._time = Date.now();

      this._savedServer = JSON.stringify(obj);

      return $.ajax({
        type: 'post',
        url: this.getUrl(),
        data: {
          content: this._savedServer,
          branch: obj._name,
          revision: obj._saved,
          action: 'Save',
        },
      });
    },

    getFromServer(data) {
      var def = $.Deferred(),
        url = this.getUrl() || this._defaultUrl;

      if (!url) {
        return def.resolve({});
      }

      data.action = 'Load';
      $.ajax({
        dataType: 'text',
        type: 'get',
        url,
        cache: false,
        data: data || {},
        success: (data) => {
          // data is now a text
          this._savedServer = data;
          data = this._reviver(JSON.parse(data));
          def.resolve(data);
        },

        error() {
          def.reject();
        },
      });

      return def;
    },

    serverCopy(data, branch) {
      data._name = data._name || branch || 'Master';
      data._time = false;
      data._saved = Date.now();

      return this._localSave(data, 'head', data._name).pipe((el) => {
        return this.make(el, data._name, 'head');
      });
    },

    serverPush(obj) {
      return this._saveToServer(obj);
    },

    _onLoaded(el) {
      var elTyped;
      elTyped = DataObject.check(el, 1);
      this.onLoaded(elTyped);
    },
  };

  return DataViewHandler;
});
