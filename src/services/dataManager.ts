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
		const raw = await fs.readFile(config.dataFilePath, 'utf-8');

		// Strip UTF-8 BOM and any null/control characters that break JSON.parse
		const cleaned = raw
			.replace(/^\uFEFF/, '') // BOM
			.replace(/\0/g, '') // null bytes
			.trim();

		if (!cleaned) {
			logInfo('Data file is empty, starting fresh', 'DATA_MANAGER');
			return { games: [], links: {} };
		}

		try {
			return JSON.parse(cleaned);
		} catch (parseError) {
			logError(
				`Data file contains invalid JSON, starting fresh. Parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
				null,
				'DATA_MANAGER',
			);
			// Back up the bad file so we don't silently lose data
			const backupPath = config.dataFilePath + '.bak';
			await fs.writeFile(backupPath, raw).catch(() => {});
			return { games: [], links: {} };
		}
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

		const json = JSON.stringify(data, null, 2);

		// Write to a temp file first, then rename — prevents partial writes corrupting the file
		const tmpPath = config.dataFilePath + '.tmp';
		await fs.writeFile(tmpPath, json, 'utf-8');
		await fs.rename(tmpPath, config.dataFilePath);

		logInfo(
			`Data written successfully - Games: ${data.games.length}, Links: ${Object.keys(data.links).length}`,
			'DATA_MANAGER',
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
			const gameTime = new Date(game.date).getTime();

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
	const filteredGames = filterRecentGames(newData.games);
	const gameIds = new Set(filteredGames.map(g => g.id));
	const mergedLinks: Record<string, any> = {};

	for (const [gameId, links] of Object.entries(newData.links)) {
		if (gameIds.has(gameId)) {
			mergedLinks[gameId] = links;
		}
	}

	for (const [gameId, links] of Object.entries(existingData.links)) {
		if (gameIds.has(gameId) && !mergedLinks[gameId]) {
			mergedLinks[gameId] = links;
		}
	}

	logInfo(
		`Processed data: ${filteredGames.length} games, ${Object.keys(mergedLinks).length} game links`,
		'DATA_MANAGER',
	);

	return {
		games: filteredGames,
		links: mergedLinks,
	};
}

export async function updateData(): Promise<void> {
	try {
		logInfo('Starting data update process', 'DATA_MANAGER');

		const newData = await scrapeData();
		const existingData = await readDataFile();
		const processedData = processData(newData, existingData);
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
		return { games: [], links: {} };
	}
}
