define(['modules/default/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this,
				cfg = $.proxy(this.module.getConfiguration, this.module);

			this.nbComponentTds = 1;

			/* Creates the necessary DOM elements */
			this.dom = $("<table />", { cellpadding: 0, cellspacing: 0 } );
			this.colgroup = $("<colgroup />").appendTo( this.dom );
			this.thead = $("<thead />").appendTo( this.dom );
			this.tfoot = $("<tfoot />").appendTo( this.dom );
			this.tbody = $("<tbody />").appendTo( this.dom );

			/* Creates the perfumes */
			this.perfumes = [];

			/* Creates the ingredients */
			this.ingredients = [];
			this.bases = [];
			
			this.indexedIngredients = {};
			this.indexedBases = {};

			this.module.getDomContent().html( this.dom );

			this.trsPaths = [];
			this.lastTr;

			this.makeDom();
		},

		makeDom: function() {

			var self = this;

			this.colgroup.append('<col>');
			//this.colgroupPerfumes = $('<col />');//.css('background-color', 'blue');
			//this.colgroup.append( this.colgroupPerfumes );
			this.thead.append('<tr><th>Ingredient</th></tr>');
			this.thead.append('<tr><th></th></tr>');

			this.tfoot.append('<tr class="totalParts"><td>Total parts : </td></tr>');
			this.tfoot.append('<tr class="totalPrice"><td>Total price</td></tr>');

			this.dom.on('click', 'td, th', function( ) {

				var pos =  $(this).index() - self.getNbComponentTds();
				for( var i = 0, l = self.perfumes.length ; i < l ; i ++ ) {
					if( self.perfumes[ i ].position == pos ) {
						self.selectPerfume( self.perfumes[ i ] );
					}
				}
			})
		},

		getPerfumeTitle: function( perfume ) {
			return perfume.name;
		},

		getComponentTitle: function( component ) {
			return component.name;
		},

		hasChildren: function( component ) {

			return ( component.ingredients && component.ingredients.length > 0 ) || ( component.bases && component.bases.length > 0 ); 
		},


		addPerfumeTheadTd: function( perfume, perfumePosition ) {

			var self = this,
				tdTitle = $('<th />').addClass('perfumeName').html( this.getPerfumeTitle( perfume ) ),
				tdControl = $('<th />').html( '' );


			var col = $("<col />").addClass('perfume');
			perfume.col = col;

			this.colgroup.children().eq( perfumePosition + self.getNbComponentTds() - 1 ).after( perfume.col );

			this.thead
				.children('tr:eq(0)')
				.children()
				.eq( perfumePosition + self.getNbComponentTds() - 1 )
				.after( tdTitle );

			this.thead
				.children()
				.eq(1)
				.children()
				.eq( perfumePosition + self.getNbComponentTds() - 1)
				.after( tdControl );
		},

		updatePerfumeInformation: function( perfume, information ) {
			perfume.tfootParts.html( information.parts );
			perfume.tfootPrice.html( Math.round( information.price * 100 ) / 100 );
		},

		addPerfumeTfootTd: function( perfume, perfumePosition ) {

			var self = this,
				tdPrice = $('<td />').html(''),
				tdParts = $('<td />').html('');
				
			perfume.tfootPrice = tdPrice;
			perfume.tfootParts = tdParts;

			this.tfoot
				.children('tr:eq(0)')
				.children()
				.eq( perfumePosition + self.getNbComponentTds() - 1 )
				.after( tdParts );

			this.tfoot
				.children('tr:eq(1)')
				.children()
				.eq( perfumePosition + self.getNbComponentTds() - 1 )
				.after( tdPrice );
		},


		selectPerfume: function( perfume ) {

			this.unSelectPerfume( this.selectedPerfume );
			perfume.selected = true;

			perfume.col.addClass('selected');
			this.selectedPerfume = perfume;
		},

		unSelectPerfume: function( perfume ) {

			if( ! perfume ) {
				return;
			}

			perfume.selected = false;
			perfume.col.removeClass('selected');

		},

		updatePerfume: function( perfume ) {

		//	this.colGroupPerfumes.attr( 'colspan', this.perfumes.length );

			var self = this,
				currentTr,
				id,
				path = [],
				tr;

			this.lastTr = false;
			var perfumePosition = perfume.position;

			if( perfumePosition == undefined ) {
				perfumePosition = this.perfumes.length - 1;
			}

			if( ! perfume._inserted ) {
				this.addPerfumeTheadTd( perfume, perfumePosition );
				this.addPerfumeTfootTd( perfume, perfumePosition );
			}

			for( var i = 0, l = this.usedComponents.length ; i < l ; i ++ ) {

				id = this.generatePathId( this.usedComponents[ i ].path );
				tr = self.findTrForPath( id );

				
			//	console.log( tr );
				//console.log( id );
				if( tr ) { // Ingredient exists

				
					if( ! perfume.components[ id ] ) { // td doesn't exist

						$( tr )
							.children()
							.eq( perfumePosition + self.getNbComponentTds() - 1 )
							.after(
								self.makePerfumeIngredientTd( perfume, this.usedComponents[ i ] )
							);
					}
					tr = $( tr );

				} else {
					
					//if( ! this.usedComponents[ i ].parent ) {
					//	perfume.components.push( this.usedComponents[ i ] );
					//}

					//var id = tr; // tr was actually a pathID
					tr = self.makeComponentTr( this.usedComponents[ i ] );

					if( this.usedComponents[ i ] && this.usedComponents[ i ].parent && ! this.usedComponents[ i ].parent.childrenVisible ) {
						$(tr).hide();
					}

					// Let's register it
					this.registerTr( id, tr );
				}

//console.log( this.lastTr );
				if( this.lastTr ) {
					this.lastTr.after( tr );
				} else {
					this.tbody.append( tr );
				}

				this.lastTr = $( tr );


			}

			perfume._inserted = true;

		},

		findTrForPath: function( id ) {

			if( this.trsPaths[ id ] ) {
				return this.trsPaths[ id ];
			}
			return false;
		},

		registerTr: function( id, tr ) {
			this.trsPaths[ id ] = tr;
		},

		generatePathId: function( path ) {

			if( ! ( path instanceof Array ) ) {
				path = [ path ];
			}
			var i = 0,
				l = path.length,
				pathString = "";

			for( ; i < l ; i ++ ) {
				pathString += ( path[ i ].isBase ? 'base' : ( path[ i ].isIngredient ? 'ingredient' : '' ) ) + ":" + path[ i ].id + ";";
			}

			return pathString;
		},

		showChildrenOfComponent: function( component ) {

			if( component.childrenVisible && component.children.length > 0 ) {
				for( var i = 0, l = component.children.length ; i < l ; i ++ ) {
					this.showChildrenOfComponent( component.children[ i ] );
				}
			} 

			component.tr.show();
		},

		hideChildrenOfComponent: function( component, tag ) {

			if( tag ) {
				component.childrenVisible = false;
			} else {
				component.tr.hide();
			}

			if( ! component.children ) {
				return;
			}

			for( var i = 0, l = component.children.length ; i < l ; i ++ ) {
				this.hideChildrenOfComponent( component.children[ i ] );
			}
		},

		makeComponentTds: function( component, callback ) {
			
			var self = this;
			var comp = this.getComponent( component );
			var hasChildren = this.hasChildren( comp );

			var title = $("<div />").html( this.getComponentTitle( comp ) );

			var td = $("<td />")
						.append( this.getComponentTitle( comp ) )
						.css( 'padding-left', component.path.length * 10 + "px");
			
			if( hasChildren ) {

				var triangle = $( "<div />" ).addClass( 'triangle-right' ).on('click', function( e ) {

					if( component.triangle.hasClass( 'triangle-right' ) ) {

						component.triangle.removeClass( 'triangle-right' ).addClass( 'triangle-bottom' );
						component.childrenVisible = true;
						self.showChildrenOfComponent( component );

					} else {

						component.triangle.addClass( 'triangle-right' ).removeClass( 'triangle-bottom' );
						self.hideChildrenOfComponent( component, true );
					}

				} );

				component.triangle = triangle;
				td.prepend( triangle );	

			}

			callback( td );
		},

		getNbComponentTds: function() {
			return this.nbComponentTds;
		},

		makeComponentTr: function( component ) {

			var self = this,
				perfumes = this.perfumes,
				i = 0,
				l = perfumes.length,
				tr = document.createElement('tr'),
				jqTr = $(tr),
				componentPath = component.path;
					
			component.tr = jqTr;


			// Adding TD
			this.makeComponentTds( component, function( td ) {
				jqTr.append( td );
			} );


			// For all perfumes
			for( ; i < l ; i ++ ) {	
				jqTr.append( this.makePerfumeIngredientTd( perfumes[ i ], component ) );
			}

			return tr;
		},

		makePerfumeIngredientTd: function( perfume, component ) {

			var td = document.createElement("td");
			
			var id = this.generatePathId( component.path );
			
			if( component.path.length == 1 ) {

				if( component.isBase ) {
					for( var i = 0, l = perfume.bases.length ; i < l ; i ++ ) {
						if( perfume.bases[ i ].id == component.id )	{
							perfume.components[ id ] = perfume.bases[ i ];
						}
					}
				}

				if( component.isIngredient ) {
					for( var i = 0, l = perfume.ingredients.length ; i < l ; i ++ ) {
						if( perfume.ingredients[ i ].id == component.id )	{
							perfume.components[ id ] = perfume.ingredients[ i ];
						}
					}
				}

				if( ! perfume.components[ id ] ) {

					perfume.components[ id ] = new DataObject( $.extend( {}, component ) );
					perfume.components[ id ].parts = 0;
					perfume.components[ id ].percent = 0;
				}
			} else {

				perfume.components[ id ] = new DataObject( $.extend( {}, component ) );
			}

			
			if( component.path.length == 1 ) {
				perfume.baseComponents[ id ] = perfume.components[ id ];
			}

			return this.fillTdWithComponentOfPerfume( perfume, component, td );
		},


		/*
		 *	Fills the td with the UI for component-perfume tds
		 *	@param perfume {Object} the perfume column
		 *	@param component {Object} An abstracted component object returned by _locateComponentRecursively
		 */
		fillTdWithComponentOfPerfume: function( perfume, component, td ) {

			var self = this;

			if( ! td._exists ) {

				$( td ).append( td._DOMparts = $( '<input /> ').addClass( 'perfume-component-parts' ).bind( 'keyup', function( e ) {

					var parts = parseInt( $(this).val() ) || 0;
					var component = $(this).parent().get(0)._component; // Component of perfume

					if( parts != component.parts ) {

						if( component.parts == perfume.maxParts ) {
							component.parts = parts;
							if( parts < perfume.maxParts) {
								self.perfumeLookForMax( perfume );	
							}
						} else {

							component.parts = parts;
						}

						if( parts > perfume.maxParts ) {
							perfume.maxParts = parts;
						}
					
						self.triggerChange( perfume );
						self.updatePerfumeTds( perfume );
					}

				}) );
					
				if( component.path.length > 1 ) {
					td._DOMparts.attr('disabled', 'disabled');
				}


				$( td ).append( td._DOMslider = $( '<div /> ').addClass( 'perfume-component-slider' ) );

				td._DOMslider.slider( {
					min: 0,
					max: 1,
					step: 0.005,
					range: "min",
					slide: function( e, ui ) {
						td._component.parts = Math.round( ui.value * perfume.maxParts );
						td._component.percent = Math.round( ui.value );
						td._DOMparts.val( td._component.parts );
						self.triggerChange( perfume );
					},

					disabled: component.path.length > 1,

					change: function( e, ui ) {


						if( ! e.originalEvent ) {
							return;
						}
						var parts = Math.round( ui.value * perfume.maxParts );
						
						self.perfumeLookForMax( perfume );
						self.triggerChange( perfume );
						self.updatePerfumeTds( perfume );
//						}

					}

				} ) ;

				
				td._exists = true;

				if( ! perfume.tds ) {

					Object.defineProperty( perfume, 'tds', {
						value: [],
						enumerable: false,
						writable: true
					} );
				}

				perfume.tds.push( td );
				
			}

			var compPerfume = this.getComponentQuantityRelativeToPerfume( perfume, component );

			td._component = compPerfume;	// Perfume component instance
			td._componentGen = component; // Generic component instance
				
			if( parseInt( td._DOMparts.val() ) !== compPerfume.parts ) {
				td._DOMparts.val( Math.round( compPerfume.parts ) );
			}	
//console.log( compPerfume.percent );
	//console.log( compPerfume.percent != td._DOMslider.slider('value') );
	
			if( compPerfume.percent != td._DOMslider.slider('value') ) {
				td._DOMslider.slider( 'value', compPerfume.percent || 0);
			}

			return td;
		},

		perfumeLookForMax: function( perfume ) {

			var i = 0,
				l = perfume.components.length;

			perfume.maxParts = 0;
			for( i in perfume.baseComponents ) {
				
				perfume.maxParts = Math.max( perfume.maxParts, perfume.baseComponents[ i ].parts );
			}
		},


		updatePerfumeTds: function( perfume  ) {

			var i = 0,
				l = perfume.tds.length;

			for( ; i < l ; i ++ ) {
				
				this.fillTdWithComponentOfPerfume( perfume, perfume.tds[ i ]._componentGen, perfume.tds[ i ] );
			}
		},

		// Component is to look 
		findComponentIn: function( component, child ) {

			if( child.isBase ) {

 				if( ! component.bases ) {
					console.error('Component has no base, yet you are looking for a base.');
 				}

				i = 0,
				l = component.bases.length;
				for( ; i < l ; i ++ ) {

					if( component.bases[ i ].id == child.id ) {
						
						return this.getBase( component.bases[ i ] );
					}	
				}

				console.error('Cannot find base ' + child.id + ' in list ');

			} else if( child.isIngredient ) {

 				if( ! component.ingredients ) {
					console.error('Component has no ingredients, yet you are looking for an ingredient.');
 				}

				i = 0,
				l = component.ingredients.length;
				for( ; i < l ; i ++ ) {

					if( component.ingredients[ i ].id == child.id ) {
						return this.getIngredient( component.ingredients[ i ] );
					}	
				}

				console.error('Cannot find ingredient ' + child.id + ' in list ');
			}
			
		},

		getComponentQuantityRelativeToPerfume: function( perfume, componentGen ) {

			var componentPath = componentGen.path;

			var pathBaseString = this.generatePathId( componentGen.path[ 0 ] );
			var componentPerfumeBase = perfume.components[ pathBaseString ]; // Let's look at the base component for quantity


			var base = perfume,
				base2,
				baseNext,
				quantity,
				ingredient,
				i = 0,
				ingr = componentPath,
				l = ingr.length,
				path;

			while( i < l ) {

				path = this.generatePathId( ingr.slice( 0, i + 1 ) );
				target = perfume.components[ path ];

			/*	if( ! target ) {

					perfume.components[ path ] = new DataObject( $.extend({}, ingr[ i ] ) );
					delete perfume.components[ path ].tr;
					delete perfume.components[ path ].path;
					target = perfume.components[ path ];
				}*/
				
				quantity = this.calculateQuantity( target, quantity, base );

				if( ! quantity ) {
					return false;
				}

				if( i < l - 1 ) {
					base = this.getBase( ingr[ i ] );
				} else {
					base = this.getIngredient( ingr[ i ] );
				}
				
				//base = target;
				i++
			}

			var path = this.generatePathId( componentPath );
			
			var component = perfume.components[ path ];

			// If the component doesn't exist for the perfume, we create it
			component.parts = quantity.parts;
			component.percent = quantity.percent;

			return component;
		},

		calculateQuantity: function( component, topQuantity, componentParent ) {

			if( ! topQuantity && typeof componentParent.totalParts == "undefined" ) {
				console.error('Should not exist. Calculation ref is missing for level 2 ingredient');
				return;
			}

			if( ! topQuantity ) {

				if( ! componentParent ) {
					console.error('Should not exist. Perfume should have an argument maxParts');
					return;		
				}

				topQuantity = {};
				topQuantity.parts = component.parts;
				
				topQuantity.percent = component.parts / componentParent.maxParts;
			
			} else {
				
				for( var i = 0, l = componentParent.ingredients.length ; i < l ; i ++ ) {
					if( component.id == componentParent.ingredients[ i ].id ) {
						var parts = componentParent.ingredients[ i ].parts;
					}
				}

				topQuantity.percent =  parts / componentParent.totalParts * topQuantity.percent;
				topQuantity.parts = parts / componentParent.totalParts * topQuantity.parts;
	
			}

			return topQuantity;
		},

		eachPerfume: function( callback ) {

			var perf = this.perfumes,
				i = 0,
				l = perf.length;

			for( ; i < l ; i ++ ) {
				callback( perf[ i ] );
			}
		},

		getIngredientsIdsOfPerfume: function( perfume, asObject ) {
			return this.getIdsOfComponents( this.getFirstLevelComponentsOfPerfume( perfume, 'ingredients' ), true );
		},

		getBasesIdsOfPerfume: function( perfume, asObject ) {
			return this.getIdsOfComponents( this.getFirstLevelComponentsOfPerfume( perfume, 'bases' ), false );
		},

		getFirstLevelComponentsOfPerfume: function( perfume, component ) {

			if( ! perfume ) { 
				return false;
			}

			return ( perfume[ component ] || [] );
		},

		getIdsOfComponents: function( components, ingredient ) {

			if( ! Array.isArray( components ) ) {
				return [];
			}

			var i = 0,
				l = components.length,
				ids;

			ids = {};
			for( ; i < l ; i ++ ) {

				if( ingredient ) {
					components[ i ].isIngredient = true;
				} else {
					components[ i ].isBase = true;
				}

				ids[ components[ i ].id ] = $.extend( {}, components[ i ] ); // Create a new component
			}
		
			return ids;
		},


		_getAllUsedIngredients: function() {

			var ingredientsIds = {},
				self = this;

			this.eachPerfume( function( perfume ) {
				$.extend( ingredientsIds, self.getIngredientsIdsOfPerfume( perfume ) );
			} );

			return ingredientsIds;
		},

		_getAllUsedBases: function() {

			var basesIds = {},
				self = this;

			this.eachPerfume( function( perfume ) {
				$.extend( basesIds, self.getBasesIdsOfPerfume( perfume ) );
			} );
			return basesIds;
		},


		getAllComponentsFirstLevel: function( ) {

			var components = [],
				i,
				component,
				repo;

			repo = this._getAllUsedIngredients( );

			for( i in repo ) {
				components.push( repo[ i ] );
			}

			this._allUsedIngredients = repo;

			repo = this._getAllUsedBases( );

			for( i in repo ) {
				components.push( repo[ i ] );	
			}

			this._allUsedBases = repo;

			return components;
		},

		sortComponents: function( components ) {

			this.sortComponentsAlphabetically( components );
		},

		sortComponentsAlphabetically: function( components ) {
			var self = this;
			
			components.sort( function( a, b ) {
				return self.getComponent( a ).name > self.getComponent( b ).name ? 1 : -1;
			} );
		},

		getComponent: function( component ) {

			var comp;	
			var ingredientOrBase = !! component.isIngredient;

			if( comp = this[ ingredientOrBase ? 'indexedIngredients' : 'indexedBases' ][ component.id ] ) {
				return comp;
			} else {
				console.error( 'Could not find component with id ' + compId + ' in ' + ( ingredientOrBase ? 'indexedIngredients' : 'indexedBases' ) );
			}
		},

		getIngredient: function( ingredient ) {

			return this.getComponent( ingredient );
		},


		getBase: function( base ) {

			return this.getComponent( base );
		},

		reIndex: function( els, ingredientOrBase ) {

			var i = 0,
				l = els.length,
				repo = ingredientOrBase ? this.indexedIngredients : this.indexedBases;

			for( ; i < l ; i ++ ) {
				repo[ els[ i ].id || els[ i ]._id ] = els[ i ];
			}
		},
		
		update: {

			'ingredients': function( variable ) {

				if( variable == undefined ) {
					return;
				}

				this.ingredients = variable;
				this.reIndex( this.ingredients, true );
			},

			'bases': function( variable ) {

				if( variable == undefined ) {
					return;
				}

				this.bases = variable;	
				this.reIndex( this.bases, false );
			},

			'perfumeInformation': function( variable ) {

				if( variable == undefined ) {
					return;
				}

				for( var i = 0, l = this.perfumes.length ; i < l ; i ++ ) {

					if( variable.perfumeName == this.perfumes[ i ].name ) {
						this.updatePerfumeInformation( this.perfumes[ i ], variable );
					}
				}
			}
		},

		getDom: function() {
			return this.dom;
		},

		getSubComponents: function( root, path, stack, isIngredient, isBase, parent ) {

			var path2;

			for( var i = 0, l = root.length ; i < l ; i ++ ) {

				path2 = path.slice( );
				path2.push( root[ i ] );

				root[ i ].path = path2;
				root[ i ].parent = parent;

				if( parent ) {
					parent.children = parent.children || [];
					parent.children.push( root[ i ] );
				}

				if( isIngredient ) {
					root[ i ].isIngredient = true;
				}

				if( isBase ) {
					root[ i ].isBase = true;

					//root[ i ].totalParts = ;
					//root[ i ].isBase = true;
				}


				stack.push( root[ i ] );

				if( root[ i ].isBase ) {

					var baseRef = this.getBase( root[ i ] );
					root[ i ].totalParts = baseRef.totalParts;
					this.getChildrenOf( baseRef, path2, stack, root[ i ] );
				}
			}

		},



		// Relative child of a base, gets the one used by the base itself.
		getChildrenOf: function( component, path, stack, relParent ) {

			if( component.bases ) {
				
				this.getSubComponents( component.bases, path, stack, false, true, relParent );
			}
			
			if( component.ingredients ) {
				
				this.getSubComponents( component.ingredients, path, stack, true, false, relParent );
			}
		},

		triggerChange: function( perfume ) {
			this.module.controller.compositionChanged( perfume );
		},


		onActionReceive: {

			addPerfume: function( perfume ) {

				for( var i = 0, l = this.perfumes.length ; i < l ; i ++ ) {
					if( this.perfumes[ i ].name == perfume.name ) {
						return;
					}
				}


				Object.defineProperty( perfume, 'totalParts', {

					value: 0,
					writable: true,
					enumerable: false,
					configurable: false
				});

				Object.defineProperty( perfume, 'maxParts', {

					value: 0,
					writable: true,
					enumerable: false,
					configurable: false
				});

				Object.defineProperty( perfume, 'indexedIngredients', {

					value: this.indexedIngredients,
					writable: true,
					enumerable: false,
					configurable: false
				});


				Object.defineProperty( perfume, 'indexedBases', {

					value: this.indexedIngredients,
					writable: true,
					enumerable: false,
					configurable: false
				});

				this.perfumes.push( perfume );
				perfume.components = [];

				
				this.usedComponentsFirstLevel = this.getAllComponentsFirstLevel();
				this.sortComponents( this.usedComponentsFirstLevel );
				
				this.usedComponents = [];
				this.getSubComponents( this.usedComponentsFirstLevel, [], this.usedComponents );

				perfume.components = {};
				perfume.baseComponents = {};
				
				
				perfume.position = this.perfumes.length - 1;

				this.updatePerfume( perfume );

				this.selectPerfume( perfume );
				this.perfumeLookForMax( perfume );
				this.updatePerfumeTds( perfume );
			},

			'addIngredient': function( ingredient ) {

				if( this._allUsedIngredients[ ingredient.id ] ) {
					return;
				}

				var el = {
					id: ingredient.id,
					isIngredient: true,
					parent: undefined,
					parts: undefined
				};

				el.path = [ el ];

				this.usedComponentsFirstLevel.push( el );
				this.usedComponents.push( el );

				for( var i = 0, l = this.perfumes.length ; i < l ; i ++ ) {
					this.updatePerfume( this.perfumes[ i ] );
				}
			}
		},
		
		typeToScreen: {
			
		}

	});
	return view;
});
 
