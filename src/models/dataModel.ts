import data from '../data/data.json';

export function find() {
	return new Promise((resolve, reject) => resolve(data));
}
