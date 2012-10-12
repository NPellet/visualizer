CI.Util.ResolveDOMDeferred = function(dom) {
	CI.Util.DOMDeferred.notify(dom);
}

CI.Util.DOMDeferred = $.Deferred();