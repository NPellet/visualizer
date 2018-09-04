'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'jsoneditor',
  'src/util/context',
  'jquery',
  'ace/ace'
], function (Default, Util, jsoneditor, Context, $, ace) {
  function View() {
    this._id = Util.getNextUniqueId();
  }

  Util.loadCss('components/jsoneditor/dist/jsoneditor.min.css');

  $.extend(true, View.prototype, Default, {
    init() {
      if (!this.dom) {
        this.dom = $(`<div id="${this._id}"></div>`).css({
          height: '100%',
          width: '100%'
        });
        this.module.getDomContent().html(this.dom);
      }
    },
    blank: {
      value() {
        this.editor.set({});
      }
    },
    inDom() {
      this.dom.empty();

      var mode = this.module.getConfiguration('editable');
      if (mode === 'text') mode = 'code'; // backward compatibility
      this.expand = !!this.module.getConfiguration('expanded', false)[0];
      this.storeObject = !!this.module.getConfiguration(
        'storeObject',
        false
      )[0];
      this.changeInputData(
        DataObject.check(
          JSON.parse(this.module.getConfiguration('storedObject')),
          true
        )
      );

      this.editor = new jsoneditor(document.getElementById(this._id), {
        mode,
        modes: ['view', 'tree', 'code'],
        ace: ace,
        theme: 'ace/theme/textmate',
        onChange: () => {
          var result;
          try {
            result = this.editor.get();
          } catch (e) {
            result = `Invalid JSON: ${e.message}`;
          }
          this.module.controller.sendValue(result, 'onObjectChange');
        },
        onModeChange: () => this.setSendButton(),

        search: this.module.getConfigurationCheckbox('searchBox', 'search')
      });

      if (this.module.getConfigurationCheckbox('sendButton', 'send')) {
        this.setSendButton();
      }

      this.update.value.call(this, this.inputData);
      this.resolveReady();
    },

    setSendButton: function () {
      var sendButton = this.dom
        .find('.jsoneditor-menu')
        .prepend(
          '<button class="send" style="width: 45px; float: left; background: none; font-size: small;">\n    <span style="font-size: 10pt; color: black">Send</span>\n</button>'
        )
        .find('button.send');

      sendButton
        .on('click', () => {
          this.module.controller.sendValue(this.editor.get(), 'onObjectSend');
        })
        .on('mouseenter', function () {
          $(this).css('background-color', '#f0f2f5');
        })
        .on('mouseleave', function () {
          $(this).css('background-color', '#e3eaf6');
        })
        .css('background-color', '#e3eaf6');
    },
    update: {
      value(value) {
        if (this.module.getConfigurationCheckbox('displayValue', 'display')) {
          value = value.get();
        }
        this.changeInputData(value);
        var valNative = this.inputData.resurrect();
        this.editor.set(JSON.parse(JSON.stringify(valNative))); // TODO more investigation (see issue #513)
        if (this.expand && this.editor.expandAll) this.editor.expandAll();
        this.module.controller.sendValue(valNative, 'onObjectChange');
      }
    },
    changeInputData(newData) {
      if (this.inputData === newData) return;
      // var that = this;
      // var id = this.module.getId();

      this.inputData = newData;

      // Need to see how it must be done now
      /* this.module.model.dataListenChange( newData, function() {

             that.update.value.call( that, this );

             }, 'value'); */
    }
  });

  return View;
});
