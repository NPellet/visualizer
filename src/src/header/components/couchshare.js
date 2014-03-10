define(['jquery', 'jqueryui', 'src/header/components/default', './couchshare/share', 'forms/button', 'src/util/util'], function($, ui, Default, Sharer, Button, Util) {

	var Element = function() {};
	$.extend(Element.prototype, Default, {

		initImpl: function() {
            
            
            this.dialogOptions = {
                modal:true,
                title:"Share view",
                width: 550,
                height: 150
            };
		},

		_onClick: function() {
                    var that = this;
                    var uniqid = Util.getNextUniqueId();
                    
                    var dialog = $("<div>").html("<h3>Click the share button to make a snapshot of your view and generate a tiny URL</h3>").append(
                        new Button('Share', function() {
                            var button = this;
                            if(!this.options.disabled) {
                                Sharer.share(that.options).done(function(tinyUrl){
                                    $("#"+uniqid).val(tinyUrl).focus().select();
                                    button.disable();
                                }).fail(function(){
                                    $("#"+uniqid).val("error");
                                });
                            }
                        }, {color: 'blue'}).render()
                    ).append(
                        $('<input type="text" id="'+uniqid+'" />').css("width","400px")
                    );
                    dialog.dialog(this.dialogOptions);
		}

	
	});

	return Element;
});