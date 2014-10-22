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
                    preferredFormat: 'hex',
                    change: function(color) {
                        console.log('color: ', color);
                        args.commitChanges();
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
                defaultValue = item.getChildSync(args.column.jpath);
                if(defaultValue) {
                    defaultValue = defaultValue.value || '#000000';
                }
                else {
                    defaultValue = '#000000';
                }
                $input.val(defaultValue);
                $input.spectrum('set', defaultValue);
                $input[0].defaultValue = defaultValue;
                $input.select();
            };

            this.serializeValue = function () {
                return $input.val();
            };


            this.applyValue = function (item, state) {
                var isNew = _.isEmpty(item);
                DataObject.check(item, true);
                var newState = {
                    type: 'color',
                    value: state
                };

                if(isNew) {
                    return newState;
                }
                else {
                    args.grid.module.model.dataSetChildSync(item, args.column.jpath, newState);
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
                defaultValue = item.getChildSync(args.column.jpath);
                defaultValue = defaultValue ? defaultValue.get() || "" : "";
                $input.val(defaultValue);
                $input[0].defaultValue = defaultValue;
                $input.select();
            };

            this.serializeValue = function () {
                return $input.val();
            };

            this.applyValue = function (item, state) {
                var isNew = _.isEmpty(item);
                DataObject.check(item, true);
                var newState;

                if(args.column.dataType) {
                    newState = {
                        type: args.column.dataType,
                        value: state
                    };

                }
                else {
                    newState = state;
                }

                if(isNew) {
                    return newState;
                }
                else {
                    args.grid.module.model.dataSetChildSync(item, args.column.jpath, newState);
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

