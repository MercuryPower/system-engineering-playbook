Math.distance = function(p0, p1) {
	if (p1.hasOwnProperty('z') && 
		p2.hasOwnProperty('z')) {
		return Math.pow(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2) +  Math.pow(p0.z - p1.z, 2), 0.5);
	} else {
		return Math.pow(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2), 0.5);
	}
}

export default Math.distance;