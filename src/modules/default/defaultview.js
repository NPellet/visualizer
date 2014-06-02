define(function() {
	return {
		
		initDefault: function() {
			this.onReady = true;
		},

		init: function() {
			this.resolveReady();
		},
		
		setModule: function( module ) {
			this.module = module;
		},

		update: {},
		blank: {},
		onResize: function() {},
		inDom: function() {
	
		},

		resolveReady: function() {

			this.module._resolveView();
		}
	};
});