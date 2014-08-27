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
        onActionReceive: {},
		inDom: function() {
	
		},

		resolveReady: function() {

			this.module._resolveView();
		},

		startLoading: function( rel ) {

			this.loadingElements = this.loadingElements || [];
			if( this.relsForLoading().indexOf( rel ) > -1 && this.loadingElements.indexOf( rel ) == -1 ) {

				this.loadingElements.push( rel );
				this.showLoading();
			}
		},

		endLoading: function( rel ) {

			this.loadingElements = this.loadingElements || [];
			
			if( this.relsForLoading().indexOf( rel ) > -1 && this.loadingElements.indexOf( rel ) > -1 ) {

				this.loadingElements.splice( this.loadingElements.indexOf( rel ), 1 );

				if( this.loadingElements.length == 0 ) {
					this.hideLoading();
				}
			}
		},

		showLoading: function() {
			
			this.module.domLoading.show();
		},

		hideLoading: function() {
			
			this.module.domLoading.hide();
		},

		relsForLoading: function() {
			return this._relsForLoading || ( this._relsForLoading = [] );
		}
	};
});