var offset = function(elem, parent) {
	function getOffsetSum(elem, parent) {
		var top = 0, left = 0;

		while(elem && elem !== parent) {
			top = top + parseInt(elem.offsetTop);
			left = left + parseInt(elem.offsetLeft);
			elem = elem.offsetParent;
		}

		return {top: top, left: left};
	}

	return getOffsetSum(elem, parent || null);
}

export default offset;