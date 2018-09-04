'use strict';

define([
  'jquery',
  'src/header/components/default',
  'src/util/versioning',
  'forms/button',
  'src/util/util',
  'fancytree',
  'components/ui-contextmenu/jquery.ui-contextmenu.min',
  'jquery-ui/ui/widgets/dialog'
], function ($, Default, Versioning, Button, Util) {
  function Element() {
  }

  Util.inherits(Element, Default, {

    initImpl: function () {
      var that = this;
      this.id = Util.getNextUniqueId();
      $.ui.fancytree.debugLevel = 0;

      $(document).keydown(
        function (event) {
          // If Control or Command key is pressed and the S key is pressed
          // run save function. 83 is the key code for S.
          if ((event.ctrlKey || event.metaKey) && event.which == 83) {
            // Save Function
            event.preventDefault();
            that.checkNode();
            that.save();
            return false;
          }
        }
      );
    },

    _onClick: function () {
      this.createMenu();
    },

    createMenu: function () {
      var that = this;
      if (!this.$_elToOpen) {
        this.$_elToOpen = $('<div/>').css('width', 550);
      }

      this.setStyleOpen(this._open);
      if (this._open) {
        if (!this.$tree) {
          this.$tree = this.$tree || $('<div/>').css('id', this.cssId('tree')).css('display', 'inline-block').css('margin-right', 20);
          this.$_elToOpen.append('<div><p><label>Filter:</label><input name="search" placeholder="Filter..."><button id="btnResetSearch" disabled="disabled">×</button><span id="matches"></span></p></div>');
          this.$_elToOpen.append(this.$tree);
        }
        this.open();
        this.initTree().then(function () {
          that.createButtons();
        });
      } else {
        this.close();
      }
    },

    cssId: function (name) {
      return `ci-navview-header-${this.id}-${name}`;
    },

    reloadTree: function () {
      this.$tree.fancytree('destroy');
      this.initTree(true);
    },

    reloadActiveNode: function () {
      this.reloadNode(this.$tree.fancytree('getActiveNode'));
    },

    reloadNode: function (node) {
      if (!node.isFolder()) {
        node = node.getParent();
      }
      if (node.isRoot()) {
        this.reloadTree();
        return;
      }
      var wasExpanded = node.isExpanded();
      node.load(true).then(function () {
        if (wasExpanded) {
          node.setExpanded(true, {
            noAnimation: true
          });
        }
      });
    },

    getDir: function (path) {
      return path.replace(new RegExp(/\/[^/]+$/), '/');
    },

    load: function (name) {
    },

    save: function () {
      var that = this;
      var dir, name;
      if (this.activeNode) {
        dir = this.getDir(this.activeNode.data.path);
        name = this.activeNode.title;
      } else if (this.viewURL) {
        dir = this.getDir(this.viewURL);
        dir = dir.replace(/^\/views/, '.');
        var idx = this.viewURL.lastIndexOf('/');
        if (idx > -1) {
          name = this.viewURL.slice(idx + 1);
        } else {
          name = this.viewURL;
        }
      } else {
        return;
      }

      confirm(`You are about to save the current view to: ${dir}${name}<br/>This operation will erase the previous content of this file and cannot be undone.`).then(function (ok) {
        if (!ok) return;
        var req = $.ajax({
          url: '/navview/save',
          data: {
            dir: dir,
            name: name,
            content: Versioning.getViewJSON('\t')
          },
          type: 'POST',
          dataType: 'json'
        });

        req.done(function () {
          that.log('success-log', 'Successfully saved view');
          that.reloadActiveNode();
        });
        req.fail(function () {
          that.log('error-log', 'Failed to save view');
        });
      });
    },

    mkdir: function () {
      var that = this;
      var dir = this.activeNode.data.path;
      if (!this.activeNode.isFolder()) {
        dir = this.getDir(dir);
      }
      var name = this.getFormContent(this.$dirnameInput);
      if (dir && name) {
        var req = $.ajax({
          url: '/navview/mkdir',
          type: 'POST',
          data: {
            dir: dir,
            name: name
          },
          dataType: 'json'
        });
        req.done(function () {
          that.log('success-log', 'Successfully created directory');
          that.reloadActiveNode();
        });
        req.fail(function () {
          that.log('error-log', 'Failed create directory');
        });
      }
    },

    remove: function (node) {
      var that = this;
      if (node.isFolder()) {
        return this.log('error-log', 'Failed remove file');
      }

      var dir = this.getDir(node.data.path);
      var name = node.title;

      confirm(`<p>You are about to remove the file: <br/>${node.data.path}</p>Do you really want to do this? You cannot undo this operation`).then(function (ok) {
        if (!ok) return;
        var req = $.ajax({
          url: '/navview/file',
          type: 'DELETE',
          data: {
            dir: dir,
            name: name
          },
          dataType: 'json'
        });

        req.done(function () {
          node.remove();
          that.log('success-log', 'Successfully removed file');
        });

        req.fail(function () {
          that.log('error-log', 'Failed remove file');
        });
      });
    },

    removeDir: function (node) {
      var that = this;
      if (!node.isFolder()) {
        return this.log('error-log', 'Failed remove directory');
      }

      confirm(`<p>You are about to remove the directory: <br/>${node.data.path}</p>Do you really want to do this? You cannot undo this operation`).then(function (ok) {
        if (!ok) return;
        var req = $.ajax({
          url: '/navview/dir',
          type: 'DELETE',
          data: {
            dir: node.data.path
          },
          dataType: 'json'
        });

        req.done(function () {
          node.remove();
          that.log('success-log', 'Successfully removed directory');
        });

        req.fail(function () {
          that.log('error-log', 'Failed remove directory');
        });
      });
    },

    rename: function () {
      var that = this;
      var reg = new RegExp(/(^.*)\/([^/]+$)/);

      var m = reg.exec(this.activeNode.data.path);
      if (!m.length === 3) {
        this.log('error-log', 'Invalid path...');
        return;
      }

      var dir = m[1];
      var newName = this.getFormContent('docName');
      var newDir = dir;
      var name = m[2];


      var req = this.ajaxRename({
        dir: dir,
        newDir: newDir,
        name: name,
        newName: newName
      });

      req.done(function () {
        that.log('success-log', 'Successfully renamed file');
        that.reloadActiveNode();
      });
      req.fail(function () {
        that.log('error-log', 'Failed to rename file');
      });
    },

    ajaxRename: function (data) {
      return $.ajax({
        url: '/navview/rename',
        type: 'PUT',
        data: data,
        dataType: 'json'
      });
    },

    inlineRename: function (node) {
      var that = this;
      var data = {
        dir: node.data.dir,
        newDir: node.data.dir,
        newName: node.title,
        name: that.inlineOldTitle
      };
      var req = this.ajaxRename(data);

      req.done(function () {
        node.setTitle(node.title);
        that.log('success-log', 'Successfully renamed file');
      });

      req.fail(function () {
        node.setTitle(that.inlineOldTitle);
        that.log('error-log', 'Failed to rename file');
      });
    },

    newFile: function () {
      var that = this;
      var dir = that.activeNode.data.path;
      if (!that.activeNode.isFolder()) {
        dir = that.getDir(dir);
      }
      var req = $.ajax({
        url: '/navview/touch',
        type: 'POST',
        data: {
          dir: dir,
          name: that.getFormContent(this.$filenameInput)
        },
        dataType: 'json'
      });

      req.done(function () {
        that.log('success-log', 'File successfully created');
        that.reloadActiveNode();
      });

      req.fail(function () {
        that.log('error-log', 'Failed to create new file');
      });
    },

    duplicate: function () {
    },

    checkNode: function () {
      if (!this.activeNode) {
        this.log('error-log', 'Error: you must select a node');
      }
      var viewURL = location.search.split('viewURL=')[1];
      viewURL = decodeURIComponent(viewURL);
      this.viewURL = viewURL;
    },

    log: function (name, text) {
      if (!this.$log) return;
      var $slog = this.$log.find(`#${this.cssId(name)}`);

      if ($slog.length > 0) {
        if (this.currentLogTimeout) {
          clearTimeout(this.currentLogTimeout);
        }
        this.$log.find('div').html('');
        $slog.html(text);
      }

      this.currentLogTimeout = setTimeout(function () {
        $slog.html('');
      }, 5000);
    },

    loadRootTree: function () {
      if (this.treeSchema) {
        return this.treeSchema;
      }
      return $.ajax({
        url: '/navview/list',
        dataType: 'json'
      });
    },

    initTree: function (force) {
      var that = this;
      if (!force && that.fancytreeOk) {
        return Promise.resolve();
      }
      return this.loadRootTree().then(function (res) {
        var source = fancyTreeDirStructure(res);
        that.$tree.fancytree({
          toggleEffect: false,
          extensions: ['edit', 'filter'],
          filter: {
            mode: 'dimm'
          },
          source: source,
          lazyLoad: function (event, data) {
            data.result = $.ajax({
              url: `/navview/list?dir=${data.node.data.path}`,
              dataType: 'json'
            }).then(fancyTreeDirStructure);
          },
          activate: function (event, data) {
            that.activeNode = data.node;
            that.updateSaveViewText();
          },
          dblclick: function (event, data) {
            Versioning.switchView({
              view: {
                url: data.node.data.url
              }
            }, true);
          },

          keydown: function (event, data) {
            event.preventDefault();
            switch (event.which) {
              case 8:
                if (data.node.isFolder()) {
                  that.removeDir(data.node);
                } else {
                  that.remove(data.node);
                }
                break;
            }
          },
          edit: {
            triggerStart: ['f2', 'shift+click', 'mac+enter'],
            beforeEdit: function (event, data) {
              if (data.node.isFolder()) {
                return false;
              }
              that.inlineOldTitle = data.node.title;
              // Return false to prevent edit mode
            },
            edit: function (event, data) {
              // Editor was opened (available as data.input)
            },
            beforeClose: function (event, data) {
              // Return false to prevent cancel/save (data.input is available)
            },
            save: function (event, data) {
              // Save data.input.val() or return false to keep editor open
              // Simulate to start a slow ajax request...
              data.node.setTitle(data.input.val());
              $(data.node.span).addClass('pending');
              that.inlineRename(data.node);
              // We return true, so ext-edit will set the current user input
              // as title
              return true;
            },
            close: function (event, data) {
              // Editor was removed
              if (data.save) {
                // Since we started an async request, mark the node as preliminary
                $(data.node.span).addClass('pending');
              }
            }
          }
        });
        that.fancytreeOk = true;
        var tree = that.$tree.fancytree('getTree');
        that.$_elToOpen.find('input[name=search]').keyup(function (e) {
          var n,
            match = $(this).val();

          if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === '') {
            $('button#btnResetSearch').click();
            return;
          }

          // Pass a string to perform case insensitive matching
          n = tree.filterNodes(match, false);
          $('button#btnResetSearch').attr('disabled', false);
          $('span#matches').text(`(${n} matches)`);
        }).focus();

        $('button#btnResetSearch').click(function () {
          $('input[name=search]').val('');
          $('span#matches').text('');
          tree.clearFilter();
        }).attr('disabled', true);
      });
    },

    createButtons: function () {
      var that = this;
      if (this._buttons) return;

      this.$log = $('<div/>').attr('id', this.cssId('log')).css('margin-bottom', 10);
      this.$_elToOpen.append('<div/>').children(':gt(1)').css('display', 'inline-block').css('vertical-align', 'top').append(this.$log);
      this.$log.append($('<div/>').attr('id', this.cssId('error-log')).css('color', 'red'));
      this.$log.append($('<div/>').attr('id', this.cssId('success-log')).css('color', 'green'));

      // Append instructions
      this.$log.parent().append(new Button('Refresh Tree', function () {
        that.reloadTree();
      }, { color: 'blue' }).render());
      this.$log.parent().append('<br/><br/><br/><div>\n    <ul>\n        <li style="color:black;">Double-click a view to load it</li>\n        <li style="color: black;">Shift+click to rename a view</li>\n        <li style="color: black;">Press delete key to remove a view or a directory</li>\n    </ul>\n</div>');

      // Append buttons
      var $buttons = $('<div>\n    <table>\n        <tr>\n            <td></td>\n            <td></td>\n        </tr>\n        <tr>\n            <td><input type="text"/></td>\n            <td></td>\n        </tr>\n        <tr>\n            <td><input type="text"/></td>\n            <td></td>\n        </tr>\n    </table>\n</div>');
      this.$_elToOpen.append($buttons);
      var $inputs = $buttons.find('input');
      this.$dirnameInput = $($inputs[0]);
      this.$filenameInput = $($inputs[1]);

      var $tds = $buttons.find('td');
      this.$saveViewText = $($tds[0]);
      $($tds[1]).append(new Button('Save view', function () {
        that.checkNode();
        that.save();
      }, { color: 'red' }).render());

      $($tds[3]).append(new Button('Mkdir', function () {
        that.checkNode();
        that.mkdir();
      }, { color: 'blue' }).render());

      $($tds[5]).append(new Button('New file', function () {
        that.checkNode();
        that.newFile();
      }, { color: 'blue' }).render());

      // Remember we've already created the UI dom
      this._buttons = true;
    },

    updateSaveViewText: function () {
      this.$saveViewText.html(this.activeNode.data.path);
    },

    getFormContent: function (type) {
      if (typeof type === 'string')
        return $(`#${this.cssId(type)}`).val().trim();
      else if (type instanceof jQuery) {
        return type.val().trim();
      }
    },
    setFormContent: function (type, value) {
      $(`#${this.cssId(type)}`).val(value);
    }
  });

  function fancyTreeDirStructure(list) {
    return list.map(function (el) {
      return {
        title: el.name,
        folder: el.isDir,
        lazy: el.isDir,
        key: el.rel + el.name,
        data: {
          url: el.url,
          path: el.rel + el.name,
          dir: el.rel
        }
      };
    });
  }

  function confirm(message) {
    return new Promise(function (resolve) {
      var $dialog = $('#ci-dialog');
      if ($dialog.length === 0) {
        $dialog = $('<div/>').css('id', 'ci-dialog');
        $('body').append($dialog);
      }
      $dialog.html(message);
      $dialog.dialog({
        modal: true,
        buttons: {
          Cancel: function () {
            $(this).dialog('close');
          },
          Ok: function () {
            resolve(true);
            $(this).dialog('close');
          }
        },
        close: function () {
          return resolve(false);
        },
        width: 400
      });
    });
  }

  return Element;
});
