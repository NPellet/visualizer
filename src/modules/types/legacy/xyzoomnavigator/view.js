define(['modules/default/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			this.dom = $("<div />");
			var self = this;
			var img = $('<div class="ci-navigation-navigarrow"></div>');
			this.domNavig = $("<div />").addClass('ci-navigation-navig')
				.append(img.clone().addClass('top'))
				.append(img.clone().addClass('left'))
				.append(img.clone().addClass('right'))
				.append(img.clone().addClass('bottom'))
				.on('mousedown', '.ci-navigation-navigarrow', function(event) {
					self.moveStart(event);
				});

			this.domZoom = $('<div class="ci-navigation-navigzoom"></div>');

			this._zoomWidget = this.domZoom.slider({
				height: 100,
				orientation: "vertical",
				min: 0,
				step: 0.01,
				max: 1,
				value: 0.5,
				slide: function(event, ui) {
					self.zoom(ui.value);
				}
			});

			this.dom.append(this.domNavig).append(this.domZoom);
			this.module.getDomContent().html(this.dom);
			this.cx = 0;
			this.cy = 0;
			this.step = 2;

			var self = this;
		},



		zoom: function(val) {
			this.module.controller.zoom(val);
		},

		moveStart: function(e) {
			var started = Date.now();
			//self.moveStart(event);

			var self = this;
			var target = $(e.target || e.srcElement);
			
			mode = target.hasClass('top') ? 'top' : (target.hasClass('bottom') ? 'bottom' : (target.hasClass('left') ? 'left' : (target.hasClass('right') ? 'right' : 'top')));
			var self = this, timeout;
			
			var getInterval = function() {
				return 300000/((Date.now() - started)+1500) + 10;
			};

			var execute = function() {
				
				if(mode == 'top')
					self.cy -= self.step;
				else if(mode == 'bottom')
					self.cy += self.step;
				else if(mode == 'left') 
					self.cx -= self.step;
				else if(mode == 'right')
					self.cx += self.step;

				
				self.module.controller.move(self.cx, self.cy);
				setTimeout();
			}

			var setTimeout = function() {
				console.log('Set');
				timeout = window.setTimeout(execute, getInterval());
			}

			var upHandler = function() {
				
				window.clearTimeout(timeout);
				$(document).unbind('mouseup', upHandler);
			}

			$(document).bind('mouseup', upHandler);

			execute();	
		},


		update: {

			xycoords: function(value) {
				if(!value)
					return;
				this.cx = value[0];
				this.cy = value[1];

			},

			zoom: function(zoom) {
				if(!(zoom))
					return;
				this._zoom = zoom;
				if(this._zoomWidget.hasClass('ui-slider'))
					this._zoomWidget.slider('value', this._zoom);
			}

		},

		buildElement: function(source, arrayToPush, jpaths, colorJPath) {
			var jpath;
			var box = this.module;
			var self = this;
			for(var i = 0, length = source.length; i < length; i++) {
				var element = {};
				element.data = {};
				element._color;

				if(colorJPath)
					element._color = CI.DataType.asyncToScreenAttribute(source[i], 'bgcolor', colorJPath).done(function(val) {
						element._colorVal = val;
					});


				for(var j in jpaths) {
					jpath = jpaths[j];
					if(jpath.jpath)
						jpath = jpath.jpath;
						async = CI.DataType.asyncToScreenHtml(source[i], box, jpath);
						async.done(function(val) {
							element.data[j] = val;
						});
						if(element.data[j] == undefined)
							element.data[j] = async.html;
				}
				
				if(source[i].children) {
					element.children  = [];
					this.buildElement(source[i].children, element.children, jpaths, colorJPath);
				}

				var execFunc, id;
				(function(myElement) {
					if(source[i]._highlight) {
						execFunc = function(value, what) {
							myElement._highlight = value;
							self.table.highlight(myElement);
						};

						id = CI.RepoHighlight.listen(source[i]._highlight, execFunc);

					}
				}) (element);
				
				this._highlights.push([source[i]._highlight, id]);
				element._source = source[i];
				arrayToPush.push(element);
			}
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		
		}

	});
	return view;
});
 