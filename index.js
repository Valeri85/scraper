import fs from 'node:fs';
import { scrape } from './scrape.js';

const createDataFile = async () => {
	const data = await scrape();

	fs.writeFileSync('data.json', JSON.stringify(data), err => {
		if (err) throw err;
		console.log('Data has been written to file successfully.');
	});
};

createDataFile();
