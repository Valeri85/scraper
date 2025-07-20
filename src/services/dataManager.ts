// src/services/dataManager.ts
import { promises as fs } from 'fs';
import { AppData, Game } from '../types';
import { config } from '../config';
import { logInfo, logError } from '../utils/logger';
import { scrapeData } from './scraper';

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
		await fs.writeFile(config.dataFilePath, JSON.stringify(data, null, 2));
	} catch (error) {
		throw new Error(`Failed to write data file: ${error instanceof Error ? error.message : String(error)}`);
	}
}

function filterRecentGames(games: Game[]): Game[] {
	const tenHours = 10 * 60 * 60 * 1000;
	const now = Date.now();

	return games.filter(game => {
		try {
			const gameTime = new Date(game.date).getTime();
			return Math.abs(now - gameTime) <= tenHours;
		} catch (error) {
			logError(`Invalid game date: ${game.date}`, error, 'DATA_MANAGER');
			return false;
		}
	});
}

function processData(newData: AppData, existingData: AppData): AppData {
	// Filter games within 10 hours of current time
	const filteredGames = filterRecentGames(newData.games);

	// Merge links (new data takes precedence)
	const mergedLinks = { ...existingData.links, ...newData.links };

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
		throw error;
	}
}
