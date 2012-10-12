
if(!window[_namespaces['util']].Util) window[_namespaces['util']].Util = {};

window[_namespaces['util']].Util.getCurrentLang = function() {
	return 'fr';
}

window[_namespaces['util']].Util.maskIframes = function() {
	$("iframe").each(function() {
		var iframe = $(this);
		var pos = iframe.position();
		var width = iframe.width();
		var height = iframe.height();		
		iframe.before($('<div />').css({
			position: 'absolute',
			width: width,
			height: height,
			top: pos.top,
			left: pos.left,
			background: 'white',
			opacity: 0.5
		}).addClass('iframemask'));
	});
}
window[_namespaces['util']].Util.unmaskIframes = function() {
	$(".iframemask").remove();
}
window[_namespaces['util']].Util.uniqueid = 0;
window[_namespaces['util']].Util.getNextUniqueId = function() {
	return 'uniqid_' + (++window[_namespaces['util']].Util.uniqueid);
}

CI.Event = function() {}
slice = Array.prototype.slice;
CI.Event.prototype.on = function(topic, callback) {
	this.topics = this.topics || [];
	this.topics[topic] = this.topics[topic] || $.Callbacks();
	this.topics[topic].add.apply(this.topics[topic], slice.call(arguments, 1));
	return this;
}

CI.Event.prototype.off = function(topic) {
	if(this.topics && this.topics[topic])
		this.topics[topic].remove.apply(this.topics[topic], slice.call(arguments, 1))
	return this;
}

CI.Event.prototype.trigger = function(topic) {
	if(this.topics && this.topics[topic])
		this.topics[topic].fireWith(this, slice.call(arguments, 1));
}

CI.Observable = function(name, value) { this.set(name, value); };
$.extend(CI.Observable.prototype, CI.Event.prototype);

CI.Observable.get = function(name) {
	return this._value[name];
}

var slicer = Array.prototype.slice;
CI.Observable.update = function(name, value) {
	this._value = this._value || {};
	this._value[name] = args;
	return this;
}

CI.Observable.set = function(name, value) {
	var current = this.get(name);
	if(current == value)
		return;
	this.update(name, value);
	var to = this.get(name);
	this.trigger('change', name, to, from);
	return this;
}

CI.Observable.prototype._proxiedSet = function() {
	if(!this.__proxiedSet)
		this.__proxiedSet = $.proxy(this.set, this);
	return this.__proxiedSet;
}
// List of observables targets
// When any of the target change, change myself
// Example:
//
//	var obs1 = new Observable();
//	var obs2 = new Observable();
//	obs1.pull(obs2);
//	obs2.set('varName', 'varVal'); // ==> obs1.set('varName', 'varVal')
CI.Observable.prototype.pull = function() {
	var mySet = this._proxiedSet();
	$.each(arguments, function(i, trgt) {
		target.on('change', set);
	});
}

CI.Observable.prototype.unpull = function() {
	var mySet = this._proxiedSet();
	$.each(arguments, function(i, trgt) {
		target.off('change', set);
	});
}

CI.Observable.prototype.push = function() {
	var self = this;
	$.each(arguments, function(i, trgt) {
		self.on('change', target._proxiedSet);
	});
}

CI.Observable.prototype.unpush = function() {
	var self = this;
	$.each(arguments, function(i, trgt) {
		self.off('change', target._proxiedSet);
	});
}

CI.RepoPool = function() {

	this._value = [];
	this.on('change', function(sourcekeys, value) {
		var callbacks = {};
		this._keys = this._keys || [];
		for(var i = 0; i < sourcekeys.length; i++) {
			if(this._keys[sourcekeys[i]] == undefined)
				continue;
			for(var j = 0; j < this._keys[sourcekeys[i]].length; j++)
				callbacks[this._keys[sourcekeys[i]][j]] = true;	
		}

		for(var i in callbacks) {
			var currentCallback = this._callbacks[i];
			if(!currentCallback)
					return;
			var commonKeys = this.getCommonKeys(currentCallback[0], sourcekeys);
			if(commonKeys.length > 0 || ((!commonKeys || commonKeys.length == 0) && currentCallback[2])) {
				currentCallback[1](value, commonKeys);
			}
		}
	});
};

$.extend(CI.RepoPool.prototype, CI.Event.prototype);

CI.RepoPool.prototype.get = function(key) {
	return this._value[key];
}

CI.RepoPool.prototype.set = function(keys, value) {
	if(!(keys instanceof Array))
		keys = [keys];
	else if(!keys.length)
		keys = [];

	this._value = this._value || [];
	this._value[keys] = [keys, value];
	this.trigger('change', keys, value);
}

CI.RepoPool.prototype._callbackId = -1;
CI.RepoPool.prototype.listen = function(keys, callback, sendCallbackOnEmptyArray) {
	var self = this;
	this._keys = this._keys || {};
	this._callbacks = this._callbacks || [];


	if(!keys || keys.length == undefined || keys.length == 0)
		return;

	if(!(keys instanceof Array))
		keys = [keys];

	var callbackId = ++CI.RepoPool.prototype._callbackId;
	this._callbacks[callbackId] = [keys, callback, sendCallbackOnEmptyArray];
	this.bindKeysRecursively(keys, callbackId, true);
}

CI.RepoPool.prototype.bindKeysRecursively = function(keys, callbackId, add) {
	for(var i = 0, l = keys.length; i < l; i++) {
		if(keys[i] instanceof Array) {
			this.bindKeysRecursively(keys[i], callbackId, add)
			continue;
		}
		this._keys[keys[i]] = this._keys[keys[i]] || [];
		if(add)
			this._keys[keys[i]].push(callbackId);
		else {
			var index = this._keys[keys[i]].indexOf(callbackId);
			if(index == -1)
				continue;
			this._keys[keys[i]].splice(index, 1);
		}
	}
}

CI.RepoPool.prototype.reset = function() {
	this._callbacks = [];
	this._keys = {};

}

CI.RepoPool.prototype.unListen = function(keys, callback) {
	this._keys = this._keys || {};
	this._callbacks = this._callbacks || [];
	this.bindKeysRecursively(keys, callback, false);

	for(var i = 0; i < this._callbacks.length; i++) {
		if(!this._callbacks[i])
			continue;
		
		if(this._callbacks[i][1] == callback) {
			this._callbacks.splice(i, 1);
			break;
		}
	}
}

CI.RepoPool.prototype.getCommonKeys = function(set1, set2) {
	var set3 = set2.slice(0), set1Rev = {};
	for(var i = 0, l = set1.length; i < l; i++)
		set1Rev[set1[i]] = true;
	return this.compareKeysRecursively(set1Rev, set3, true);
}

CI.RepoPool.prototype.compareKeysRecursively = function(set1, set2, or) {
	var i = 0, l, set2el, set3 = [];	
	for(i = 0, l = set2.length; i < l; i++) {
		set2el = set2[i];
		if(set2el instanceof Array)
			set2el = this.compareKeysRecursively(set1, set2el, !or);
		if(!set1[set2el] && !or)
			return null;
		else if(set1[set2el])
			set3.push(set2el)
	}
	return set3;
}

CI.RepoPool.prototype.resendAll = function() {

	for(var i in this._value)
		this.set(this._value[i][0], this._value[i][1]);

}



CI.Repo = new CI.RepoPool();
CI.RepoHighlight = new CI.RepoPool();