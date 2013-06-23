/**
 * --------------------------------------------------------------------
 * jQuery customInput plugin
 * Author: Maggie Costello Wachs maggie@filamentgroup.com, Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group 
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * --------------------------------------------------------------------
 */
jQuery.fn.customInput = function(){
	return $(this).each(function(){	
		if($(this).is('[type=checkbox],[type=radio]')){
			var input = $(this);
			
			// get the associated label using the input's id
			var label = $('label[for="'+input.attr('id')+'"]');
			
			// wrap the input + label in a div 
			input.add(label).wrapAll('<div class="custom-'+ input.attr('type') +'"></div>');
			
			// necessary for browsers that don't support the :hover pseudo class on labels
			label.hover(
				function(){ $(this).addClass('hover'); },
				function(){ $(this).removeClass('hover'); }
			);
			/* Fix for jQuery UI ? */
			if(input.parent().parent().hasClass('bi-formfield-checkboxcontainer'))
				label.bind('click', function() {
					input.trigger('click');
				});
			//bind custom event, trigger it, bind click,focus,blur events					
			input.bind('updateState', function(){	
				window.setTimeout(function() { input.is(':checked') ? label.addClass('checked') : label.removeClass('checked checkedHover checkedFocus'); }, 1);
			})
			.trigger('updateState')
			.on('click', function(){ 
				$('input[name="'+ $(this).attr('name') +'"]').trigger('updateState');
			})
			.focus(function(){ 
				label.addClass('focus');
				if(input.is(':checked')) $(this).addClass('checkedFocus');
			})
			.blur(function(){ label.removeClass('focus checkedFocus'); });
		}
	});
};


	
	
