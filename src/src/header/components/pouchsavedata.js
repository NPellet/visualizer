'use strict';

define([
  'jquery',
  'src/util/ui',
  'src/header/components/default',
  'src/util/versioning',
  'pouchdb',
  'src/util/util',
], function ($, ui, Default, Versioning, PouchDB, Util) {
  function Element() {}

  Util.inherits(Element, Default, {
    initImpl() {
      var id = Util.getNextUniqueId();
      var db = new PouchDB('localDatas');
      this.dialog = $(
        `<form><label for="name">Name</label><input type="text" name="name" id="${id}" class="text ui-widget-content ui-corner-all" />`,
      );

      this.dialogOptions = {
        title: 'Save data',
        buttons: {
          Save() {
            var text = $(`#${id}`).val();
            text = text.replaceAll(/[^a-zA-Z0-9-_]*/g, '');
            var data = JSON.parse(Versioning.getDataJSON());
            db.get(text, function (event, otherDoc) {
              db.put({ data }, text, otherDoc ? otherDoc._rev : undefined);
            });
            $(this).dialog('close');
          },
          Cancel() {
            $(this).dialog('close');
          },
        },
      };
    },

    _onClick() {
      ui.dialog(this.dialog, this.dialogOptions);
    },
  });

  return Element;
});
