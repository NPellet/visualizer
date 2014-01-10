define(['jquery', 'src/header/components/default', 'src/util/versioning', 'forms/button', 'src/util/util'], function($, Default, Versioning, Button, Util) {

	var defaults = {
		label: false,
		elements: false,
		viewURL: false,
		dataURL: false,
		viewBranch: false,
		dataBranch: false,

		toggle: false
	}



	var buttons = { view: {}, data: {}};
	function makeHandlerButtons() {

		var pos = ['view', 'data'];
		var pos2 = ['View', 'Data']

		for(var i = 0; i < pos.length; i++) {

			(function(j) {
				var subject = j == 0 ?	Versioning.getView() : Versioning.getData();
				var handler = j == 0 ? Versioning.getViewHandler() : Versioning.getDataHandler();

				buttons[pos[j]].copyToLocal = new Button('Copy to local', function() {
					handler.serverCopy(subject);
				}, { color: 'red' });

				buttons[pos[j]].snapshotLocal = new Button('Snapshot', function() {
					handler.localSnapshot(subject);
				}, { color: 'blue' });

				buttons[pos[j]].autosaveLocal = new Button('Autosave', function(event, val, item) {
					handler.localAutosave(val, function() {
						
						return subject;
					}, function() {
						item.children().find('span').remove();
						var date = new Date();
						date = Util.pad(date.getHours()) + ":" + Util.pad(date.getMinutes());
						item.children().append('<span> (' + date + ')</span>');
					});
				}, { checkbox: true, color: 'blue' });

				buttons[pos[j]].branchLocal = new Button('Make branch', function() {

					require(['forms/formfactory', 'jqueryui', 'forms/button'], function(FormFactory, jqueryui, Button) {

						var div = $('<div></div>').dialog({ modal: true, width: '80%', title: "Make brach"});
						div.parent().css('zIndex', 10000);
						
						FormFactory.newform(div, {
							sections: {
								'cfg': {
									config: {
										multiple: false,
										title: 'Branch name'
									},

									groups: {
										'general': {
											config: {
												type: 'list'
											},

											fields: [

												{
													type: 'Text',
													name: 'name',
													multiple: false,
													title: 'Name'
												}
											]
										}
									}
								}
							}
						}, function(form) {
							var save = new Button('Save', function() {
								form.dom.trigger('stopEditing');
								var value = form.getValue();
								handler.localBranch(subject, value.cfg[0].general[0].name[0]);	
								form.getDom().dialog('close');
							});
							save.setColor('blue');
							form.addButtonZone(save);
						});
					});

				}, { color: 'blue' });

				buttons[pos[j]].revertLocal = new Button('Revert head', function() {

					handler.localRevert(subject);
					
				}, { color: 'blue' });

				buttons[pos[j]].localToServer = new Button('Push to server', function(event, val, item) {
					handler.serverPush(subject).done(function() {
						item.children().find('span').remove();
						var date = new Date();
						date = Util.pad(date.getHours()) + ":" + Util.pad(date.getMinutes());
						item.children().append('<span> (' + date + ')</span>');
					});
				}, { color: 'green' });
			}) (i);
		}

		return buttons;
	}


	var versioningElement = function() {};
	$.extend(versioningElement.prototype, Default, {

		getReady: function() { // Gets DOM ready
			if(this.$_elToOpen)
				return this.$_elToOpen;

			this.$_elToOpen = $("<div />").attr('id', 'visualizer-dataviews');


			this._ready = true;
			makeHandlerButtons(); // Make those buttons !

			$dom = this.$_elToOpen;

			// And add 'em all !
			
			$dom.append('<h1>Data</h1>');

			$dom.append(buttons.data.copyToLocal.render());
			$dom.append(buttons.data.localToServer.render());
			$dom.append(buttons.data.snapshotLocal.render());
			$dom.append(buttons.data.autosaveLocal.render());
			$dom.append(buttons.data.branchLocal.render());
			$dom.append(buttons.data.revertLocal.render());

			var _dom = $('<div class="ci-dataview-path"><label>Data path : </label></div>');
			$dom.append(_dom);
			var _domel = $("<div />").appendTo(_dom);
			_domel.append(Versioning.getDataHandler().getDom());
		

			$dom.append('<br /><br />');
			$dom.append('<h1>View</h1>');

			$dom.append(buttons.view.copyToLocal.render());
			$dom.append(buttons.view.localToServer.render());
			$dom.append(buttons.view.snapshotLocal.render());
			$dom.append(buttons.view.autosaveLocal.render());
			$dom.append(buttons.view.branchLocal.render());
			$dom.append(buttons.view.revertLocal.render());

			var _dom = $('<div class="ci-dataview-path"><label>View path : </label></div>');
			$dom.append(_dom);
			var _domel = $("<div />").appendTo(_dom);
			_domel.append(Versioning.getViewHandler().getDom());
		
			this._versionDiv = $dom;


			Versioning.getViewHandler().updateButtons = this.updateButtons;
			Versioning.getViewHandler().doUpdateButtons();
			Versioning.getDataHandler().updateButtons = this.updateButtons;
			Versioning.getDataHandler().doUpdateButtons();
		},

		updateButtons: function(type, head, path) {

			if(!buttons[type].autosaveLocal)
				return;

			if(head !== 'head' || path !== 'local')
				buttons[type].autosaveLocal.disable();
			else
				buttons[type].autosaveLocal.enable();

			if(path == 'local') {

				buttons[type].copyToLocal.disable();
			//	buttons[this.type].localToServer.enable();

				buttons[type].snapshotLocal.enable();
				buttons[type].branchLocal.enable();

				if(head == 'head')
					buttons[type].revertLocal.disable();
				else
					buttons[type].revertLocal.enable();
				
			} else {
				buttons[type].copyToLocal.enable();
			//	buttons[this.type].localToServer.disable();

				buttons[type].snapshotLocal.disable();
				buttons[type].branchLocal.disable();
				buttons[type].revertLocal.disable();
			}
		},

	

		_onClick: function() { // Overwrite usual onclick which loads a list / loads views/datas
			var el = this.getReady();
			this.setStyleOpen(this._open);
			if(this._open) {
				this.open();
			} else {
				this.close();
			}
		}
	});

	return versioningElement;
});
