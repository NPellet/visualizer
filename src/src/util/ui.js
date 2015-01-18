'use strict';

/**
 * Global ui methods
 * @module src/util/ui
 */

define(['src/util/debug', 'lodash'], function (Debug, _) {
    var $dialog;
   return {
       confirm: function (html, okLabel, cancelLabel) {
           if(_.isUndefined(okLabel)) okLabel = 'Ok';
           if(_.isUndefined(cancelLabel)) cancelLabel = 'Cancel';
           return new Promise(function (resolve) {
               if (!$dialog) {
                   $dialog = $('<div/>');
                   $('body').append($dialog);
               }
               if (html) {
                   $dialog.html(html);
               }

               var options = {
                   modal: true,
                   buttons: {},
                   close: function() {
                       resolve(false);
                   },
                   width: 400
               };

               if(okLabel !== null && okLabel !== '') options.buttons[okLabel] = function() {
                   resolve(true);
                   $(this).dialog('close');
               };

               if(cancelLabel !== null && cancelLabel !== '') options.buttons[cancelLabel] = function() {
                   resolve(false);
                   $(this).dialog('close');
               };

               $dialog.dialog(options);
           });
       }
   };
});