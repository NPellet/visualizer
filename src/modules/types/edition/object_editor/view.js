define(['modules/default/defaultview', 'src/util/util', 'components/jsoneditor/jsoneditor.min', 'src/util/context', 'jquery'], function (Default, Util, jsoneditor, Context, $) {

    function View() {
        this._id = Util.getNextUniqueId();
    }

    Util.loadCss('components/jsoneditor/jsoneditor.min.css');

    View.prototype = $.extend(true, {}, Default, {
        init: function () {
            var that = this;
            if (!this.dom) {
                this.dom = $('<div id="' + this._id + '"></div>').css({
                    height: '100%',
                    width: '100%'
                });
                this.module.getDomContent().html(this.dom);
                Context.listen(this.module.getDomWrapper().get(0), [], function (contextDom) {
                    var li = $('<li><a>Change editor type</a></li>');

                    var ul = $('<ul/>').appendTo(li);

                    var elements = {Read: 'view', Edit: 'tree', Text: 'text'};
                    for (var i in elements) {
                        var li2 = $('<li>').appendTo(ul);
                        li2.html('<a>' + i + '</a>');
                    }
                    $(contextDom).append(li);
                    li.bind('click', function (event) {
                        var mode = elements[event.target.text];
                        that.editor.setMode(mode);
                        that.module.definition.configuration.groups.group[0].editable[0] = mode; // temporary waiting for API
                    });
                });
            }

        },
        blank: {
            value: function () {
                this.editor.set({});
            }
        },
        inDom: function () {
            var that = this;
            this.dom.empty();

            var mode = this.module.getConfiguration('editable');
            this.expand = !!this.module.getConfiguration('expanded', false)[0];
            this.storeObject = !!this.module.getConfiguration('storeObject', false)[0];
            this.changeInputData(DataObject.check(JSON.parse(this.module.getConfiguration('storedObject')), true));

            this.editor = new jsoneditor(document.getElementById(this._id), {mode: mode, change: function () {
                that.module.controller.sendValue(that.editor.get(), 'onObjectChange');
            }, module: this.module});

            var sendButton = this.dom.find('.menu').prepend('<button class="send" style="width: 45px; float: left; background: none; font-size: small;">\n    <span style="font-size: 10pt;">Send</span>\n</button>').find('button.send');

            sendButton.on('click', function () {
                that.module.controller.sendValue(that.editor.get(), 'onObjectSend');
            })
                .on('mouseenter', function () {
                    $(this).css('background-color', '#f0f2f5');
                })
                .on('mouseleave', function () {
                    $(this).css('background-color', '#e3eaf6');
                })
                .css('background-color', '#e3eaf6');


            this.update.value.call(this, this.inputData);
            this.resolveReady();
        },
        update: {
            value: function (value) {
                this.changeInputData(value);
                var valNative = this.inputData.resurrect();
                this.editor.set(valNative);
                if (this.expand && this.editor.expandAll)
                    this.editor.expandAll();
                this.module.controller.sendValue(valNative, 'onObjectChange');
            }
        },
        changeInputData: function (newData) {
            if (this.inputData === newData)
                return;
            //var that = this;
            //var id = this.module.getId();

            this.inputData = newData;

            // Need to see how it must be done now
            /*this.module.model.dataListenChange( newData, function() {

             that.update.value.call( that, this );

             }, 'value');	*/
        }
    });

    return View;
});