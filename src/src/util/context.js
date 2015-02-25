'use strict';
define(['jquery', 'src/util/api', 'modules/modulefactory', 'jquery-ui/menu'], function ($, API, ModuleFactory) {

    var contextMenu;

    return {

        listen: function (dom, elements, onBeforeShow, onAfterShow) {
            if (!Array.isArray(elements[0]))
                elements = [elements];

            dom.addEventListener('contextmenu', function (e) {


                if (onBeforeShow) {
                    onBeforeShow(contextMenu);
                }

                for (var i = 0, l = elements.length; i < l; i++) {
                    (function (element, callbackClick, callbackOpen) {
                        if (API.isViewLocked() || (API.getContextMenu().indexOf('all') === -1 && API.getContextMenu().indexOf(element.attr('name') || 'undefined') === -1)) return;
                        if (( callbackOpen && callbackOpen(e, element) ) || !callbackOpen) {
                            contextMenu.append(element);
                        }

                        element.bind('click', function (e2) {

                            if (callbackClick) {

                                callbackClick.call(this, e, e2);
                            }
                        })

                    })($(elements[i][0]), elements[i][1], elements[i][2]);
                }

                if (onAfterShow) {
                    onAfterShow(contextMenu);
                }

            }, true);
        },

        unlisten: function (dom) {
            dom.removeEventListener('contextmenu');
        },

        getRootDom: function () {
            return this.dom;
        },

        init: function (dom) {
            this.dom = dom;
            var top, left;
            dom.addEventListener('contextmenu', function (e) {

                //e.preventDefault();
                if (contextMenu) {
                    if (contextMenu.hasClass('ui-menu')) {
                        contextMenu.menu('destroy')
                    }
                    contextMenu.remove();
                }

                contextMenu = null;
                top = e.clientY;
                left = e.clientX;
                var $menu = $('<ul class="ci-contextmenu"></ul>').css({
                    'position': 'fixed',
                    'left': left,
                    'top': top,
                    'z-index': 10000
                }).appendTo($("body"));

                contextMenu = $menu;

                var clickHandler = function () {

                    //e.preventDefault();
                    if (contextMenu) {
                        if (contextMenu.hasClass('ui-menu')) {
                            contextMenu.menu('destroy')
                        }
                        contextMenu.remove();
                    }

                    contextMenu = null;
                    $(document).unbind('click', clickHandler);
                }

                var rightClickHandler = function () {

                    //e.preventDefault();
                    if (contextMenu) {
                        if (contextMenu.hasClass('ui-menu')) {
                            contextMenu.menu('destroy')
                        }
                        contextMenu.remove();
                    }

                    contextMenu = null;
                }

                $(document).bind('click', clickHandler);
                //		return false;

            }, true);


            dom.parentNode.addEventListener('contextmenu', function (e) {


                //contextMenu.height(contextMenu.height(document.documentElement.clientHeight))

                //console.log( contextMenu );
                if (contextMenu.children().length > 0) {
                    contextMenu.menu({
                        select: function (event, ui) {
                            var moduleName = ui.item.attr('name');
                        }
                    });

                    e.preventDefault();
                    e.stopPropagation();

                    // Move the menu if it would go beyond the viewport
                    var height = contextMenu.height();
                    var width = contextMenu.width();
                    var clientH = document.documentElement.clientHeight;
                    var clientW = document.documentElement.clientWidth;
                    if (top + height > clientH) {
                        contextMenu.css("top", Math.max(0, clientH - height - 10));
                    }
                    if (left + width > clientW) {
                        contextMenu.css("left", Math.max(0, clientW - width - 10));
                    }

                    return false;
                }

            }, false);
        }


    }
});
