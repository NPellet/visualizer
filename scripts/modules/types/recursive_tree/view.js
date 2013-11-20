define(['modules/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			this.dom = $('<div class="ci-recursive-tree"></div>');
			this.module.getDomContent().html(this.dom);
			var self = this;
		},

		inDom: function() {
			this.dynatree = this.dom.dynatree({

				onActivate: function(node) {
					console.log(node);
				}

			}).dynatree('getTree');
		},
		

		blank: function() {
			this.dom.empty();
		},

		update: {
			tree: function(treeValue) {
				// When a new tree rel is received => We should simply reload the dynatree instance
				if(this.dynatree) {
					var root = this.dynatree.getRoot();
					root.removeChildren();
					root.addChild(treeValue);
				}
			}
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: { }
		
	});
	return view;
});
 
