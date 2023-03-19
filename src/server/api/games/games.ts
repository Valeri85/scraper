import data from '../../../data/data.json';

export function getGamesData() {
	return new Promise((resolve, reject) => resolve(data));
}
