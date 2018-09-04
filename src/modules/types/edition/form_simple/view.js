'use strict';

define([
  'modules/default/defaultview',
  'src/util/datatraversing',
  'src/util/api',
  'lib/formcreator/formcreator',
  'lodash'
], function (Default, DataTraversing, API, FormCreator, _) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init: function () {
      this.dom = $('<div />');
      this.module.getDomContent().html(this.dom);
      this.callback = null;
    },

    inDom: function () {
      var that = this,
        structure = this.module.getConfiguration('structure') || [],
        tpl_file = this.module.getConfiguration('tpl_file'),
        trigger = this.module.getConfiguration('trigger'),
        tpl_html = this.module.getConfiguration('tpl_html'),
        form,
        def,
        options = {},
        formStructure = {
          sections: {
            main: {
              groups: {
                main: {
                  options: {
                    type: 'list',
                    multiple: false
                  },

                  fields: FormCreator.makeStructure(structure)
                }
              }
            }
          }
        };

      if (tpl_file) {
        def = $.get(tpl_file, {});
      } else {
        def = tpl_html;
      }

      function triggerCommon() {
        if (that.lockEvents) {
          return;
        }

        var i, l;

        var val = new DataObject(this.getValue(), true);
        that.formValue = val;

        var input = that.module.getDataFromRel('input_object'),
          structure = that.module.getConfiguration('structure') || [],
          jpath;

        var el = new DataObject();

        if (input) {
          if (that.module.getConfiguration('replaceObj')) {
            for (i = 0, l = structure.length; i < l; i++) {
              jpath = structure[i].groups.general[0].searchOnField[0];
              input.setChild(
                jpath,
                that.form.sectionElements.main[0].groupElements.main[0]
                  .fieldElements[structure[i].groups.general[0].name[0]][0]
                  .value,
                [that.module.getId()]
              );
            }

            that.module.model.dataTriggerChange(input);
          } else {
            for (i = 0, l = structure.length; i < l; i++) {
              jpath = structure[i].groups.general[0].searchOnField[0];
              el.setChild(
                jpath,
                that.form.sectionElements.main[0].groupElements.main[0]
                  .fieldElements[structure[i].groups.general[0].name[0]][0]
                  .value
              );
              //      input.setChild( jpath, self.form.sectionElements.main[ 0 ].groupElements.main[ 0 ].fieldElements[ structure[ i ].groups.general[ 0 ].name[ 0 ] ][0].value );
            }
          }
        } else {
          el = val;
        }
        return el;
      }

      var triggerFunction = function () {
        var el = triggerCommon.call(this);
        that.module.controller.formTriggered(el);
      };

      var changedFunction = function () {
        var el = triggerCommon.call(this);
        that.module.controller.valueChanged(el);
      };

      $.when(def).done(function (tpl) {
        tpl = `<form><div style="position: relative;" class="form-sections-wrapper form-section-section-container"><div class="form-section" data-form-sectionname="main"><div class="form-section-group-container"><div class="form-group" data-form-groupname="main">${tpl}</div></div></div></div></form>`;
        var form = FormCreator.makeForm();

        switch (trigger) {
          case 'btn':
          case 'both':
            var btnLabel = that.module.getConfiguration('btnLabel');
            form.addButton(
              btnLabel,
              { color: 'blue' },
              triggerFunction.bind(form)
            );
          case 'change': // eslint-disable-line no-fallthrough
            var debounce = that.module.getConfiguration('debounce');
            options.onValueChanged =
              debounce > 0
                ? _.debounce(changedFunction, debounce)
                : changedFunction;
        }

        form.init(options);

        form.setStructure(formStructure);
        form.onStructureLoaded().done(function () {
          form.fill({}); // For now let's keep it empty.
        });

        form.onLoaded().done(function () {
          form.setTpl(tpl);

          that.dom.html(form.makeDomTpl());
          form.inDom();
          form.dom.submit(function (event) {
            event.preventDefault();
          });
          triggerFunction.call(form);
          that.resolveReady();
        });

        that.form = form;
      });
    },

    update: {
      input_object: function (varValue) {
        var that = this;
        this.newValue(varValue);

        this.module.model.dataListenChange(
          varValue,
          function () {
            that.newValue(this);
          },
          'input_object'
        );
      }
    },

    newValue: function (varValue) {
      var that = this,
        structure = this.module.getConfiguration('structure') || [],
        jpath;

      that.lockEvents = true;
      that.nb = 0;

      for (var i = 0, l = structure.length; i < l; i++) {
        jpath = structure[i].groups.general[0].searchOnField[0];

        (function (j, jpath) {
          that.nb++;

          varValue.getChild(jpath, true).then(function (returned) {
            that.form.sectionElements.main[0].groupElements.main[0].fieldElements[
              structure[j].groups.general[0].name[0]
            ][0].value = returned
              ? returned.get
                ? returned.get()
                : returned.toString()
              : '';

            that.nb--;
            if (that.nb == 0) {
              that.lockEvents = false;
            }
          });
        })(i, jpath);
      }
    }
  });

  return View;
});
