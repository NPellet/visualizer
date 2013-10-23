
define( [ require, '../../field', 'libs/dynatree/dynatree' ], function( require, FieldDefaultConstructor ) {

	var FieldConstructor = function(name) {

		var self = this;

		this.name = name;
		this.domExpander = $("<div></div>").dynatree({

			onActivate: function(node, event) {

				if( node.data.isFolder ) {
					return;
				}				
				self.getElementExpanded( ).value = node.data.key;
			},

			onClick: function(node, event) {

				if( node && (!node.data.children || (node.data.children && node.data.children.length == 0 ))) {
					self.form.hideExpander( true );
				}
			}
		});
	};

	FieldConstructor.prototype = new FieldDefaultConstructor( );

	FieldConstructor.prototype.showExpander = function( fieldElement ) {

		var optionsSource = this.getOptions( fieldElement ),
			i,
			root = this.domExpander.dynatree( 'getRoot' ),
			tree = this.domExpander.dynatree( 'getTree' ),
			node;

		root.removeChildren( );
		root.addChild( optionsSource );


		if( tree.getActiveNode ) {
			if( ( node = tree.getActiveNode( ) ) != null ) {
				node.deactivate( );
			}
		}

		if( tree.getNodeByKey && ( node = tree.getNodeByKey( fieldElement.value ) ) ) {
			node.activateSilently( );
		}

		this._showExpander( fieldElement );
	};

	return FieldConstructor;

});