'use strict';

define(['jquery', 'src/util/ui', 'src/header/components/default', 'src/util/versioning', 'pouchdb', 'src/util/util'], function ($, ui, Default, Versioning, PouchDB, Util) {
  function Element() {
  }

  Util.inherits(Element, Default, {

    initImpl: function () {
      var id = Util.getNextUniqueId();
      var db = new PouchDB('localViews');
      this.dialog = $(`<form><label for="name">Name</label><input type="text" name="name" id="${id}" class="text ui-widget-content ui-corner-all" />`);

      this.dialogOptions = {
        title: 'Load view',
        buttons: {
          Load: function () {
            var text = $(`#${id}`).val();
            text = text.replace(/[^a-zA-Z0-9-_]*/g, '');
            db.get(text, function (err, data) {
              var view;
              if (err)
                view = new DataObject();
              else
                view = new DataObject(data.view, true);
              Versioning.setViewJSON(view);
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
