
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
					this.searchTerms[searchparams[i].name] = searchparams[i].defaultvalue;
				}
			}
			
			this.result = null;
			this.request = null;

			if ( this.module.getConfiguration( 'onloadsearch' )) {
				this.doSearch();
			}
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

			this.url=url;

			
			for(; i < l; i++) {
				var valueToPost = API.getVar(toPost[i].variable);
				if (valueToPost) {
					if ( valueToPost.getType() != "number" && valueToPost.getType() != "string" ) {
						if (toPost[i].filter=="value") {
							data[toPost[i].name]=valueToPost.get();
						} else {
							data[toPost[i].name] = JSON.stringify(valueToPost);
						}
					} else {
						data[toPost[i].name]=valueToPost;
					}
				}
			}

			if(this.request && this.request.abort) {
				this.request.abort();
			}

			if(l == 0) {
				this.request = URL.get(url, 30, data);	
			} else {
				this.request = URL.post(url, data);	
			}

			this.module.view.lock();
			
			this.request.done(function(data) {
				self.request = null;

				if (self.module.resultfilter) {
					data = self.module.resultfilter(data);
				}

				self.module.view.unlock();

				if(typeof data == "object") {
					data = new DataObject.check(data, true);
				}
				//console.log(data);
				self.onSearchDone(data);
			});
		},


		onSearchDone: function(elements) {
			var self = this;
			self.result = elements;
			self.module.model.data = elements;


			if( ! ( actions = this.module.vars_out() ) ) {
				return;
			}

			for( i in actions ) {
				if( actions[ i ].event == "onSearchReturn" ) {
					if( actions[ i ].rel == "results" ) {
						API.setVar( actions[i].name, elements, actions[i].jpath );
					} if ( actions[ i ].rel == "url" ) {
							API.setVar( actions[i].name, self.url);
					}
				}
			}

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
				},
				'url': {
					label: 'URL',
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

							onloadsearch: {
								type: 'checkbox',
								title: 'Make one query on load',
								options: { button: '' }
							},

							resultfilter: {
								type: 'jscode',
								title: 'Result data filter'
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
								options: [
									{ key: 'text', title: 'Text'},
									{ key: 'textarea', title: 'Textarea'},
									{ key: 'combo', title: 'Combo'},
									{ key: 'checkbox', title: 'Checkbox'}
								]
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
										title: 'Form variable name'
									},

									filter: {
										type: 'combo',
										title: 'Filter',
										options: [{key: 'none', title: 'None'}, {key: 'value', title: 'Only value'}]
									}
								}
							},
						}

					}

				}
			}
		},
		
		configFunctions: {
			'button': function(cfg) { return cfg.indexOf('button')>-1; }
		},

		configAliases: {
			'button': [ 'groups', 'group', 0, 'button', 0 ],
			'url': [ 'groups', 'group', 0, 'url', 0 ],
			'searchparams': [ 'groups', 'searchparams', 0 ],
			'buttonlabel': [ 'groups', 'group', 0, 'buttonlabel', 0 ],
			'buttonlabel_exec': [ 'groups', 'group', 0, 'buttonlabel_exec', 0 ],
			'onloadsearch': [ 'groups', 'group', 0, 'onloadsearch', 0, 0 ],
			'resultfilter': [ 'groups', 'group', 0, 'resultfilter', 0 ],
			'postvariables': [ 'sections', 'postvariables', 0, 'groups', 'postvariables', 0 ]
		},

		"export": function() {
		}

	});

	return controller;
});

