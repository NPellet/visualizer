define(['modules/default/defaultview', "src/util/util", "jquery", "components/onde/src/onde", "forms/button"], function(Default, Util, $, onde, Button) {

    function view() {
        this._id = Util.getNextUniqueId();
    }

    Util.loadCss('components/onde/src/onde.css');

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var that = this;
			this.dom = $('<form id="' + this._id + '">').css({
				height: '100%',
				width: '100%',
				textAlign: "center"
			}).append($('<div class="onde-panel">'));
			
			var hasButton = this.module.getConfiguration("hasButton") || [];
			if(hasButton[0]) {
				this.dom.append(new Button(this.module.getConfiguration('button_text'), function() {
					that.exportForm();
				}, {color: 'green'}).render().css({
					marginTop: "10px"
				}));
			}
			
            this.dom.on("submit",function(e){
				e.preventDefault();
				that.exportForm();
				return false;
			});
            this.inputVal = {};

        },
        blank: {},
        inDom: function() {
			this.module.getDomContent( ).html(this.dom);
			this.initForm();
            this.resolveReady();
        },
		initForm: function() {
			this.form = new onde.Onde(this.dom);
            this.renderForm();
		},
        update: {
            inputValue: function(value) {
				this.inputObj = value;
                this.inputVal = value.resurrect();
                this.renderForm();
            },
            schema: function(value) {
                this.module.controller.inputSchema = value;
                this.renderForm();
            }
        },
        renderForm: function() {
            var schema = this.module.controller.getSchema();
            this.form.render(schema, this.inputVal, {});
        },
        exportForm: function() {
            var data = this.form.getData();
            if(data.errorCount)
				return;
            else
                this.module.controller.onSubmit(data.data);
        }
    });

    return view;
});