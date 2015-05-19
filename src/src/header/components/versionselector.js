'use strict';

define(['jquery', 'src/header/components/default', 'src/util/versioning', 'src/util/util', 'uri/URI'], function ($, Default, Versioning, Util, URI) {

    function VersionSelector() {
    }

    var versionURL;
    var versions;

    var currentMenu;

    function getVersions() {
        if (!versions) {
            versions = Promise.resolve($.getJSON(versionURL));
        }
        return versions;
    }

    Util.inherits(VersionSelector, Default, {

        initImpl: function () {
            versionURL = this.options.url;
        },

        _onClick: function () {

            this.setStyleOpen(this._open);

            if (this._open) {
                if (currentMenu && (currentMenu !== this) && currentMenu._open)
                    currentMenu.onClick();
                currentMenu = this;

                this.doElements();
            } else {
                this.close();
            }

        },

        doElements: function () {
            var self = this;
            var uri = new URI(document.location.href);
            var query = uri.query(true);
            var currentVersion;
            if (query.v) {
                currentVersion = query.v;
            } else {
                currentVersion = 'v' + Versioning.version;
            }
            getVersions().then(function (versions) {
                var ul = self.$_elToOpen = $('<ul />'),
                    i = 0,
                    l = versions.length;
                for (; i < l; i++) {
                    var version = versions[i];
                    var bool = currentVersion === version;
                    ul.append(self._buildSubElement(versions[i], bool));
                }
                self.open();
            });
        },

        _buildSubElement: function (version, isSame) {
            var text = (isSame ? '• ' : '') + version;
            var self = this,
                dom = $('<li />').text(text);
            dom.addClass('hasEvent').bind('click', function () {
                self.load(version);
                self.onClick();
            });
            return dom;
        },

        load: function (version) {
            var uri = new URI(document.location.href);
            var query = uri.query(true);
            if (query.v !== version) {
                uri.setQuery('v', version);
                document.location = uri.href();
            }
        }
    });

    return VersionSelector;

});
