'use strict';

define(['modules/default/defaultview'], function (Default) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init: function () {
            this.dom = $('<iframe>');

            var self = this;
            this.dom.load(function () { // we remove the loading message
                if (self.dom.attr('src') != 'about:blank') {
                    if (self._loadingTimeout) clearTimeout(self._loadingTimeout);
                    else self.hideLoading();
                }
            });

            this.module.getDomContent().html(this.dom);
            this.resolveReady();
        },
        blank: {
            url: function () {
                this.dom.attr('src', 'about:blank');
            }
        },
        update: {
            url: function (moduleValue) {
                var self = this;
                if (self._loadingTimeout) clearTimeout(self._loadingTimeout);
                this._loadingTimeout = setTimeout(function () {
                    self._loadingTimeout = null;
                    self.showLoading();
                }, 500);
                this.dom.attr('src', moduleValue.get());
            }
        }
    });

    return View;

});
