
define( [ ], function(  ) {

	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		var self = this,
			dom = $("<div />"),
			div = $( "<div>adasd</div>" )
					.addClass( 'form-field' )
					.appendTo( dom )
					.bind('click', function() {
						
						self.showExpander();

					});

		this.div = div;
		this.dom = dom;
		
		return dom;
	};

	FieldConstructor.prototype.checkValue = function() {

		if( this.dom ) {

			var val = this.value,
				options = this.field.getOptions( this ),
				text = this.lookRecursively( val, options );

			if( text !== false ) {
				this.div.html( text.title + "asdasd" );
			}
		}

	}

	FieldConstructor.prototype.lookRecursively = function(key, pool) {
		
		var found = false,
			i = 0, l = pool.length;

		if( ! pool ) {
			return;
		}

		for(  ; i < l ; i++) {

			if( pool[ i ].key == key ) {
				return pool[ i ];
			}
			
			if( pool[ i ].children ) {

				if(found = this.lookRecursively( key, pool[ i ].children ) ) {
					
					return found;
				}
			}
		}

		return false;
	},



	FieldConstructor.prototype.getOptions = function() {
		return this.combooptions || false;
	}

	FieldConstructor.prototype.setOptions = function(options) {
		this.combooptions = options;
	}

	return FieldConstructor;
});