CI.Util.ResolveDOMDeferred = function(dom) {
	if(dom.length == 0)
		return;
	
	CI.Util.DOMDeferred.notify(dom);
}

CI.Util.DOMDeferred = $.Deferred();