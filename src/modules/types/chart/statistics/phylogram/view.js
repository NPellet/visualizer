'use strict';

define(['modules/default/defaultview', 'src/util/util', 'lib/d3/d3.phylogram', 'src/util/api', 'src/util/ui'], function (Default, Util, d3, API, ui) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init: function () {
            this._id = Util.getNextUniqueId();
            this.selectorId = '#' + this._id;
            this.chart = null;
            this.currentHighlightId = null;

            this.dom = ui.getSafeElement('div').attr('id', this._id);
            this.module.getDomContent().html(this.dom);
            this.resolveReady();
        },
        blank: function () {
            this.dom.empty();
        },
        getIdHash: function (currentNode) {
            if (currentNode.id) {
                this._idHash[currentNode.id] = currentNode;
            }
            if (Array.isArray(currentNode.children)) {
                for (var i = 0; i < currentNode.children.length; i++) {
                    this.getIdHash(currentNode.children[i]);
                }
            }
        },
        update: {
            tree: function (data) {

                data = data.get();

                this._idHash = [];
                this.getIdHash(data);

                API.killHighlight(this._id);

                this._data = data;

                this.drawPhylogram();
            }
        },
        drawPhylogram: function (data, view) {

            if (!this._data)
                return;

            var data = this._data;
            var that = this;

            this.dom.empty();
            var skipBranchLengthScaling = true;
            if (data.children && data.children.length > 0)
                skipBranchLengthScaling = (data.children[0].length === undefined);
            d3.phylogram.build(this.selectorId, data, {
                height: that.height,
                width: that.width,
                skipBranchLengthScaling: skipBranchLengthScaling,
                skipTicks: false,
                skipLabels: true,
                children: function (node) {
                    return node.children;
                },
                // LEAF
                callbackMouseOverLeaf: function (data) {
                    that.module.controller.mouseOverLeaf(data);
                    API.highlight(data.data, 1);
                },
                callbackMouseOutLeaf: function (data) {
                    that.module.controller.mouseOutLeaf(data);
                    API.highlight(data.data, 0);
                },
                callbackClickLeaf: function (data) {
                    that.module.controller.clickLeaf(data);
                },
                // BRANCH
                callbackMouseOverBranch: function (data) {
                    that.module.controller.mouseOverBranch(data.target);
                },
                callbackMouseOutBranch: function (data) {
                    that.module.controller.mouseOutBranch(data.target);
                },
                callbackClickBranch: function (data) {
                    that.module.controller.clickBranch(data.target);
                }
                //skipLabels: false
            });

            var leaves = d3.selectAll(this.selectorId + ' .leaf');

            leaves.each(function (data) {

                (function (dataNode, leaf) {

                    if (dataNode.data && dataNode.data._highlight) {

                        API.listenHighlight(dataNode.data, function (value, what) {

                            var point = leaf.select('circle');
                            point.attr('fill', function (a) {
                                if (a.data && a.data.$color)
                                    return a.data.$color;
                                if (value)
                                    return '#f5f48d';
                                return 'grey';
                            });
                            point.attr('r', (value ? 9 : 4.5));

                        }, false, that._id);

                    }


                })(data, d3.select(this));

            });

            // ( this.module.getConfiguration('defaultvalue') || '' )
            d3.selectAll(this.selectorId + ' .link').each(function () {
                //d3.select(this).attr('stroke',( view.module.getConfiguration('branchColor') || '#cccccc' ));
                d3.select(this).attr('stroke-width', (that.module.getConfiguration('branchWidth') + 'px' || '5px'));
            });

        },
        onResize: function () {
            this.drawPhylogram();
        }
    });

    return View;

});
