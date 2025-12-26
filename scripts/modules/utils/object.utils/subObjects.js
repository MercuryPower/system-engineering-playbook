export default function(ob1, ob2) {
	let newObject = {};

	Object.keys(ob1).forEach((key) => {
		if (typeof ob1[key] !== 'number' ||
			typeof ob2[key] !== 'number') {
			return;
		}

		newObject[key] = ob1[key] - ob2[key];
	});

	return Object.assign({}, ob2, newObject);
}