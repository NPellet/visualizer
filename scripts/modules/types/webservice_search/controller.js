
define(['modules/defaultcontroller', 'util/api', 'util/datatraversing', 'util/urlData'], function(Default, API, Traversing, URL) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		initimpl: function() { 
			this.searchTerms = {};
			this.result = null;
			this.request = null;
		},
		
		doSearch: function(name, val) {

			if(!this.searchTerms)
				this.searchTerms = [];

		/*	if(this.request)
				this.request.abort();
*/
			var self = this;
			this.searchTerms[name] = val;
			var url = this.module.getConfiguration().url;
			for(var i in this.searchTerms) {
				url = url.replace('<' + i + '>', encodeURIComponent(this.searchTerms[i]));
			}

			var reg = /\<var:([a-zA-Z0-9]+)\>/;
			while(val = reg.exec(url)) {
				variable = API.getRepositoryData.get(val[1]) || [''];
				variable = variable[1];
				url = url.replace('<var:' + val[1] + '>', variable);
			}
			

			this.request = URL.get(url).done(function(data) {
				console.log(data);
				self.request = null;
				self.onSearchDone(data);
			});
		},


		onSearchDone: function(elements) {
			var self = this;
			self.result = elements;
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

		},
		
		moduleInformations: {
			moduleName: 'Webservice Lookup'
		},

		
		doConfiguration: function(section) {
			

			var data = Traversing.getValueIfNeeded(this.module.data),
				jpaths = [];
			
			if(Traversing.getType(data) == 'array') 
				Traversing.getJPathsFromElement(data[0], jpaths);
			else if(Traversing.getType(data) == 'arrayXY')
				Traversing.getJPathsFromElement(data, jpaths);
			
			return {
				groups: {
					'cfg': {
						config: {
							type: 'list'
						},

						fields: [
							{
								type: 'Text',
								name: 'url',
								title: 'Search URL'
							}
						]
					},

					'searchparams': {
						config: {
							type: 'table'
						},

						fields: [
							{
								type: 'Text',
								name: 'name',
								title: 'Term name'
							},

							{
								type: 'Text',
								name: 'label',
								title: 'Term label'
							},

							{
								type: 'Text',
								name: 'defaultvalue',
								title: 'Default value'
							}

						]
					}
				}
			}
		},
		
		doFillConfiguration: function() {
			
			var searchparams = this.module.getConfiguration().searchparams;
			var names = [];
			var labels = [];
			var defaultvalue = [];
			for(var i in searchparams) {
				names.push(i);
				labels.push(searchparams[i].label);
				defaultvalue.push(searchparams[i].defaultvalue || '');
			}

			return {	

				groups: {
					
					cfg: [{
						url: [this.module.getConfiguration().url]
				//		jpatharray: [this.module.getConfiguration().jpatharray]
					}],

					searchparams: [{
						name: names,
						label: labels,
						defaultvalue: defaultvalue 
					}]
				}
			}
		},
		
		doSaveConfiguration: function(confSection) {
			var group = confSection[0].searchparams[0];
			var searchparams = {};
			for(var i = 0; i < group.length; i++)
				searchparams[group[i].name] = {label: group[i].label, defaultvalue: group[i].defaultvalue};
			this.module.getConfiguration().searchparams = searchparams;
			this.module.getConfiguration().url = confSection[0].cfg[0].url[0];
		//	this.module.getConfiguration().jpatharray = confSection[0].cfg[0].jpatharray[0];
		},

		"export": function() {
		}

	});

	return controller;
});

