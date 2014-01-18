
define(['modules/default/defaultcontroller', 'src/util/api', 'src/util/datatraversing', 'src/util/urldata'], function(Default, API, Traversing, URL) {
	

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
		moduleName: 'NMR spin system simulation',
		description: 'Allows to enter coupling constant',
		author: 'Luc Patiny',
		date: '30.12.2013',
		license: 'MIT',
		cssClass: 'webservice_nmr_spin'
	};


	controller.prototype.initimpl = function() { 
		this.result = null;
		this.request = null;
	};
	
	controller.prototype.doAnalysis = function() {
		var self = this,
			url = this.module.getConfiguration( 'url' ),
			reg,
			i = 0,
			data = {};


		// Replace all variables in the URL
		var reg = /\<var:([a-zA-Z0-9]+)\>/;
		while( val = reg.exec( url ) ) {
			variable = API.getRepositoryData( ).get( val[ 1 ] ) || [ '' ];
			variable = variable[ 1 ];
			url = url.replace( '<var:' + val[ 1 ] + '>', encodeURIComponent( variable ) );
		}

		this.url = url;
		if( this.request && this.request.abort ) {
			this.request.abort( );
		}

		var data = this.module.view.system.serializeArray();

		this.module.view.lock();
		
		this.request = URL.post(url, data);
		
		this.request.done(function(data) {
			self.request = null;

			self.module.view.unlock();

			if(typeof data == "object") {
				data = new DataObject.check(data, true);
			}
			self.onAnalysisDone(data);
		});
	};


	controller.prototype.onAnalysisDone = function(elements) {
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

	};



	controller.prototype.configurationSend = {

		events: {
			onSearchReturn: {
				label: 'An analysis has been completed',
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
	};
	
	controller.prototype.configurationReceive = {
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
							title: 'Service URL'
						},

						systemSize: {
							type: 'combo',
							title: 'Spin system',
							default: '2',
							options: [
								{ key: '2', title: 'AB'},
								{ key: '3', title: 'ABC'},
								{ key: '4', title: 'ABCD'},
								{ key: '5', title: 'ABCDE'},
								{ key: '6', title: 'ABCDEF'}
							]
						},

						button: {
							type: 'checkbox',
							title: 'Process button',
							default: true,
							options: { button: '' }
						},

						buttonlabel: {
							type: 'text',
							default:'Calculate',
							title: 'Button text'
						},

						buttonlabel_exec: {
							type: 'text',
							default:'Calculating',
							title: 'Button text (executing)'
						},

						onloadanalysis: {
							type: 'checkbox',
							title: 'Make one process on load',
							default: true,
							options: { button: '' }
						}
					}
				}
			}
		}
	};
	
	controller.prototype.configAliases = {
		'url': [ 'groups', 'group', 0, 'url', 0 ],
		'button': [ 'groups', 'group', 0, 'button', 0 ],
		'systemSize': [ 'groups', 'group', 0, 'systemSize' ],
		'buttonlabel': [ 'groups', 'group', 0, 'buttonlabel', 0 ],
		'buttonlabel_exec': [ 'groups', 'group', 0, 'buttonlabel_exec', 0 ],
		'onloadanalysis': [ 'groups', 'group', 0, 'onloadanalysis', 0, 0 ]
	};


	return controller;
});

