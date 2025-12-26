Math.smoothstep = function(edge0, edge1, x) {
	x = Math.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0); 
	return x * x * (3 - 2 * x);
}

export default Math.smoothstep;