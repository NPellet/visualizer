'use strict';

define(['modules/default/defaultview'], function (Default) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    inDom() {
      const data = this.module.definition.placeholderData;
      const dom = $('<section></section>');
      dom.append('<h1>Placeholder</h1>');
      dom.append(
        '<p>This module is being displayed instead of another one that could not be loaded.</p>',
      );
      if (data) {
        dom.append(
          $('<p></p>')
            .append('<span class="ci-module-placeholder-label">URL: </span>')
            .append($('<span></span>').text(data.url)),
        );
        dom.append(
          $('<p></p>')
            .append('<span class="ci-module-placeholder-label">Error: </span>')
            .append($('<span></span>').text(data.error)),
        );
      }
      this.module.getDomContent().html(dom);
    },
  });

  return View;
});
