'use strict';

define(['modules/default/defaultview', 'src/util/datatraversing', 'src/util/api', 'lib/formcreator/formcreator', 'src/util/util', 'src/util/debug'], function (Default, Traversing, API, FormCreator, Util, Debug) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      var that = this;
      var parentDom = $('<div>').css({
        position: 'relative',
        height: '100%',
        weight: '100%'
      });
      this.overlay = $('<div>').css({
        position: 'absolute',
        height: '100%',
        width: '100%',
        zIndex: 1000,
        backgroundColor: 'rgba(200,200,200,0)',
        color: 'rgba(50,50,50,0)',
        display: 'none'
      }).appendTo(parentDom).click(function (e) {
        e.stopPropagation();
        that.searchEnabled = true;
        that.overlay.animate({
          backgroundColor: 'rgba(200,200,200,0)',
          color: 'rgba(50,50,50,0)'
        }, 500, function () {
          that.overlay.css('display', 'none');
        });
        that.search();
      }).append($(`<div>${this.module.getConfiguration('disableMessage')}</div>`).css({
        textAlign: 'center',
        width: '100%',
        zIndex: 1001,
        display: 'table-cell',
        verticalAlign: 'middle',
        fontSize: '20pt'
      }));
      this.searchEnabled = true;

      this.dom = $('<div>').appendTo(parentDom);
      this.module.getDomContent().html(parentDom);
      this.variables = {};
      this.cfgValue = {};
      this.maxhits = parseInt(this.module.getConfiguration('maxhits'), 10) || Number.POSITIVE_INFINITY;

      this._jpathsFcts = {};

      var searchfields = this.module.getConfiguration('searchfields'),
        varsoutCfg = this.module.definition.vars_out || [],
        varsout = [],
        j = 0,
        k = varsoutCfg.length,
        cfg = {
          sections: {
            cfg: {
              groups: {
                cfg: {
                  options: {
                    type: 'list'
                  },
                  fields: FormCreator.makeStructure(searchfields, function (field) {
                    for (var k = 0, m = field.groups.general[0].searchOnField.length; field.groups.general[0].searchOnField[k]; k++) {
                      Util.addjPathFunction(that._jpathsFcts, field.groups.general[0].searchOnField[k]);
                    }
                  })
                }
              }
            }
          }
        };

      for (; j < k; j++) {
        varsout.push(varsoutCfg[j].name);
      }


      var form = FormCreator.makeForm();

      form.init({
        onValueChanged: function (value) {
          var cfg = form.getValue().sections.cfg[0].groups.cfg[0],
            cfgFinal = {};

          for (var i in cfg) {
            cfgFinal[i] = cfg[i][0];
          }

          $.extend(that.cfgValue, cfgFinal);
          that.search();
        }
      });

      form.setStructure(cfg);
      form.onStructureLoaded().done(function () {
        form.fill({});
      });

      form.onLoaded().done(function () {
        that.dom.html(form.makeDom(2));
        form.inDom();
        form.fieldElementValueChanged();
      });

      this.makeSearchFilter();

      this.resolveReady();
    },

    blank: {
      value: function (varName) {
        this.dom.empty();
      }
    },

    search: function () {
      if (this.searchEnabled) {
        var cfg = this.cfgValue,
          i,
          l,
          target = new DataArray(),
          flags = new DataArray();

        var keys = Object.keys(this.variables),
          val;
        if (keys.length === 0 || Object.keys(cfg).length === 0) {
          return;
        }

        var max = this.maxhits,
          count = 0;
        for (var key in keys) {
          val = this.variables[keys[key]];
          l = val.length;
          for (i = 0; (i < l); i++) {
            if (this.searchElement(cfg, val.getChildSync([i]).get())) {
              if (count < max) target[count++] = val[i];
              flags[i] = true;
            } else {
              flags[i] = false;
            }
          }
        }

        this.module.controller.searchDone(target, flags);
      }
    },

    _makeOp: function (op, val, options) {
      val = `cfg[ "${val}" ]`;
      var numPrefix = '',
        numSuffix = '';
      if (options.number) {
        numPrefix = 'parseFloat(';
        numSuffix = ')';
      }
      var textSuffix = '.toLowerCase()';
      if (options.caseSensitive) {
        textSuffix = '';
      }
      switch (op) {
        case '=':
        case 'eq':
          if (options.number) {
            return ` el == ${numPrefix}${val}${numSuffix} `;
          } else {
            return ` ((el+"")${textSuffix}) == ${val}${textSuffix} `;
          }

        case '<>':
        case '><':
        case '!=':
          return ` (el + "") !== ${val} `;

        case '>':
          return ` el > ${numPrefix}${val}${numSuffix} `;

        case '>=':
          return ` el >= ${numPrefix}${val}${numSuffix} `;

        case '<':
          return ` el < ${numPrefix}${val}${numSuffix} `;

        case '<=':
          return ` el <= ${numPrefix}${val}${numSuffix} `;

        case 'contains':
          return ` el${textSuffix}.match(${val}${textSuffix}) `;

        case 'notcontain':
          return ` ! el${textSuffix}.match(${val}${textSuffix}) `;

        case 'starts':
          return ` el${textSuffix}.match(new RegExp("^"+${val}${textSuffix})) `;

        case 'end':
          return ` el${textSuffix}.match(new RegExp(${val}${textSuffix}+"$")) `;

        case 'btw':
          return ` ( el >= parseFloat( ${val}[0] ) && el <= parseFloat( ${val}[1] ) )`;
      }
    },

    makeSearchFilter: function () {
      var searchfields = this.module.getConfiguration('searchfields'),
        i = 0,
        l = searchfields.length,
        searchOn;

      var toEval = '';
      toEval += ' this._searchFunc = function( cfg, row ) { ';

      toEval += ' var el; ';


      toEval += ' return ';
      for (; i < l; i++) {
        searchOn = searchfields[i].groups.general[0].searchOnField || [];

        if (i > 0) {
          toEval += ' && ';
        }

        var j = 0,
          k = searchOn.length;

        if (k > 0) {
          toEval += ' ( ';

          for (; j < k; j++) {
            if (j > 0) {
              toEval += ' || ';
            }
            var opts = {};
            if (searchfields[i].groups.general[0].type[0] === 'float') opts.number = true;
            if (searchfields[i].groups.text && searchfields[i].groups.text[0].case_sensitive[0][0] === 'case_sensitive') opts.caseSensitive = true;
            var allow_undefined = false;
            if (searchfields[i].groups.general[0].allow_undefined && searchfields[i].groups.general[0].allow_undefined[0]) {
              allow_undefined = !!searchfields[i].groups.general[0].allow_undefined[0].length;
            }
            toEval += ` ( ( el = this.getJpath( "${searchOn[j]}", row ) ) ? ( `;
            toEval += this._makeOp(searchfields[i].groups.general[0].operator[0], searchfields[i].groups.general[0].name[0], opts);
            toEval += ` ) : ${allow_undefined} ) `;
          }
          toEval += ' ) ';
        }
      }

      toEval += ';};';

      try {
        this._searchFunc = null;
        eval(toEval);
      } catch (e) {
        Debug.error('Error while evaluating function.', toEval);
      }
    },

    searchElement: function (cfg, row) {
      return this._searchFunc(cfg, row);
    },

    getJpath: function (jpathEl, row) {
      return this._jpathsFcts[jpathEl](row);
    },

    update: {
      array: function (variableValue, variableName) {
        if (variableValue) {
          this.variables[variableName] = variableValue.get();
          this.search();
        }
      }
    },

    onActionReceive: {
      disable: function () {
        if (this.searchEnabled) {
          this.searchEnabled = false;
          this.overlay.css('display', 'table');
          this.overlay.animate({
            backgroundColor: 'rgba(200,200,200,0.6)',
            color: 'rgba(50,50,50,1)'
          }, 500);
        }
      }
    }
  });

  return View;
});
