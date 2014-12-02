'use strict';

define([ ], function () {

    var FieldConstructor = function () {
    };

    FieldConstructor.prototype.__makeDom = function () {

        var self = this,
            dom = $('<div />'),
            div = $('<div></div>')
                .addClass('form-field')
                .appendTo(dom)
                .bind('click', function (event) {
                    self.toggleSelect(event);
                }).bind('click', function (event) {

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
                this.value = [ 0, 0, 0, 1 ];
            }
            var color = 'rgba(' + this.value.join(',') + ')';
            this.div.html(color);
            this.div.css('background-color', color);

            // from http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
            var brightness = (this.value[0]/255*299)+(this.value[1]/255*587)+(this.value[2]/255*114);
            this.div.css('color', (brightness < 500) ? 'white' : 'black');

        }
    };


    return FieldConstructor;
});