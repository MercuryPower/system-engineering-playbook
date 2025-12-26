export default function(original) {
	if (typeof original !== 'object' || original === null) {
		return original
	}

	let out = Array.isArray(original) ? [] : {}

	for (let key in original) {
		let value = original[key]
		out[key] = deepCopyFunction(value)
	}

	return out
}
