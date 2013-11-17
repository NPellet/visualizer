define(['modules/defaultcontroller','util/datatraversing', 'util/versioning', 'util/api'], function(Default,Traversing, Versioning, API) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		init: function() {

			var self = this;
			this.reader = new FileReader();

			this.reader.onload = function(e) {
				var obj = e.target.result;

				if( self.lineCfg.type[ 0 ] == "array" || self.lineCfg.type[ 0 ] == "object" ) {

					try {
						obj = JSON.parse( obj, Versioning.getViewHandler( ).reviver );
					} catch( _ ) {

					}
				}

				obj = new DataObject({ type: self.lineCfg.type, value: obj });
				console.log(  self.lineCfg.variable, obj );
				API.setVar( self.lineCfg.variable, obj );
				self.leased = false;
			}

			this.reader.onerror = function(e) {
				console.error(e);
				self.leased = false;
			}
		},

		onDropped: function( file ) {

			//self.controller.fileReceived( obj );

			var self = this,
				ext = file.name.split( '.' ).pop(),
				cfg = this.module.getConfiguration('vars'),
				lineCfg;

			self.leased = true;
			for( var i = 0, l = cfg.length ; i < l ; i ++ ) {
				if( cfg[ i ].extension == ext) {
					lineCfg = cfg[ i ];
					break;
				}
			}

			if( ! lineCfg ) {
				return;
			}

			this.lineCfg = lineCfg;

			
			switch( lineCfg.filetype ) {

				case 'text':
				console.log(file);
					self.reader.readAsText( file );
				break;

				case 'base64':
					self.reader.readAsDataURL( file );
				break;

				case 'binary':
					self.reader.readAsBinary( file );
				break;
			}

		},

		configurationSend: {

			events: {
				onDropped: {
					label: 'A file has been opened'
				}
			},
			
			rels: {
				'object': {
					label: 'Dropped file'
				}
			}		
		},
		
		actions: {
			rel: {

			}
		},

		actionsReceive: { },

		configurationReceive: {
				
		},
		
		
		configurationStructure: function(section) {
			
			var jpaths = this.module.model.getjPath();

			return {
				groups: {
					group: {
						options: {
							type: 'list'
						},

						fields: {
						
							label: {
								type: 'text',
								title: 'Displayed text'
							},

							filter: {
								type: 'jscode',
								title: 'Result data filter'
							}
						}
					},

					vars: {

						options: {
							type: 'table',
							multiple: true
						},

						fields: {
/*
							type: {
								type: 'combo',
								title: 'File type',
								options: [
									{ title: "Text file", key: "string" },
									{ title: "Picture", key: "image" }
								]
							},
*/
							extension: {
								type: "text",
								title: "File extension"
							},
							
							filetype: {
								type: "combo",
								title: "Read type",
								options: [{ title: "Text", key: "text"}, { title: "Base64 Encoded", key: "base64"}, { title: "Binary", key: "binary"} ]
							},

							type: {
								type: "text",
								title: "Force type"
							},

							variable: {
								type: "text",
								title: "In variable"	
							}
						}
					}
				}
			}		
		},
		

		configAliases: {
			'vartype': [ 'groups', 'group', 0, 'vartype', 0 ],
			'label': [ 'groups', 'group', 0, 'label', 0 ],
			'filter': [ 'groups', 'group', 0, 'filter', 0 ],
			'vars': [ 'groups', 'vars', 0 ]
		}
	});

	return controller;
});
