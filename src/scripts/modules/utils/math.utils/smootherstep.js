Math.smootherstep = function(edge0, edge1, x) {
	x = Math.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
	return x * x * x * (x * (x * 6 - 15) + 10);
}

export default Math.smootherstep;