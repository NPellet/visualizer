define(['libs/jquery', 'util/event'], function($, Event) {

	var Observable = function(name, value) { this.set(name, value); };

	$.extend(Observable.prototype, Event.prototype);
	
	Observable.get = function(name) {
		return this._value[name];
	}

	var slicer = Array.prototype.slice;
	Observable.update = function(name, value) {
		this._value = this._value || {};
		this._value[name] = args;
		return this;
	}

	Observable.set = function(name, value) {
		var current = this.get(name);
		if(current == value)
			return;
		this.update(name, value);
		var to = this.get(name);
		this.trigger('change', name, to, current);
		return this;
	}

	Observable.prototype._proxiedSet = function() {
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
	Observable.prototype.pull = function() {
		var mySet = this._proxiedSet();
		$.each(arguments, function(i, trgt) {
			target.on('change', set);
		});
	}

	Observable.prototype.unpull = function() {
		var mySet = this._proxiedSet();
		$.each(arguments, function(i, trgt) {
			target.off('change', set);
		});
	}

	Observable.prototype.push = function() {
		var self = this;
		$.each(arguments, function(i, trgt) {
			self.on('change', target._proxiedSet);
		});
	}

	Observable.prototype.unpush = function() {
		var self = this;
		$.each(arguments, function(i, trgt) {
			self.off('change', target._proxiedSet);
		});
	}

	return Observable;

});

