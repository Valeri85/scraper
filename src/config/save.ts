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
	const threeHours = 3 * 60 * 60 * 1000;
	const currentTimestamp = date.getTime();

	return games.filter(game => {
		const gameDate = new Date(game.date);
		const gameTimestamp = gameDate.getTime();

		const isWithinThreeHours = Math.abs(currentTimestamp - gameTimestamp) <= threeHours;

		const isFromPreviousDay = gameDate.getDate() < date.getDate() && currentTimestamp - gameTimestamp <= threeHours;

		return isWithinThreeHours || isFromPreviousDay;
	});
}
saveDataLocally();

// ! Old code

// import fs from 'node:fs/promises';
// import { scrape } from './scrape';

// export async function saveDataLocally() {
// 	const newJsonData = await scrape();
// 	const newData = JSON.parse(newJsonData);

// 	const oldJsonData = await fs.readFile('./src/data/data.json', 'utf-8');
// 	const oldData = JSON.parse(oldJsonData);

// 	const { games: oldGames, links: oldLinks } = oldData;
// 	const { games: newGames, links: newLinks } = newData;

// 	const gamesToKeep = oldGames.filter((oldGame: any) => {
// 		const dayFormatter = new Intl.DateTimeFormat('en-US', { day: '2-digit' });

// 		const now = new Date();
// 		const today = dayFormatter.format(now);

// 		const oldGameDate = new Date(oldGame.date);
// 		const oldGameDay = dayFormatter.format(oldGameDate);

// 		return oldGameDay === today;
// 	});

// 	const gamesToAdd = newGames.filter((newGame: any) => {
// 		const existingGame = gamesToKeep.find((oldGame: any) => oldGame.id === newGame.id);
// 		return !existingGame;
// 	});

// 	const gamesArr = [...gamesToKeep, ...gamesToAdd];

// 	const linksObj = Object.keys(newLinks).reduce((acc, key) => ({ ...acc, [key]: newLinks[key] }), oldLinks);

// 	await fs.writeFile(
// 		'./src/data/data.json',
// 		JSON.stringify({
// 			games: gamesArr,
// 			links: linksObj,
// 		})
// 	);
// }
