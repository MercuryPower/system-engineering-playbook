import difference from "./set.utils/difference.js";
import isSuperset from "./set.utils/isSuperset.js";
import intersection from "./set.utils/intersection.js";
import symmetricDifference from "./set.utils/symmetricDifference.js";
import union from "./set.utils/union.js";

let equals = function (s1, s2) {
	return symmetricDifference(s1, s2).size === 0;
};

export {
	difference,
	isSuperset,
	intersection,
	symmetricDifference,
	equals,
	union,
};