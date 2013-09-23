define(['forms/fielddefault', 'libs/dynatree/dynatree'], function(Default) {

	return $.extend({}, Default, {
		
		setText: function(index, text) {
			this.main.fieldContainer.children().eq(index).html(text);
		},
		
		setOptions: function(options, index) {
			
			if(index !== undefined)
				this.optionsIndexed[index] = options;
			else
				this.options = options;
			
			this.checkFillState(index);
			//this.setText(index, title);	
			//this.loadTree(index);
		},
		
		setOptionsUrl: function(url, index) {
			
			var field = this;
			$.ajax({
				url: url + "&init=1",
				dataType: 'xml',
				type: 'get',
				success: function(dataXml) {
					var xml = $($.parseXML(data)).children();
					var json = field.parseLazyRead(dom);
					field.options = json;
					//field.fil();
				}
			});
		},
		
		loadTree: function(index) {

			var field = this;		
			field.domTree = this.main.domExpander.empty().html('<div />').children();
			field.domTree.dynatree({
				
				children: [],
				imagePath: '',
				onLazyRead: function(node) {
					
					if(!node.data.isFolder)
						return;
					
					$.ajax({
						url: this.treeUrl + "&root=" + noda.data.key,
						data: field.main.form.getSerializedForm(),
						type: 'post',
						dataType: 'xml',
						timeout: 120000, // 2 minutes timeout
						success: function(data) {
							var xml = $($.parseXML(data)).children();
							var json = field.parseLazyRead(dom);
							node.removeChildren(false, true, true);
							node.setLazyNodeStatus(DTNodeStatus_Ok);
							node.addChild(json);
						}
					});
				},

				onActivate: function(node, event) {
						
					//event.stopPropagation();
					
					/*if(field.currentIndex !== undefined)
						var index = field.currentIndex;
	*/

					if(field.main.findExpandedElement())
						var index = field.main.findExpandedElement().index;


					var id = node.data.key;
					var icon = node.data.icon;
					var title = node.data.title;
					// If we click on a folder, do nothing.
					if(node.data.isFolder)
						return;

					field.main.changeValue(index, id);
					field.setText(index, title);
					field.main.hideExpander();

					var show = ((node.data.data && node.data.data.show) || '').split(' ');
					for(var i = 0, l = show.length; i < l; i++) {
						field.main.section.showHideSubSection(show, true);				
					}
				},

				onDeactivate: function(node) {
					var show = ((node.data.data && node.data.data.show) || '').split(' ');
					for(var i = 0, l = show.length; i < l; i++) {
						field.main.section.showHideSubSection(show, false);				
					}
				},
				
				onClick: function() {
					field._loadedCallback = [];
				},

				debugLevel: 0
			});
		},

		fillTree: function(index) {
			var options = this.options;
			if(this.optionsIndexed[index])
				options = this.optionsIndexed[index];

			var root = this.domTree.dynatree('getRoot');
			root.removeChildren();
			root.addChild(options);

			tree = this.main.domExpander.children().dynatree("getTree");
			if(!tree.getActiveNode)
				return;
			var node;
			if((node = tree.getActiveNode()) != null)
				node.deactivate();
				

			if(tree.getNodeByKey && (node = tree.getNodeByKey(this.main.getValue(index)))) {
				node.activateSilently();
			}
		},
		

		
		setValue: function(index, value) {		

			this.main.changeValue(index, value);
			this.checkFillState(index);
		},
		

		checkFillState: function(index) {

			var options = (!index) ? this.options : (this.optionsIndexed[index] || []);
			if(!index)
				index = Object.keys(this.main.fields);
			else
				index = [index];
			
			for(var i = 0, l = index.length; i < l; i++) {
				var element = this.lookRecursively(this.main.getValue(index[i]), this.optionsIndexed[index[i]] || this.options);
				if(element) {
					this.setText(index[i], element.title);
					var show = ((element.data && element.data.show) || '').split(' ');
					for(var j = 0, k = show.length; j < k; j++) {
						this.main.section.showHideSubSection(show, true);				
					}
				} else
					this.setText(index[i], '');
			}
		},
		

		lookRecursively: function(key, pool) {
			var found = false;


			if(!pool) return;

			for(var i = 0; i < pool.length; i++) {

				if(pool[i].key == key)
					return pool[i];
				
				if(pool[i].children)
					if(found = this.lookRecursively(key, pool[i].children))
						return found;
			}

			return false;
		},

		parseLazyRead: function(dom) {
		
			var json = [];
			var child = $(dom).children();
			for(var i = 0; i < child.length; i++) {
				
				var node = child[i];
				if(child[i].nodeType == 3)
					continue;
				json.push({
					key: node.getAttribute('value'),
					title: node.getAttribute('text'),
					//children: BI.form._IMPL.fieldComboBox.parseRecursive(node),
					isLazy: node.getAttribute('leaf') == 1 ? false : true,
					isFolder: node.getAttribute('folder') == 1 ? true : false
				//	icon: BI.icons.iconToUrl(node.getAttribute('icon'))
				});
			}
			
			return json;	
		}
	});
});