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
                    "Text": TextValueEditor,
                    "SpecialNativeObject": SpecialNativeObjectEditor
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
                        console.log('change');
                        console.log('color: ', color);
                        $input.spectrum('hide');
                        args.commitChanges();
                    },
                    move: function(color) {
                        console.log('move');
                        console.log('color: ', color);
                    },
                    show: function() {
                        console.log('show');
                    },
                    hide: function() {
                        console.log('hide');
                        args.commitChanges();
                    },
                    localStorageKey: 'visualizer-spectrum',
                    showPalette: true,
                    showSelectionPalette: true,
                    palette: []
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
            this.args = args;
            this.init = defaultInit;
            this.destroy = defaultDestroy;
            this.focus = defaultFocus;
            this.getValue = defaultGetValue;
            this.setValue = defaultSetValue;
            this.loadValue = defaultLoadValue;
            this.serializeValue = defaultSerializeValue;
            this.isValueChanged = defaultIsValueChanged;
            this.validate = defaultValidate;

            this.applyValue = function(item, state) {
                var isNew = _.isEmpty(item);
                DataObject.check(item, true);
                var newState;

                if(this.args.column.dataType) {
                    newState = {
                        type: this.args.column.dataType,
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
                    this.args.grid.module.model.dataSetChildSync(item, this.args.column.jpath, newState);
                }
            };

            this.init();
        }


        function SpecialNativeObjectEditor(args) {
            this.args = args;
            this.init = defaultInit;
            this.destroy = defaultDestroy;
            this.focus = defaultFocus;
            this.getValue = defaultGetValue;
            this.setValue = defaultSetValue;
            this.loadValue = defaultLoadValue;
            this.serializeValue = defaultSerializeValue;
            this.applyValue = defaultApplyValue;
            this.isValueChanged = defaultIsValueChanged;
            this.validate = defaultValidate;
            this.init();
        }
    })(jQuery);

    function defaultValidate() {
        if (this.args.column.validator) {
            var validationResults = this.args.column.validator(this.$input.val());
            if (!validationResults.valid) {
                return validationResults;
            }
        }

        return {
            valid: true,
            msg: null
        };
    }

    function defaultIsValueChanged() {
        return (!(this.$input.val() == "" && this.defaultValue == null)) && (this.$input.val() != this.defaultValue);
    }

    function defaultApplyValue(item, state) {
        var isNew = _.isEmpty(item);
        DataObject.check(item, true);
        var newState = state;

        if(isNew) {
            return newState;
        }
        else {
            this.args.grid.module.model.dataSetChildSync(item, this.args.column.jpath, newState);
        }
    }

    function defaultSerializeValue() {
        return this.$input.val();
    }

    function defaultLoadValue(item) {
        this.defaultValue = item.getChildSync(this.args.column.jpath);
        this.defaultValue = this.defaultValue ? this.defaultValue.get() || "" : "";
        this.$input.val(this.defaultValue);
        this.$input[0].defaultValue = this.defaultValue;
        this.$input.select();
    }

    function defaultSetValue(val) {
        this.$input.val(val);
    }

    function defaultGetValue() {
        return this.$input.val();
    }

    function defaultInit(args) {
        this.$input = $("<INPUT type=text class='editor-text' />")
            .appendTo(this.args.container)
            .bind("keydown.nav", function (e) {
                if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                    e.stopImmediatePropagation();
                }
            })
            .focus()
            .select();
    }

    function defaultDestroy() {
        this.$input.remove();
    }

    function defaultFocus() {
        this.$input.focus();
    }



});

