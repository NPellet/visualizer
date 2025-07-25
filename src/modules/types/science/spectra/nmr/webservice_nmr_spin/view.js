'use strict';

define(['jquery', 'modules/default/defaultview'], function ($, Default) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      var that = this;

      this.button = this.module.getConfiguration('button')[0] === 'button';
      this.dom = $('<div>').addClass('ci-module-webservice_nmr_spin');

      var selector = [];
      selector.push(
        '<select name="system">',
        '<option value="2" selected>AB</option>',
        '<option value="3">ABC</option>',
        '<option value="4">ABCD</option>',
        '<option value="5">ABCDE</option>',
        '<option value="6">ABCDEF</option>',
        '<option value="7">ABCDEFG</option>',
        '<option value="8">ABCDEFGH</option>',
        '</select>',
      );
      var selectorSelect = $(selector.join(''));
      selectorSelect.val(this.module.getConfiguration('systemSize')[0]);
      this.systemSelector = $('<h1>Select your spin system: </h1>');
      this.systemSelector.append(selectorSelect);

      this.dom.append(this.systemSelector);

      this.systemSelector.on('change', 'select', function () {
        var s = that.module.getConfiguration('systemSize', null, false);
        s[0] = $(this).val();
        that.init();
      });

      this.system = $(
        this._getTable(this.module.getConfiguration('systemSize')[0]),
      );

      if (!this.button) {
        this.system.on('keyup', 'input[type=text]', function () {
          that.module.controller.doAnalysis();
        });

        this.system.on('change', 'select', function () {
          that.module.controller.doAnalysis();
        });
      }

      this.dom.append(this.system);
      this.module.getDomContent().html(this.dom);

      if (this.button) {
        require(['forms/button'], function (Button) {
          that.system.append(
            (that.buttonInst = new Button(
              that.module.getConfiguration('buttonlabel'),
              function () {
                that.module.controller.doAnalysis();
              },
            )).render(),
          );
        });
      }

      if (this.module.getConfiguration('onloadanalysis') === 'onload') {
        this.module.controller.doAnalysis();
      }

      this.resolveReady();
    },

    _getTable(size) {
      var content = [];
      var i;

      content.push(
        '<table><tbody id="table2"><tr>',
        '<th></th>',
        '<th>delta (ppm)</th>',
      );
      for (i = 1; i < size; i++) {
        content.push(`<th>J<sub>${i}-</sub> (Hz)</th>`);
      }
      content.push('</tr>');

      for (i = 0; i < size; i++) {
        content.push(
          '<tr>',
          `<th>${i + 1}</th>`,
          `<td><input type="text" size=4 value=${i + 1} name="delta_${i}">`,
        );
        for (var j = 0; j < i; j++) {
          content.push(
            `<td><input type="text" size=3 value=0 name="coupling_${i}_${j}">`,
          );
        }
        content.push('</tr>');
      }
      content.push(
        '</tbody></table>',
        '<p>From: <input type="text" value=0 name="from" size=4>',
        'to: <input type="text" value=10 name="to" size=4> ppm.',
        '<select id="frequency" name="frequency">',
        '<option value="60">60 MHz</option>',
        '<option value="90">90 MHz</option>',
        '<option value="100">100 MHz</option>',
        '<option value="200">200 MHz</option>',
        '<option value="300">300 MHz</option>',
        '<option value="400" selected>400 MHz</option>',
        '<option value="500">500 MHz</option>',
        '<option value="600">600 MHz</option>',
        '<option value="800">800 MHz</option>',
        '<option value="1000">1000 MHz</option>',
        '</select></p>',
        '<p>Line width: <input type="text" value=1 name="lineWidth" size=4 id="lineWidth" /> Hz.</p>',
        '<p>Number of points: <select id="nbPoints" name="nbPoints">',
        '<option value="1024">1k</option>',
        '<option value="2048">2k</option>',
        '<option value="4096">4k</option>',
        '<option value="8192">8k</option>',
        '<option value="16384" selected>16k</option>',
        '<option value="32768">32k</option>',
        '<option value="65536">64k</option>',
        '<option value="131072">128k</option>',
        '</select></p>',
      );

      return `<form>${content.join('')}</form>`;
    },

    lock() {
      this.locked = true;
      if (this.buttonInst) {
        this.buttonInst.setTitle(
          this.module.getConfiguration('buttonlabel_exec'),
        );
        this.buttonInst.disable();
      }
    },

    unlock() {
      this.locked = false;
      if (this.buttonInst) {
        this.buttonInst.setTitle(this.module.getConfiguration('buttonlabel'));
        this.buttonInst.enable();
      }
    },
  });

  return View;
});
