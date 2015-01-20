define(['modules/default/defaultview', 'src/util/util', 'jquery'], function (Default, Util, $) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {

			this.dom = $("<div />");
			var self = this;
			var img = $('<div class="ci-navigation-navigarrow"></div>');
			this.domNavig = $("<div />").addClass('')
				.append(img.clone().addClass('left'))
				.append(img.clone().addClass('right'))
				.on('mousedown', '.ci-navigation-navigarrow', function(event) {
					self.moveStart(event);
				});

			this.dom.append(this.domNavig);
			this.module.getDomContent().html(this.dom);
			this.cx = 0;
			this.step = this.module.getConfiguration('step') || 2;
console.log( this.step );
			var self = this;

        },


        inDom: function () {
            var self = this;
            this.resolveReady();
        },


		update: {

			xcoords: function(value) {
				if( ! value ) {
					return;
				}

				this.cx = value;
			}
		},

		moveStart: function(e) {
			var started = Date.now();
			//self.moveStart(event);

			var self = this;
			var target = $(e.target || e.srcElement);
			
			mode = (target.hasClass('left') ? 'left' : (target.hasClass('right') ? 'right' : 'left'));
			var self = this, timeout;
			
			var getInterval = function() {
				return 300000/((Date.now() - started)+1500) + 10;
			};

			var execute = function() {
				
				if(mode == 'left') 
					self.cx -= self.step;
				else if(mode == 'right')
					self.cx += self.step;

				
				self.module.controller.move(self.cx);
				setTimeout();
			}

			var setTimeout = function() {
				timeout = window.setTimeout(execute, getInterval());
			}

			var upHandler = function() {
				
				window.clearTimeout(timeout);
				$(document).unbind('mouseup', upHandler);
			}

			$(document).bind('mouseup', upHandler);

			execute();	
		},

	  onActionReceive: {
        changeX: function (value) {

        	this.cx = parseFloat( value.valueOf() );
           
        }
	}

    });

    return View;
});
