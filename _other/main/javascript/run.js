
(function() {
	var url = 'http://script.epfl.ch/servletScript/JavaScriptServlet';
	var result;
	var help = {};
	
	
	var visualizer;
	
	(function() {
		var helpFiles = ["ChemCalc","String"];
		for (var i=0; i < helpFiles.length; i++) {
			$.getJSON("http://script.epfl.ch/servletScript/javascript/help/"+helpFiles[i]+".help.json", {}, function(data) {
				for (property in data) {
					help[property]=data[property];
				}
			});
		}
	})();
	
	
	function openVisualizer(newWindow) {
		var viewURL = '', dataURL = '', saveViewURL = '';
		if (!result.url) {
			alert("No results are available");
			return;
		} else
			dataURL = escape(result.url);
		
		if(typeof visualizer == "undefined") {
			alert("The visualizer has not been chosen");
			return;
		}
		console.log(url);
		if(visualizer != null) {
			viewURL = url + escape(visualizer);
			saveViewURL = url + escape(visualizer.replace("action=LoadFile","action=SaveFile"));
		}
		
		var urlTotal = ["http://lpatiny.github.com/visualizer/index.html?viewURL=", viewURL, "&dataURL=", dataURL, "&saveViewURL=", saveViewURL].join('');
		if(newWindow)
			window.open(urlTotal);
		else
			window.document.location.href = urlTotal;
	}
	
	/*
	function saveScript() {
		if ($('#name').val()=="") {
			alert("You need to specifiy the name of the script you want to save.");
			return false;
		}
		
		$('#name').val($('#name').val().replace(/\.js/,"")+".js");
		
		editor.save();
		$.post(url,
			{
				action: "SaveScript",
				name:$('#name').val(),
				script:$('#script').val()
			},
			function(data) {
				refreshScript();
		  });
	}
	*/
	
	/*
	function saveView() {
		if ($('#name').val()=="") {
			alert("You need to specifiy the name of the view you want to save.");
			return false;
		}
		
		$('#name').val($('#name').val().replace(/\.view/,"")+".view");
		
		editor.save();
		$.post(url,
			{
				action: "SaveScript",
				name:$('#name').val(),
				script:$('#script').val()
			},
			function(data) {
				refreshScript();
		  });
	}
	*/
	
	/*
	function deleteScript() {
		if ($('#name').val()=="") {
			alert("You need to specifiy the name of the file you want to delete.");
			return false;
		}
		if (confirm('Are you sure you want to delete this file?')) {
			$.get(url,
					{
						action: "DeleteScript",
						name:$('#name').val()
					},
					function(data) {
						refreshScript();
				  });
		} else {
			return false;
		}
	
	}
	*/
	
	function runScript(callback) {
		editor.save();
		$.post(url, { script: $('#script').val() }, function(data) {
			result = JSON.parse(data);
			$('#output').val(data);
			if(typeof callback == "function")
				callback();
			checkFinalStep();
		 });
		
	}
	
	function loadScript(scriptName) {
		
		$.get(url, {  action: "LoadScript",
			      name: scriptName
			      
		}, function(data) {
			editor.toTextArea();
			$('#script').val(data);
			addEditor();
		  });
	}
	
	function selectVisualizer(visualizerName) {
		$(".selectedvisualizer").removeClass('none').html('You have selected the following visualizer : ' + visualizerName);
		visualizer = visualizerName;
		checkFinalStep();
	}
	
	var editor;
	var hints;
	
	function addEditor() {
	      hints = $("#hints");
	      editor = CodeMirror.fromTextArea($("#script")[0], {
	        mode: "javascript",
	        onCursorActivity: function(cm) {HELP.showHints(cm, hints);},
	        extraKeys: {"Ctrl-Space": function(cm) {CodeMirror.simpleHint(cm, HELP.javascriptHint);}},
	        lineNumbers: true,
	        matchBrackets: true,
	        tabMode: "indent",
	        autofocus: true
	      });
	}
	
	
	function addFileBrowser() {
		var mainUrl = 'http://script.epfl.ch/servletScript/JavaScriptServlet?action=FileManager&event=list&target=data';
		
		function jsonToDynatree(data) {
			var els = [];
			
			for(var i in data.result) {
				var el = {};
				if(typeof data.result[i] == 'object') {
					el.isFolder = true;
					for(var j in data.result[i]) {
						el.key = j;
						el.title = j;
					}
					
					el.isLazy = true;
				} else {
					el.key = data.result[i];
					el.title = data.result[i];
				}
				
				els.push(el);
			}
			
			return els;
		}
		
		$(".browser").each(function() {
			
			
			var div = $(this);
			var mode = div.data('mode');
			$.getJSON(mainUrl, {}, function(data) {
				var els = jsonToDynatree(data);
				div.dynatree({
					children: els,
					onLazyRead: function(node) {
						var key = node.data.key;
						
						$.getJSON(mainUrl + "&name=" + key, {}, function(data) {
							var els = jsonToDynatree(data);
							node.addChild(els);
						});
					},
					
					onActivate: function(node) {
						if(node.isFolder)
							return;
							
						var path = [];
						while(node.parent) {
							path.unshift(node.data.key);
							node = node.parent;
						}
						
						path = path.join('/');
						switch(mode) {
							case 'scripts':
								loadScript(path);
							break;
							case 'visualizers':
								selectVisualizer(path);
							break;
						}
					}
				});
			});
		});	
	}
	
	function checkFinalStep() {
		$("#buttons4 > *")[(result && typeof visualizer != "undefined") ? 'removeClass' : 'addClass']('disabled');
	}
	
	$(document).ready(function() {
		//refreshScripts();
		addEditor();
		addFileBrowser();
		checkFinalStep();
		
		$("#buttons2 [rel=launch]").bind('click', function() {
			var btn = $(this);
			if(btn.hasClass('disabled'))
				return;
			btn.data('html', btn.html()).html('Script is currently running').addClass('disabled');
			runScript(function() {
				btn.html(btn.data('html')).removeClass('disabled');
				btn.siblings().removeClass('disabled');
			});
			
			btn.siblings().each(function() {
				var html, btn = $(this);
				if(html = btn.data('html'))
					btn.html(html).data('html', false);
			});
		});
		
		$("#buttons2 [rel=mail]").bind('click', function() {
			var btn = $(this);  
			btn.data('html', btn.html()).html("Report is being sent...");
			$.ajax({
				url: url + "&sendReport=true", 
				type: 'post',
				data: { output: $("#ouput").val() }, 
				
				success: function() {
					btn.html('The report has been sent !');
				},
				
				error: function() {
					btn.html('Error while sending the report');
				}
			});
		});
		
		$("#visualizernew").bind('click', function() {
			var btn = $(this);
			if(btn.hasClass('selected')) {
				visualizer = _oldVisualizer;
				
				if(visualizer)
					$(".selectedvisualizer").removeClass('none');
					
				btn.removeClass('selected');
				checkFinalStep();
			} else {
				
				_oldVisualizer = visualizer;
				visualizer = null;
				$(".selectedvisualizer").addClass('none');
				btn.addClass('selected');
				checkFinalStep();
			}	
		});
		
		$("#buttons4 [rel=open]").bind('click', function() {
			if($(this).hasClass('disabled'))
				return;
			openVisualizer(false);
		});
		
		$("#buttons4 [rel=opennew]").bind('click', function() {
			if($(this).hasClass('disabled'))
				return;
			openVisualizer(true);
		});
		
	});
	
})();