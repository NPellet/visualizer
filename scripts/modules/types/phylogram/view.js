define(['modules/defaultview','util/util','libs/d3/d3.v2.min','util/api'], function(Default, Util, D3Lib,API) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {

			this._id = Util.getNextUniqueId();
			this.selectorId = "#" + this._id ;
			this.chart = null ;
			this.currentHighlightId = null ;

			$block = $('<div>',{Id: this._id }) ;
			$block.css('display', 'table').css('height', '100%').css('width', '100%').css("overflow","hidden") ; //.css("background","#33ccff");
			this.dom = $block ;
			this.module.getDomContent().html(this.dom) ;

		},

		inDom: function(){

		},

		onResize: function(w,h) {
			/*
			var elWidth = w-2 ;//$(this.selectorId).width()-2 ;
			var elHeight = h-2 ; //$(this.selectorId).height()-2 ;

			// return elHeight-this.getBBox().height ;
			*/
		},

		blank: function() {
			this.dom.empty();
		},

		getIdHash: function(currentNode) {
			if (currentNode.id) {
				this._idHash[currentNode.id]=currentNode;
			}
			if (currentNode.children instanceof Array) {
				for (var i=0; i<currentNode.children.length; i++) {
					this.getIdHash(currentNode.children[i]);
				}
			}
		},

		update: {
			'array':function(data){

				console.log("UPDATE "+this._id) ;

				var view = this ;
				var box = this.module ;
				this._idHash = [] ;
				this.getIdHash(data.value) ;

				API.killHighlight(box.id);

				// Loading phylogram extension for D3
				require(['libs/d3/d3.phylogram'], function(d3Phylo) {

					$(view.selectorId).html("");

					this.phylogram = d3.phylogram.build(view.selectorId, data.value, {
						//height : view._idHash.length*8,
						skipBranchLengthScaling : true,
						skipTicks : true,

						// LEAF
						callbackMouseOverLeaf : function(data){
							box.controller.mouseOverLeaf(data);
							if(data.data){
								if(data.data.data && data.data.data._highlight){
									API.highlight(data.data.data._highlight,1);
									view.currentHighlightId = data.data.data._highlight ;
								}
							}
						},
						callbackMouseOutLeaf : function(data){
							box.controller.mouseOutLeaf(data);

							if(view.currentHighlightId)
								API.highlight(view.currentHighlightId,0);
						},
						callbackClickLeaf : function(data){
							box.controller.clickLeaf(data) ;
						},

						// BRANCH
						callbackMouseOverBranch : function(data){
							box.controller.mouseOverBranch(data.target);
						},
						callbackMouseOutBranch : function(data){
							box.controller.mouseOutBranch(data.target);
						},
						callbackClickBranch : function(data){
							box.controller.clickBranch(data.target);
						}
						//skipLabels: false
					}) ;


					var phylogram = this.phylogram ;

					leaves = d3.selectAll(view.selectorId + " .leaf") ;

					leaves.each(function(data){

						(function(myElement,leaf) {

							if(myElement.data){
								var dataNode = myElement.data ;
								if(dataNode.data && dataNode.data._highlight){

									API.listenHighlight(dataNode.data._highlight, function(value, what) {

										var point = leaf.select("circle");
										point.attr("fill",function(a){
											if(a.data.data.$color) return a.data.data.$color ;
											if(value) return "#f5f48d" ;
											return "grey" ;
										});
										point.attr("r",(value?9:4.5));

									}, false, box.id);

								}
							}


						})(data,d3.select(this));

					});

				}); // End require phylogram




			}
		},
		

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {}
	});

	return view;
});