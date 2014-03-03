define(['jquery', 'jqueryui', 'src/header/components/default', './couchshare/share', 'forms/button', 'src/util/util'], function($, ui, Default, Sharer, Button, Util) {

	var Element = function() {};
        
        var shareOptions = {
            couchUrl : "http://visualizer.epfl.ch",
            database : "x",
            tinyUrl : "http://visualizer.epfl.ch/tiny"
        };
        
	$.extend(Element.prototype, Default, {

		initImpl: function() {
            
            
            this.dialogOptions = {
                modal:true,
                title:"Feedback",
                width: 750,
                height: 350
            };
		},

		_onClick: function() {
                    var uniqid = Util.getNextUniqueId();
                    
                    var message = $("<span>").attr("id",uniqid+"-message").css("color","red");
                    
                    var dialog = $("<div>").html("<h2>Do you have a comment on the visualizer ? Did you find a bug ?</h2><p>Put your comment here and we will be notified.<br>A snapshot of you view and data will also be sent to us so feel free to describe exactly what you did and what happened !</p>"+
                                                 '<table><tr><td>Title : </td><td><input type="text" id="'+uniqid+'-title" style="width:500px" /></td></tr><tr><td>Description : </td><td><textarea id="'+uniqid+'-description" rows="12" cols="80"></textarea></td></tr></table>').append(
                        new Button('Send', function() {
                            var button = this;
                            if(!this.options.disabled) {
                                Sharer.share(shareOptions).done(function(tinyUrl){
                                    var title = $("#"+uniqid+"-title").val();
                                    var description = $("#"+uniqid+"-description").val();
                                    var json = {
                                        title: title,
                                        body: description+"\n\nTestcase: "+tinyUrl
                                    };
                                    $.ajax({
                                        type: "POST",
                                        url: "http://visualizer.epfl.ch/github/api/issue",
                                        contentType: "application/json",
                                        dataType: "json",
                                        data: JSON.stringify(json),
                                        success: function(data) {
                                            console.log("success", data);
                                            message.html("Thank you for your feedback ! You can follow your issue <a target=\"_blank\" href=\""+data.description+"\">here</a>");
                                            button.disable();
                                        },
                                        error: function(data) {
                                            message.html("ERROR");
                                            console.log("error",data);
                                        }
                                    });
                                }).fail(function(data){
                                    message.html("ERROR");
                                    console.log("error", data);
                                });
                            }
                        }, {color: 'blue'}).render()
                    ).append(message);
                    dialog.dialog(this.dialogOptions);
		}

	
	});

	return Element;
});