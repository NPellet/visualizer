/***
 * Contains basic SlickGrid editors.
 * @module Editors
 * @namespace Slick
 */

define(['src/util/util', 'components/spectrum/spectrum', 'jquery'], function(Util) {
    Util.loadCss("./components/spectrum/spectrum.css");
    (function ($) {
        // register namespace
        $.extend(true, window, {
            "Slick": {
                "Editors": {
                    "TextValue": TextValueEditor,
                    "ColorValue": ColorEditor,
                    "Text": TextValueEditor
                }
            }
        });

        function ColorEditor(args) {
            var $cont, $input, defaultValue;
            var that = this;
            this.init = function() {

                console.log('INIT!');
                $cont = $('<div/>');
                $cont.append('<input type="text">');
                $input = $cont.find('input');
                $input.appendTo(args.container)
                    .bind("keydown.nav", function (e) {
                        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    })
                    .focus()
                    .select();
                $input.spectrum({
                    color: $input.val(),
                    change: function(color) {
                        console.log('color: ', color);
                    },
                    move: function(color) {
                        console.log('color: ', color);
                    },
                    show: function() {
                        console.log('show');
                    },
                    hide: function() {
                        console.log('hide');
                    }
                });

                $input.next().first().click();
            };

            this.destroy = function() {
                $cont.remove();
            };

            this.focus = function() {
                $input.focus();
            };

            this.getValue = function() {
                $input.val();
            };

            this.setValue = function(val) {
                $input.val(val);
            };

            this.loadValue = function(item) {
                defaultValue = item.getChildSync(args.column.jpath).value || "";
                $input.val(defaultValue);
                $input.spectrum('set', defaultValue);
                $input[0].defaultValue = defaultValue;
                $input.select();
            };

            this.serializeValue = function () {
                return $input.val();
            };

            this.applyValue = function (item, state) {
                item.getChildSync(args.column.jpath).setValue(state);
            };

            this.isValueChanged = function () {
                return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
            };

            this.validate = function () {
                if (args.column.validator) {
                    var validationResults = args.column.validator($input.val());
                    if (!validationResults.valid) {
                        return validationResults;
                    }
                }

                return {
                    valid: true,
                    msg: null
                };
            };

            this.init();
        }

        function TextValueEditor(args) {
            var $input;
            var defaultValue;
            var scope = this;

            this.init = function () {
                $input = $("<INPUT type=text class='editor-text' />")
                    .appendTo(args.container)
                    .bind("keydown.nav", function (e) {
                        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    })
                    .focus()
                    .select();
            };

            this.destroy = function () {
                $input.remove();
            };

            this.focus = function () {
                $input.focus();
            };

            this.getValue = function () {
                return $input.val();
            };

            this.setValue = function (val) {
                $input.val(val);
            };

            this.loadValue = function (item) {
                defaultValue = item.getChildSync(args.column.jpath).get() || "";
                $input.val(defaultValue);
                $input[0].defaultValue = defaultValue;
                $input.select();
            };

            this.serializeValue = function () {
                return $input.val();
            };

            this.applyValue = function (item, state) {

                if(_.isEmpty(item)) {
                    if(args.column.dataType) {
                        item.type = args.column.dataType;
                        item.value = state;
                        DataObject.check(item, true);
                    }
                    else {
                        return new DataString(state);
                    }
                }
                else {
                    item.getChildSync(args.column.jpath).setValue(state);
                }

            };

            this.isValueChanged = function () {
                return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
            };

            this.validate = function () {
                if (args.column.validator) {
                    var validationResults = args.column.validator($input.val());
                    if (!validationResults.valid) {
                        return validationResults;
                    }
                }

                return {
                    valid: true,
                    msg: null
                };
            };

            this.init();
        }
    })(jQuery);

});

