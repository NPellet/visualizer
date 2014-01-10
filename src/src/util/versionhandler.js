define(['src/util/util', 'src/util/localdb'], function(Util, db) {

	var DataViewHandler = function(dirUrl, defaultBranch, defaultUrl) {
		
		this.currentPath = [];
		this._allData = {};
		self._head = {};
		this.dom = $("<div />");
		
 		this.versionChangeDeferred = $.Deferred();
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

	DataViewHandler.prototype = {
		
		setType: function(type) {
			this.type = type;
		},

		set reviver(rev) {
			this._reviver = rev;
		},

		getData: function() {
			var self = this;
		
			if(this.currentPath[1] == 'server') {

				return this._getServer().pipe(function(data) {
					
					if(self.type == 'view') {
						return self._data['server'] = new ViewObject(data, true);
					} else if(self.type == 'data') {
						return self._data['server'] = new DataObject(data, true);
					}

				}, function() {
					return false;
				});

			} else {
				
				return this._getLocal().pipe(function(data) {
					//console.log(data);

					if( ! ( typeof el == 'object' ) ) {
						el = JSON.parse( el );
					}
					
					if(self.type == 'view') {
						return self._data['local'] = new ViewObject(data, true);
					} else if(self.type == 'data') {
						return self._data['local'] = new DataObject(data, true);
					}
					
				}, function() {
					return false;
				});
			}
		},


		getBranches: function() {
			var self = this;
			return $.when(this.getData()).pipe(function(data) {
				var branches = {};

				for(var i in data) {
					// i is branch name
					// data.revisions is all revs || data[i].list
					branches[i] = i + " (" + (data[i].list.length + (self.currentPath[1] == 'local' ? 1 : 0)) + ")";
				}
				return branches;
			});
		},

		getElements: function(level) {

			var self = this;
			var branch = this.currentPath[2];
			return $.when(this.getData()).pipe(function(alldata) {

				data = alldata[ branch ].list;
				var all = {};

				if(self.currentPath[1] == 'local' && alldata[branch].head)
					all['head'] = self.makeFilename(alldata[branch].head);

				for(var i = data.length - 1; i >= 0; i--)
					all[data[i]._time] = self.makeFilename(data[i]);
				
				return all;
			});
		},

		makeFilename: function(el, head) {

			if(!el._time)
				return 'Head';

			var time = new Date(el._time);
			var str = time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear() + " ";
			str += Util.pad(time.getHours()) + ":" + Util.pad(time.getMinutes());
			return str;
		},

		_getLocal: function() {
			var self = this;
			return db.open().pipe(function() {
				return db.getAll(self.type, self._dirUrl).pipe(function(all) {
					console.log(all);
					return all;
				});
			});
		},

		_getServer: function() {

			var def = $.Deferred();
			$.ajax({
				url: this.getUrl(),
				type: 'get',
				dataType: 'json',
				data: {
					action: 'Dir'
				},
				success: function(data) {

					for(var i in data) {
						data[i].list = [];
						for(var j in data[i].revisions)
							data[i].list.push({ _time: data[i].revisions[j] });
					}

					def.resolve(data);
				},

				error: function() {
					def.reject();
				}
			});

			return def;
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
					return self.objectToMenu(toOpen, level, self.currentPath[level - 1] || null, self.currentPath[level - 2] || null);
				else
					return self.arrayToMenu(toOpen, level, self.currentPath[level - 1] || null, self.currentPath[level - 2] || null);
			});
		},

		arrayToMenu: function(array, level, parent, parentParent) {

			var html = '';
			for(var i = 0, l = array.length; i < l; i++) {
				html += '<li draggable="false" data-parent-parent="' + parentParent + '" data-parent="' + parent + '" data-el="' + array[i][1] + '"><a>' + array[i][0] + (level < 3  ? '<ul draggable="false" class="ci-dataview-menu" data-level="' + (level + 1) + '"><li><a>Fetching data...</a></li></ul>' : '') + '</a></li>';
			}
			return html;
		},

		objectToMenu: function(object, level, parent, parentParent) {
			
			var html = '';
			for(var i in object) {
				html += '<li draggable="false" data-parent-parent="' + parentParent + '" data-el="' + i + '" data-parent="' + parent + '"><a>' + object[i] + (level < 3  ? '<ul draggable="false" class="ci-dataview-menu" data-level="' + (level + 1) + '"><li><a>Fetching data...</a></li></ul>' : '') + '</a></li>';
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
			});

			$(document).on('mouseup', function() {
				$(".ci-dataview-menu").remove();
			});

		},

		getDom: function() {
			return this.dom;
		},

		doUpdateButtons: function() {
			if(this.updateButtons)
				this.updateButtons(this.type, this.currentPath[3], this.currentPath[1]);
		},

		make: function(el, branch, head) {
			this.currentElement = el;
			this.doUpdateButtons();
			var html = $(this.buildDom(el));
			this.bindEventsDom(html);

			this.dom.empty().html(html);
			this.versionChange().notify(el);
			this._html = html;
		},

		versionChange: function() {
			return this.versionChangeDeferred;
		},

		clickLeaf: function(li) {
			var self = this;
			var i = li.data('el');
			var branch = li.data('parent');
			var mode = li.data('parent-parent');

			if(mode == 'server') { // fetch head from server

				var data = { branch: branch };
				if(i !== 'head')
					data.revision = i;

				this.getFromServer(data).done(function(el) {

					self.currentPath[1] = 'server';
					self.currentPath[2] = branch;
					self.currentPath[3] = i;
					self.make(el, branch, i);	
					self._savedServer = JSON.stringify(el);
					self.onReload(el);
				});
				
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

					self.currentPath[1] = 'local';
					self.currentPath[2] = branch;
					self.currentPath[3] = i;
					self.make(el, branch, i);
					self._savedLocal = JSON.stringify(el);
					self.onReload(el);
				});
			}
		},

		loadReadonly: function(def) {
			var self = this,
				url = this._defaultUrl;

			$.ajax({
				url: url,
				timeout: 200000,
				dataType: 'text',
				success: function(data) {
					//console.log(this._reviver);
					
					data = JSON.parse( data, self._reviver );
					self.make(data);
					self.onLoaded(data);
					def.resolve();
				}
			});
		},

		load: function(dirUrl, defaultBranch, defaultUrl) {

			this._dirUrl = dirUrl;
			this._defaultUrl = defaultUrl;
			this.defaultBranch = defaultBranch;

			var self = this;
			var def = $.Deferred();

			if(!this._dirUrl && this._defaultUrl) {
				this.loadReadonly(def);
				return def;
			}

			var branch = (this.defaultBranch || 'Master');
			var defServer = this.getFromServer({ branch: branch, action: 'Load' });
			var defLocal = self._getLocalHead(branch);

			// First load the server
			// Needed to identify branch and revision of the file
			
			$.when(defServer).then(function(server) {
				
				// Success
				var branch = server._name || self.defaultBranch;
				var rev = server._time || 'head';
				var saved = server._saved || 0;

				// Always compare to the head of the local branch
				var defLocal = self._getLocalHead(branch);

				$.when(defLocal).then(function(el) {

					// If the corresponding head does not exist, we copy the server data
					// to the head of the corresponding local branch
					if(!el._saved) {
						//doServer(server, branch, rev);
						self.serverCopy(server, branch, 'head').done(function() {

							doLocal(server, server._name, 'head');
						});

					} else {
						var savedLocal = el._saved || 0;					
						// Loads the latest file
						el._name = branch;

						if(savedLocal > saved && 1 == 0) // Prevent loading local for now
							doLocal(el, el._name, el._time || 'head');
						else
							doServer(server, branch, rev);
					}
				}, function() {
					doServer(server, branch, rev);
				});
			}, function(server) {
				$.when(self._getLocalHead(branch)).then(function(el) {

					doLocal(el, branch, el._time || 'head');
				});
			});

			function doLocal(el, branch, rev) {

				self.currentPath[1] = 'local';
				self.currentPath[2] = branch;
				self.currentPath[3] = rev;


				self._savedLocal = JSON.stringify(el);
				self.make(el, self.currentPath[2], self.currentPath[3]);
				def.resolve(el);
				
				self.onLoaded(el);
			}

			function doServer(el, branch, rev) {

				self.currentPath[1] = 'server';
				self.currentPath[2] = branch;
				self.currentPath[3] = rev;
				self.make(el, self.currentPath[2], self.currentPath[3]);
				self._savedServer = JSON.stringify(el);
				def.resolve(el);
				self.onLoaded(el);
			}
			
			return def;
		},


		getUrl: function() {
			return this._dirUrl;
		},

		getMonth: function(i) {
			return Util.getMonth(i);
		},

		getDay: function(i) {
			return Util.getDay(i);
		},

		
		/************************/
		/** LOCAL SIDE **********/
		/************************/


		_getLocalHead: function(branch) {
			branch = branch || 'Master';
			var self = this;
			
			return db.getHead(this.type, this._dirUrl, branch).pipe(function(el) {

				if( ! ( typeof el == 'object' ) ) {
					el = JSON.parse( el );
				}

				if(self.type == 'view')
					return new ViewObject(el, true);
				else if(self.type == 'data')
					return new DataObject(el, true);

			});
		},

		_localSave: function(obj, mode, name) {

			var self = this;
			obj._local = true;
			// IF: Already Head => Erase current head, IF: New head: Overwrite head (keep current)
			obj._time = mode == 'head' ? false : Date.now();
			obj._saved = Date.now();

			//this._savedLocal = JSON.stringify(obj);
			
			return db.open().pipe(function() {

				return db[mode == 'head' ? 'storeToHead' : 'store'](self.type, self._dirUrl, name, obj).pipe(function(element) {

					self.currentPath[1] = 'local';
					self.currentPath[2] = name;
					self.currentPath[3] = obj._time || 'head';
					return element;
				});
			});

		},

		localSave: function(obj) {
			
			this._localSave(obj, obj._time, obj._name);
		},

		localSnapshot: function(data) {
			if(!data)
				return;
			
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
				}, 10000);
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
		},


		/************************/
		/** SERVER SIDE *********/
		/************************/

		autosaveServer: function(val, callback, done) {
			var self = this;
			if(this._autosaveServer)
				window.clearInterval(this._autosaveServer);

			if(val)
				this._autosaveServer = window.setInterval(function() {

					self._saveToServer(callback()).done(function() {
						if(done)
							done();
					});
				}, 10000);
		},


		_saveToServer: function(obj) {

			//obj._name = mode || 'Master';
			obj._local = false;
			obj._saved = Date.now();
			obj._time = Date.now();
			
			this._savedServer = JSON.stringify(obj);
			return $.ajax({
				type: 'post',
				url: this.getUrl(),
				data: { content: this._savedServer, branch: obj._name, revision: obj._saved, action: 'Save' }
			});
		},

		getFromServer: function(data) {
			var self = this, 
				def = $.Deferred(),
				url = this.getUrl() || this._defaultUrl;

			if(!url) {
				return def.resolve({});
			}

			data.action = 'Load';
			$.ajax({
				dataType: 'text',
				type: 'get',
				url: url,
				cache: false,
				data: data || {},
				success: function(data) { // data is now a text
					self._savedServer = data;
					data = JSON.parse(data, self._reviver);
					def.resolve(data);
				},

				error: function() {
					def.reject();
				}
			});

			return def;
		},

		serverCopy: function(data, branch, rev) {
			var self = this;

			data._name = data._name || branch || 'Master';
			data._time = false;
			data._saved = Date.now();

			return this._localSave(data, 'head', data._name).pipe(function(el) {
				return self.make(el, data._name, 'head');
			});
		},

		serverPush: function(obj) {
			return this._saveToServer(obj);
		}
	}

	return DataViewHandler;
});
