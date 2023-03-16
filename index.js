import fs from 'node:fs/promises';
import { scrape } from './scrape.js';

const createDataFile = async () => {
	try {
		const data = await scrape();
		await fs.writeFile('data.json', JSON.stringify(data));
	} catch (error) {
		console.log(error);
	}
};

createDataFile();
