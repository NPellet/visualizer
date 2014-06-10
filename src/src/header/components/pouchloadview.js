define(['jquery', 'jqueryui', 'src/header/components/default', 'src/util/versioning', 'pouchdb','src/util/util'], function($, ui, Default, Versioning, PouchDB, Util) {

	var Element = function() {};
	$.extend(Element.prototype, Default, {

		initImpl: function() {
            var id = Util.getNextUniqueId();
            var db = new PouchDB('localViews');
            this.dialog = $("<div>").html('<form><label for="name">Name</label><input type="text" name="name" id="'+id+'" class="text ui-widget-content ui-corner-all" />');
            
            this.dialogOptions = {
                modal:true,
                title: "Load view",
                buttons: {
                    "Load": function() {
                        var text = $("#"+id).val();
                        text = text.replace(/[^a-zA-Z0-9-_]*/g,"");
                        db.get(text,function(err,data){
                            var view;
                            if(err)
                                view = new DataObject();
                            else
                                view = new DataObject(data.view,true);
                            Versioning.setViewJSON( view );
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