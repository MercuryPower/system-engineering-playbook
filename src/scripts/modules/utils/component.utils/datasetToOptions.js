function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return '';
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

function parseValue(original, value) {
	if (!value) {
		return original;
	} else if (typeof original === 'number') {
		return parseFloat(value);
	} else if (typeof original === 'boolean') {
		return value === 'true';
	} else if (typeof original === 'string') {
		return value;
	} else {
		if (typeof value === 'string') {
			value = JSON.parse(value);
		}

		return value;
	}
}

export default function(dataset, options) {
	let result = {};
	let namespace = options.__namespace ? options.__namespace : '';

	for (let key in options) {
		let camelKey;
		if (options.__namespace) {
			camelKey = camelize(namespace + ' ' + key);
		} else {
			camelKey = camelize(key);
		}

		result[key] = parseValue(options[key], dataset[camelKey]);
	}

	return result;
}