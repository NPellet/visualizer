
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
				//url = this.module.getConfiguration( 'url' ),
				reg,
				i = 0,
				data = {};


			var data = self.searchTerms ;

			//console.warn();
			/*
			// Replace all variables in the URL
			var reg = /\<var:([a-zA-Z0-9]+)\>/;
			while(val = reg.exec(url)) {
				variable = API.getRepositoryData().get(val[1]) || [''];
				variable = variable[1];
				url = url.replace('<var:' + val[1] + '>', encodeURIComponent(variable));
			}
			*/


			this.module.view.lock();

			if (self.module.resultfilter) {
				var dataTemp = self.module.resultfilter(data);
				if(dataTemp)
					data = dataTemp ;
			}

			self.module.view.unlock();

			if(typeof data == "object") {
				data = new DataObject.check(data, true);
			}

			self.onSearchDone(data);

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
					label: 'An edition has been completed',
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
			moduleName: 'Var Editor'
		},

		
		configurationStructure: function(section) {

			return {
				groups: {
					group: {
						options: {
							type: 'list'
						},

						fields: {

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
								title: 'Result data filter',
								default: '/**\r\ndata.result = parseInt(data.var1)+parseInt(data.var2);\r\nreturn data;\r\n*/'
							}
						}
					},

					searchparams: {
						options: {
							type: 'table',
							multiple: true,
							title: 'Variable creation parameters'
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

				}
			}
		},
		
		configFunctions: {
			'button': function(cfg) { return cfg.indexOf('button')>-1; }
		},

		configAliases: {
			'button': [ 'groups', 'group', 0, 'button', 0 ],
			'searchparams': [ 'groups', 'searchparams', 0 ],
			'buttonlabel': [ 'groups', 'group', 0, 'buttonlabel', 0 ],
			'buttonlabel_exec': [ 'groups', 'group', 0, 'buttonlabel_exec', 0 ],
			'onloadsearch': [ 'groups', 'group', 0, 'onloadsearch', 0, 0 ],
			'resultfilter': [ 'groups', 'group', 0, 'resultfilter', 0 ]
		},

		"export": function() {
		}

	});

	return controller;
});

