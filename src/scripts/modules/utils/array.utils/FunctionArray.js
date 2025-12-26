var FunctionArray = function() {
	this.elements = [];

	this.forEach = function(func) {
		return this.elements.forEach(func);
	}

	this.reduce = function(func) {
		return this.elements.reduce(func);
	}

	this.map = function(func) {
		return this.elements.map(func);
	}

	this.push = function(func) {
		this.elements.push(func);
	}

	this.remove = function(func) {
		this.elements = this.elements.filter(function(el) {
			return el !== func;
		});
	}

	this.boolReduce = function() {
		return this.elements.reduce(function(prev, flag) {
			return prev && flag();
		}, true)
	}
}

export default FunctionArray;