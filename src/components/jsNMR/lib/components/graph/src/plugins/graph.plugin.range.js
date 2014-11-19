define([], function() {

	var plugin = function() {};

	plugin.prototype = {

		init: function() {},
	
		onMouseDown: function(graph, x, y, e, target) {
			var self = graph;
			this.count = this.count || 0;
			if(this.count == graph.options.rangeLimitX)
				return;
			x -= graph.getPaddingLeft(), xVal = graph.getXAxis().getVal( x );

			var shape = graph.makeShape({type: 'rangeX', pos: {x: xVal, y: 0}, pos2: {x: xVal, y: 0}}, {
				onChange: function(newData) {
					self.triggerEvent('onAnnotationChange', newData);
				}
			}, true);

			if(require) {
				require(['src/util/context'], function(Context) {
					Context.listen(shape._dom, [
						[ '<li><a><span class="ui-icon ui-icon-cross"></span> Remove range zone</a></li>', 
						function(e) {
							shape.kill();
						} ]
					]);
				});
			}

			var color = Util.getNextColorRGB(this.count, graph.options.rangeLimitX);
			
			shape.set('fillColor', 'rgba(' + color + ', 0.3)');
			shape.set('strokeColor', 'rgba(' + color + ', 0.9)');
			this.count++;
			shape.handleMouseDown(e, true);
			shape.draw();
		}
	}


	return plugin;
});
