'use strict';

define(['src/util/color'], function (Color) {

    var FieldConstructor = function () {
    };

    FieldConstructor.prototype.__makeDom = function () {

        var self = this,
            dom = $('<div />'),
            div = $('<div></div>')
                .addClass('form-field')
                .appendTo(dom)
                .on('click', function (event) {
                    self.toggleSelect(event);
                }).on('click', function (event) {

                    event.stopPropagation();

                });


        this.div = div;
        this.fieldElement = div;
        this.dom = dom;

        return dom;
    };

    FieldConstructor.prototype.checkValue = function () {
        if (this.dom) {
            if (!( this.value instanceof Array)) {
                this.value = [0, 0, 0, 1];
            }
            var color = 'rgba(' + this.value.join(',') + ')';
            this.div.html(color);
            this.div.css('background-color', color);

            var brightness = Color.getBrightness(this.value);;
            this.div.css('color', (brightness < 500) ? 'white' : 'black');

        }
    };


    return FieldConstructor;
});