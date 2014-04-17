define(['modules/default/defaultview', "src/util/util", "src/util/context", "jquery", "components/onde/src/onde"], function(Default, Util, Context, $, onde) {

    function view() {
        this._id = Util.getNextUniqueId();
    }

    Util.loadCss('components/onde/src/onde.css');

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var that = this;
            if (!this.dom) {
                this.dom = $('<form id="' + this._id + '"></form>').css({
                    height: '100%',
                    width: '100%'
                }).append($('<div class="onde-panel">')).append($('<button>Export</button>').on('click',function(e){
                    e.preventDefault();
                    that.exportForm();
                }));
                this.module.getDomContent( ).html(this.dom);
            }
            
            this.inputVal = {};

            this.onReady = $.Deferred();
        },
        blank: {},
        inDom: function() {
            this.form = new onde.Onde(this.dom);
            this.renderForm();
            this.onReady.resolve();
        },
        update: {
            inputValue: function(value) {
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
                return; //TODO display error
            else
                this.module.controller.onSubmit(data.data);
        }

    });

    return view;
});