'use strict';

define(['src/util/util', 'components/farbtastic/src/farbtastic'], function (Util) {

    var FieldConstructor = function () {
    };

    FieldConstructor.prototype.__makeDom = function () {

        var fonts = Util.getWebsafeFonts();

        var self = this,
            dom = $('<div />'),
            value = this.value;

        var ul = $('<ul />').addClass('form-textstyle-ul'),
            boldBtn = $('<li><span>B</span></li>').addClass('btn').attr('data-style', 'bold'),
            italicBtn = $('<li><span>I</span></li>').addClass('btn').attr('data-style', 'italic'),
            underlineBtn = $('<li><span>U</span></li>').addClass('btn').attr('data-style', 'underline'),
            fontfaceBtn = $('<li><select></select></li>').children('select').attr('data-style', 'fontface').append(function () {
                var opts = [];
                for (var i = 0, l = fonts.length; i < l; i += 1) {
                    opts.push('<option value="' + fonts[i].key + '">' + fonts[i].title + '</option>');
                }
                return opts;
            }),

            fontsizeBtn = $('<li><select></select></li>').children('select').attr('data-style', 'fontsize').append(function () {
                var opts = [];
                for (var i = 10, l = 20; i < l; i += 1) {
                    opts.push('<option value="' + i + '">' + i + ' pts</option>');
                }
                return opts;
            }),

            fontcolorBtn = $('<li><span>A</span></li>').addClass('form-textstyle-colorli').bind('click', function () {

                fontcolorDiv.toggle();
                $(this).toggleClass('selected');
            }),


            backgroundcolorBtn = $('<li><span></span></li>').addClass('form-textstyle-bgcolorli').bind('click', function () {

                fontcolorDiv2.toggle();
                $(this).toggleClass('selected');
            }),

            fontcolorDiv = $('<div />').addClass('form-textstyle-color'),
            fontcolorDiv2 = $('<div />').addClass('form-textstyle-color');


        ul.on('click', '.btn', function () {

            value[$(this).attr('data-style')] = !$(this).hasClass('selected');

            self.checkValue();
        });

        ul.on('change', 'select', function () {

            value[$(this).attr('data-style')] = $(this).attr('value');

            self.checkValue();
        });

        this.farb = $.farbtastic(fontcolorDiv, {});
        this.farb2 = $.farbtastic(fontcolorDiv2, {});


        ul.append(boldBtn);
        ul.append(italicBtn);
        ul.append(underlineBtn);
        ul.append(fontfaceBtn);
        ul.append(fontsizeBtn);
        ul.append(fontcolorBtn);
        ul.append(backgroundcolorBtn);

        this.div = ul;
        this.dom = dom;
        this.fieldElement = ul;
        this.checkboxes = {};

        this.checkValue();

        this.farb.linkTo(function () {
            value.color = arguments[0];
            self.checkValue();
        });

        this.farb2.linkTo(function () {
            value.bgcolor = arguments[0];
            self.checkValue();
        });


        dom.append(ul, fontcolorDiv, fontcolorDiv2);
        return dom;
    };

    FieldConstructor.prototype.focus = function () {

        this.fieldElement.find('input:first').focus();
        this.select();
    };

    FieldConstructor.prototype.checkValue = function () {

        if (!( this.value instanceof Object )) {
            this.setValueSilent({});
        }


        if (this.div) {
            for (var i in this.value) {

                if (!this.value.hasOwnProperty(i)) {
                    continue;
                }

                switch (i) {

                    case 'bold':
                        this.div.find('li[data-style="bold"]')[this.value[i] ? 'addClass' : 'removeClass']('selected');
                        break;

                    case 'italic':
                        this.div.find('li[data-style="italic"]')[this.value[i] ? 'addClass' : 'removeClass']('selected');
                        break;

                    case 'underline':
                        this.div.find('li[data-style="underline"]')[this.value[i] ? 'addClass' : 'removeClass']('selected');
                        break;

                    case 'color':
                        this.div.find('li.form-textstyle-colorli').children().css('color', this.value[i]);
                        this.farb.setColor(this.value[i]);
                        break;

                    case 'bgcolor':
                        this.div.find('li.form-textstyle-bgcolorli').children().css('background-color', this.value[i]);
                        this.farb2.setColor(this.value[i]);
                        break;

                    case 'fontface':
                        this.div.find('select[data-style="fontface"]').attr('value', this.value[i]);
                        break;

                    case 'fontsize':
                        this.div.find('select[data-style="fontsize"]').attr('value', this.value[i]);
                        break;
                }
            }
        }

    };

    FieldConstructor.prototype.getOptions = function () {
        return this.combooptions || false;
    };

    FieldConstructor.prototype.setOptions = function (options) {
        this.combooptions = options;
    };

    return FieldConstructor;

});
