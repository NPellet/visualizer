'use strict';

define([
  'jquery',
  'src/header/components/default',
  'src/util/versioning',
  'forms/button',
  'src/util/util',
  'src/util/debug',
  'lib/couchdb/jquery.couch',
  'fancytree',
  'components/ui-contextmenu/jquery.ui-contextmenu.min'
], function ($, Default, Versioning, Button, Util, Debug) {
  function CouchDBManager() {}

  Util.inherits(CouchDBManager, Default, {
    initImpl: function () {
      this.ok = this.loggedIn = false;
      this.id = Util.getNextUniqueId();
      if (this.options.url)
        $.couch.urlPrefix = this.options.url.replace(/\/$/, '');
      var db = this.options.database || 'visualizer';
      this.database = $.couch.db(db);

      this.showError = showError.bind(this);
      this.getFormContent = getFormContent.bind(this);

      this.checkDatabase();
    },
    checkDatabase: function () {
      var that = this;
      $.couch.info({
        success: function (event) {
          that.ok = true;
        },
        error: function (e, f, g) {
          Debug.error(
            `CouchDB header : database connection error. Code:${e}.`,
            g
          );
        }
      });
    },
    cssId: function (name) {
      return `ci-couchdb-header-${this.id}-${name}`;
    },
    _onClick: function () {
      if (this.ok) {
        this.setStyleOpen(this._open);
        if (this._open) {
          this.createMenu();
          this.open();
        } else {
          this.close();
        }
      } else {
        this.checkDatabase();
        Debug.error('CouchDB header : unreachable database.');
      }
    },
    createMenu: function () {
      if (this.$_elToOpen) {
        if (this.loggedIn) this.$_elToOpen.html(this.getMenuContent());
        else this.$_elToOpen.html(this.getLoginForm());
        return;
      }

      var that = this;
      this.$_elToOpen = $('<div>');
      this.errorP = $(`<p id="${this.cssId('error')}" style="color: red;">`);

      $.couch.session({
        success: function (data) {
          if (data.userCtx.name === null) {
            that.$_elToOpen.html(that.getLoginForm());
          } else {
            that.loggedIn = true;
            that.username = data.userCtx.name;
            that.$_elToOpen.html(that.getMenuContent());
          }
        }
      });
    },
    load: function (type, node, rev) {
      var result = {};
      result[type.toLowerCase()] = {
        url: this.database.uri + node.data.id + (rev ? `?rev=${rev}` : '')
      };
      Versioning.switchView(result, true);
    },
    save: function (type, name) {
      if (name.length < 1) return;
      if (name.indexOf(':') !== -1) return this.showError(10);

      var content = JSON.parse(Versioning[`get${type}JSON`]());

      var last = this[`last${type}Node`];
      if (typeof last === 'undefined') return this.showError(11);

      var id, folderNode;
      if (last.node.folder) {
        id = `${last.name}:${name}`;
        folderNode = last.node;
      } else {
        id = last.name.replace(/[^:]*$/, name);
        folderNode = last.node.parent;
      }

      var keys = Object.keys(content);
      for (var i = 0, ii = keys.length; i < ii; i++) {
        if (keys[i].charAt(0) === '_') delete content[keys[i]];
      }

      content._id = id;

      var update = false;
      if (id === last.name) {
        update = true;
        content._rev = last.node.data.lastRev;
      }

      this.database.saveDoc(content, {
        success: function (data) {
          if (update) {
            last.node.data.lastRev = data.rev;
            if (last.node.children) last.node.load(true);
          } else {
            folderNode.addNode({
              id: data.id,
              lazy: true,
              title: name,
              key: `${folderNode.key}:${name}`,
              lastRev: data.rev
            });
            if (!folderNode.expanded) folderNode.toggleExpanded();
          }
        },
        error: this.showError
      });
    },
    mkdir: function (type, name) {
      if (name.length < 1) return;
      if (name.indexOf(':') !== -1) return this.showError(10);

      var last = this[`last${type}Node`];
      if (typeof last === 'undefined') return this.showError(11);

      var folderNode;
      if (last.node.folder) folderNode = last.node;
      else folderNode = last.node.parent;

      // Check if folder already exists
      var children = folderNode.getChildren();
      if (children) {
        for (var i = 0; i < children.length; i++) {
          if (children[i].title === name && children[i].folder)
            return this.showError(12);
        }
      }

      var newNode = folderNode.addNode({
        folder: true,
        title: name,
        key: `${folderNode.key}:${name}`
      });
      if (!folderNode.expanded) folderNode.toggleExpanded();
      $(newNode.li)
        .find('.fancytree-title')
        .trigger('click');
    },
    login: function (username, password) {
      var that = this;
      $.couch.login({
        name: username,
        password: password,
        success: function (data) {
          that.loggedIn = true;
          that.username = username;
          that.$_elToOpen.html(that.getMenuContent());
        },
        error: this.showError
      });
    },
    logout: function () {
      var that = this;
      $.couch.logout({
        success: function () {
          that.loggedIn = false;
          that.username = null;
          that.$_elToOpen.html(that.getLoginForm());
        }
      });
    },
    getLoginForm: function () {
      var that = this;

      function doLogin() {
        that.login(
          that.getFormContent('login-username'),
          that.getFormContent('login-password')
        );
        return false;
      }

      var loginForm = (this.loginForm = $('<div>'));
      loginForm.append('<h1>Login</h1>');
      loginForm.append(
        `<label for="${this.cssId(
          'login-username'
        )}">Username </label><input type="text" id="${this.cssId(
          'login-username'
        )}" /><br>`
      );
      loginForm.append(
        `<label for="${this.cssId(
          'login-password'
        )}">Password </label><input type="password" id="${this.cssId(
          'login-password'
        )}" />`
      );
      loginForm.append(
        new Button('Login', doLogin, { color: 'green' }).render()
      );
      loginForm.bind('keypress', function (e) {
        if (e.charCode === 13) return doLogin();
      });

      loginForm.append(this.errorP);

      return loginForm;
    },
    getMenuContent: function () {
      var that = this;
      var dom = (this.menuContent = $('<div>'));

      var logout = $('<div>')
        .append(
          $('<p>')
            .css('display', 'inline-block')
            .css('width', '50%')
            .append('Click on an element to select it. Double-click to load.')
        )
        .append(
          $('<p>')
            .append(`Logged in as ${this.username} `)
            .css('width', '50%')
            .css('text-align', 'right')
            .css('display', 'inline-block')
            .append(
              $('<a>Logout</a>')
                .on('click', function () {
                  that.logout();
                })
                .css({
                  color: 'blue',
                  'text-decoration': 'underline',
                  cursor: 'pointer'
                })
            )
        );
      dom.append(logout);

      var tableRow = $('<tr>').appendTo($('<table>').appendTo(dom));
      var treeCSS = {
        'overflow-y': 'auto',
        height: '200px',
        width: '300px'
      };

      var dataCol = $('<td valign="top">').appendTo(tableRow);
      dataCol.append('<h1>Data</h1>');

      var dataTree = $('<div>')
        .attr('id', this.cssId('datatree'))
        .css(treeCSS);
      dataCol.append(dataTree);

      dataCol.append(`<p id="${this.cssId('datadiv')}">&nbsp;</p>`);
      dataCol.append(
        $('<p>')
          .append(`<input type="text" id="${this.cssId('data')}"/>`)
          .append(
            new Button(
              'Save',
              function () {
                that.save('Data', that.getFormContent('data'));
              },
              { color: 'red' }
            ).render()
          )
          .append(
            new Button(
              'Mkdir',
              function () {
                that.mkdir('Data', that.getFormContent('data'));
              },
              { color: 'blue' }
            ).render()
          )
      );
      this.lastDataFolder = { name: `${this.username}:data`, node: null };

      var viewCol = $('<td valign="top">').appendTo(tableRow);
      viewCol.append('<h1>View</h1>');

      var viewTree = $('<div>')
        .attr('id', this.cssId('viewtree'))
        .css(treeCSS);
      viewCol.append(viewTree);

      viewCol.append(`<p id="${this.cssId('viewdiv')}">&nbsp;</p>`);
      viewCol.append(
        $('<p>')
          .append(`<input type="text" id="${this.cssId('view')}"/>`)
          .append(
            new Button(
              'Save',
              function () {
                that.save('View', that.getFormContent('view'));
              },
              { color: 'red' }
            ).render()
          )
          .append(
            new Button(
              'Mkdir',
              function () {
                that.mkdir('View', that.getFormContent('view'));
              },
              { color: 'blue' }
            ).render()
          )
      );
      this.lastViewFolder = { name: `${this.username}:view`, node: null };

      dom.append(this.errorP);

      this.loadTree();

      return dom;
    },
    lazyLoad: function (event, result) {
      var id = result.node.data.id;
      var def = $.Deferred();
      result.result = def.promise();
      this.database.openDoc(id, {
        revs_info: true,
        success: function (data) {
          var info = data._revs_info,
            l = info.length,
            revs = [];
          for (var i = 0; i < l; i++) {
            var rev = info[i];
            if (rev.status === 'available') {
              var el = {
                title: `rev ${l - i}`,
                id: data._id,
                rev: true,
                key: rev.rev
              };
              revs.push(el);
            }
          }
          def.resolve(revs);
        }
      });
    },
    clickNode: function (type, event, data) {
      if (data.targetType !== 'title' && data.targetType !== 'icon') return;

      var node = data.node,
        divContent = '',
        last;
      var typeL = type.toLowerCase();

      if (node.folder) {
        divContent += node.key;
        var folderName = divContent.substring(5);
        last = {
          name: `${this.username}:${typeL}${
            folderName.length > 0 ? `:${folderName}` : ''
          }`,
          node: node
        };
      } else {
        var rev;
        divContent += node.key.replace(/:?[^:]*$/, '');
        if (node.data.rev) {
          rev = node.key;
          node = node.parent;
        }
        $(`#${this.cssId(typeL)}`).val(node.title);
        last = { name: node.data.id, node: node };
        if (event.type === 'fancytreedblclick') this.load(type, node, rev);
      }

      this[`last${type}Node`] = last;
      $(`#${this.cssId(`${typeL}div`)}`).html(`&nbsp;${divContent}`);

      if (event.type === 'fancytreedblclick' && !node.folder) return false;
    },
    loadTree: function () {
      const proxyLazyLoad = this.lazyLoad.bind(this);
      const proxyClickData = this.clickNode.bind(this, 'Data');
      const proxyClickView = this.clickNode.bind(this, 'View');
      const that = this;

      var menuOptions = {
        delegate: 'span.fancytree-title',
        menu: [{ title: 'Delete', cmd: 'delete', uiIcon: 'ui-icon-trash' }],
        beforeOpen(event, ui) {
          var node = $.ui.fancytree.getNode(ui.target);
          if (node.folder) return false;
          node.setActive();
        },
        select(event, ui) {
          var node = $.ui.fancytree.getNode(ui.target);
          that.contextClick(node, ui.cmd);
        },
        createMenu(event) {
          $(event.target).css('z-index', 1000);
        }
      };

      this.database.allDocs({
        startkey: `${this.username}:`,
        endkey: `${this.username}:~`,
        success(data) {
          var trees = createTrees(data.rows);
          var datatree = $(`#${that.cssId('datatree')}`);
          datatree
            .fancytree({
              toggleEffect: false,
              source: trees.data,
              lazyload: proxyLazyLoad,
              click: proxyClickData,
              dblclick: proxyClickData,
              debugLevel: 0
            })
            .children('ul')
            .css('box-sizing', 'border-box');
          datatree
            .data('ui-fancytree')
            .getNodeByKey('root')
            .toggleExpanded();
          datatree.contextmenu(menuOptions);

          var viewtree = $(`#${that.cssId('viewtree')}`);
          viewtree
            .fancytree({
              toggleEffect: false,
              source: trees.view,
              lazyload: proxyLazyLoad,
              click: proxyClickView,
              dblclick: proxyClickView,
              debugLevel: 0
            })
            .children('ul')
            .css('box-sizing', 'border-box');
          viewtree
            .data('ui-fancytree')
            .getNodeByKey('root')
            .toggleExpanded();
          viewtree.contextmenu(menuOptions);
        }
      });
    },
    contextClick(node, action) {
      if (action === 'delete' && !node.folder) {
        if (node.data.rev) node = node.parent;
        var doc = {
          _id: node.data.id,
          _rev: node.data.lastRev
        };
        this.database.removeDoc(doc, {
          success: function () {
            node.remove();
          },
          error: this.showError
        });
      }
    }
  });

  function showError(e) {
    var content;
    switch (e) {
      case 10:
        content = 'Colons are not allowed in the name.';
        break;
      case 11:
        content = 'Please select a folder';
        break;
      case 12:
        content = 'A folder with this name already exists.';
        break;
      case 401:
        content = 'Wrong username or password.';
        break;
      case 409:
        content = 'Conflict. An entry with the same name already exists.';
        break;
      case 503:
        content = 'Service Unavailable.';
        break;
      default:
        content = 'Unknown error.';
    }
    $(`#${this.cssId('error')}`)
      .text(content)
      .show()
      .delay(3000)
      .fadeOut();
  }

  function createTrees(data) {
    var trees = { data: { __folder: true }, view: { __folder: true } };
    var trees2 = { data: { __folder: true }, view: { __folder: true } };
    for (var i = 0, ii = data.length; i < ii; i++) {
      var info = data[i];
      var split = info.id.split(':');
      split.shift();
      if (split.shift() === 'data') addBranch(trees.data, split, info);
      else addBranch(trees.view, split, info);
    }

    trees2.data = createFancyTree(trees.data, '');
    trees2.view = createFancyTree(trees.view, '');

    return trees2;
  }

  function addBranch(tree, indices, info) {
    if (indices.length === 0) {
      addLeaf(tree, info);
    } else {
      tree.__folder = true;
      var index = indices.shift();
      if (!tree[index]) tree[index] = {};
      addBranch(tree[index], indices, info);
    }
  }

  function addLeaf(tree, info) {
    tree.__name = info.id;
    tree.__rev = info.value.rev;
  }

  function createFancyTree(object, currentPath) {
    var tree, root;
    if (currentPath.length) {
      tree = root = [];
    } else {
      root = [
        {
          key: 'root',
          title: 'root',
          folder: true,
          children: []
        }
      ];
      tree = root[0].children;
      currentPath = 'root:';
    }

    for (var name in object) {
      if (name === '__folder' || name === '__name' || name === '__rev')
        continue;
      var obj = object[name];
      var thisPath = currentPath + name;
      var el = { title: name, key: thisPath };
      if (obj.__folder) {
        if (obj.__name) {
          tree.push({
            id: obj.__name,
            lazy: true,
            title: name,
            key: thisPath,
            lastRev: obj.__rev
          });
        }
        el.folder = true;
        el.children = createFancyTree(obj, `${thisPath}:`);
      } else {
        el.lazy = true;
        el.id = obj.__name;
        el.lastRev = obj.__rev;
      }
      tree.push(el);
    }

    return root;
  }

  function getFormContent(type) {
    return $(`#${this.cssId(type)}`)
      .val()
      .trim();
  }

  return CouchDBManager;
});
