
if(!window[_namespaces['util']].Util) window[_namespaces['util']].Util = {};

window[_namespaces['util']].Util.JsonLoader = function(url, element, isText) {

	if(!element.source && element.url) {
		element.loaded = false;
		var query = new CI.Util.AjaxQuery({
			url: url,
			dataType: (isText ? 'text' : 'json'),
			success: function(data) {
				
				element.source = data;
				element.value = data;
				
				if(element.parent)
					element.parent.value = data;
					
				element.loaded = true;
				element.doCallbacks();
				CI.dataType.instanciate(data);
			}
		});
	}
}