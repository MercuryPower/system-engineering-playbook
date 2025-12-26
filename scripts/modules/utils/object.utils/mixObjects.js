import { mix } from '../math.utils.js';

export default function(ob1, ob2, mixValue) {
	let newObject = {};

	Object.keys(ob1).forEach((key) => {
		if (typeof ob1[key] !== 'number' ||
			typeof ob2[key] !== 'number') {
			return;
		}

		newObject[key] = mix(ob1[key], ob2[key], mixValue);
	});

	return Object.assign({}, ob2, newObject);
}