'use strict';

define(['require', 'modules/default/defaultview', 'src/util/api'], function (require, Default, API) {

    function View() {
    }

    var views = {};

    window.addEventListener('message', function (event) {

        try {
            var message = JSON.parse(event.data);
        } catch (e) {
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
            case 'error':
                console.log('An error message was received', message.message);
                break;
            case 'execSync':
                view.module.controller.onSyncExecDone(message.message);
                break;
            default:
                console.error('Message type not handled: ', message.type);
                break;
        }
    });

    $.extend(true, View.prototype, Default, {

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
            this.postMessage('setSize', {
                width: this.width,
                height: this.height
            });
        },

        inDom: function () {
            var that = this;
            this.dom.parent().on('mouseleave', function () {
                if (that.lastHoveredAtom) {
                    API.highlightId(that.lastHoveredAtom.label, 0);
                    that.lastHoveredAtom = null;
                }
            });
        },

        blank: {
            data: function () {
                this.postMessage('blank', '');
            }
        },


        update: {
            data: function (data) {
                var self = this;
                this.module.data = data;
                self.postMessage('setMolFile', {
                    _modelLoad: data.get(),
                    _lattice: data._lattice,
                    _script: data._script
                });

                if (self.module.getConfiguration('script')) {
                    self.postMessage('executeScript', [self.module.getConfiguration('script')]);
                }
                if (self.module.getConfiguration('syncScript')) {
                    self.postMessage('executeScriptSync', [self.module.getConfiguration('syncScript')]);
                }
                this._activateHighlights();

                //self.postMessage('restoreOrientation', 'lastOrientation');
            }
        },

        onActionReceive: {
            jsmolscript: function (a) {
                this.executeScript(a);
            },
            jsmolscriptSync: function (a) {
                this.executeScriptSync(a);
            }
        },

        executeScriptSync: function (src) {
            this.postMessage('executeScriptSync', [src]);
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

        parseAtom: function (atom) {
            var reg = /^([^\s]+)\s+([^\s]+)\s+([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)/;
            var m = reg.exec(atom);
            return {
                id: m[2],
                label: m[1],
                x: m[3],
                y: m[4],
                z: m[5]
            };
        },

        _doHighlights: function (atom) {
            if (this.lastHoveredAtom) {
                if (this.lastHoveredAtom.label === atom.label) {
                    this._undoHighlightsDebounced();
                    return;
                }
                API.highlightId(this.lastHoveredAtom.label, 0);
            }
            this._undoHighlights();
            API.highlightId(atom.label, 1);
            this.lastHoveredAtom = atom;
            this._undoHighlightsDebounced();
        },

        _undoHighlights: function () {
            _undoHighlights.call(this);
        },

        _undoHighlightsDebounced: function () {
            _undoHighlightsDebounced.call(this);
        },

        _activateHighlights: function () {
            var that = this;
            if (!this.module.data._highlight) return;
            var hl = _(this.module.data._highlight).flatten().uniq().value();

            that._highlighted = [];

            API.killHighlight(this.module.getId());

            for (var i = 0; i < hl.length; i++) {
                (function (i) {
                    API.listenHighlight({_highlight: hl[i]}, function (onOff, key) {
                        if (!key instanceof Array) {
                            key = [key];
                        }
                        if (onOff) {
                            that._highlighted = _(that._highlighted).push(key).flatten().uniq().value();
                        }
                        else {
                            that._highlighted = _.filter(that._highlighted, function (val) {
                                return key.indexOf(val) === -1;
                            });
                        }
                        that._drawHighlight();
                    }, false, that.module.getId());
                })(i);
            }
        },

        _drawHighlight: function () {
            var script = 'select *.*; halos off;';
            if (this._highlighted && this._highlighted.length) {
                script += 'select ' + this._highlighted.join(',') + '; halos on;';
            }
            this.executeScript(script);
        }


    });

    function _undoHighlights() {
        if (this.lastHoveredAtom) {
            API.highlightId(this.lastHoveredAtom.label, 0);
            this.lastHoveredAtom = null;
        }
    }

    var _undoHighlightsDebounced = _.debounce(_undoHighlights, 250);

    return View;

});
