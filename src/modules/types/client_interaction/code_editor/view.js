define(['modules/default/defaultview', "src/util/util", "ace/ace", "src/util/context", "jquery"], function(Default, Util, ace, Context, $) {

    function view() {
    }

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            
            this._id = Util.getNextUniqueId();
            this._code = new DataObject({type:"string",value:""});
            
            var table = $('<table>').css({
                height: '100%',
                width: '100%'
            });
            var editorRow = $('<tr>').appendTo(table).css("height","auto");
            this.buttonRow = $('<tr>').appendTo(table).css("height","30px");
            this.editorCell = $('<td>').appendTo(editorRow);
            this.buttonCell = $('<td>').appendTo(this.buttonRow).css("text-align","center");
            
            this.module.getDomContent( ).html(table);


            this.onReady = $.Deferred();
        },
        blank: {},
        inDom: function() {
            var self = this;
            var initVal = this.module.getConfiguration('script') || "";
            this._code.value = initVal;
            
            if(this.module.getConfiguration('iseditable')[0]) {
                this.editable=true;
                $('<div id="' + this._id + '"></div>').css("height","100%").css("width","100%").appendTo(this.editorCell);
                this.editor = ace.edit(this._id);
                var mode = "./mode/" + this.module.getConfiguration('mode');
                
                this.editor.getSession().setMode(mode);
                this.editor.setValue(initVal, -1);
                this.editor.getSession().on('change', function() {
                    self.editorChanged();
                });
            }
            
			var hasButton = this.module.getConfiguration("hasButton");
			if(hasButton==="button") {
				this.buttonCell.append(
					$("<span>"+this.module.getConfiguration('btnvalue')+"</span>")
					.addClass("form-button")
					.on("click",function(){
						self.module.controller.onButtonClick(self._code);
					})
				);
			}
			else {
				this.buttonRow.remove();
			}
            this.onReady.resolve();
        },
        update: {
            value: function(value) {
                var val = value.get();
                this._code.value = val;
                if(this.editable) {
                    this.editor.setValue(val);
                    this.editorChanged();
                }
            }
        },
        onResize : function() {
            if(this.editable) this.editor.resize();
        },
        editorChanged : function() {
            var val = this.editor.getValue();
            this._code.value = val;
            this.module.definition.configuration.groups.group[0].script[0] = val;
            this.module.controller.onEditorChanged(this._code);
        }

    });

    return view;
});