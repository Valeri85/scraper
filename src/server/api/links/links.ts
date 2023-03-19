import data from '../../../data/data.json';

export function getLinksData() {
	return new Promise((resolve, reject) => resolve(data));
}
