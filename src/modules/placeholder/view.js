'use strict';

define(['modules/default/defaultview'], function (Default) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    inDom() {
      const data = this.module.placeholderData;
      const dom = $('<section></section>');
      dom.append('<h1>Placeholder</h1>');
      dom.append(
        '<p>This is being displayed instead of a module that could not be loaded. Removing this placeholder will also remove the original module from the view.</p>',
      );
      dom.append(
        $('<p></p>')
          .append('<span class="ci-module-placeholder-label">URL: </span>')
          .append($('<span></span>').text(this.module.definition.url)),
      );
      dom.append(
        $('<p></p>')
          .append('<span class="ci-module-placeholder-label">Error: </span>')
          .append($('<span></span>').text(data.error?.stack || data.error)),
      );
      this.module.getDomContent().html(dom);
    },
  });

  return View;
});
