import fs from 'node:fs/promises';
import { scrape } from './scrape';

async function saveDataLocally() {
	const data = await scrape();
	await fs.writeFile('./src/data/data.json', JSON.stringify(data));
}

saveDataLocally();
