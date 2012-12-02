CI.DataViewHandler = function(dirUrl) {
	
	this._dirUrl = dirUrl;

	this.currentPath = [];
	this._allData = {};
	self._head = {};
	this.dom = $("<div />");

	this._data = {};
	this.structure = {
		server: { title: 'Server', children: {
					head: { title: 'Head' },
					stored: { title: 'Stored', children: true }
				}
		},

		local: { title: 'Local DB', children: {
					head: { title: 'Head' },
					stored: { title: 'Stored', children: true }
				}
		}
	};
}


/*
Level definition:
	Level 1: 	Server / Local
	Level 2:	Head / Stored
	Level 3:	Year + Month
	Level 4:	Date
	Level 5:	List
*/

CI.DataViewHandler.prototype = {
	
	setType: function(type) {
		this.type = type;
	},


	getData: function() {
		var self = this;
	/*	if(this._data[this.currentPath[1]])
			return self._data[this.currentPath[1]];
		else*/
			if(this.currentPath[1] == 'server')
				return this._getServer().pipe(function(data) {
					return self._data['server'] = data;
				});
			else
				return this._getLocal().pipe(function(data) {
					return self._data['local'] = data;
				});
	},


	getBranches: function() {
		return $.when(this.getData()).pipe(function(data) {
			var branches = {};

			for(var i in data) {
				branches[i] = i + " (" + (data[i].list.length + 1) + ")";
			}
			return branches;
		});
	},

	getElements: function(level) {
		var self = this;
		var branch = this.currentPath[2];
		return $.when(this.getData()).pipe(function(alldata) {
			data = alldata[branch].list;
			var all = {};
			for(var i = 0, l = data.length; i < l; i++) {
				all[data[i]._time] = self.makeFilename(data[i]);
			}


			all['head'] = self.makeFilename(alldata[branch].head);

			return all;
		});
	},

	pad: function(val) {
		return val < 10 ? "0" + val : val;
	},

	makeFilename: function(el, head) {

		if(!el._time)
			return 'Head';

		var time = new Date(el._time);
		var str = time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear() + " ";
		str += this.pad(time.getHours()) + ":" + this.pad(time.getMinutes());
		return str;
	},

	_getLocal: function() {
		var self = this;
		return CI.DB.open().pipe(function() {
			return CI.DB.getAll(self.type, self._dirUrl).pipe(function(all) {
				return all;
			});
		});
	},

	_getServer: function() {
		return $.get({});
	},

	makeMenu: function(level) {
		var toOpen = this.structure, self = this;
		var i = 0;

		// Want to display the top level (server/local)
		if(level == 1) {
			toOpen = {'server': 'Server', 'local': 'Local Database'};
		} else if(level == 2) { // (head/stored)
			toOpen = this.getBranches();
		} else if(level == 3) { // Display all month + years
			toOpen = this.getElements()
		}

		// When we got it !
		return $.when(toOpen).pipe(function(toOpen) {
			// It's still an object
			if(!(toOpen instanceof Array))
				return self.objectToMenu(toOpen, level, self.currentPath[level - 1]);
			else
				return self.arrayToMenu(toOpen, level, self.currentPath[level - 1]);
		});
	},

	arrayToMenu: function(array, level, parent) {

		var html = '';
		for(var i = 0, l = array.length; i < l; i++) {
			html += '<li draggable="false" data-parent="' + parent + '" data-el="' + array[i][1] + '"><a>' + array[i][0] + (level < 3  ? '<ul draggable="false" class="ci-dataview-menu" data-level="' + (level + 1) + '"><li><a>Fetching data...</a></li></ul>' : '') + '</a></li>';
		}
		return html;
	},

	objectToMenu: function(object, level, parent) {
		
		var html = '';
		for(var i in object) {
			html += '<li draggable="false" data-el="' + i + '" data-parent="' + parent + '"><a>' + object[i] + (level < 3  ? '<ul draggable="false" class="ci-dataview-menu" data-level="' + (level + 1) + '"><li><a>Fetching data...</a></li></ul>' : '') + '</a></li>';
		}
		return html;
	},

	bindEventsMenu: function(dom) {
		var self = this;
		dom.on('mouseenter', 'li', function(e) {
			
			var $this = $(this);
			if($this.find('.ci-fetched').length > 0)
				return;

			var ul = $this.parent();
			var level = ul.data('level');
			self.currentPath[level] = $this.data('el');
			// Leaf
			if(level == 3)
				return;

			self.makeMenu(level + 1).then(function(menu) {
				menu = $(menu);

				$this.find('ul').html(menu).addClass('ci-fetched');
				
				if(level + 1 == 3 && self.currentPath[2] == 'head')
					menu.find('ul').remove();

				self._menu.menu('refresh');
				
			}, function() {
				$this.find('ul').html('<li><a>No element here</a></li>').addClass('ci-fetched');

				self._menu.menu('refresh');
			});
			return false;
		});

		dom.on('mouseup', 'li', function() {

			var $this = $(this);
			var ul = $this.parent();
			var level = ul.data('level');
			self.currentPath[level] = $this.data('el');

			if($this.find('ul').length > 0)
				return;

			self.clickLeaf($this);
		});
	},

	buildDom: function(el) {
		var html = '<ul draggable="false" class="ci-dataview">';
		html += this._buildDomEl(1, this.currentPath[1]); // Local / Server
		html += this._buildDomEl(2, this.currentPath[2]); // Master / Branch1 / Branch2
		// Head or not head (handled by makeFilename)
		html += this._buildDomEl(3, this.makeFilename(el));	
		
		return html + '<li class="ci-spacer"></li></ul>';
	},

	_buildDomEl: function(level, val) {
		var htmlvalue;
		var value;

		if(level == 1) {
			if(val == 'server') {
				htmlvalue = 'On Server';
				value = 'server';
			} else {
				htmlvalue = 'Local DB';
				value = 'local';
			}
		} else if(level == 2) {
			htmlvalue = val;
			value = val;
		} else {
			htmlvalue = val;
			value = val;
		}

		//this.currentPath[level] = value;

		return '<li draggable="false" class="ci-dataview-lvl ci-dataview-lvl-' + level + '" data-level="' + level + '" data-value="' + escape(value) + '">' + htmlvalue + '</li>' + (level < 3 ? '<li class="inter">></li>' : '');
	},

	bindEventsDom: function(dom) {
		var self = this;
		dom.on('mousedown', 'li', function(e) {
			var $this = $(this);
			var pos = $this.position();
			self.makeMenu($this.data('level')).done(function(menu) {
				menu = $('<ul draggable="false" class="ci-dataview-menu" data-level="' + $this.data('level') + '"></ul>').append(menu).menu();
				self._menu = menu;
				self.bindEventsMenu(menu);
				menu.appendTo('#visualizer-dataviews').css({
					position: 'absolute',
					left: pos.left,
					top: pos.top + $this.outerHeight(true)
				});	
			});
		})

		$(document).on('mouseup', function() {
			$(".ci-dataview-menu").remove();
		});

	},

	getDom: function() {
		return this.dom;
	},

	make: function(el, branch, head) {


		if(head !== 'head' || this.currentPath[1] !== 'local')
			buttons[this.type].autosaveLocal.disable();
		else
			buttons[this.type].autosaveLocal.enable();

		if(this.currentPath[1] == 'local') {

			buttons[this.type].copyToLocal.disable();
			buttons[this.type].localToServer.enable();

			buttons[this.type].snapshotLocal.enable();
			buttons[this.type].branchLocal.enable();

			if(head == 'head')
				buttons[this.type].revertLocal.disable();
			else
				buttons[this.type].revertLocal.enable();
			
		} else {
			buttons[this.type].copyToLocal.enable();
			buttons[this.type].localToServer.disable();

			buttons[this.type].snapshotLocal.disable();
			buttons[this.type].branchLocal.disable();
			buttons[this.type].revertLocal.disable();
		}
	

		var html = $(this.buildDom(el));
		this.bindEventsDom(html);
		this.dom.empty().html(html);

		this._html = html;
	},


	clickLeaf: function(li) {
		var self = this;
		var i = li.data('el');
		var branch = li.data('parent');
		
		if(this.currentPath[1] == 'server') { // fetch head from server
			this.getFromServer(false);
		} else {
			$.when(this.getData()).done(function(el) {
				
				el = el[branch];

				if(i == 'head') {
					el = el.head;
					
				} else {
					for(var j = 0, l = el.list.length; j < l; j++) {
						if(el.list[j]._time == i) {
							el = el.list[j];
							break;
						}
					}
				}

				self.make(el, branch, i);
				self.onLoaded(el);
			});
		}	
	
	},

	getFromServer: function(url) {

		var def = $.Deferred();
		$.ajax({

			dataType: 'json',
			type: 'get',
			url: url,
			cache: false,
			success: function(data) {
				def.resolve(data);
			},
			error: function() {
				/*def.pipe(function() {
					return self.load(true);
				});
*/
				def.reject();
			}
		});

		return def;
	},

	serverCopy: function(data) {
		var self = this;
		var branch = data._name || 'Master';
		return this._localSave(data, 'head', branch).pipe(function(el) {

			return self.make(el, branch, 'head');
		});
	},

	serverPush: function() {
		return Saver.doSave(CI.URLs[(this.type == 'view' ? 'saveViewURL' : '')]);
	},

	load: function(local) {

		var self = this;

		function makeLocalCall() {

			// If no URL is defined
			return $.when(self._getLocalHead('Master')).pipe(function(el) {
				// Current OR empty (and saved) is sent from local DB
				// Get the master head

				self.currentPath[1] = 'local';
				self.currentPath[2] = 'Master';
				self.currentPath[3] = 'head';

				self.make(el, self.currentPath[2], self.currentPath[3]);

				return el;
			});
		}
		

		if(CI.URLs[this.type + "URL"] && !local)
			return this.getFromServer(CI.URLs[this.type + "URL"]).pipe(function(el) {
				self.currentPath[1] = 'server';
				self.currentPath[2] = el._name || 'Master';
				self.currentPath[3] = el._time || 'head';
				self.make(el, self.currentPath[2], self.currentPath[3]);

				return el;
			}, function() {

				return makeLocalCall();
			});
		else
			return makeLocalCall();
	},

	_saveToServer: function(obj, mode) {
		obj._local = false;
		return $.post({


		});
	},

	getMonth: function(i) {
		return this._months[i];
	},

	getDay: function(i) {
		return this._days[i];
	},

	_months: ['January', 'February', 'March', 'April', 'Mai', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	_days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],


	/* LOCAL */
	// Only available from the head !


	_getLocalHead: function(branch) {
		branch = branch || 'Master';
		
		return CI.DB.getHead(this.type, this._dirUrl, branch).pipe(function(el) {
			return el;
		});
	},



	_localSave: function(obj, mode, name) {
		var self = this;
		obj._local = true;
		// IF: Already Head => Erase current head, IF: New head: Overwrite head (keep current)
		obj._time = mode == 'head' ? false : Date.now();
		
		return CI.DB.open().pipe(function() {

			return CI.DB[mode == 'head' ? 'storeToHead' : 'store'](self.type, self._dirUrl, name, obj).pipe(function(element) {
				self.currentPath[1] = 'local';
				self.currentPath[2] = name;
				self.currentPath[3] = obj._time || 'head';
				return element;
			});
		});

	},



	localSnapshot: function(data) {
		this._localSave(data, 'stored', data._name || 'Master').pipe(function(element) {
			element._time = false; // We saved a snapshot, but have to reload the head (we continue working on the head)
			return element;
		});
	},

	localAutosave: function(val, callback, done) {
		var self = this;
		if(this._autosaveLocal)
			window.clearInterval(this._autosaveLocal);

		if(val)
			this._autosaveLocal = window.setInterval(function() {
				var el = callback();
				self._localSave(el, 'head', el._name || 'Master').done(function() {
					if(done)
						done();
				});
			}, 1000);
	},

	// When we create a branch, we switch to the branch
	localBranch: function(data, name) {
		data._name = name;
		data._time = false;
		var self = this;
		return this._localSave(data, 'head', name).pipe(function(obj) {

			self.make(obj, self.currentPath[2], self.currentPath[3]);
		});
	},

	// Do not change branch, just change the head
	localRevert: function(data) {
		var self = this;
		data._time = false;
		this._localSave(data, 'head', data._name || 'Master').done(function(obj) {
			self.make(obj, self.currentPath[2], self.currentPath[3]);
		});
	//	buttons.view.autosaveLocal.enable();
	},

	saveServer: function(data, name) {
		return this._saveToServer(data, 'stored', name);
	},

	autosaveServer: function(val, callback, done) {
		var self = this;
		if(this._autosaveServer)
			window.clearInterval(this._autosaveServer);

		if(val)
			this._autosaveServer = window.setInterval(function() {

				self._saveToServer(callback(), 'head', val.name).done(function() {
					if(done)
						done();
				});
			}, 10000);
	}
}


