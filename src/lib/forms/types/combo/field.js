'use strict';

define([require, '../../field', 'components/fancytree/dist/modules/jquery.fancytree'], function (require, FieldDefaultConstructor) {

    var FieldConstructor = function (name) {

        $.ui.fancytree.debugLevel = 0;

        var self = this;

        this.name = name;
        this.domExpander = $('<div></div>').fancytree({

            toggleEffect: false,
            debut: 0,
            source: [],

            activate: function (event, node) {
                node = node.node;
                if (node.data.isFolder) {
                    return;
                }

                if (self.getElementExpanded()) {
                    self.getElementExpanded().value = node.key;
                }
            },

            click: function (event, node) {
                node = node.node;

                if (node && ( !node.children || ( node.children && node.children.length == 0 ) )) {
                    self.form.hideExpander(true);
                }
            }
        });


    };

    FieldConstructor.prototype = new FieldDefaultConstructor();

    FieldConstructor.prototype.showExpander = function (fieldElement) {

        var optionsSource = this.getOptions(fieldElement),
            i,
            root = this.domExpander.fancytree('getRootNode'),
            tree = this.domExpander.fancytree('getTree'),
            node;

        this._showExpander(fieldElement);

        tree._callHook('treeClear', tree); // root.removeChildren() causes root ul to loose its classes => bad.
        root.addChildren(optionsSource);

        if (tree.getActiveNode) {
            if (( node = tree.getActiveNode() ) != null) {
                node.setActive(false);
            }
        }

        if (tree.getNodeByKey && ( node = tree.getNodeByKey(fieldElement.value) )) {
            node.setActive(true);
        }

        root.toggleExpanded();


    };

    return FieldConstructor;

});