'use strict';

define(['require', 'modules/default/defaultview', 'src/util/api'], function (require, Default, API) {

    function View() {
    }

    var views = {};

    window.addEventListener('message', function (event) {

        try {
            var message = JSON.parse(event.data);
        } catch(e) {
            return;
        }
        if (message.module !== 'jsmol') {
            return;
        }
        var id = message.id;
        if (!views[id]) {
            console.error('No view with ID ' + id);
            return;
        }
        var view = views[id];
        var atom;
        switch (message.type) {
            case 'ready':
                view.resolveReady();
                break;
            case 'message':
                view.module.controller.onNewMessage(message.message);
                break;
            case 'atomClick':
                atom = view.parseAtom(message.message);
                view.module.controller.onAtomClick(atom);
                break;
            case 'atomHover':
                atom = view.parseAtom(message.message);
                view._doHighlights(atom);
                view.module.controller.onAtomHover(atom);
                break;
            default:
                console.error('Message type not handled: ', message.type);
                break;
        }
    });

    View.prototype = $.extend(true, {}, Default, {

        init: function () {
            var self = this;

            var id = this.module.getId();
            views[id] = this;

            this.dom = $('<iframe>', {src: require.toUrl('./jsmol.html')}).css('border', 0);
            this.module.getDomContent().html(this.dom).css('overflow', 'hidden');

            this._highlights = this._highlights || [];

            this.dom.bind('load', function () {
                self.postMessage('init', {
                    id: id
                });
            });

        },

        onResize: function () {
            this.dom.height(this.height).width(this.width);
            this.postMessage('setSize', {width: this.width, height: this.height});
        },

        blank: {
            data: function () {
                this.postMessage('blank', '');
            }
        },


        update: {
            data: function (data) {
                var self = this;
                self.postMessage('setMolFile', data.get());

                if (self.module.getConfiguration('script')) {
                    self.postMessage('executeScript', [self.module.getConfiguration('script')]);
                }


                //self.postMessage('restoreOrientation', 'lastOrientation');
            }
        },

        onActionReceive: {
            jsmolscript: function (a) {
                this.module.controller.onJSMolScriptReceive(a);
            }
        },

        executeScript: function (src) {
            this.postMessage('executeScript', [src]);
        },

        postMessage: function (type, message) {
            var cw = this.dom.get(0).contentWindow;
            if (cw) {
                cw.postMessage(JSON.stringify({
                    type: type,
                    message: message
                }), '*');
            }
        },

        remove: function (id) {
            delete views[id];
        },

        parseAtom: function(atom) {
            var reg = /^([^\s]+)\s+([^\s]+)\s+([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)/;
            var m = reg.exec(atom);
            return {
                id: m[1],
                label: m[2],
                x: m[3],
                y: m[4],
                z: m[5]
            };
        },

        _doHighlights: function(atom) {
            if(this.lastHoveredAtom) {
                API.highlightId(this.lastHoveredAtom.label, 0);
            }
            API.highlightId(atom.label, 1);
            this.lastHoveredAtom = atom;
        },

        _activateHighlights: function() {

        },

        _drawHighlights: function() {

        }

    });

    return View;

});