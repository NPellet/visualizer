'use strict';

define(['modules/default/defaultview', 'src/util/color', 'jquery-ui/progressbar'], function (Default, Color) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {

        init: function () {
            var self = this;
            this.currentValue = null;
            this.currentTotal = null;
            this.mode = this.module.getConfiguration('progressmode');
            var color = this.module.getConfiguration('barcolor');

            var progressBar = this.progressBar = $('<div>').css({
                position: 'relative'
            });
            var options = {
                value: 0
            };
            if (this.module.getConfigurationCheckbox('showprogress', 'show')) {
                var progressDiv = $('<div>').css({
                    position: 'absolute',
                    left: '50%',
                    top: '4px',
                    fontWeight: 'bold'
                });
                progressBar.append(progressDiv);
                options.change = function () {
                    if (self.mode === 'percent') {
                        progressDiv.text(Math.round(progressBar.progressbar('value') * 100) / 100 + '%');
                    } else {
                        progressDiv.text(self.currentValue + ' / ' + self.currentTotal);
                    }
                };
            }
            progressBar.progressbar(options);

            progressBar.find('.ui-progressbar-value').css({
                background: Color.getColor(color)
            });

            this.module.getDomContent().html(progressBar);
            this.resolveReady();
        },

        //TODO implement blank
        blank: {
            progress: function () {

            },
            total: function () {

            }
        },

        update: {
            progress: function (progress) {
                if (this.mode === 'percent') {
                    this.progressBar.progressbar('value', progress.get() * 100);
                } else {
                    this.currentValue = progress.get();
                    this.renderValue();
                }
            },
            total: function (total) {
                this.currentTotal = total.get();
                this.renderValue();
            }
        },

        renderValue: function () {
            if (this.currentTotal >= 0 && this.currentValue >= 0) {
                this.progressBar.progressbar('value', this.currentValue / this.currentTotal * 100);
            }
        }
    });

    return View;

});
