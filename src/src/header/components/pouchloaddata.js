'use strict';

define(['jquery', 'src/util/ui', 'src/header/components/default', 'src/util/versioning', 'pouchdb', 'src/util/util'], function ($, ui, Default, Versioning, PouchDB, Util) {
  function Element() {
  }

  Util.inherits(Element, Default, {

    initImpl: function () {
      var id = Util.getNextUniqueId();
      var db = new PouchDB('localDatas');
      this.dialog = $(`<form><label for="name">Name</label><input type="text" name="name" id="${id}" class="text ui-widget-content ui-corner-all" />`);

      this.dialogOptions = {
        title: 'Load data',
        buttons: {
          Load: function () {
            var text = $(`#${id}`).val();
            text = text.replace(/[^a-zA-Z0-9-_]*/g, '');
            db.get(text, function (err, data) {
              var datas;
              if (err)
                datas = new DataObject();
              else
                datas = new DataObject(data.data, true);
              Versioning.setDataJSON(datas);
            });
            $(this).dialog('close');
          },
          Cancel: function () {
            $(this).dialog('close');
          }
        }
      };
    },

    _onClick: function () {
      ui.dialog(this.dialog, this.dialogOptions);
    }

  });

  return Element;
});
