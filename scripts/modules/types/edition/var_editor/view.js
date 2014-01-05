define(['modules/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this,
				cfg = $.proxy(this.module.getConfiguration, this.module);

			this.dom = $('<div></div>');
			this.search = $('<table class="Search" cellpadding="5" cellspacing="0"><col width="100"><col width="*"></table>').css('width', '90%');

			this.dom.append( this.search );
			this.module.getDomContent( ).html( this.dom );
			this.oldVal = {};


			if(searchparams = cfg('searchparams' ) ) {

				for(var i in searchparams) {
					if(!i ||  ! searchparams[i].label)
						continue;
					this.search.append('<tr><td><nobr>' + searchparams[i].label + '</nobr></td><td>' + this._makeFormEl(searchparams[i], i) + '</td></tr>');
				}

				this.button = cfg( 'button', false );

				if(this.button) {

					require( [ 'forms/button' ], function( Button ) {

						self.search.append( (self.buttonInst = new Button( cfg("buttonlabel") || 'Search', function() {

							self.module.controller.doSearch();
							
						} ) ).render() );
					});

				}


				this.search.on( 'keyup', 'input[type=text]', function() {

					var searchTerm = $(this).val(),
						searchName = $(this).attr('name');

					if( !self.oldVal[ searchName ] || self.oldVal[ searchName ] !== searchTerm ) {
						$( this ).trigger( 'change' );
					}

					if( searchName !== undefined ) {
						self.module.controller.searchTerms[ searchName ] = searchTerm;
					}
					
					if ( ! self.button ) {
						self.module.controller.doSearch();
					}

				});

				this.search.on('change', 'select, input[type=text]', function() {
					
					var searchTerm = $(this).val();
					var searchName = $(this).attr('name');
					
					if(searchName !== undefined) {
						self.module.controller.searchTerms[ searchName ] = searchTerm;
					}

					
					if ( ! self.button ) {
						self.module.controller.doSearch();
					}
				});

				this.search.on('change', 'input[type=checkbox]', function() {
					var searchTerm = $(this).is(':checked');
					var searchName = $(this).attr('name');
					
					if( searchName !== undefined ) {
						self.module.controller.searchTerms[ searchName ] = searchTerm;
					}

					if ( ! self.button ) {
						self.module.controller.doSearch();
					}
				});
			}


			if (cfg('resultfilter')) {
        		eval("self.module.resultfilter = function(data) { try { \n " + cfg('resultfilter') + "\n } catch(_) { console.log(_); } }");
      		} else {
      			delete self.module.resultfilter;
      		}
		},

		_makeFormEl: function(spec, name) {

			switch(spec.fieldtype) {

				case 'combo':
					var opts = (spec.fieldoptions || '').split(';'),
						opt, html = '';
					html += '<option ' + (spec.defaultvalue == '' ? 'selected="selected" ' : '') + 'value=""></option>';
					for(var i = 0, l = opts.length; i < l; i++) {
						opt = opts[i].split(':');
						html += '<option ' + (spec.defaultvalue == opt[0] ? 'selected="selected" ' : '') + 'value="' + opt[0] + '">' + (opt[1] || opt[0]) + '</option>';
					}
					return '<select name="' + spec.name + '">' + html + '</select>';
				break;

				case 'checkbox':
					return '<input type="checkbox" ' + (spec.defaultvalue ? 'checked="checked"' : '') + ' value="1" offvalue="0" name="' +  spec.name +'" /></div>';
				break;
				
				default:
				case 'text':
					return '<input type="text" value="' + (spec.defaultvalue || '') + '" name="' + spec.name +'" style="width: 100%" /></div>';
				break;
			}	
		},

		inDom: function() {
			this.search.find('input:last').trigger('change');
		},

		lock: function() {
			this.locked = true;
			if( this.buttonInst ) {
				this.buttonInst.setTitle( this.module.getConfiguration( 'buttonlabel_exec', 'Loading...' ) || 'Loading...');
				this.buttonInst.disable();
			}
		},

		unlock: function() {
			this.locked = false;
			if( this.buttonInst ) {
				this.buttonInst.setTitle( this.module.getConfiguration( 'buttonlabel', 'Search' ) || 'Search' );
				this.buttonInst.enable();
			}
		},
		
		update: {
			'vartrigger': function(variable) {			
				if(variable == undefined)
					return;

				this.module.controller.doSearch();
			}
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		}

	});
	return view;
});
 
