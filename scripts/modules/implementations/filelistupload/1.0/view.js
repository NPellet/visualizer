 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


 if(typeof CI.Module.prototype._types.filelistupload == 'undefined')
 	CI.Module.prototype._types.filelistupload = {};

 CI.Module.prototype._types.filelistupload.View = function(module) {
 	this.module = module;
 }

 CI.Module.prototype._types.filelistupload.View.prototype = {

 	init: function() {	
 		var self = this;
 		this.dom = $('<ul class="ci-fileupload"></ul>');
 		this.module.getDomContent().html(this.dom);

 		var dom = this.dom.get(0);
 		dom.addEventListener('dragenter', function(e) {
 			e.stopPropagation();
 			e.preventDefault();
 			self.dom.addClass('ci-fileupload-over');
 		});

 		dom.addEventListener('dragover', function(e) {
 			e.stopPropagation();
 			e.preventDefault();
 			
 		});

 		dom.addEventListener('dragleave', function(e) {
 			 e.stopPropagation();
 			 e.preventDefault();
 			 self.dom.addClass('ci-fileupload-over');
 		});

 		dom.addEventListener('drop', function(e) {
 			e.stopPropagation();
 			e.preventDefault();

 			self.upload(e.dataTransfer.files);
 		})

 	},

 	upload: function(files) {
 		this.queue = files;
 		this.currentIndex = 0;

 		this.startUpload();
 	},

 	startUpload: function() {
		var self = this;
 		var form = new FormData();
 		var file = this.queue[this.currentIndex];
 		form.append('file', file);
 		
 		var liDom = $(this.newLi(file.type, file.name, file.size, '<progress />'));

 		var xhr = new XMLHttpRequest();
 		this.dom.append(liDom);
 		xhr.addEventListener('readystatechange', function() {
			if(xhr.readyState == 4) {
				liDom.find('progress').replaceWith(file.type);
	        	if(xhr.status == 200) { 
					liDom.attr('href', xhr.responseText);
					self.currentVar.push({ type: file.type, filename: file.name, filesize: file.size, link: xhr.responseText });
					CI.Repo.set(self.varname, self.currentVarRoot, true);
				} else {
					liDom.addClass('file-error');
				}
			}
		});

 		xhr.open("POST", this.module.getConfiguration().fileuploadurl);
 		xhr.send(form);
 	},

 	inDom: function() {},

 	onResize: function() {
 	},

 	blank: function() {
 		this.dom.empty();
 		this.table = false;
 	},

 	newLi: function(type, filename, filesize, link) {
 		console.log(CI);
 		filesize = CI.formatSize(filesize);
		return '<a target="_blank" href="' + (link || '') + '"><li data-file-type="' + (type || '') + '"><div class="file-filename">' + (filename || '') + '</div><div class="file-type"	>' + (type || '') + '</div><div class="file-size">Size: ' + (filesize || '') + '</div><div class="ci-spacer"></div></li></a>'
 	},

 	update2: {
 		filelist: function(moduleValue, varname) {
 			// { filename: '', description: '', filesize: '', type: ''} 			
 			if(!moduleValue)
 				return;

 			this.currentVar = moduleValue.value = moduleValue.value || [];
 			this.currentVarRoot = moduleValue;

 			this.varname = varname;

 			var list = CI.DataType.getValueIfNeeded(moduleValue).value;

 			for(var i = 0, l = list.length; i < l; i++) {
 				this.dom.append(this.newLi(list[i].type, list[i].filename, list[i].filesize, list[i].link));
 			}
		}
	},

	getDom: function() {
		return this.dom;
	}
}