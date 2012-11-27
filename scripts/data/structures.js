
define(function() {

	return {
		
		'object': "object",
		'mol2d': "string",
		'molfile2D': "string",
		'gif': "string" ,
		'picture': "string",
		'string': "string",
		'gif': "string",
		'jpg': "string",
		'jpeg': "string",
		'png': "string",
		'number': "number",
		'mf': 'string',
		'jcamp': "string",
		"downloadLink": "string",

		'boolean': "boolean",
		'arrayXY': {
			'type': 'array',
			'elements': ['number', 'number']
		},

		'matrix': {
			'type': 'object'
		},

		'tree': {
			'type': 'object'
		},

		'fromTo': {
			'type': 'object',
			'elements': {
				'from': 'number',
				'to': 'number'
			}
		},

		'loading': {
			'type': 'object',
			'elements': {
				'title': 'string',
				'series': {
					'type': 'array',
					'nbElements': 6,
					'elements': {
						'type': 'object',
						'elements': {
							'label': 'string',
							'data': {
								'type': 'array',
								'elements': {
									'type': 'object',
									'elements': {
										'a': 'number',
										'c': 'string',
										'h': 'number',
										'info': 'object',
										'l': 'string',
										'u': 'string',
										'n': 'string',
										'o': 'number',
										'w': 'number',
										'x': 'number',
										'y': 'number'
									}
								}
							}
						}
					}
				}
			}
		},


		'gridSelector': {
			'type': 'object',
			'elements': {
				'categories': {
					'type': 'array',
					'elements': {
						'type': 'object',
						'elements': {
							'selectorType': 'string',
							'name': 'string',
							'label': 'string',
							'defaultValue': 'number',
							'defaultMaxValue': 'number',
							'defaultMinValue': 'number',
							'maxValue': 'number',
							'minValue': 'number'
						} 
					}
				},

				'variables': {
					'type': 'array',
					'elements': {
						'type': 'object',
						'elements': {
							'name': 'string',
							'label': 'strig'
						}
					}
				}
			}
		},

		'chart': {

			"type": "object",
			"elements": {
				"serieLabels": {
					"type": "array",
					"elements": "string"
				},


				"series": {
					"type": "array",
					"elements": {
						"type": "array",
						"elements": {
							"type": "object",
							"elements": {
								"value": "number",
							},
							"otherElementsPossible": true
						}
					}
				},

				"title": "string",
				"x": {
					"type": "array",
					"elements": "number"
				},

				"xAxis": {
					"type": "object",
					"elements": {
						"label": "string",
						"maxValue": "number",
						"minValue": "number"
					}
				},

				"yAxis": {
					"type": "object",
					"elements": {
						"label": "string"
					}
				}
			}
		},

		'chemical': {/*
			"type": "object",
			"elements": {

				"entry": {
					"type": "array",
					"elements": {*/
						
						"type": "object",
						"elements": {

							"_entryID": "int",
							"supplierName": "string",
							"_dateCreated": "string",
							"_dateLastModified": "string",
							"iupac": {
								"type": "array",
								'nbElements': 2,
								"elements": {
									"type": "object",
									"elements": {
										"value": "string",
										"language": "string"	
									}
								}
							},
							
							"mf": {
								"type": "array",
								'nbElements': 2,
								"elements": {
									"type": "object",
									"elements": {
										"value": "mf",
										"mw": "int",
										"exactMass": "int" 
									}
								}
							},
							
							"mol": {
								"type": "array",
								'nbElements': 2,
								"elements": {
									"type": "object",
									"elements": {
										"value": "molfile2D",
										"gif": "gif"
									}
								}
							},
							
							"rn": {
								"type": "array",
								'nbElements': 2,
								"elements": {
									"type": "object",
									"elements": {
										"value": "int"
									}
								}
							},
							"batchID": "string",
							"catalogID": "string",
							"entryDetails": "chemicalDetails"
						}
				/*	}
				}
			}*/
		},
		
		"chemicalDetails": {
			"type": "object",
			"elements": {
				"_entryID": "int",
				"supplierName": "string",
				"_dateCreated": "string",
				"_dateLastModified": "string",
				"iupac": {
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"value": "string",
							"language": "string"	
						}
					}
				},
				
				"mf": {
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"value": "mf",
							"mw": "int",
							"exactMass": "int" 
						}
					}
				},
				
				"mol": {
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"value": "molfile2D",
							"gif": "gif"
						}
					}
				},
				
				"rn": {
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"value": "int"
						}
					}
				},
				
				"batchID": "string",
				"catalogID": "string",
				
				"bp": {
					
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"pressure": "number",
							"high": "number",
							"low": "number"
						}
					}
					
				},
				
				"mp": {
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"pressure": "number",
							"high": "number",
							"low": "number"
						}
					}
					
				},
				
				"rn": {
					
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"value": "number"
						}
					}
					
				},
				
				"density": {
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"high": "number",
							"low": "number",
							"temperature": "number",
						}
					}
					
				},
				
				"mol3d": {
					"type": "array",
					"elements": "molfile3d"
				},
				
				"ir": {
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"conditions": "string",
							"solvent": "string",
							"jcamp": "jcamp",
							"view": {
								"type": "object",
								"elements": {
									"description": "string",
									"value": "string",
									"url": "string",
									"pdf": "string"
								}
							}
						}
					}
				},
				
				
				"nmr": {
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"pressure": "string",
							"solvent": "string",
							"experiment": "string",
							"frequency": "number",
							"nucleus": "string",
							"temperature": "string",
							"jcamp": "jcamp",
							"view": {
								"type": "object",
								"elements": {
									"description": "string",
									"value": "string",
									"url": "string",
									"pdf": "string"
								}
							}
						}
					}
				},

				"nmrExperiment": {
					"type": "object",
					"elements": {
						"1H":{
							"type": "array",
							"elements": {
								"type": "object",
								"elements": {
									"pressure": "string",
									"solvent": "string",
									"experiment": "string",
									"frequency": "number",
									"nucleus": "string",
									"temperature": "string",
									"jcamp": "jcamp",
									"view": {
										"type": "object",
										"elements": {
											"description": "string",
											"value": "string",
											"url": "string",
											"pdf": "string"
										}
									}
								}
							}
						},
						"13C":{
							"type": "array",
							"elements": {
								"type": "object",
								"elements": {
									"pressure": "string",
									"solvent": "string",
									"experiment": "string",
									"frequency": "number",
									"nucleus": "string",
									"temperature": "string",
									"jcamp": "jcamp",
									"view": {
										"type": "object",
										"elements": {
											"description": "string",
											"value": "string",
											"url": "string",
											"pdf": "string"
										}
									}
								}
							}
						},
						"cosy":{
							"type": "array",
							"elements": {
								"type": "object",
								"elements": {
									"pressure": "string",
									"solvent": "string",
									"experiment": "string",
									"frequency": "number",
									"nucleus": "string",
									"temperature": "string",
									"jcamp": "jcamp",
									"view": {
										"type": "object",
										"elements": {
											"description": "string",
											"value": "string",
											"url": "string",
											"pdf": "string"
										}
									}
								}
							}
						},
						"hsqc":{
							"type": "array",
							"elements": {
								"type": "object",
								"elements": {
									"pressure": "string",
									"solvent": "string",
									"experiment": "string",
									"frequency": "number",
									"nucleus": "string",
									"temperature": "string",
									"jcamp": "jcamp",
									"view": {
										"type": "object",
										"elements": {
											"description": "string",
											"value": "string",
											"url": "string",
											"pdf": "string"
										}
									}
								}
							}
						},
						"hmbc":{
							"type": "array",
							"elements": {
								"type": "object",
								"elements": {
									"pressure": "string",
									"solvent": "string",
									"experiment": "string",
									"frequency": "number",
									"nucleus": "string",
									"temperature": "string",
									"jcamp": "jcamp",
									"view": {
										"type": "object",
										"elements": {
											"description": "string",
											"value": "string",
											"url": "string",
											"pdf": "string"
										}
									}
								}
							}
						},
						"jresolv":{
							"type": "array",
							"elements": {
								"type": "object",
								"elements": {
									"pressure": "string",
									"solvent": "string",
									"experiment": "string",
									"frequency": "number",
									"nucleus": "string",
									"temperature": "string",
									"jcamp": "jcamp",
									"view": {
										"type": "object",
										"elements": {
											"description": "string",
											"value": "string",
											"url": "string",
											"pdf": "string"
										}
									}
								}
							}
						}						
					}
						
				},				
				
				
				"mass": {
					"type": "array",
					"elements": {
						"type": "object",
						"elements": {
							"experiment": "string",
							"jcamp": "jcamp"
						}
						
					}
					
				},

				"massExperiment": {
					"type": "object",
					"elements": {
						"hplcMS":{
							"type": "array",
								"elements": {
								"type": "object",
								"elements": {
									"experiment": "string",
									"jcamp": "jcamp"
								}
							}
						},
						"gcMS":{
							"type": "array",
								"elements": {
								"type": "object",
								"elements": {
									"experiment": "string",
									"jcamp": "jcamp"
								}
							}
						},
						"ms":{
							"type": "array",
								"elements": {
								"type": "object",
								"elements": {
									"experiment": "string",
									"jcamp": "jcamp"
								}
							}
						}						
					}
						
				}
				
			}
		},

		"pdb": "string",
		"jsmolscript": "string",
	};


})

