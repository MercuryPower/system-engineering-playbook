Math.mix = function(v1, v2, mix) {
	return v1 + (v2 - v1) * mix;
}

export default Math.mix;