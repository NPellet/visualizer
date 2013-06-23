define(['./default', 'libs/uploader/uploader'], function(FieldDefault) {
	var field = function(main) {
		this.main = main;
	}
	
	field.prototype = $.extend({}, FieldDefault, {

		initHtml: function() {

			var field = this;
			// Change the input value will change the input hidden value
			var input = this.main.dom.on('click', 'div.bi-formfield-field-container > div', function(event) {
				event.stopPropagation();
				field.main.toggleExpander($(this).index());
			});
			
			
			this.placeholder = this.main.dom.on('click', '.bi-formfield-placeholder-container > label', function(event) {
				event.stopPropagation();
				var index = $(this).index();
				field.main.fieldContainer.children().eq(index).trigger('click');
			});
			
			this.main.dom.on('click', '.bi-formfield-image-container > img', function(event) {
				event.stopPropagation();
				var index = $(this).index();
				field.main.fieldContainer.children().eq(index).trigger('click');
			});
			
			this.fillExpander();
			
			var dropZone = this.main.domExpander.find('.bi-formfield-picturedrop');
			var uploader = new FileUploader({
				dropZone: dropZone,
				fileInput: this.main.domExpander.find('.bi-formfield-picturehdd'),
				url: 'http://google.com'
			});
			
			
			function dragwhile(event) {
				
				event.dataTransfer.effectAllowed = "copy";
				event.dataTransfer.dropEffect = "copy";
				event.preventDefault();
				event.stopPropagation();
				
				$(this).css({
					'box-shadow': '0px 0px 3px #000000',
					color: '#444444',
					backgroundColor: '#ffffff'
				});
				
				return true;
			}
			
			function dragout() {
				
				$(this).css({
					'box-shadow': '0px 0px 0px #000000',
					color: '#c0c0c0',
					backgroundColor: '#fefefe'
				});
			}

			dropZone.get(0).addEventListener('dragover', dragwhile, false);
			dropZone.get(0).addEventListener('dragenter', dragwhile, false);
			dropZone.get(0).addEventListener('dragleave', dragout, false);
			
			document.addEventListener('drop', function(event) { event.preventDefault(); })

		},

		setText: function(index, text) {
			this.main.fieldContainer.children().eq(index).html(text);
		},

		setValue: function(value) {
			dom.children('input').val(value);
			this.main.valueChanged(value);
		},

		fillExpander: function() {

			var html = [];
			
			html.push('<div class="bi-formfield-picture-details">');
				html.push('<div class="bi-formfield-picture-current">')
					html.push('<h3>Current picture</h3>');
					html.push('<div class="bi-formfield-picturecurrent">No picture uploaded</div>');
					html.push('<div class="bi-formfield-picturedetails"><h4>');
					html.push('Details');
					html.push('</h4><ul>');
						html.push('<li><label>Date :</label><span class="bi-formfield-picture-dateuploaded">N/A</span><div class="bi-spacer"></div></li>');
						html.push('<li><label>Size :</label><span class="bi-formfield-picture-size">N/A</span><div class="bi-spacer"></div></li>');
						html.push('<li><label>Weight :</label><span class="bi-formfield-picture-weight">N/A</span><div class="bi-spacer"></div></li>');
						html.push('<li><label>Title :</label><input type="text" class="bi-formfield-picture-dateuploaded" /><div class="bi-spacer"></div></li>');
					html.push('</ul>');
					html.push('</div>');
					
				html.push('</div>');
				html.push('<div class="bi-formfield-picture-upload">')
					html.push('<h3>Enter the URL of the picture</h3>');
					html.push('<input type="text" class="bi-formfield-pictureurl" />');
					
					html.push('<h3>Select a picture from your hard-drive</h3>');
					html.push('<input type="file" class="bi-formfield-picturehdd" />');
				
				html.push('</div>');
				
				if($.support.drop) {
					html.push('<div class="bi-formfield-picture-drop">')
						html.push('<h3>Drag and drop the file here</h3>');
						html.push('<div class="bi-formfield-picturedrop">Drop a file here</div>');
					html.push('</div>');
				}
				
			html.push('</div>');
			this.main.domExpander.html(html.join(''));
		}
	});

	return field;
});
