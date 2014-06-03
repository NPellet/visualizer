define( [ 'modules/default/defaultcontroller', 'src/util/api', 'src/util/urldata', 'uri/URITemplate'], function(Default, API, URL, URITemplate) {
	
	/**
	 * Creates a new empty controller
	 * @class Controller
	 * @name Controller
	 * @constructor
	 */
	function controller() { };

	// Extends the default properties of the default controller
	controller.prototype = $.extend( true, {}, Default );


	/*
		Information about the module
	*/
	controller.prototype.moduleInformation = {
		moduleName: 'Webservice search',
		description: 'Performs a server search',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'webservice_search'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		
		"vartrigger": {
			label: 'A variable to trigger the search'
		},
                
                "varinput": {
                    label: 'A variable to add to the search'
                },

		'results': {
			label: 'Search results'
		},

		'url': {
			label: 'Lookup URL',
			type: 'string'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events
		'onSearchReturn': {
			label: 'On search complete',
			refVariable: [ 'results', 'url' ],
                        refAction: [ 'results' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
	*/
	controller.prototype.variablesIn = [ 'vartrigger', 'varinput', 'url' ];

	/*
		Received actions
	*/
	controller.prototype.actionsIn = {
		doSearch: 'Trigger search'
	};
	
		
	controller.prototype.configurationStructure = function(section) {
		
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
                                                
                                                method: {
                                              type:'combo',
                                              title:'Query method',
                                              options: [
                                                  { key: 'GET', title: 'GET'},
						{ key: 'POST', title: 'POST'},
						{ key: 'PUT', title: 'PUT'},
						{ key: 'DELETE', title: 'DELETE'},
						{ key: 'HEAD', title: 'HEAD'}
                                              ],
                                              'default':'POST'
                                            },
                                            
                                            dataType: {
                                                type: "combo",
                                                title: "Data type to send",
                                                options: [
                                                    {key: 'json', title: 'JSON'},
                                                    {key: 'form', title: 'Form data'}
                                                ],
                                                'default': 'form'
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
                                
                                headers: {
                                    options: {
                                        type: 'table',
                                        multiple: true,
                                        title: 'Request headers'
                                    },
                                    fields: {
                                        name: {
                                            type: "text",
                                            title: "Name"
                                        },
                                        value: {
                                            type:"text",
                                            title:"Value"
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
				}

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
						}
					}

				}

			}
		};
	};

	controller.prototype.configFunctions = {
		'button': function(cfg) { return cfg.indexOf('button') > -1; }
	};

	controller.prototype.configAliases = {
		'button': [ 'groups', 'group', 0, 'button', 0 ],
		'url': [ 'groups', 'group', 0, 'url', 0 ],
                'method': [ 'groups', 'group', 0, 'method', 0 ],
		'searchparams': [ 'groups', 'searchparams', 0 ],
		'buttonlabel': [ 'groups', 'group', 0, 'buttonlabel', 0 ],
		'buttonlabel_exec': [ 'groups', 'group', 0, 'buttonlabel_exec', 0 ],
		'onloadsearch': [ 'groups', 'group', 0, 'onloadsearch', 0, 0 ],
		'resultfilter': [ 'groups', 'group', 0, 'resultfilter', 0 ],
		'postvariables': [ 'sections', 'postvariables', 0, 'groups', 'postvariables', 0 ],
                'headers': [ 'groups', 'headers', 0 ],
                'dataType': [ 'groups', 'group', 0, 'dataType', 0 ]
	};

	controller.prototype.initImpl = function() {
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
		
		this.resolveReady();
	};
		
	controller.prototype.doSearch = function() {
		
		var url = this.module.view._url || this.module.getConfiguration( 'url' );

		var self = this,
			urltemplate = new URITemplate(url),
			toPost = this.module.getConfiguration( 'postvariables', [] ),
			l = toPost.length,
			i = 0,
			data = {};

                var varsin = this.module.vars_in();

                for(var i = 0; i < varsin.length; i++) {
                    var varin = varsin[i];
                    if((varin.rel==="vartrigger"||varin.rel==="varinput") && varin.name) {
                        var theVar = API.getVar(varin.name);
                        if(theVar.get && typeof(theVar.get)==='function') theVar=theVar.get();
                        this.searchTerms[varin.name] = theVar;
                    }
                }

		this.url=urltemplate.expand(this.searchTerms);

                var headers = {};
                var headerList = this.module.getConfiguration('headers') || [];
		for(var i = 0; i < headerList.length; i++) {
                    var header = headerList[i];
                    if(!header.name || !header.value)
                        continue;
                    headers[header.name] = header.value;
                }
                
                var options = {
                    url: this.url,
                    type: this.module.getConfiguration('method')||"POST",
                    cache: false,
                    headers: headers
                };
                
                var dataType = this.module.getConfiguration( 'dataType' );
                if(dataType === "form") {
                    for(var i = 0; i < l; i++) {
                            var valueToPost = API.getVar(toPost[i].variable).get();
                            if (valueToPost) {
                                    if ( valueToPost.getType() !== "number" && valueToPost.getType() !== "string" ) {
                                            if (toPost[i].filter==="value") {
                                                    data[toPost[i].name]=valueToPost.get();
                                            } else {
                                                    data[toPost[i].name] = JSON.stringify(valueToPost);
                                            }
                                    } else {
                                            data[toPost[i].name]=valueToPost;
                                    }
                            }
                    }
                } else {
                    data = JSON.stringify(API.getVar(toPost[0].variable).resurrect());
                    options.contentType = "application/json; charset=utf-8";
                }
                
                options.data = data;

		if(this.request && this.request.abort) {
			this.request.abort();
		}
                
                this.request = $.ajax(options);

		this.module.view.lock();
		
		this.request.done(function(data) {
			self.request = null;

			if (self.module.resultfilter) {
				data = self.module.resultfilter(data);
			}
                        
			if(typeof data === "object") {
				data = DataObject.check(data, true);
			}
                        
			self.onSearchDone(data);
		}).fail(function(xhr){
                    self.onSearchDone(new DataObject({
                        type: "error",
                        status: xhr.status,
                        statusText: xhr.statusText,
                        responseText: xhr.responseText,
                        responseJSON: xhr.responseJSON
                    }));
                }).always(function(){
                    self.module.view.unlock();
                });
	};


	controller.prototype.onSearchDone = function(elements) {
		this.result = elements;
		this.module.model.data = elements;
                
                this.setVarFromEvent('onSearchReturn', elements, 'results');
                this.setVarFromEvent('onSearchReturn', this.url, 'url');
                
                this.sendAction('results', elements, 'onSearchReturn');
	};

 	return controller;
});
