Math.step = function(edge, x) {
	if (x < edge) {
		return 0;
	} else {
		return 1;
	}
}

export default Math.step;