/*

	var date = new Date(), key, self = this;
		var all = {};
		var _allData = this._allData[this.currentPath[1]];

		if(level == 3) {
			
			for(var i = 0, l = _allData.length; i < l; i++) {
				date.setTime(_allData[i]._time);
				key = date.getMonth() + "-" + date.getFullYear();
				if(all[key])
					continue;
				all[key] = this.getMonth(date.getMonth()) + " " + date.getFullYear();
			}

			return all;
		} else {

			var monthYear = this.currentPath[3].split('-');
			var dateFrom = new Date();
				dateFrom.setMonth(monthYear[0]);
				dateFrom.setFullYear(monthYear[1]);
				dateFrom.setHours(0);
				dateFrom.setMinutes(0);
				dateFrom.setSeconds(0);
				dateFrom.setMilliseconds(0);
			
		
			if(level == 4) {
				dateFrom.setDate(1);
				var _dateFrom = dateFrom.getTime();
				var dateTo = new Date(_dateFrom); // One month later

					dateTo.setMonth(parseInt(monthYear[0]) + 1);
				
				var _dateTo = dateTo.getTime();
console.log(_dateTo);
				for(var i = 0, l = _allData.length; i < l; i++) {
					if(_allData[i]._time >= _dateFrom && _allData[i]._time < _dateTo) {
						if(!_allData[i]._time)
							continue;
						date.setTime(_allData[i]._time);
						key = date.getDate();
						if(all[key])
							continue;

						all[key] = this.getDay(date.getDay()) + " " + date.getDate();

					}
				}
				console.log(all);
				return all;

			} else if(level == 5) {

				var day = this.currentPath[4];

				dateFrom.setDate(day);
				var _dateFrom = dateFrom.getTime();
				var dateTo = new Date(_dateFrom);
					dateTo.setDate(dateTo.getDate() + 1);
				var _dateTo = dateTo.getTime();
				
				all = []; // Ensure leafs
				for(var i = 0, l = _allData.length; i < l; i++)
					if(_allData[i]._time >= _dateFrom && _allData[i]._time < _dateTo) {
						date.setTime(_allData[i]._time);
						all.push([self.makeFilename(_allData[i]), i]);
					}
				return all;

			}
		}

		*/