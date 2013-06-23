
define(['./default'], function(FieldDefault) {

	var field = function(main) {
		this.main = main;
	};

	field.prototype = $.extend({}, FieldDefault, {
			
		initHtml: function() {
			
			var field = this;
			var input = this.main.dom.on('click', 'div.bi-formfield-field-container > div', function(event) {
				var index = $(this).index();
			});
		},
		
		formatSize: function(size, forceUnit) {
			var units = [["o",1], ["ko",1024], ["Mo", 1024 * 1024], ["Go",1024 * 1024 * 1024]];
			if(forceUnit) {
				for(var i in units) {
					if(units[i][0] == forceUnit) {
						var factor = units[forceUnit][1];
						return [Math.round(size / factor * 10) / 10, forceUnit];	
					}
				}
				return false;
			} else {
				var i = 0;
				newSize = size;
				while(newSize > 1024) {
					i++;
					newSize = size / units[i][1];
				}
				
				return [Math.round(newSize * 10) / 10, units[i][0]];
			}
		},
		
		addField: function() {
			var self = this;
		
			var fieldWrapper = $("<div />").addClass('bi-formfield-container');
			//var right = $('<div class="bi-formfield-right"></div>').appendTo(fieldWrapper);
			//var percent = $('<span class="bi-formfield-upload-percentage"></span>').appendTo(right);
			//var duplicate = $('<div class="bi-formfield-duplicate"></div>').appendTo(right);
			
			var zone = new BI.Buttons.Zone();
			var button = new BI.Buttons.Button('Supprimer', function() {
				var index = fieldWrapper.index();
				self.main.changeValue(index, {});
				self.setValue(index, null)
				self.fileCount--;
			});

			zone.addButton(button);
			var button = new BI.Buttons.Button('Dupliquer le champ', function() {
				self.main.addField();
			});
			zone.addButton(button);

			var html = $('<div><div class="bi-formfield-uploader-upload"><div class="bi-formfield-uploader-zone"></div><div class="bi-formfield-uploader-fileinput"><input type="file" /></div></div>' + 
			'<div class="bi-formfield-uploader-fileinfos"><div><progress class="bi-formfield-uploader-progress" value="0" max="100" />' +
			'<div><span class="bi-formfield-uploader-filename"></span> <span class="bi-formfield-uploader-filesize"></span>'
			+ '<div class="bi-formfield-uploader-description"><label>File description</label><div><input type="text" class="bi-formfield-uploader-filedescr" /></div></div><div class="bi-formfield-spacer"></div>'
			+ '</div></div>'
			+ '<div class="bi-formfield-uploader-details bi-formfield-hidden">' +
			'<div class="bi-formfield-uploader-image"><img class="bi-formfield-uploader-fileimg bi-formfield-hidden"></div>' + 
			zone.render() + 
			'<div class="bi-spacer"></div></div></div><div class="bi-spacer"></div>').appendTo(fieldWrapper);

			var zone = html.find('.bi-formfield-uploader-zone');
			var input = html.find('.bi-formfield-uploader-fileinput input');
			var details = html.find('.bi-formfield-uploader-details');
			var progress = html.find('.bi-formfield-uploader-progress');

			var filename = html.find('.bi-formfield-uploader-filename');
			var filesize = html.find('.bi-formfield-uploader-filesize');
			var filedescr = html.find('.bi-formfield-uploader-filedescr');
			var fileimage = html.find('.bi-formfield-uploader-fileimg');
			var details = html.find('.bi-formfield-uploader-details');

			var pos = 0;
			if(typeof position == "undefined")
				this.main.fieldContainer.append(fieldWrapper);
			else if(typeof position == "number") {
				this.main.fields[position].wrapper.after(fieldWrapper);
				pos = position + 1;
			}

			self.fileCount = 0;

			new FileUploader({
				dropZone: zone,
				fileInput: input,
				url: this.uploadURL,

				fileStart: function(file) {
					
					filename.html('');
					filesize.html('');
					filedescr.html('');

					details.hide();
					//placeholder.html(file.name)
					self.fileCount++;
					file.uploaderId = self.fileCount;
					
					if(self.fileCount > 1)
						self.duplicate();

					progress.attr('value', 0);
				//	fieldWrapper.addClass('bi-formfield-upload-progress');
				},

				fileProgress: function(file, percentage, onServer, total) {

					//var totalSize = self.formatSize(total);
					//var currentSize = self.formatSize(onServer, totalSize[1]);

					progress.attr('value', percentage);
					//percent.html(totalSize.join("") + "/" + currentSize.join("") + " (" + percentage + " %)");
				},

				fileUploaded: function(file, response) {
					var size = self.formatSize(file.size);
					//percent.html(size.join("") + "/" + size.join("") + " (100 %)");
					fieldWrapper.removeClass('bi-formfield-upload-progress').addClass('bi-formfield-upload-progress');
					
					progress.attr('value', 100);

					var index = fieldWrapper.index();
					self.main.changeValue(index, response);
					console.log(response, 'Uploaded !');
					self.setValue(index, response)
					
				}

			});

			return {
				index: pos,
				wrapper: fieldWrapper,
				filename: filename,
				filesize: filesize,
				filedescr: filedescr,
				fileimage: fileimage,
				progress: progress,
				details: details
			};
		},

		setValue: function(index, value) {

			var field = this.main.fields[index];
			if(!value) {
				field.filename.html('');
				field.filesize.html('');
				field.fileimage.hide().attr('src', '');
				field.details.hide();
				field.progress.attr('value', 0);
			} else {
				var size = this.formatSize(value.size);
				this.main.changeValue(index, value);
				field.filename.html(value.fullname);
				field.filesize.html('(' + size.join(" ") + ')');
				field.details.show();
				if(value.type.toLowerCase() == 'image/jpeg' || value.type == 'image/jpg' || value.type == 'image/gif' || value.type == 'image/png')
					field.fileimage.attr('src', value.srcpath).show();
				else if(value.srcpath)
					field.fileimage.attr('src', value.srcpath).show();
			}
		}
	});

	return field;
});
