define(['forms/button', 'util/util'], function(Button, Util) {

	var buttons = { view: {}, data: {}};
	function makeHandlerButtons(datahandler, viewhandler, view, data) {

		var pos = ['view', 'data'];
		var pos2 = ['View', 'Data']

		for(var i = 0; i < pos.length; i++) {

			(function(j) {
				var subject = j == 0 ?	view : data;
				var handler = j == 0 ? viewhandler : datahandler;

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

				buttons[pos[j]].revertLocal = new Button('Revert to this version', function() {

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

	function addButtons(container, datahandler, viewhandler, data, view) {

		container.append(new Button('Push view to server', function() {
			viewhandler.serverPush(view);
		}).render());
			
		container.append(new Button('Save locally', function() {
			console.log(JSON.stringify(view));
			console.trace();
			if(viewhandler)
				viewhandler.localSave(view);
		}).render());

		if((datahandler || viewhandler) && (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB)) {

			makeHandlerButtons(datahandler, viewhandler, view, data);

			var button = new Button('<span class="ui-icon ui-icon-gear"></span>', function() {
				var $this = $(this);
				if($this.hasClass('bi-active')) {
				$("#visualizer-dataviews").hide();
					$this.removeClass('bi-active');
					return;
				}
				$this.addClass('bi-active');
					
				var $dom = $("#visualizer-dataviews");
				if($dom.length == 0) {
					$dom = $("<div>").attr('id', 'visualizer-dataviews').appendTo('body');

					if(datahandler) {
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
						_domel.append(datahandler.getDom());
					}

					if(viewhandler) {

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
						_domel.append(viewhandler.getDom());
					}
				} else {
					$dom.show();
				}
			});

			container.append(button.render());
		}
	}

	function makeHeaderEditable(headerdom, configuration, viewhandler) {

		headerdom.text(configuration.title).attr('contenteditable', 'true').bind('keypress', function(e) {
			if(e.keyCode == 13) {
				e.preventDefault();
				$(this).trigger('blur');
				return false;
			}
		}).bind('blur', function() {
			configuration.title = $(this).text().replace(/[\r\n]/g, "");
			viewhandler.save();
		});
	}

	function makeHeader(headerdom, configuration) {
		headerdom.text(configuration.title || 'No title');
	}


	function updateButtons(type, head, path) {

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
	}

	return {
		addButtons: addButtons,
		makeHeaderEditable: makeHeaderEditable,
		makeHeader: makeHeader,
		updateButtons: updateButtons
	}
});