(function($) {
	
	$.fn.mask = function(message, options) {
		
		this.data('mask-options', options);
		
		return this.each(function() {
			
			var pos = $(this).position();
			var options = $.extend(true, {}, $.fn.mask.prototype.options, $(this).data('mask-options'));
			
			if($(this).is('body'))
				var width = $(document).outerWidth(), height = $(document).outerHeight();
			else 
				var width = $(this).outerWidth(), height = $(this).outerHeight();
			
		
			
			$(this).data('mask.overlay', $("<div />").addClass('ci-mask-overlay').css({
				position: 'absolute',
				left: pos.left,
				top: pos.top,
				width: width,
				height: height,
				fontSize: "1.4em",
				backgroundColor: options.error ? '#F9EAED' : '#fafafa'
			}).appendTo('body'));
			
			var mask = $("<div />").appendTo($(this).data('mask.overlay')).addClass('ci-mask').html(message).each(function() {
				$(this).css({
					marginTop: $(this).parent().height() / 2 - $(this).height() / 2,
					backgroundColor: options.error ? '#F26F5E' : 'white'
				});	
			});
		});
	}
	
	$.fn.mask.prototype.options = {
		error: false
	}
	
	
	$.fn.unmask = function() {
		
		return this.each(function() {

			if($(this).data('mask.overlay'))
				$(this).data('mask.overlay').remove();
		});
	}
	
	
}) (jQuery);
