'use strict';

define(() => {
  // https://jquery.com/upgrade-guide/3.5/
  const rxhtmlTag =
    /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^/\0>\u0020\t\r\n\f]*)[^>]*)\/>/gi;

  return function jqueryPrefilter(html) {
    // Self-closing tags are invalid except for void elements like input
    const filteredHtml = html.replaceAll(rxhtmlTag, '<$1></$2>');
    if (filteredHtml !== html) {
      // Ignore svg content because it is actually XML
      const cleanedHtml = html
        .replaceAll(/<svg[^>]*>(.*?)<\/svg>/gs, '')
        .trim();

      const result = rxhtmlTag.exec(cleanedHtml);
      if (cleanedHtml && result && result[0] !== cleanedHtml) {
        return {
          html: filteredHtml,
          warn: true,
        };
      }
    }
    return {
      html,
      warn: false,
    };
  };
});
