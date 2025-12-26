// push({name: 'name', value: {x: 0, y: 0, z: 0})
// remove({name: 'name'})
// set({name: 'name', value: {x: 1, y: 1, x: 1})

var VectorArray = function() {
	this.elements = [];

	this.forEach = function(func) {
		return this.elements.forEach(func);
	}

	this.push = function(val) {
		if (this.elements.find(function(el) {return el.name === val.name})) {
			console.error('element with name "' + val.name + '" already exists');
			return;
		}

		this.elements.push(val);
	}

	this.remove = function(val) {
		this.elements = this.elements.filter(function(el) {
			return el.name !== val.name;
		});
	}

	this.set = function(val) {
		this.elements.find(function(el) {
			return el.name === val.name
		}).value = val.value;
	}

	this.get = function(val) {
		return this.elements.find(function(el) {
			return el.name === val.name
		}).value;
	}

	this.summ = function() {
		return this.elements.map(function(val) {
			return val.value;
		}).reduce(function(total, value) {
			return {
				x: total.x + value.x,
				y: total.y + value.y,
				z: total.z + value.z
			};
		}, {x: 0, y: 0, z: 0}); 
	}

	this.multiply = function() {
		return this.elements.map(function(val) {
			return val.value;
		}).reduce(function(total, value) {
			return {
				x: total.x * value.x,
				y: total.y * value.y,
				z: total.z * value.z
			};
		}, {x: 1, y: 1, z: 1}); 
	}
}

export default VectorArray;