import fs from 'node:fs/promises';
import { scrape } from './scrape';

// ToDo | remove games after 3 h
// Todo | Change 'get' method to 'post' on client side and in data.php
// ToDo | Lazy loading
//? | should I sort games by time?

async function saveDataLocally() {
	const newJsonData = await scrape();
	const newData = JSON.parse(newJsonData);

	const oldJsonData = await fs.readFile('./src/data/data.json', 'utf-8');
	const oldData = JSON.parse(oldJsonData);

	const { games: oldGames, links: oldLinks } = oldData;
	const { games: newGames, links: newLinks } = newData;

	const gamesToKeep = oldGames.filter((oldGame: any) => {
		const dayFormatter = new Intl.DateTimeFormat('en-US', { day: '2-digit' });

		const now = new Date();
		const today = dayFormatter.format(now);

		const oldGameDate = new Date(oldGame.date);
		const oldGameDay = dayFormatter.format(oldGameDate);

		return oldGameDay === today;
	});

	const gamesToAdd = newGames.filter((newGame: any) => {
		const existingGame = gamesToKeep.find((oldGame: any) => oldGame.id === newGame.id);
		return !existingGame;
	});

	const gamesArr = [...gamesToKeep, ...gamesToAdd];

	const linksObj = Object.keys(newLinks).reduce((acc, key) => ({ ...acc, [key]: newLinks[key] }), oldLinks);

	await fs.writeFile(
		'./src/data/data.json',
		JSON.stringify({
			games: gamesArr,
			links: linksObj,
		})
	);
}

saveDataLocally();
