'use strict';

define([
  'jquery',
  'lodash',
  'src/util/api',
  'src/util/ui',
  'src/header/components/default',
  'src/util/versioning',
  'forms/button',
  'src/util/util',
  'forms/form',
  'src/util/couchdbAttachments',
  'src/util/uploadUi',
  'src/util/debug',
  'file-saver',
  'lib/couchdb/jquery.couch',
  'fancytree',
  'components/ui-contextmenu/jquery.ui-contextmenu.min',
  'jquery-ui/ui/widgets/autocomplete'
], function ($, _, API, ui, Default, Versioning, Button, Util, Form, CouchdbAttachments, uploadUi, Debug, fileSaver) {
  function CouchDBManager() {
  }

  let loadingId = Util.getNextUniqueId();
  let regAlphaNum = /^[a-zA-Z0-9]+$/;
  let UPLOAD_LIMIT = 50 * 1024 * 1024;

  Util.inherits(CouchDBManager, Default, {
    initImpl: function () {
      let that = this;

      $(document).keydown(
        function (event) {
          // If Control or Command key is pressed and the S key is pressed
          // run save function. 83 is the key code for S.
          if ((event.ctrlKey || event.metaKey) && !event.altKey && event.which == 83) {
            event.preventDefault();
            let viewUrl = Versioning.lastLoaded.view.url;
            let reg = /\/([^/]+)\/view\.json$/;
            let m = reg.exec(viewUrl);
            let loadedDocId = m[1];
            let nodes = [];
            if (!that.ftree) {
              ui.showNotification('Cannot save, couchdb tree not loaded yet', 'info');
              return;
            }
            that.ftree.visit(function (n) {
              nodes.push(n);
            });
            nodes = nodes.filter(function (n) {
              return !n.folder && n.data.doc && n.data.doc._id === loadedDocId;
            });
            if (!nodes.length) return;
            let compiled = _.template('<table>\n    <tr>\n        <td style="vertical-align: top;"><b>Document id</b></td>\n        <td><%= doc._id %></td>\n    </tr>\n    <tr>\n        <td style="vertical-align: top;"><b>Flavor</b></td>\n        <td><%= flavor %></td>\n    </tr>\n    <tr>\n        <td style="vertical-align: top;"><b>Name</b></td>\n        <td><% print(flavors[flavors.length-1]) %></td>\n    </tr>\n    <tr>\n        <td style="vertical-align: top;"><b>Location</b></td>\n        <td><li><% print(flavors.join(\'</li><li>\')) %></li></td>\n    </tr>\n</table>');
            ui.dialog(compiled({
              doc: nodes[0].data.doc,
              flavor: that.flavor,
              flavors: nodes[0].data.doc.flavors[that.flavor]
            }), {
              width: '400px',
              buttons: {
                'Save View': function () {
                  $(this).dialog('close');
                  that.saveNode('View', nodes[0]).then(function () {
                    ui.showNotification('View saved', 'success');
                  }, function (e) {
                    ui.showNotification(that.getErrorContent(e.status), 'error');
                  });
                },
                'Save Data': function () {
                  $(this).dialog('close');
                  that.saveNode('Data', nodes[0]).then(function () {
                    ui.showNotification('Data saved', 'success');
                  }, function (e) {
                    ui.showNotification(that.getErrorContent(e.status), 'error');
                  });
                },
                'Save Both': function () {
                  $(this).dialog('close');
                  that.saveNode('View', nodes[0]).then(function () {
                    ui.showNotification('View saved', 'success');
                    that.saveNode('Data', nodes[0]).then(function () {
                      ui.showNotification('Data saved', 'success');
                    }, function (e) {
                      ui.showNotification(that.getErrorContent(e.status), 'error');
                    });
                  }, function (e) {
                    ui.showNotification(that.getErrorContent(e.status), 'error');
                  });
                }
              }
            });
          }
        }
      );

      this.ok = this.loggedIn = this.ready = false;
      if (!this.options.beforeUrl) this.ready = true;
      else {
        this.beforeUrl();
      }
      this.id = Util.getNextUniqueId();
      this.options.loginMethods = this.options.loginMethods || ['couchdb'];
      if (this.options.url) {
        $.couch.urlPrefix = this.options.url.replace(/\/$/, '');
      }
      this.url = $.couch.urlPrefix;
      let db = this.db = this.options.database || 'visualizer';
      this.dbUrl = `${this.url}/${db}`;
      this.database = $.couch.db(db);
      $.ui.fancytree.debugLevel = 0;
      this.checkDatabase();
    },

    beforeUrl: function () {
      let that = this;
      let url = this.options.beforeUrl;
      $.ajax({
        type: 'GET',
        url: url,
        success: function () {
          Debug.info('CouchDB: beforeUrl success');
          that.ready = true;
        },
        error: function (err) {
          Debug.info('CouchDB: beforeUrl error', err);
          that.ready = true;
        }
      });
    },

    getErrorContent: function (e) {
      let content;
      if (typeof e === 'number') {
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
          case 20:
            content = 'Document already has this flavor';
            break;
          case 21:
            content = 'Path already used by another document';
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
      } else {
        content = e;
      }
      return content;
    },

    showError: function (e, type) {
      let color = 'red';
      if (type === 2)
        color = 'green';
      let content = this.getErrorContent(e, type);
      this.errorP.text(content).css('color', color).show().delay(3000).fadeOut();
    },
    getFormContent: function (type) {
      return $(`#${this.cssId(type)}`).val().trim();
    },
    setFormContent: function (type, value) {
      $(`#${this.cssId(type)}`).val(value);
    },
    checkDatabase: function () {
      let that = this;
      $.couch.info({
        success: function (event) {
          that.ok = true;
        },
        error: function (e, f, g) {
          Debug.error(`CouchDB header : database connection error. Code:${e}.`, g);
        }
      });
    },
    cssId: function (name) {
      return `ci-couchdb-header-${this.id}-${name}`;
    },
    changeFlavor: function (flavorName) {
      if (!regAlphaNum.test(flavorName))
        return this.showError('Flavor name must be alphanumeric.');
      this.flavor = flavorName;
      this.setFormContent('flavor-input', flavorName);
      this.loadFlavor();
    },
    _onClick: function () {
      if (this.ok && this.ready) {
        this.setStyleOpen(this._open);
        if (this._open) {
          this.createMenu();
          this.errorP.hide();
          this.open();
        } else {
          this.close();
        }
      } else if (!this.ok) {
        this.checkDatabase();
        Debug.error('CouchDB header : unreachable database.');
      } else {
        ui.showNotification('Couchdb button not ready');
      }
    },
    createMenu: function (checkSession) {
      if (!this.$_elToOpen) {
        this.$_elToOpen = $('<div>').css('width', 560);
        this.errorP = $(`<p id="${this.cssId('error')}">`);
        checkSession = true;
      }

      if (checkSession) {
        let that = this;
        $.couch.session({
          success: function (data) {
            if (data.userCtx.name === null) {
              that.openMenu('login');
            } else {
              that.loggedIn = true;
              that.username = data.userCtx.name;
              that.openMenu('tree');
            }
          }
        });
      } else if (this.loggedIn) {
        this.openMenu('tree');
      } else {
        this.openMenu('login');
      }
    },
    openMenu: function (which) {
      switch (which) {
        case this.lastMenu:
          return;
        case 'tree':
          this.$_elToOpen.html(this.getMenuContent());
          this.lastMenu = 'tree';
          break;
        case 'login':
          this.$_elToOpen.html(this.getLoginForm());
          this.lastMenu = 'login';
          break;
        default:
                    // ignore
      }
    },
    load: function (node, rev) {
      let result = {};
      if (node.data.hasData) {
        result.data = {
          url: `${this.database.uri + node.data.doc._id}/data.json${rev ? `?rev=${rev}` : ''}`
        };
      }
      if (node.data.hasView) {
        result.view = {
          url: `${this.database.uri + node.data.doc._id}/view.json${rev ? `?rev=${rev}` : ''}`
        };
      }
      Versioning.switchView(result, true, {
        withCredentials: true
      });

      this.lastKeyLoaded = node.key;
    },

    saveMeta: function (val) {
      let that = this;
      let node = that.currentDocument;
      let doc = node.data.doc;
      if (val && val.keywords && val.keywords.value) {
        doc.keywords = val.keywords.value;
      }
      doc._attachments['meta.json'] = {
        content_type: 'application/json',
        data: btoa(unescape(encodeURIComponent(JSON.stringify(val))))
      };
      that.database.saveDoc(doc, {
        success: function (data) {
          doc._rev = data.rev;
          node.data.hasMeta = true;
          if (node.children)
            node.load(true);

          that.showError('meta saved.', 2);
        },
        error: function () {
          that.showError(...arguments);
        }
      });
    },

    saveNode: function (type, node) {
      let that = this;
      if (!node) {
        let msg = 'Cannot save node (undefined)';
        this.showError(msg);
        return Promise.reject(msg);
      }
      let doc = node.data.doc;
      let content = Versioning[`get${type}JSON`]();
      doc._attachments[`${type.toLowerCase()}.json`] = {
        content_type: 'application/json',
        data: btoa(unescape(encodeURIComponent(content)))
      };

      return Promise.resolve(that.database.saveDoc(doc, {
        success: function () {
          node.data[`has${type}`] = true;
          if (node.children)
            node.load(true);
          that.showError(`${type} saved.`, 2);
        },
        error: function () {
          that.showError(...arguments);
        }
      }));
    },

    save: function (type, name) {
      if (name.length < 1)
        return;
      if (name.indexOf(':') !== -1)
        return this.showError(10);

      let content = Versioning[`get${type}JSON`]();

      let last = this.lastNode;
      if (typeof last === 'undefined')
        return this.showError(11);

      let children = last.node.getChildren();
      let child;
      if (children) {
        for (let i = 0; i < children.length; i++) {
          if (children[i].title === name) {
            child = children[i];
            break;
          }
        }
      }

      let doc;
      let that = this;

      if (child && !child.folder) {
        // This doc has revs which means it has been saved to couchdb already
        // Therefore we only need to update the attachment
        doc = child.data.doc;

        doc._attachments[`${type.toLowerCase()}.json`] = {
          content_type: 'application/json',
          data: btoa(unescape(encodeURIComponent(content)))
        };

        return Promise.resolve(that.database.saveDoc(doc, {
          success: function () {
            child.data[`has${type}`] = true;
            if (child.children)
              child.load(true);
            that.showError(`${type} saved.`, 2);
          },
          error: function () {
            that.showError(...arguments);
          }
        }));
      } else {
        // The doc is new so we need to save the whole document
        // With a new uuid
        let flavors = {},
          flav = [];
        if (last.key) {
          flav = last.node.key.split(':');
          flav.shift();
        }
        flav.push(name);
        flavors[this.flavor] = flav;
        doc = {
          flavors: flavors,
          name: this.username,
          _attachments: {}
        };
        doc._attachments[`${type.toLowerCase()}.json`] = {
          content_type: 'application/json',
          data: btoa(unescape(encodeURIComponent(content)))
        };
        this.database.saveDoc(doc, {
          success: function (data) {
            doc._id = data.id;
            doc._rev = data.rev;
            let newNode = {
              doc: doc,
              lazy: true,
              title: name,
              key: `${last.node.key}:${name}`
            };
            newNode[`has${type}`] = true;
            last.node.addNode(newNode);
            if (!last.node.expanded)
              last.node.toggleExpanded();
            that.showError(`${type} saved.`, 2);
          }
        });
      }
    },
    mkdir: function (name) {
      if (name.length < 1)
        return;
      if (name.indexOf(':') !== -1)
        return this.showError(10);

      let last = this.lastNode;
      if (typeof last === 'undefined')
        return this.showError(11);

      let folderNode;
      if (last.node.folder)
        folderNode = last.node;
      else
        folderNode = last.node.parent;

      // Check if folder already exists
      let children = folderNode.getChildren();
      if (children) {
        for (let i = 0; i < children.length; i++) {
          if (children[i].title === name && children[i].folder)
            return this.showError(12);
        }
      }

      let newNode = folderNode.addNode({
        folder: true,
        title: name,
        key: `${folderNode.key}:${name}`
      });
      if (!folderNode.expanded)
        folderNode.toggleExpanded();
      $(newNode.li).find('.fancytree-title').trigger('click');
    },
    login: function (username, password) {
      let that = this;
      $.couch.login({
        name: username,
        password: password,
        success: function (data) {
          that.loggedIn = true;
          that.username = username;
          that.openMenu('tree');
        },
        error: function () {
          that.showError(...arguments);
        }
      });
    },
    logout: function () {
      let that = this;
      let prom = Promise.resolve($.couch.logout({
        success: function () {
          that.loggedIn = false;
          that.username = null;
          that.openMenu('login');
        }
      }));
      prom.catch(function (e) {
        if (e.status === 401) window.location = window.location.href;
      });
    },
    renderLoginMethods: function () {
      let that = this;

      function doLogin() {
        that.login(that.getFormContent('login-username'), that.getFormContent('login-password'));
        return false;
      }

      let openLogin = this.openLogin.bind(this);
      for (let i = 0; i < this.options.loginMethods.length; i++) {
        switch (this.options.loginMethods[i]) {
          case 'google':
            $(`<a href=" ${this.url}/auth/google">Google login</a><br/>`).appendTo(this.loginForm).on('click', openLogin);
            break;
          case 'github':
            $(`<a href=" ${this.url}/auth/github">Github login</a><br/>`).appendTo(this.loginForm).on('click', openLogin);
            break;
          case 'facebook':
            $(`<a href=" ${this.url}/auth/facebook">Facebook login</a><br/>`).appendTo(this.loginForm).on('click', openLogin);
            break;
          case 'couchdb':
            this.loginForm.append('<div> Couchdb Login </div>');
            this.loginForm.append(`<label for="${this.cssId('login-username')}">Username </label><input type="text" id="${this.cssId('login-username')}" /><br>`);
            this.loginForm.append(`<label for="${this.cssId('login-password')}">Password </label><input type="password" id="${this.cssId('login-password')}" /><br><br>`);
            this.loginForm.append(new Button('Login', doLogin, { color: 'green' }).render());
            this.loginForm.bind('keypress', function (e) {
              if (e.charCode === 13)
                return doLogin();
            });
            break;
        }
      }
    },

    openLogin: function (e) {
      e.preventDefault();
      let url = e.currentTarget.href;
      let win = window.open(`${url}?close=true`, 'CI_Couch_Login', 'menubar=no');
      clearInterval(this._loginWinI);
      let that = this;
      this._loginWinI = window.setInterval(function () {
        if (win.closed) {
          that.createMenu(true);
          clearInterval(that._loginWinI);
        }
      }, 100);
    },

    getLoginForm: function () {
      let loginForm = this.loginForm = $('<div>');
      loginForm.append('<h1>Login</h1>');
      this.renderLoginMethods();
      loginForm.append(this.errorP);
      return loginForm;
    },
    getMenuContent: function () {
      let that = this;
      let dom = this.menuContent = $('<div>');

      let logout = $('<div>')
        .append($('<p>')
          .css('display', 'inline-block')
          .css('width', '50%')
          .append('Click on an element to select it. Double-click to load.'))
        .append($('<p>')
          .append(`Logged in as ${this.username} `)
          .css('width', '50%')
          .css('text-align', 'right')
          .css('display', 'inline-block')
          .append($('<a>Logout</a>')
            .on('click', function () {
              that.logout();
            })
            .css({
              color: 'blue',
              'text-decoration': 'underline',
              cursor: 'pointer'
            })));
      dom.append(logout);

      let flavorField = $(`<input type="text" value="${this.flavor}" id="${this.cssId('flavor-input')}">`);

      function changeFlavor() {
        let flavor = that.getFormContent('flavor-input');
        if (that.flavor !== flavor) that.changeFlavor(flavor);
      }

      this.database.view('flavor/list', {
        success: function (data) {
          if (!data.rows.length)
            that.flavorList = ['default'];
          else
            that.flavorList = data.rows[0].value;
          flavorField.autocomplete({
            appendTo: '#ci-visualizer',
            minLength: 0,
            source: that.flavorList
          }).on('autocompleteselect', function (event, d) {
            let flavor = d.item.value;
            if (that.flavor !== flavor) that.changeFlavor(flavor);
            flavorField.blur();
          }).on('keypress', function (e) {
            if (e.keyCode === 13) {
              changeFlavor();
              flavorField.blur();
            }
          });
        },
        error: function (status) {
          Debug.warn(status);
        },
        key: this.username
      });

      dom.append($('<p><span>Flavor : </span>').append(flavorField).append(
        new Button('Switch', changeFlavor, { color: 'red' }).setTooltip('Switch flavor!').render()
      ));

      let treeCSS = {
        'overflow-y': 'auto',
        height: '200px',
        width: '300px'
      };
      let treeContainer = $('<div>').attr('id', this.cssId('tree')).css(treeCSS).appendTo(dom);
      this.makePublicButton = new Button('Make Public', function () {
        ui.confirm('You are about to make your view public. This action is irreversible. It will enable anybody to access the saved view and data. Do you want to proceed?', 'Proceed', 'Cancel').then(function (proceed) {
          if (!proceed || !that.currentDocument) return;
          let node = that.currentDocument;
          let doc = node.data.doc;
          doc.isPublic = true;
          that.database.saveDoc(doc, {
            success: function (data) {
              doc._rev = data.rev;
              node.data.isPublic = true;
              that.updateButtons();
              if (node.children)
                node.load(true);

              that.showError('The view was made public', 2);
            },
            error: function () {
              that.showError(...arguments);
            }
          });
        });
      }, { color: 'red' });
      dom.append($('<div style="width:560px; height:35px;">').append(`<input type="text" id="${this.cssId('docName')}"/>`)
        .append(new Button('Edit Meta', function () {
          that.metaData();
        }, { color: 'blue' }).render())
        .append(new Button('Save data', function () {
          that.save('Data', that.getFormContent('docName'));
        }, { color: 'red' }).render())
        .append(new Button('Save view', function () {
          that.save('View', that.getFormContent('docName'));
        }, { color: 'red' }).render())
        .append(new Button('Mkdir', function () {
          that.mkdir(that.getFormContent('docName'));
        }, { color: 'blue' }).render())
        .append(this.errorP)
      );

      function uploadFiles() {
        if (!that.currentDocument) return;
        let docUrl = `${that.dbUrl}/${that.currentDocument.data.doc._id}`;
        let couchA = new CouchdbAttachments(docUrl);
        couchA.fetchList().then(function (attachments) {
          uploadUi.uploadDialog(attachments, {
            mode: 'couch',
            docUrl: docUrl
          }).then(function (toUpload) {
            if (!toUpload) return;
            API.loading(loadingId, 'Uploading files...');
            let parts;
            parts = _.partition(toUpload, function (v) {
              return v.toDelete;
            });
            let toDelete = parts[0];
            parts = _.partition(parts[1], function (v) {
              return v.size < UPLOAD_LIMIT;
            });

            let largeUploads = parts[1];
            let smallUploads = parts[0];

            // Sort to minimize number of requests
            smallUploads.sort(function (a, b) {
              if (a.size < b.size) return 1;
              else if (a.size === b.size) return 0;
              else return -1;
            });

            // Create inline uploads batch
            let inlineUploads = [];
            let current = [];
            let uploadSum = 0;
            let i;
            for (i = 0; i < smallUploads.length; i++) {
              uploadSum += smallUploads[i].size;
              if (uploadSum < UPLOAD_LIMIT) {
                current.push(smallUploads[i]);
              } else {
                inlineUploads.push(current);
                current = [smallUploads[i]];
                uploadSum = smallUploads[i].size;
              }
            }

            if (current.length) {
              inlineUploads.push(current);
            }

            let prom = Promise.resolve();

            prom = prom.then(function () {
              return couchA.remove(_.map(toDelete, 'name'));
            });
            for (let i = 0; i < largeUploads.length; i++) {
              prom = prom.then(function () {
                return couchA.upload(largeUploads[i]);
              });
            }

            for (let i = 0; i < inlineUploads.length; i++) {
              prom = prom.then(function () {
                return couchA.inlineUploads(inlineUploads[i]);
              });
            }

            prom.then(function () {
              API.stopLoading(loadingId);
              that.showError('Files uploaded successfully', 2);
            }, function (err) {
              API.stopLoading(loadingId);
              that.showError('Files upload failed (at least partially)');
              Debug.error(err.message, err.stack);
            });

            prom.then(function () {
              that.loadFlavor(); // Reload flavor to update tree and linked documents
            });
          });
        });
      }

      dom.append('<hr>')
        .append(this.makePublicButton.render().hide())
        .append(new Button('Upload', uploadFiles, { color: 'green' }).render());

      this.loadFlavor();

      return dom;
    },
    updateButtons: function () {
      let node = this.currentDocument;
      let dom = this.makePublicButton.getDom();
      if ((node && node.data && !node.data.isPublic && dom)) {
        dom.show();
      } else if (dom) {
        dom.hide();
      }
    },
    getMetaForm: function (node) {
      let that = this;
      let doc = node.data.doc;
      return new Promise(function (resolve) {
        $.ajax({
          url: `${that.database.uri + doc._id}/meta.json`, // always the last revision
          type: 'GET',
          dataType: 'json',
          error: function (e) {
            Debug.warn('Could not get meta data...', e);
            resolve({});
          },
          success: function (data) {
            resolve(that.processMetaForm(data));
          }
        });
      });
    },

    processMetaForm: function (obj) {
      // var result = {
      //    sections: {
      //        metadata: [{
      //            sections: {
      //                keywords: [
      //                    {
      //                        "sections": {},
      //                        "groups": {
      //                            "group": [
      //                                {
      //                                    "contentType": ['html'],
      //                                    "keyword": [
      //                                        "showHelp"
      //                                    ],
      //                                    "contentText": [
      //                                        "abc"
      //                                    ],
      //                                    "contentHtml": [
      //                                        "xyz"
      //                                    ]
      //                                }
      //                            ]
      //                        }
      //                    },
      //                    {
      //                        "sections": {},
      //                        "groups": {
      //                            "group": [
      //                                {
      //                                    "contentType": ['text'],
      //                                    "keyword": [
      //                                        "showHelp"
      //                                    ],
      //                                    "contentText": [
      //                                        "abc"
      //                                    ],
      //                                    "contentHtml": [
      //                                        "xyz"
      //                                    ]
      //                                }
      //                            ]
      //                        }
      //                    }
      //                ]
      //            }
      //        }]
      //    }
      // };
      let result = {
        sections: {
          metadata: [
            {
              sections: {
                keywords: []
              }
            }
          ]
        }
      };
      for (let key in obj) {
        let n = {};
        n.contentType = [obj[key].type];
        n.keyword = [key];
        if (obj[key].type === 'text') {
          n.contentText = [obj[key].value];
          n.contentHtml = [''];
        } else if (obj[key].type === 'html') {
          n.contentHtml = [obj[key].value];
          n.contentText = [''];
        }
        result.sections.metadata[0].sections.keywords.push({
          sections: {},
          groups: {
            group: [n]
          }
        });
      }
      return result;
    },

    metaData: function () {
      let that = this;
      if (!this.currentDocument) {
        that.showError('No document selected');
        return;
      }

      let div = ui.dialog({
        width: '80%',
        autoPosition: true,
        title: 'Edit Metadata'
      });

      let structure = {

        sections: {

          metadata: {

            options: {
              title: 'Metadata',
              icon: 'info_rhombus'
            },
            sections: {
              keywords: {
                options: {
                  multiple: true,
                  title: 'Key/Value Metadata'
                },
                groups: {
                  group: {
                    options: {
                      type: 'list',
                      multiple: true
                    },
                    fields: {
                      contentType: {
                        type: 'combo',
                        options: [{ key: 'text', title: 'Text' }, { key: 'html', title: 'html' }],
                        title: 'Content type',
                        displaySource: { text: 't', html: 'h' },
                        default: 'text'
                      },
                      keyword: {
                        type: 'text',
                        title: 'Key'
                      },
                      contentText: {
                        type: 'jscode',
                        mode: 'text',
                        title: 'Value',
                        displayTarget: ['t']
                      },
                      contentHtml: {
                        type: 'wysiwyg',
                        title: 'Value',
                        default: ' ',
                        displayTarget: ['h']
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      let form = new Form({});

      form.init({
        onValueChanged: function (value) {
        }
      });

      form.setStructure(structure);
      form.onStructureLoaded().done(function () {
        let fill = {};
        let prom;
        if (!that.currentDocument.data.hasMeta) {
          prom = Promise.resolve({});
        } else {
          prom = that.getMetaForm(that.currentDocument);
        }

        prom.then(function (fill) {
          form.fill(fill);
        });
      });

      form.addButton('Cancel', { color: 'blue' }, function () {
        div.dialog('close');
      });

      form.addButton('Save', { color: 'green' }, function () {
        let value = form.getValue();
        that.saveMeta(that.getMetaFromForm(value));
        div.dialog('close');
      });

      form.onLoaded().done(function () {
        div.html(form.makeDom(1, 0));
        form.inDom();
      });
    },

    getMetaFromForm: function (value) {
      value = DataObject.check(value, true);
      let result = {};
      let x = value.getChildSync(['sections', 'metadata', 0, 'sections', 'keywords']);
      if (x) {
        for (let i = 0; i < x.length; i++) {
          let val = x.getChildSync([i, 'groups', 'group', 0]);
          if (val.contentType[0] === 'text') {
            result[val.keyword[0]] = {
              type: 'text',
              value: val.contentText[0]
            };
          } else if (val.contentType[0] === 'html') {
            result[val.keyword[0]] = {
              type: 'html',
              value: val.contentHtml[0]
            };
          }
        }
      }
      return result;
    },
    lazyLoad: function (event, result) {
      let id = result.node.data.doc._id;
      let def = $.Deferred();
      result.result = def.promise();
      this.database.openDoc(id, {
        revs_info: true,
        success: function (data) {
          let info = data._revs_info,
            l = info.length,
            revs = [];
          for (let i = 0; i < l; i++) {
            let rev = info[i];
            if (rev.status === 'available') {
              let el = { title: `rev ${l - i}`, id: data._id, rev: rev.rev, key: result.node.key };
              revs.push(el);
            }
          }
          def.resolve(revs);
        }
      });
    },
    clickNode: function (event, data) {
      let folder;
      let node = folder = data.node,
        last;

      let index = node.key.indexOf(':'),
        keyWithoutFlavor;
      if (index >= 0)
        keyWithoutFlavor = node.key.substring(index + 1);
      else
        keyWithoutFlavor = '';

      if (node.folder) {
        this.currentDocument = null;
      } else {
        let rev;
        if (node.data.rev) {
          rev = node.data.rev;
          node = node.parent;
        }
        folder = node.parent;
        this.currentDocument = node;
        $(`#${this.cssId('docName')}`).val(node.title);
        this.updateButtons();
        if (event.type === 'fancytreedblclick')
          this.load(node, rev);
      }

      last = {
        key: keyWithoutFlavor,
        node: folder
      };
      this.lastNode = last;
      if (event.type === 'fancytreedblclick' && !node.folder)
        return false;
    },
    loadFlavor: function () {
      const proxyLazyLoad = this.lazyLoad.bind(this);
      const proxyClick = this.clickNode.bind(this);
      const that = this;

      let menuOptions = {
        delegate: 'span.fancytree-title',
        menu: [
          { title: 'Delete', cmd: 'delete', uiIcon: 'ui-icon-trash' },
          { title: 'New flavor', cmd: 'newflavor', uiIcon: 'ui-icon-newwin' },
          { title: 'Rename', cmd: 'rename', uiIcon: 'ui-icon-folder-collapsed' },
          { title: 'Flavors', cmd: 'flavors', children: [] }
        ],
        beforeOpen: function (event, ui) {
          let node = $.ui.fancytree.getNode(ui.target);
          if (node.folder)
            return false;
          let tree = $(`#${that.cssId('tree')}`);
          let flavors = Object.keys(node.data.doc.flavors);
          if (flavors.length === 1) {
            tree.contextmenu('setEntry', 'delete', 'Delete');
            tree.contextmenu('showEntry', 'flavors', false);
          } else {
            let children = new Array(flavors.length);
            for (let i = 0; i < flavors.length; i++) {
              children[i] = {
                title: flavors[i],
                cmd: 'flavor'
              };
              if (flavors[i] === that.flavor) {
                children[i].disabled = true;
              }
            }
            tree.contextmenu('setEntry', 'delete', 'Delete flavor');
            tree.contextmenu('setEntry', 'flavors', {
              title: 'Flavors',
              children: children
            });
            tree.contextmenu('showEntry', 'flavors', true);
          }
          node.setActive();
        },
        select: function (event, ui) {
          let node = $.ui.fancytree.getNode(ui.target);
          that.contextClick(node, ui.cmd, ui);
        },
        createMenu: function (event) {
          $(event.target).css('z-index', 10000);
        }
      };

      let dnd = {
        preventVoidMoves: true,
        preventRecursiveMoves: true,
        autoExpandMS: 300,
        dragStart: function (node) { // Can only move documents
          return !node.folder && !node.data.rev;
        },
        dragEnter: function (target) { // Can only drop in a folder
          return !!target.folder;
        },
        dragDrop: function (target, info) {
          let theNode = info.otherNode;
          if (target === theNode.parent) // Same folder, nothing to do
            return false;
          let newKey = target.key.substring(that.flavor.length + 1);
          newKey += newKey.length ? `:${theNode.title}` : theNode.title;
          let newFlavor = newKey.split(':');
          that.database.view('flavor/docs', {
            success: function (data) {
              if (comparePaths(newFlavor, data.rows))
                return that.showError(21);

              theNode.data.doc.flavors[that.flavor] = newFlavor;
              that.database.saveDoc(theNode.data.doc, {
                success: function () {
                  theNode.moveTo(target, info.hitMode);
                },
                error: function () {
                  that.showError(...arguments);
                }
              });
            },
            error: function (status) {
              Debug.warn(status);
            },
            key: [that.flavor, that.username],
            include_docs: false
          });
        }
      };
      this.database.list(
        'flavor/sort',
        'docs',
        {
          key: [this.flavor, this.username],
          include_docs: true
        },
        {
          success: function (data) {
            let tree = createFullTree(data, that.flavor);
            let theTree = $(`#${that.cssId('tree')}`);
            theTree.fancytree({
              toggleEffect: false,
              extensions: ['dnd'],
              dnd: dnd,
              source: [],
              lazyLoad: proxyLazyLoad,
              dblclick: proxyClick,
              debugLevel: 0,
              activate: proxyClick
            }).children('ul').css('box-sizing', 'border-box');
            let thefTree = theTree.data('ui-fancytree').getTree();
            that.ftree = thefTree;
            thefTree.reload(tree);
            thefTree.getNodeByKey(that.flavor).toggleExpanded();
            theTree.contextmenu(menuOptions);
            if (that.lastKeyLoaded)
              thefTree.activateKey(that.lastKeyLoaded);
            if (that.currentDocument) {
              // When switching flavors, if this document is also
              // in the new flavor we select it automatically
              let id = that.currentDocument.data.doc._id;
              let d = _.find(data, function (d) {
                return d.id === id;
              });
              if (d) {
                let key = _.flatten([that.flavor, d.value.flavors]).join(':');
                thefTree.activateKey(key);
              }
            }
          },
          error: function (status) {
            Debug.warn(status);
          }
        }
      );
    },
    contextClick: function (node, action, ctx) {
      let that = this;

      if (!node.folder) {
        if (action === 'delete') {
          if (node.data.rev)
            node = node.parent;

          delete node.data.doc.flavors[this.flavor]; // Delete current flavor
          if ($.isEmptyObject(node.data.doc.flavors)) { // No more flavors, delete document
            node.data.doc._deleted = true;
            this.database.saveDoc(node.data.doc, {
              success: function () {
                that.showError('Document deleted.', 2);
                node.remove();
              },
              error: function () {
                that.showError(...arguments);
              }
            });
          } else { // Update current doc
            this.database.saveDoc(node.data.doc, {
              success: function () {
                that.showError('Flavor deleted.', 2);
                node.remove();
              },
              error: function () {
                that.showError(...arguments);
              }
            });
          }
        } else if (action === 'rename') {
          ui.dialog(`New name : <input type="text" id="${this.cssId('newname')}" value="${node.title}" />`, {
            buttons: {
              Save: function () {
                let dialog = $(this);
                let doc = node.data.doc;
                let name = that.getFormContent('newname');
                let path = doc.flavors[that.flavor];
                let oldName = path[path.length - 1];
                path[path.length - 1] = name;
                that.database.view('flavor/docs', {
                  success: function (data) {
                    if (comparePaths(path, data.rows)) {
                      path[path.length - 1] = oldName;
                      return that.showError(21);
                    }
                    that.database.saveDoc(doc, {
                      success: function () {
                        node.key = node.key.replace(/[^:]+$/, name);
                        node.setTitle(name);
                        dialog.dialog('destroy');
                        that.setFormContent('docName', name);
                      },
                      error: function (status) {
                        Debug.warn(status);
                      }
                    });
                  },
                  error: function (status) {
                    Debug.warn(status);
                  },
                  key: [that.flavor, that.username],
                  include_docs: false
                });
              },
              Cancel: function () {
                $(this).dialog('destroy');
              }
            }
          });
        } else if (action === 'newflavor') {
          let div = $('<div>').html('Flavor :');
          ui.dialog(div, {
            buttons: {
              Save: function () {
                let dialog = $(this);
                let doc = node.data.doc;
                let flavor = that.getFormContent('newflavorname');
                if (doc.flavors[flavor])
                  that.showError(20);
                else {
                  let path = doc.flavors[that.flavor];
                  that.database.view('flavor/docs', {
                    success: function (data) {
                      if (comparePaths(path, data.rows))
                        return that.showError(21);
                      doc.flavors[flavor] = path;
                      that.database.saveDoc(doc, {
                        success: function () {
                          that.showError(`Flavor ${flavor} successfully added.`, 2);
                          dialog.dialog('destroy');
                        },
                        error: function (status) {
                          Debug.warn(status);
                        }
                      });
                    },
                    error: function (status) {
                      Debug.warn(status);
                    },
                    key: [flavor, that.username],
                    include_docs: false
                  });
                }
              },
              Cancel: function () {
                $(this).dialog('destroy');
              }
            },
            title: 'New flavor'
          });
          div.append($(`<input type="text" id="${this.cssId('newflavorname')}" />`).autocomplete({
            appendTo: '#ci-visualizer',
            minLength: 0,
            source: that.flavorList
          }));
        } else if (action === 'flavor') {
          that.changeFlavor(ctx.item.text());
        } else if (action === 'flavors') {
          // do nothing
        } else {
          Debug.warn(`Context menu action "${action}" not implemented !`);
        }
      }
    }
  });

  Object.defineProperty(CouchDBManager.prototype, 'flavor', {
    get: function () {
      if (this._flavor) {
        return this._flavor;
      } else {
        return (this._flavor = window.sessionStorage.getItem('ci-visualizer-pouchdb2-flavor') || 'default');
      }
    },
    set: function (value) {
      this._flavor = value;
      window.sessionStorage.setItem('ci-visualizer-pouchdb2-flavor', value);
    }
  });

  function createFullTree(data, flavor) {
    let tree = {};
    for (let i = 0; i < data.length; i++) {
      let theData = data[i];
      let structure = getStructure(theData);
      $.extend(true, tree, structure);
    }
    return createFancyTree(tree, '', flavor);
  }

  function getStructure(data) {
    let flavors = data.value.flavors;
    let structure = {},
      current = structure;
    for (let i = 0; i < flavors.length - 1; i++) {
      current = current[flavors[i]] = { __folder: true };
    }
    current[flavors[flavors.length - 1]] = {
      __name: flavors.join(':'),
      __doc: data.doc,
      __data: data.value.data,
      __view: data.value.view,
      __meta: data.value.meta,
      __public: data.value.isPublic
    };
    return structure;
  }

  function createFancyTree(object, currentPath, flavor) {
    let tree, root;
    if (currentPath.length) {
      tree = root = [];
    } else {
      root = [
        {
          key: flavor,
          title: flavor,
          folder: true,
          children: []
        }
      ];
      tree = root[0].children;
      currentPath = `${flavor}:`;
    }

    for (let name in object) {
      if (name.indexOf('__') === 0)
        continue;
      let obj = object[name];
      let thisPath = currentPath + name;
      let el = { title: name, key: thisPath };
      if (obj.__folder) {
        if (obj.__name) {
          tree.push({
            doc: obj.__doc,
            hasData: obj.__data,
            hasView: obj.__view,
            hasMeta: obj.__meta,
            isPublic: obj.__public,
            lazy: true,
            title: name,
            key: thisPath
          });
        }
        el.folder = true;
        el.children = createFancyTree(obj, `${thisPath}:`, flavor);
      } else {
        el.lazy = true;
        el.doc = obj.__doc;
        el.hasData = obj.__data;
        el.hasView = obj.__view;
        el.hasMeta = obj.__meta;
        el.isPublic = obj.__public;
      }
      tree.push(el);
    }
    return root;
  }

  function comparePaths(path1, paths) {
    let joinedPath1 = path1.join(':');
    let i = 0,
      l = paths.length;
    for (; i < l; i++) {
      let path2 = paths[i].value.flavors.join(':');
      if (joinedPath1 === path2)
        return true;
    }
    return false;
  }

  return CouchDBManager;
});
