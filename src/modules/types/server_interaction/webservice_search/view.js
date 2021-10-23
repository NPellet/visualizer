'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'src/util/ui'
], function ($, Default, ui) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {
    init: function () {
      var that = this;
      var cfg = this.module.getConfiguration;

      this.dom = $('<div></div>');
      this.search = $('<table class="Search" cellpadding="5" cellspacing="0"><col width="100"><col width="*"></table>').css('width', '90%');

      this.dom.append(this.search);
      this.$feedback = $('<div id="ci-webservice-search-feedback"/>');
      this.dom.append(this.$feedback);
      this.module.getDomContent().html(this.dom);
      this.oldVal = {};
      this._url = false;

      var searchparams;
      if ((searchparams = cfg('searchparams'))) {
        for (var i in searchparams) {
          if (!i || !searchparams[i].label)
            continue;
          this.search.append(`<tr><td><nobr>${searchparams[i].label}</nobr></td><td>${this._makeFormEl(searchparams[i], i)}</td></tr>`);
        }

        var url = cfg('url');
        this.button = cfg('button', false);

        if (this.button) {
          require(['forms/button'], function (Button) {
            that.dom.append((that.buttonInst = new Button(cfg('buttonlabel') || 'Search', function () {
              var prom = Promise.resolve(true);
              if (that.module.getConfigurationCheckbox('askConfirm', 'yes')) {
                prom = ui.confirm(that.module.getConfiguration('confirmText'));
              }
              prom.then(function (ok) {
                if (ok) {
                  that.module.controller.doSearch();
                }
              });
            })).render());
          });
        }


        this.search.on('keyup', 'input[type=text], textarea', function (e) {
          var $this = $(this);
          var searchTerm = $this.val();
          if ($this.attr('data-type') === 'float') {
            searchTerm = parseFloat(searchTerm);
          }
          var searchName = $this.attr('name');

          if (!that.oldVal[searchName] || that.oldVal[searchName] !== searchTerm) {
            $this.trigger('change');
          }

          if (searchName !== undefined) {
            that.module.controller.addValue({
              name: searchName,
              destination: $this.attr('data-dest')
            }, searchTerm);
          }

          if (!that.button) {
            that.module.controller.doSearch();
            return;
          }


          if (that.buttonInst && e.keyCode == 13) {
            that.module.controller.doSearch();
          }
        });

        this.search.on('change', 'select', function () {
          var $this = $(this);

          var searchTerm = $this.val();
          if ($this.attr('data-type') === 'float') {
            searchTerm = parseFloat(searchTerm);
          }
          var searchName = $this.attr('name');
          if (searchName !== undefined) {
            that.module.controller.addValue({
              name: searchName,
              destination: $this.attr('data-dest')
            }, searchTerm);
          }

          if (!that.button) {
            that.module.controller.doSearch();
          }
        });

        this.search.on('change', 'input[type=checkbox]', function () {
          var $this = $(this);
          var searchTerm = $this.is(':checked');
          var searchName = $this.attr('name');

          if (searchName !== undefined) {
            that.module.controller.addValue({
              name: searchName,
              destination: $this.attr('data-dest')
            }, searchTerm);
          }

          if (!that.button) {
            that.module.controller.doSearch();
          }
        });
      }

      this.resolveReady();
    },

    _makeFormEl: function (spec, name) {
      var elemAttribute = `name="${spec.name}" data-dest="${spec.destination}" data-type="${spec.fieldtype}"`;

      switch (spec.fieldtype) {
        case 'combo':
          var opts = (spec.fieldoptions || '').split(';'),
            opt,
            html = '';
          html += `<option ${spec.defaultvalue == '' ? 'selected="selected" ' : ''}value=""></option>`;
          for (var i = 0, l = opts.length; i < l; i++) {
            opt = opts[i].split(':');
            html += `<option ${spec.defaultvalue == opt[0] ? 'selected="selected" ' : ''}value="${opt[0]}">${opt[1] || opt[0]}</option>`;
          }
          return `<select ${elemAttribute}>${html}</select>`;

        case 'checkbox':
          return `<input type="checkbox" ${spec.defaultvalue ? 'checked="checked"' : ''} value="1" offvalue="0" ${elemAttribute} />`;

        case 'textarea':
          return `<textarea ${elemAttribute
          } style="width: 100%" ${spec.fieldoptions || ''}>${
            spec.defaultvalue || ''
          }</textarea>`;

        default:
        case 'float':
        case 'text':
          return `<input type="text" value="${spec.defaultvalue || ''}" ${elemAttribute} style="width: 100%" />`;
      }
    },

    inDom: function () {
      this.search.find('input:last').trigger('change');
    },


    lock: function () {
      this.locked = true;
      if (this.buttonInst) {
        this.buttonInst.setTitle(this.module.getConfiguration('buttonlabel_exec', 'Loading...') || 'Loading...');
        this.buttonInst.disable();
      }
    },

    unlock: function () {
      this.locked = false;
      if (this.buttonInst) {
        this.buttonInst.setTitle(this.module.getConfiguration('buttonlabel', 'Search') || 'Search');
        this.buttonInst.enable();
      }
    },

    update: {
      vartrigger: function (variable) {
        if (variable == undefined)
          return;

        this.module.controller.doSearch();
      },
      url: function (val) {
        this._url = val.get();
      }
    },

    onActionReceive: {
      doSearch: function () {
        this.module.controller.doSearch();
      },
      buttonColor: function (newColor) {
        if (this.buttonInst) {
          this.buttonInst.setColor(newColor);
        }
      }
    },

    showError: function () {
      this.$feedback.html('Error').css('color', 'red');
      this._feedbackTimeout();
    },

    showSuccess: function (status) {
      this.$feedback.html(`Request successful with status ${status}`).css('color', 'green');
      this._feedbackTimeout();
    },

    _feedbackTimeout: function () {
      var that = this;
      if (this._ftimeout) {
        clearTimeout(this._ftimeout);
      }
      this._ftimeout = setTimeout(function () {
        that.$feedback.html('');
      }, 5000);
    }

  });

  return View;
});
