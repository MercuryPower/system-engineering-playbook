Math.clamp = function(x, lowerlimit, upperlimit) {
	if (x < lowerlimit) x = lowerlimit;
	if (x > upperlimit) x = upperlimit;
	return x;
}

export default Math.clamp;