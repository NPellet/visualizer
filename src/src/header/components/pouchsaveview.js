define(['jquery', 'jqueryui', 'src/header/components/default', 'src/util/versioning', 'pouchdb','src/util/util'], function($, ui, Default, Versioning, PouchDB, Util) {

	var Element = function() {};
	$.extend(Element.prototype, Default, {

		initImpl: function() {
            var id = Util.getNextUniqueId();
            var db = new PouchDB('localViews');
            this.dialog = $("<div>").html('<form><label for="name">Name</label><input type="text" name="name" id="'+id+'" class="text ui-widget-content ui-corner-all" />');
            
            this.dialogOptions = {
                modal:true,
                title:"Save view",
                buttons: {
                    "Save": function() {
                        var text = $("#"+id).val();
                        text = text.replace(/[^a-zA-Z0-9-_]*/g,"");
                        var view = JSON.parse(Versioning.getViewJSON());
                        db.get(text, function(err, otherDoc) {
                                db.put({view:view}, text, otherDoc ? otherDoc._rev : undefined);
                          });
                        $(this).dialog("close");
                    },
                    "Cancel": function() {
                        $(this).dialog("close");
                    }
                }
            };
		},

		_onClick: function() {
            this.dialog.dialog(this.dialogOptions);
		}

	
	});

	return Element;
});