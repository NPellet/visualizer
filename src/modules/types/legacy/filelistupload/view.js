define(['modules/default/defaultview','src/util/datatraversing', 'src/util/api', 'src/util/util'], function(Default, Traversing, API, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

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

			var self = this,
				form = new FormData( ),
	 			file = this.queue[ this.currentIndex ];

	 		if( ! file ) {
	 			return;
	 		}

	 		form.append('file', file);
	 		
	 		var liDom = $(this.newLi(file.type, file.name, file.size, '<progress />')),
	 			xhr = new XMLHttpRequest();

	 		this.dom.append( liDom );

	 		xhr.addEventListener('readystatechange', function() {
	 			
				if( xhr.readyState == 4 ) {

					liDom.find( 'progress' ).replaceWith(file.type);
		        	
		        	if( xhr.status == 200 ) { 

						liDom.attr( 'href', xhr.responseText );
						
						self.currentVar.push( { 
							type: file.type,
							filename: file.name,
							filesize: file.size,
							link: xhr.responseText
						} );

						API.setVariable( self.varname, self.currentVarRoot, true );
					} else {
						liDom.addClass( 'file-error' );
					}
				}
			});

	 		xhr.open("POST", this.module.getConfiguration('fileuploadurl'));
	 		xhr.send(form);
	 	},

	 	inDom: function() {},


	 	blank: function() {
	 		this.dom.empty();
	 		this.table = false;
	 	},

	 	newLi: function(type, filename, filesize, link) {
	 		
	 		filesize = Util.formatSize(filesize);
			return '<a target="_blank" href="' + (link || '') + '"><li data-file-type="' + (type || '') + '"><div class="file-filename">' + (filename || '') + '</div><div class="file-type"	>' + (type || '') + '</div><div class="file-size">Size: ' + (filesize || '') + '</div><div class="ci-spacer"></div></li></a>'
	 	},

	 	update: {
	 		filelist: function(moduleValue, varname) {
	 			// { filename: '', description: '', filesize: '', type: ''} 			
	 			if(!moduleValue)
	 				return;

	 			this.currentVar = moduleValue.value = moduleValue.value || [];
	 			this.currentVarRoot = moduleValue;
	 			this.varname = varname;

	 			var list = moduleValue.get(),
	 				i = 0,
	 				l = list.length;

	 			for( ; i < l; i++ ) {
	 				this.dom.append( this.newLi( list[ i ].type, list[ i ].filename, list[ i ].filesize, list[ i ].link ) );
	 			}
			}
		},

		getDom: function() {
			return this.dom;
		}


	});

	return view;
});
