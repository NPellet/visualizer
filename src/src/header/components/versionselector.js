'use strict';

define(['jquery', 'src/header/components/default', 'src/util/versioning', 'src/util/util', 'uri/URI'], function ($, Default, Versioning, Util, URI) {

    function VersionSelector() {
    }

    var versionURL;
    var versions;
    var type;

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
            type = this.options.type || 'query';
        },

        _onClick: function () {
            var that = this;

            this.setStyleOpen(this._open);

            if (this._open) {
                if (currentMenu && (currentMenu !== this) && currentMenu._open)
                    currentMenu.onClick();
                currentMenu = that;

                this.doElements();
            } else {
                this.close();
            }

        },

        doElements: function () {
            var that = this;
            var uri = new URI(document.location.href);
            var query = getQuery(uri);
            var currentVersion;
            if (query.v) {
                currentVersion = query.v;
            } else {
                currentVersion = 'v' + Versioning.version;
            }
            getVersions().then(function (versions) {
                var ul = that.$_elToOpen = $('<ul />'),
                    i = 0,
                    l = versions.length;
                for (; i < l; i++) {
                    var version = versions[i];
                    var bool = currentVersion === version;
                    ul.append(that._buildSubElement(versions[i], bool));
                }
                that.open();
            });
        },

        _buildSubElement: function (version, isSame) {
            var text = (isSame ? '• ' : '') + version;
            var that = this,
                dom = $('<li />').text(text);
            dom.addClass('hasEvent').bind('click', function () {
                that.load(version);
                that.onClick();
            });
            return dom;
        },

        load: function (version) {
            var uri = new URI(document.location.href);
            var query = getQuery(uri);
            if (query.v !== version) {
                setQuery(uri, 'v', version);
                document.location = uri.href();
            }
        }
    });

    function getQuery(uri) {
        var query;
        if(type === 'query') {
            query = uri.query(true);
        } else if (type === 'fragment') {
            query = uri.fragment(true);
        }
        return query;
    }

    function setQuery(uri, prop, val) {
        if(type === 'query') {
            uri.setQuery(prop, val);
        } else if(type === 'fragment') {
            uri.addFragment(prop, val);
        }
        return uri;
    }

    return VersionSelector;

});
