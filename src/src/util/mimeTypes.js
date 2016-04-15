'use strict';

define(['mime-types'], function (mimeTypes) {
    return {
        lookup: function (filename, fallback) {
            var contentType = mimeTypes.lookup(filename);
            if (!contentType && /\.j?dx$/i.test(filename)) {
                contentType = 'chemical/x-jcamp-dx';
            }
            if (!contentType) {
                contentType = fallback;
            }
            return contentType;
        }
    };
});
