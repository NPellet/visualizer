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
		},

		startLoading: function( rel ) {

			if( this.relsForLoading().indexOf( rel ) > -1 ) {

				this.loadingElements = this.loadingElements || 0;
				this.loadingElements ++;
				this.showLoading();
			}
		},

		endLoading: function( rel ) {

			if( this.relsForLoading().indexOf( rel ) > -1 ) {

				this.loadingElements = this.loadingElements || 1;
				this.loadingElements --;

				if( ! this.loadingElements ) {
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