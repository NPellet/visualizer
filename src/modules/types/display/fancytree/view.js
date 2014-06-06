define(['modules/default/defaultview', 'src/util/util', 'fancytree'], function(Default, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		init: function() {
			
			var id = Util.getNextUniqueId();
			this.dom = $('<table id="'+id+'">').css({
				width: "100%"
			});
			
			var columns = this.module.getConfiguration('columns')||[],
				colgroup = $('<colgroup><col></col></colgroup>').appendTo(this.dom),
				thead = $('<tr><th></th></tr>').appendTo($('<thead></thead>').appendTo(this.dom)),
				trow = $('<tr><td></td></tr>').appendTo($('<tbody></tbody>').appendTo(this.dom)),
				jpaths = [];
			
			if(columns.length) {
				var col;
				for(var i = 0; i < columns.length; i++) {
					col = columns[i];
					if(col.jpath) {
						colgroup.append($('<col'+(col.width?' width="'+col.width+'px"':'')+'></col>'));
						thead.append('<th>'+(col.name||"")+'</th>');
						trow.append('<td></td>');
						jpaths.push(col.jpath);
					}
				}
			}
			
			this.jpaths = jpaths;
			
			this.module.getDomContent().html(this.dom);
			
		},
		inDom: function() {
			
			var that = this;
			
			this.dom.fancytree({
				extensions: ["table"],
				table: {
					indentation: 20,
					nodeColumnIdx: 0
				},
				source:[/*{title:"a1",children:[{title:"b1",data:{plop:"LOL"}}]},{title:"a2"}*/],
				renderColumns: function(event, data) {
					var node = data.node,
						$tdList = $(node.tr).find(">td"),
						jpaths = that.jpaths;
					for(var i = 0; i < jpaths.length; i++) {
						$tdList.eq(i+1).text(jpaths[i]+i);
					}
				}
			});
			
			this.tree = this.dom.fancytree('getTree');
			
			this.resolveReady();
		},
		
		update: {
			tree: function(value) {
				value = treeToFancy(value.get());
				this.tree.reload(value);
			}
		},
		blank: {
			tree: function() {
				this.tree.reload([]);
			}
		}
	});
	
	function treeToFancy(tree) {
		console.log(tree)
		var fancytree = [];
		var props = {};
	}

	return view;
});