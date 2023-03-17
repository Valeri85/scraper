import data from '../data/data.json' assert { type: 'json' };

export function find() {
	return new Promise((resolve, reject) => resolve(data));
}
