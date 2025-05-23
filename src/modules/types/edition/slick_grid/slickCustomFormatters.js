'use strict';

/** *
 * Contains basic SlickGrid formatters.
 *
 * NOTE:  These are merely examples.  You will most likely need to implement something more
 *        robust/extensible/localizable/etc. for your use!
 *
 * @module Formatters
 * @namespace Slick
 */

(function ($) {
  // register namespace
  $.extend(true, window, {
    Slick: {
      Formatters: {
        PercentComplete: PercentCompleteFormatter,
        PercentCompleteBar: PercentCompleteBarFormatter,
        YesNo: YesNoFormatter,
        Checkmark: CheckmarkFormatter,
      },
    },
  });

  function PercentCompleteFormatter(row, cell, value) {
    if (value == null || value === '') {
      return '-';
    } else if (value < 50) {
      return `<span style="color:red;font-weight:bold;">${value}%</span>`;
    } else {
      return `<span style="color:green">${value}%</span>`;
    }
  }

  function PercentCompleteBarFormatter(row, cell, value) {
    if (value == null || value === '') {
      return '';
    }

    var color;

    if (value < 30) {
      color = 'red';
    } else if (value < 70) {
      color = 'silver';
    } else {
      color = 'green';
    }

    return `<span class="percent-complete-bar" style="background:${color};width:${value}%"></span>`;
  }

  function YesNoFormatter(row, cell, value) {
    return value ? 'Yes' : 'No';
  }

  function CheckmarkFormatter(row, cell, value) {
    return value
      ? '<span style="color: green;">&#10004;</span>'
      : '<span style="color: red;">&#10008;</span>';
  }
})(jQuery);
