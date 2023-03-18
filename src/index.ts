import fs from 'node:fs/promises';
import { scrape } from './config/scrape';

const createDataFile = async () => {
	try {
		const data = await scrape();
		await fs.writeFile('./src/data/data.json', JSON.stringify(data));
	} catch (error) {
		console.log(error);
	}
};

createDataFile();
