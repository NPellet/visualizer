define([ 'lib/forms/form'], function( Form ) {

	function makeOptions( cfg, form ) {

		var type = form.groups.general[ 0 ].type[ 0 ];

		switch( type ) {

			case 'checkbox':
				cfg.options = makeCheckboxOptions( form );
			break;

			case 'combo':
				cfg.options = makeComboOptions( form );
			break;

			case 'slider':
				cfg.min = parseFloat( form.groups.slider[ 0 ].start[ 0 ] || 0 );
				cfg.max = parseFloat( form.groups.slider[ 0 ].end[ 0 ] || 1 );
				cfg.step = parseFloat( form.groups.slider[ 0 ].step[ 0 ] || 0.1 );
			break;


			case 'slider_range':
				cfg.min = parseFloat( form.groups.slider[ 0 ].start[ 0 ] || 0 );
				cfg.max = parseFloat( form.groups.slider[ 0 ].end[ 0 ] || 1 );
				cfg.step = parseFloat( form.groups.slider[ 0 ].step[ 0 ] || 0.1 );
				cfg.default = [ 
									form.groups.slider[ 0 ].range[ 0 ].val1[ 0 ],
									form.groups.slider[ 0 ].range[ 0 ].val2[ 0 ]
							  ];
				cfg.range = true;
				
			break;
		}
	};

	function makeComboOptions( form ) {
		form = form.groups.options[ 0 ];
		var i = 0,
			l = form.length,
			cfg = [];
		for( ; i < l ; i ++ ) {
			cfg.push({ 
				title: form[ i ].label, 
				key: form[ i ].value
			});

		}
		return cfg;
	};

	function makeCheckboxOptions( form ) {
		form = form.groups.options[ 0 ];
		var i = 0,
			l = form.length,
			cfg = [];

		for( ; i < l ; cfg[ form[ i ].value ] = form[ i ].label, i ++ );

		return cfg;
	};


	return {

		makeConfig: function( jpath, operator ) {

			var el = {

				options: {
					multiple: true,
					title: "Filtering field"
				},

				groups: {
					general: {
						options: {
							type: 'list'
						},

						fields: {

							name: {
								type: 'text',
								title: 'Field name'
							},

							label: {
								type: 'text',
								title: 'Field label'
							},

							defaultVal: {
								type: 'text',
								title: 'Default value'
							},

							type: {
								type: 'combo',
								title: 'Field type',
								options: [
									{ title: 'Text', key: 'text' },	
									{ title: 'Number', key: 'float' },
									{ title: 'Combo', key: 'combo' },
									{ title: 'Slider', key: 'slider' },
									{ title: 'Range', key: 'slider' },
									{ title: 'Checkbox', key: 'checkbox' }
								],

								displaySource:  {
									'text': 'text',
									'float': 'float',
									'combo': 'combo',
									'checkbox': 'checkbox',
									'slider': 'slider',
									'range': 'range'
								}
							}
						}
					},

					text: {

						options: {
							type: 'list',
							displayTarget: [ 'text' ]
						},

						fields: {

							case_sensitive: {
								type: 'checkbox',
								title: 'Case sensitive',
								options: {'case_sensitive': ''}
							}
						}
					},


					slider: {

						options: {
							type: 'list',
							displayTarget: [ 'slider' ]
						},

						fields: {

							start: {
								type: 'text',
								title: 'Start'
							},

							end: {
								type: 'text',
								title: 'End'
							},

							step: {
								type: 'text',
								title: 'Step'
							}
						}
					},


					slider: {

						options: {
							type: 'list',
							displayTarget: [ 'slider' ]
						},

						fields: {

							start: {
								type: 'text',
								title: 'Start'
							},

							end: {
								type: 'text',
								title: 'End'
							},

							step: {
								type: 'text',
								title: 'Step'
							},

							val1: {
								type: 'text',
								title: 'Default min'
							},

							val2: {
								type: 'text',
								title: 'Default max'
							},

						}
					},

					options: {
						options: {
							type: 'table',
							multiple: true,
							displayTarget: [ 'combo', 'checkbox' ]
						},

						fields: {

							label: {
								type: 'text',
								title: 'Label'
							},

							value: {
								type: 'text',
								title: 'Value'
							}
						}
					}
				}
			}

			if( jpath ) {

				el.groups.general.fields.searchOnField = {
					type: 'combo',
					multiple: true,
					title: jpath.name,
					options: jpath.jpaths
				};
			}

			if( operator ) {

				el.groups.general.fields.operator = {
					type: 'combo',
					multiple: true,
					title: operator.name,
					options: [
						{ title: '=', key: '=' },
						{ title: '!=', key: '!=' },
						{ title: '>', key: '>' },
						{ title: '<', key: '<' },
						{ title: 'between', key: 'btw' },
						{ title: 'starts with', key: 'starts' },
						{ title: 'end with', key: 'end' },
						{ title: 'contains', key: 'contains' },
						{ title: 'does not contain', key: 'notcontain' }
					]
				}
			}

			return el;
			// makeConfig()
		},

		makeStructure: function( fields, callback ) {

			var i = 0,
				l = fields.length,
				allFields = {};
				
			for( ; i < l ; i ++ ) {

				if( ! fields[ i ].groups.general ) {
					continue;
				}

				var defaultVal = fields[ i ].groups.general[ 0 ].defaultVal ? fields[ i ].groups.general[ 0 ].defaultVal[ 0 ] : ''

				allFields[ fields[ i ].groups.general[ 0 ].name[ 0 ] ] = {
					type: 	fields[ i ].groups.general[ 0 ].type[ 0 ],
					title: 	fields[ i ].groups.general[ 0 ].label[ 0 ],
					default: defaultVal
				};

				if( callback ) {
					callback( fields[ i ], allFields[ fields[ i ].groups.general[ 0 ].name[ 0 ] ] );
				}

				makeOptions( allFields[ fields[ i ].groups.general[ 0 ].name[ 0 ] ], fields[ i ] );
			}
			
			return allFields;
		},

		makeForm: function() {
			return new Form( );
		}
	}
});