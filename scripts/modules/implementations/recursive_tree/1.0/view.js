 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.recursive_tree == 'undefined')
	CI.Module.prototype._types.recursive_tree = {};

CI.Module.prototype._types.recursive_tree.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.recursive_tree.View.prototype = {
	
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
	
	onResize: function() {
	},
	
	blank: function() {
		this.dom.empty();
	},

	update2: {

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
	
	typeToScreen: {
		
	}
}

 
