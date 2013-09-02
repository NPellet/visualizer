define(['modules/defaultview', 'libs/plot/plot', 'util/datatraversing', './gcms', 'util/util', 'util/api'], function(Default, Graph, Traversing, gcms, Util, API) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		init: function() {

			var html = [];
			html.push('<div class="gcms"><div class="gc"></div><div class="ms"></div></div>');
			this.namedSeries = {};
			this.dom = $(html.join(''));
			this.module.getDomContent().html(this.dom);
		},

		unload: function() {
			this.gcmsInstance.unload();
			this.dom.remove();
		},

		inDom: function() {
			var self = this;
			var _gcms = new gcms();
			_gcms.setMSContinuous(this.module.getConfiguration().continuous);
			_gcms.setRangeLimit(this.module.getConfiguration().nbzones || 1);
			_gcms.inDom(this.dom.find('.gc').get(0), this.dom.find('.ms').get(0));
			this.gcmsInstance = _gcms;
		},

		onResize: function(width, height) {
			this.gcmsInstance.resize(width, height);
		},
		
		update: {
			'jcamp': function(moduleValue) {
				var self = this;
				moduleValue = Traversing.getValueIfNeeded(moduleValue);
				require(['util/jcampconverter'], function(tojcamp) {

					var jcamp = tojcamp(moduleValue);
					if(jcamp.gcms) {
						self.gcmsInstance.setGC(jcamp.gcms.gc);
						self.gcmsInstance.setMS(jcamp.gcms.ms);

						self.resetAnnotationsGC();
					}
				});
			},


			'annotationgc': function(value) {
				value = Traversing.getValueIfNeeded(value);
				if(!value)
					return;
				this.annotations = value;
				this.resetAnnotationsGC();
			},

			'gcms': function(moduleValue) {
				
				this.gcmsInstance.setGC(moduleValue.gc);
				this.gcmsInstance.setMS(moduleValue.ms);

				this.resetAnnotationsGC();
			}
		},

		getDom: function() {
			return this.dom;
		},

		resetAnnotationsGC: function() {
			if(!this.gcmsInstance)
				return;
			for(var i = 0, l = this.annotations.length; i < l; i++) {
				this.doAnnotation(this.annotations[i]);
			}
		},

		doAnnotation: function(annotation) {
			
			var shape = this.gcmsInstance.getGC().makeShape(annotation, {
				onChange: function(newData) {
					Traversing.triggerDataChange(newData);
				}
			});
			Traversing.listenDataChange(annotation, function(value) {
				shape.draw();
				shape.redraw();				
			});
			
			if(annotation._highlight) {
				API.listenHighlight(annotation._highlight, function(onOff) {
					if(onOff)
						shape.highlight();
					else
						shape.unHighlight();
				});
			}
			shape.draw();
			shape.redraw();
		}
	});

	return view;
});

 
