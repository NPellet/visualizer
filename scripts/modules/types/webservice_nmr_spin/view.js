define(['modules/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this,
				cfg = $.proxy(this.module.getConfiguration, this.module);

			this.dom = $('<div></div>');
			this.system = $(this._getTable(cfg('systemSize' )));


			this.dom.append( this.system );
			this.module.getDomContent( ).html( this.dom );


			require( [ 'forms/button' ], function( Button ) {
				self.system.append( (self.buttonInst = new Button( cfg("buttonlabel"), function() {
					self.module.controller.doAnalysis();
				} ) ).render() );
			});

		},

	


		

		_getTable: function(size) {
			var content=[];

			content.push("Spin system");
			
			content.push("<table border=1><tbody id='table2'><tr>");
			content.push("<td></td>");
			content.push("<th>delta (ppm)</th>");
			for(var i=1; i<size;i++) {
				content.push("<th>J<sub>"+i+"-</sub> (Hz)</th>");
			}
			content.push("</tr>");

			for(var i=0; i<size; i++) {
				content.push("<tr>");
				content.push("<th>"+(i+1)+"</th>");
				content.push("<td><input type='input' size=4 value="+(i+1)+" name='delta_"+i+"'>");
				for (var j=0; j<i; j++) {
					content.push("<td><input type='input' size=4 value=7 name='coupling_"+i+"_"+j+"'>");
				}
				content.push("</tr>");
			}
			content.push("</tbody></table>");

			content.push("From: <input type='text' value=0 name='from' size=4>");
			content.push("to: <input type='text' value=10 name='to' size=4> ppm.");
			content.push("<select id='frequency' name='frequency'>");
			content.push("<option value='60'>60 MHz</option>");
			content.push("<option value='90'>90 MHz</option>");
			content.push("<option value='200'>200 MHz</option>");
			content.push("<option value='300'>300 MHz</option>");
			content.push("<option value='400' selected>400 MHz</option>");
			content.push("<option value='500'>500 MHz</option>");
			content.push("<option value='600'>600 MHz</option>");
			content.push("<option value='800'>800 MHz</option>");
			content.push("<option value='800'>800 MHz</option>");
			content.push("<option value='1000'>1000 MHz</option>");
			content.push("</select>");

			return "<form>"+content.join("")+"</form>";
		},

		lock: function() {
			this.locked = true;
			if( this.buttonInst ) {
				this.buttonInst.setTitle( this.module.getConfiguration( 'buttonlabel_exec' ));
				this.buttonInst.disable();
			}
		},

		unlock: function() {
			this.locked = false;
			if( this.buttonInst ) {
				this.buttonInst.setTitle( this.module.getConfiguration( 'buttonlabel'));
				this.buttonInst.enable();
			}
		},
		


		getDom: function() {
			return this.dom;
		}

	});
	return view;
});
 
