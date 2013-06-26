define(['./default'], function(FieldDefault) {

	var field = function(main) {
	

		this.main = main;
		this.treeLoaded = false;
		this.divs = [];
		
		this.optionsIndexed = [];
		this.options = {};
		
		this._loadedCallback = [];
		
	}

	field.prototype = $.extend({}, FieldDefault, {
		builtHtml: function() {},
		initHtml: function() {
			this.loadTree();
		},

		setText:function(index, value) {
			
			if(this.divs && this.divs[index])
				this.divs[index].html(value);

			if(this.html && this.html[index])
				this.html[index].html(value);
		},

		addField: function(position) {
			this._loadedCallback = [];
			var inst = this;
			var div = $("<div></div>");
			this.divs.splice(position, 0, div)
			return { field: div, html: div, index: position };
		},

		removeField: function(position) {
			this.divs.splice(position, 1)[0].remove();
		},

		startEditing: function(position) {
			this.fillTree(position);
			this.currentIndex = position;
			this.main.toggleExpander(position);
		},

		stopEditing: function(position) {
			this.main.hideExpander();
		},

		expanderShowed: function(index) {

			if(this.optionsIndexed[index] !== undefined)
				this.fillTree(index);
			
			tree = this.main.domExpander.children().dynatree("getTree");
			if(!tree.getActiveNode)
				return;
				
			var node;
			if((node = tree.getActiveNode()) != null)
				node.deactivate();
				
			if(tree.getNodeByKey && (node = tree.getNodeByKey(this.main.getValue(index)))) {
				node.activateSilently();
			}
		}

	});

	return field;
});