import fs from 'node:fs/promises';
import { DATA_FILE_PATH } from '../constants';
import { DataType } from '../data/data.types';
import { GameType } from '../server/api/games/games.types';
import { LinkType } from '../server/api/links/links.types';
import { scrape } from './scrape';

export async function saveDataLocally() {
	try {
		const newJsonData = await scrape();
		const jsonData: DataType = JSON.parse(newJsonData);
		await writeDataToFile(DATA_FILE_PATH, jsonData);

		const dataFromFile = await readDataFromFile(DATA_FILE_PATH);

		const gamesArr = filterGamesByTime(dataFromFile.games, new Date());
		const linksObj: LinkType = { ...dataFromFile.links, ...jsonData.links };

		await writeDataToFile(DATA_FILE_PATH, { games: gamesArr, links: linksObj });
	} catch (error) {
		console.error('Failed to save data locally: ', error);
	}
}

async function readDataFromFile(filePath: string): Promise<DataType> {
	try {
		const jsonData = await fs.readFile(filePath, 'utf-8');
		return JSON.parse(jsonData);
	} catch (error) {
		console.error(`Failed to read file ${filePath}: `, error);
		throw error;
	}
}

async function writeDataToFile(filePath: string, data: DataType): Promise<void> {
	try {
		await fs.writeFile(filePath, JSON.stringify(data));
	} catch (error) {
		console.error(`Failed to write file ${filePath}: `, error);
		throw error;
	}
}

function filterGamesByTime(games: GameType[], date: Date): GameType[] {
	const tenHours = 10 * 60 * 60 * 1000;
	const currentTimestamp = date.getTime();

	return games.filter(game => {
		const gameDate = new Date(game.date);
		const gameTimestamp = gameDate.getTime();

		const isWithinTenHours = Math.abs(currentTimestamp - gameTimestamp) <= tenHours;

		const isFromPreviousDay = gameDate.getDate() < date.getDate() && currentTimestamp - gameTimestamp <= tenHours;

		return isWithinTenHours || isFromPreviousDay;
	});
}
saveDataLocally();
