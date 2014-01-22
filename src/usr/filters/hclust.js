define(["lib/datamining/clustering/hclust", "lib/datamining/math/distance"], function(hclust, Distance) {

    function getTree(cluster, infos, counter) {
        if(!counter) counter = {val:0};
        var tree = {children: [], distance: cluster.distance, id:counter.val++};
        if (cluster.children.length === 0) {
            if(infos) {
                var info = infos[[cluster.elements[0].index]];
                for (var prop in info) {
                    tree[prop] = info[prop];
                }
            }
            return tree;
        } else {
            for (var i = 0, ii = cluster.children.length; i < ii; i++) {
                tree.children[i] = getTree(cluster.children[i], infos, counter);
            }
        }
        return tree;
    }


    return function(data) {

        var result = hclust.compute(data.get(), hclust.methods.completeLinkage, Distance.euclidean);
        var tree = getTree(result);
        return new DataObject({type:"tree",value:tree});

    };

});