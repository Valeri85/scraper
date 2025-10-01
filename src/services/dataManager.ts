import { promises as fs } from 'fs';
import { AppData, Game } from '../types';
import { config } from '../config';
import { logInfo, logError } from '../utils/logger';
import { scrapeData } from './scraper';
import path from 'path';

async function ensureDataDirectory(): Promise<void> {
	const dir = path.dirname(config.dataFilePath);
	try {
		await fs.mkdir(dir, { recursive: true });
	} catch (error) {
		// Directory might already exist, which is fine
	}
}

async function readDataFile(): Promise<AppData> {
	try {
		const data = await fs.readFile(config.dataFilePath, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			logInfo('Data file not found, creating new one', 'DATA_MANAGER');
			return { games: [], links: {} };
		}
		throw error;
	}
}

async function writeDataFile(data: AppData): Promise<void> {
	try {
		await ensureDataDirectory();
		await fs.writeFile(config.dataFilePath, JSON.stringify(data, null, 2));
		logInfo(
			`Data written successfully - Games: ${data.games.length}, Links: ${Object.keys(data.links).length}`,
			'DATA_MANAGER'
		);
	} catch (error) {
		throw new Error(`Failed to write data file: ${error instanceof Error ? error.message : String(error)}`);
	}
}

function filterRecentGames(games: Game[]): Game[] {
	const tenHours = 10 * 60 * 60 * 1000;
	const now = Date.now();

	const filtered = games.filter(game => {
		try {
			// Parse the date string (format: "2025-07-22 03:10:00")
			const gameTime = new Date(game.date).getTime();

			// Check if the date is valid
			if (isNaN(gameTime)) {
				logError(`Invalid game date: ${game.date}`, null, 'DATA_MANAGER');
				return false;
			}

			const timeDiff = Math.abs(now - gameTime);
			return timeDiff <= tenHours;
		} catch (error) {
			logError(`Error parsing game date: ${game.date}`, error, 'DATA_MANAGER');
			return false;
		}
	});

	logInfo(`Filtered games: ${filtered.length} out of ${games.length} within 10 hours`, 'DATA_MANAGER');
	return filtered;
}

function processData(newData: AppData, existingData: AppData): AppData {
	// Filter games within 10 hours of current time
	const filteredGames = filterRecentGames(newData.games);

	// Merge links - only keep links for games that exist
	const gameIds = new Set(filteredGames.map(g => g.id));
	const mergedLinks: Record<string, any> = {};

	// Add links from new data for existing games
	for (const [gameId, links] of Object.entries(newData.links)) {
		if (gameIds.has(gameId)) {
			mergedLinks[gameId] = links;
		}
	}

	// Keep existing links for games that are still in the filtered list
	for (const [gameId, links] of Object.entries(existingData.links)) {
		if (gameIds.has(gameId) && !mergedLinks[gameId]) {
			mergedLinks[gameId] = links;
		}
	}

	logInfo(
		`Processed data: ${filteredGames.length} games, ${Object.keys(mergedLinks).length} game links`,
		'DATA_MANAGER'
	);

	return {
		games: filteredGames,
		links: mergedLinks,
	};
}

export async function updateData(): Promise<void> {
	try {
		logInfo('Starting data update process', 'DATA_MANAGER');

		// Scrape new data
		const newData = await scrapeData();

		// Read existing data
		const existingData = await readDataFile();

		// Process and merge data
		const processedData = processData(newData, existingData);

		// Save updated data
		await writeDataFile(processedData);

		logInfo('Data update completed successfully', 'DATA_MANAGER');
	} catch (error) {
		logError('Data update failed', error, 'DATA_MANAGER');
		throw error;
	}
}

export async function readData(): Promise<AppData> {
	try {
		return await readDataFile();
	} catch (error) {
		logError('Failed to read data', error, 'DATA_MANAGER');
		// Return empty data instead of throwing to keep API working
		return { games: [], links: {} };
	}
}
