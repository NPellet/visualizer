'use strict';

define([], function () {
    var uniqueID = 0;

    function annotateTree(tree, data, options) {
        for (var i = 0; i < data.length; i++) {
            data[i] = DataObject.check(data[i]);
        }

        var root = tree;
        var keys = Object.keys(options);
        uniqueID = 0;
        traversal(root, data, options, keys);
        return tree;
    }

    function traversal(node, data, options, keys) {
        node.id = uniqueID;
        ++uniqueID;
        node.data = {};
        // add data to the currentNode
        if (node.hasOwnProperty('index')) {
            var element = data[node.index];
            if (element) {
                node.data.data = element;
                for (var i = 0; i < keys.length; ++i) {
                    var value = element.getChildSync(options[keys[i]]);
                    if (value) {
                        node['data'][keys[i]] = value.get();
                    }
                }
            }
        }

        // go inside of each node
        for (var i = 0; i < node.children.length; ++i) {
            traversal(node.children[i], data, options, keys);
        }


    }

    return {
        annotateTree: annotateTree
    };
});
