function getFocusable(parent) {
	if (!parent) parent = document;
	
	let nodeList = parent.querySelectorAll('a, button, input, textarea, select, details, [tabindex]');
	nodeList = Array.prototype.slice.call(nodeList);

	return nodeList.filter((el) => {
		return !el.hasAttribute('disabled');
	});
}

export default getFocusable;