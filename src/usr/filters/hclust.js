define(["lib/datamining/clustering/hclust", "lib/datamining/math/distance"], function(hclust, Distance) {

    function getTree(cluster, infos) {
        var tree = {children: [], distance: cluster.distance};
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
                tree.children[i] = getTree(cluster.children[i], infos);
            }
        }
        return tree;
    }


    return function(data) {

        var result = hclust.compute(data.get(), hclust.methods.singleLinkage, Distance.euclidean);
        var tree = new DataObject(getTree(result));
        return tree;

    };

});