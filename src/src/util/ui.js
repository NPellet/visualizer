'use strict';

/**
 * Global ui methods
 * @module src/util/ui
 */

define(['src/util/debug'], function (Debug) {
    var $dialog;
   return {
       confirm: function (html) {
           return new Promise(function (resolve) {
               if (!$dialog) {
                   $dialog = $('<div/>');
                   $('body').append($dialog);
               }
               if (html) {
                   $dialog.html(html);
               }

               $dialog.dialog({
                   modal: true,
                   buttons: {
                       Cancel: function () {
                           resolve(false);
                           $(this).dialog('close');
                       },
                       Ok: function () {
                           resolve(true);
                           $(this).dialog('close');
                       }
                   },
                   close: function () {
                       resolve(false);
                   },
                   width: 400
               });
           });
       }
   };
});