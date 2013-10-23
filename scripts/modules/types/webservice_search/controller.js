
define(['modules/defaultcontroller', 'util/api', 'util/datatraversing', 'util/urldata'], function(Default, API, Traversing, URL) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		initimpl: function() { 
			this.searchTerms = {};
			var searchparams;

			if( searchparams = this.module.getConfiguration( 'searchparams' ) ) {

				for(var i in searchparams) {
					if(!i) {
						continue;
					}

					this.searchTerms[i] = searchparams[i].defaultvalue;
				}
			}
			
			this.result = null;
			this.request = null;
		},
		
		doSearch: function() {

		/*	if(this.request)
				this.request.abort();
*/
			var self = this,
				url = this.module.getConfiguration( 'url' ),
				reg,
				toPost = this.module.getConfiguration( 'postvariables', [] ),
				l = toPost.length,
				i = 0,
				data = {};


			// Replace all search terms in the URL
			var reg = /\<([a-zA-Z0-9]+)\>/;
			
			while(val = reg.exec(url)) {
				url = url.replace('<' + val[1] + '>', (encodeURIComponent(this.searchTerms[val[1]] || '')));
			}
			

			// Replace all variables in the URL
			var reg = /\<var:([a-zA-Z0-9]+)\>/;
			while(val = reg.exec(url)) {
				variable = API.getRepositoryData().get(val[1]) || [''];
				variable = variable[1];
				url = url.replace('<var:' + val[1] + '>', encodeURIComponent(variable));
			}
			
			for(; i < l; i++) {
				data[toPost[i][0]] = API.getVar(toPost[i][1]);

				if(data[toPost[i][0]] && typeof data[toPost[i][0]].getType() == "object") {
					data[toPost[i][0]] = JSON.stringify(data[toPost[i][0]]);
				}
			}

			if(this.request && this.request.abort)
				this.request.abort();

			if(l == 0) {
				this.request = URL.get(url, 30, data);	
			} else {
				this.request = URL.post(url, data);	
			}
			
			this.request.done(function(data) {
				self.request = null;

				if (self.module.resultFilter) {
					data=self.module.resultFilter(data);
				}

				data = DataObject.check(data, true);
				self.onSearchDone(data);
			});
		},


		onSearchDone: function(elements) {
			var self = this;
			self.result = elements;
			self.module.model.data = elements;
			this.setVarFromEvent('onSearchReturn', elements);
		},

		configurationSend: {

			events: {

				onSearchReturn: {
					label: 'A search has been completed',
					description: ''
				}
				
			},
			
			rels: {
				'results': {
					label: 'Results',
					description: ''
				}
			}
		},
		
		configurationReceive: {

			"vartrigger": {
				type: [],
				label: 'A variable to trigger the search',
				description: ''
			}

		},
		
		moduleInformations: {
			moduleName: 'Webservice Lookup'
		},

		
		configurationStructure: function(section) {

			return {
				groups: {
					group: {
						options: {
							type: 'list'
						},

						fields: {

							url: {
								type: 'text',
								title: 'Search URL'
							},

							button: {
								type: 'checkbox',
								title: 'Search button',
								options: { button: '' }
							},

							buttonlabel: {
								type: 'text',
								title: 'Button text'
							},

							buttonlabel_exec: {
								type: 'text',
								title: 'Button text (executing)'
							},

							resultFilter: {
								type: 'jscode',
								title: 'Result filter'
							}
						}
					},

					searchparams: {
						options: {
							type: 'table',
							multiple: true,
							title: 'Seach parameters'
						},

						fields: {
							name: {
								type: 'text',
								title: 'Term name'
							},

							label: {
								type: 'text',
								title: 'Term label'
							},

							defaultvalue: {
								type: 'text',
								title: 'Default value'
							},

							fieldtype: {
								type: 'combo',
								title: 'Field type',
								options: [{ key: 'text', title: 'Text'}, { key: 'combo', title: 'Combo'}, { key: 'checkbox', title: 'Checkbox'}]
							},

							fieldoptions: {
								type: 'text',
								title: 'Field options (a:b;)'
							}
						}
					},

				},

				sections: {
					postvariables: {
						options: {
							multiple: false,
							title: 'POST variables'
						},

						groups: {
							postvariables: {
								options: {
									type: 'table',
									multiple: true
								},

								fields: {
									
									variable: {
										type: 'text',
										title: 'Variable'
									},

									name: {
										type: 'text',
										title: 'Name'
									}
								}
							},
						}

					}

				}
			}
		},
		

		configAliases: {
			'button': function(cfg) { return cfg.groups.group[ 0 ].button[ 0 ][ 0 ] == "button"; },
			'url': function(cfg) { return cfg.groups.group[ 0 ].url[ 0 ]; },
			'searchparams': function(cfg) { return cfg.groups.searchparams[ 0 ]; },
			'buttonlabel': function(cfg) { return cfg.groups.group[ 0 ].buttonlabel[ 0 ]; },
			'postvariables': function(cfg) { return cfg.sections.postvariables[ 0 ].postvariables[ 0 ]; }
		},

		"export": function() {
		}

	});

	return controller;
});

