var getByDataId = function(tag, id) {
	var elements;
	var result = null;

	if (tag.split(':')[1]) {
		elements = document.querySelectorAll(tag.split(':')[0] 
			+ '[is=' + tag.split(':')[1] + ']');
	} else {
		elements = document.getElementsByTagName(tag);
	}

	Array.prototype.forEach.call(elements, function(el) {
		if (el.getAttribute('data-id') === id) {
			result = el;
		}
	});

	return result;
}

export default getByDataId;