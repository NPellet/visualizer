
var FileUploader = function(options) {
	
	this.options = $.extend(true, {}, FileUploader.prototype.defaults, options);

	this.queue = [],
	this.paused = false;
	
	this.action = ($.support.fileReader && $.support.formData) ? 'xhr' : 'iframe';
	
	if(this.action == 'xhr')
		this.reader = new FileReader();
		
	// Iterated vars
	this.currentFileId = 0, 
	this.uploaded = 0;
	
	var inst = this;
	
	if(this.options.fileInput)
		this.options.fileInput.get(0).addEventListener('change', function(event) {

			var files = $(this).val();

			inst.init(files);
			inst.next();
		});
		
	
	if(this.options.dropZone) {
		this.options.dropZone.get(0).addEventListener('drop', function(event) {
			var files = event.dataTransfer.files;
			inst.init(files);
			inst.next();
		});
		
		
	}
	
	return this;
}




FileUploader.prototype = {
	
	defaults: {
		url: '/work/upload/file',
		slice: false, // 8388508000
		dropZone: false,
		fileInput: false
	},
	
	init: function(files) {
		var first = true;
		var j = 0;
		var fileType, mime;
		for(var i in files) {
			var file = files[i];	
			this.stackQueue(file);
		}
	},
	
	stackQueue: function(file) {
		this.queue.push(file);
		file.id = this.queue.length - 1;
		if($.isFunction(this.options.fileQueue))
			this.options.fileQueue.call(that, file);
	},
	
	next: function() {
		
		var file = this.queue[this.currentFileId];
		if(file) {
			this.currentFileId++;
			this.fileStart(file);
		} else 
			if(typeof this.options.terminated) 
				return this.options.terminated.call(this);
	},
	
	
	fileStart: function(file) {
		
		if(typeof this.options.fileStart == "function")
			options.fileStart.call(this, file);

		if(this.action == 'xhr')
			this.xhrInitiateFile(file);
	},
	
	fileTerminated: function(file) {
		
		if(typeof this.options.fileUploaded == "function") {
			var next = this.options.fileUploaded.call(this, file);
			if(next === false || next === undefined) {
				if(typeof this.options.terminated) 
					this.options.terminated.call(this);
				return;
			}
		}
		nextQueue();
		
	},
	
	fileProgress: function(file, percentage, onServer, total) {
		if(typeof this.options.fileProgress == "function")
			this.options.fileProgress.call(that, file, percentage, onServer, total);
	},
	
	
	xhrInitiateFile: function(file) {
		this.uploaded = 0;	
		this.initial = 0;
		this.xhrReadSlice(file, this.initial, this.reader);												
	},
	
	xhrReadSlice: function(file, initial, prevTemp) {

		var inst = this;
		
		if(initial > file.size)
			 return this.fileTerminated(file);	
		
		var sliceSize = this.options.sliceSize;
		
		if(sliceSize) {
			if(file.slice !== undefined)		
				var slice = file.slice(initial, sliceSize);
			else if(file.mozSlice !== undefined)
				var slice = file.mozSlice(initial, initial + sliceSize);
			else if(file.webkitSlice !== undefined) {
				// Webkit bug, we must reload the reader
				var reader = new FileReader();
				var slice = file.webkitSlice(initial, initial + sliceSize);
			} else {
				console.warn("Could not slice file !");
				return;
				var slice = file;
			}
		} else 
			var slice = file;
			
		this.reader.onloadend = function(event) {
			inst.xhrUpload(file, (prevTemp == undefined ? '' : prevTemp) + '/' + event.target.result, reader);
		}
		
		this.reader.readAsBinaryString(slice);
	},
	
	xhrUpload: function(file, content, reader) {
		
		var inst = this;
		// Creation form data
		var data = new FormData();
		for(var i in this.options.data)
			data.append(i, this.options.data[i]);	
	
		data.append('file', file);
		
		var self = this;
		var xhr = new XMLHttpRequest();

		xhr.upload.addEventListener("progress", function(evt) {
			if (evt.lengthComputable) {
				var percentage = Math.round((evt.loaded * 100) / evt.total);   
				var onServer = uploaded + evt.loaded;
				progress(file, percentage, onServer, file.size);
			}
		});

		xhr.addEventListener('readystatechange', function() {

			if(xhr.readyState == 4) {
		        	if(xhr.status == 200) { 
					uploaded += sliceSize;
					initial += sliceSize;
					
					if(xhr.responseXML !== null) {
						var response = xml2json(xhr.responseXML);
						file.response = response;
						readSlice.call(that, file, initial, reader, response);
					} else
						if(typeof inst.options.fileError == 'function')
							inst.options.fileError.call(this, file);
				} else {
					
					if(typeof inst.options.fileError == 'function')
						inst.options.fileError.call(this, file);
				}
			}
		});
		
		xhr.timeout = 60000;
		xhr.open("POST", this.options.url);
		xhr.send(data);
	},
	
	iframeCreateIframe: function(id, url) {
	    
		var iframeHtml = ['<iframe id="', id, '" name="', id, '" style="position:absolute; top:-9999px; left:-9999px"'];
		if(window.ActiveXObject)
			iframeHtml.push((typeof url == 'boolean') ? ' src="javascript:false"' : ' src="' + url + '"');
                
		iframeHtml.push(' />');
		var iframe = $(iframeHtml.join(''));
		iframe.appendTo(document.body);

            	return iframe.get(0);	
	},
	
	iframeCreateForm: function(formid, fileelementid, fileElement) {
		
		var form = $('<form></form>').attr({
				method: 'pos',
				name: formid,
				id: formid,
				enctype: 'multipart/form-data'
			}).css({
				position: 'absolute',
				top: '-1200px',
				left: '-1200px'
			}).appendTo(document.body);
			
		for(var i in this.options.data)
			$('<input type="hidden" name="' + i + '" value="' + data[i] + '" />').appendTo(form);
		
		fileElement.clone().insertBefore(fileElement);
		fileElement.attr('id', fileelementid).appendTo(form);
	},
	
	
    	ajaxFileUpload: function() {
	       
	        var id = Date.now();
	        var frameId = 'ajaxuploadiframe_' + id;
		var form = this.iframeCreateForm('ajaxuploadform_' + id, 'ajaxuploadelement_' + id, this.options.fileinput);
		var io = this.iframeCreateIframe(frameId, this.options.url);
		            
	        var requestDone = false;
	        var xml = {}   
	        var isTimeout = false;
	        
	        // Wait for a response to come back
	        var uploadCallback = function(isTimeout) {
	        				
			var io = document.getElementById(frameId);
	        	try {				
					
				if(io.contentWindow) {
					xml.responseText = io.contentWindow.document.body?io.contentWindow.document.body.innerHTML:null;
	                		xml.responseXML = io.contentWindow.document.XMLDocument?io.contentWindow.document.XMLDocument:io.contentWindow.document;
				} else if(io.contentDocument) {
					xml.responseText = io.contentDocument.document.body?io.contentDocument.document.body.innerHTML:null;
	                		xml.responseXML = io.contentDocument.document.XMLDocument?io.contentDocument.document.XMLDocument:io.contentDocument.document;
				}
										
			} catch(e) {
		            	
		            	if(typeof this.options.onError == "function")
					this.options.onError.call(this, xml);
					
				if(xml || isTimeout) {
		            					
					requestDone = true;
					var status;
					
					try {
						
					    status = !isTimeout ? "success" : "error";
					    
					    if (status != "error") {
					        var data = inst.iframeParseData(xml, this.options.responseType);
					        inst.fileTerminated.call(data);
					    } else
					        inst.fileError.call(xml, status);
					        
					} catch(e) {
						
					    status = "error";
					    inst.fileError.call(xml, status);
					    
					}
		
		
		                jQuery(io).unbind()
		
		                setTimeout(function() {	
		                	try {
						jQuery(io).remove();
						jQuery(form).remove();	
						
					} catch(e) {
						inst.fileError.call(xml, status)
					}
				}, 100)
		                xml = null
			}
		}
	        
	        // Timeout checker
	        if(this.options.timeout > 0)
	            setTimeout(function() {
	            	
	                if(!requestDone)
	                	uploadCallback( "timeout" );
	            }, this.options.timeout);
	        }
	        
	
		var form = $('#' + formId);
		form.attr({
			action: this.options.url,
			method: 'post',
			target: frameId,
			enctype: 'multipart/form-data'
		}).submit();
		
		jQuery('#' + frameId).load(uploadCallback);
    },

    iframeParseData: function(r, type) {
    	
        var data = !type;
        data = type == "xml" || data ? r.responseXML : r.responseText;
        
        if(type == "script")
            jQuery.globalEval( data );
        
        if(type == "json")
            eval( "data = " + data );
        
        if(type == "html")
            $("<div>").html(data).evalScripts();

        return data;
    }
}
