export function clx(...className) {
	return className.join(' ');
}

export function queryIndex(array, target) {
	return array.findIndex((item) => item._id === target._id);
}

export function insertItem(array, payload) {
	let newArray = array.slice();
	newArray.splice(payload.index, 0, payload.value);
	return newArray;
}

export function replaceItem(array, target) {
	const index = queryIndex(array, target);
	if (index !== -1) {
		const removed = removeItemFromIndex(array, index);
		return insertItem(removed, { index: index, value: target });
	}

	return insertItem(array, { index: array.length, value: target });
}

export function removeItemFromIndex(array, index) {
	let newArray = array.slice();
	newArray.splice(index, 1);
	return newArray;
}

export function removeItemById(array, value) {
	return array.filter((item) => item._id !== value._id);
}

export function withoutProperty(obj, property) {
	const { [property]: unused, ...rest } = obj;
	return rest;
}

export function withoutMultiProperty(obj, properties) {
	let rest = obj;
	properties.forEach((prop) => {
		rest = withoutProperty(rest, prop);
	});
	return rest;
}
