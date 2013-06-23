
define(function() {

	var Event = function() {}
	slice = Array.prototype.slice;
	Event.prototype.on = function(topic, callback) {
		this.topics = this.topics || [];
		this.topics[topic] = this.topics[topic] || $.Callbacks();
		this.topics[topic].add.apply(this.topics[topic], slice.call(arguments, 1));
		return this;
	}

	Event.prototype.off = function(topic) {
		if(this.topics && this.topics[topic])
			this.topics[topic].remove.apply(this.topics[topic], slice.call(arguments, 1))
		return this;
	}

	Event.prototype.trigger = function(topic) {
		if(this.topics && this.topics[topic])
			this.topics[topic].fireWith(this, slice.call(arguments, 1));
	}

	return Event;
});
