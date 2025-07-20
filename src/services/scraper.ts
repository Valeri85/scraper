import puppeteer from 'puppeteer';
import parser from 'node-html-parser';
import { AppData } from '../types';
import { config } from '../config';
import { logInfo, logError } from '../utils/logger';

const GAMES_VARIABLE = 'var ev_arr = ';
const LINKS_VARIABLE = 'var chan_arr = ';
const LINKS_END_VARIABLE = 'var adv_1 = ';

function extractDataFromScript(scriptContent: string): AppData {
	try {
		// Extract games data
		const gamesStartIndex = scriptContent.indexOf(GAMES_VARIABLE);
		if (gamesStartIndex === -1) {
			throw new Error('Games variable not found in script');
		}

		const gamesEndIndex = scriptContent.indexOf(';', gamesStartIndex);
		if (gamesEndIndex === -1) {
			throw new Error('Games variable end not found');
		}

		const gamesData = scriptContent.substring(gamesStartIndex + GAMES_VARIABLE.length, gamesEndIndex).trim();

		// Extract links data
		const linksStartIndex = scriptContent.indexOf(LINKS_VARIABLE);
		if (linksStartIndex === -1) {
			throw new Error('Links variable not found in script');
		}

		const linksEndIndex = scriptContent.indexOf(LINKS_END_VARIABLE);
		if (linksEndIndex === -1) {
			throw new Error('Links variable end not found');
		}

		const linksData = scriptContent
			.substring(linksStartIndex + LINKS_VARIABLE.length, linksEndIndex)
			.trim()
			.slice(0, -1); // Remove trailing comma

		return {
			games: JSON.parse(gamesData),
			links: JSON.parse(linksData),
		};
	} catch (error) {
		throw new Error(`Failed to parse scraped data: ${error instanceof Error ? error.message : String(error)}`);
	}
}

export async function scrapeData(): Promise<AppData> {
	let browser;

	try {
		logInfo('Starting scraping process', 'SCRAPER');

		browser = await puppeteer.launch({
			headless: 'shell',
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		const page = await browser.newPage();
		await page.goto(config.scrapeUrl, { waitUntil: 'networkidle2' });

		const pageContent = await page.content();
		if (!pageContent) {
			throw new Error('Empty page content received');
		}

		const html = parser.parse(pageContent);
		const script = html.querySelector('.ui-accordion script');

		if (!script?.textContent) {
			throw new Error('Script tag not found or empty');
		}

		const scriptContent = script.textContent.replace(/&(#\d+|\w+);/gi, '');
		const data = extractDataFromScript(scriptContent);

		logInfo('Scraping completed successfully', 'SCRAPER');
		return data;
	} catch (error) {
		logError('Scraping failed', error, 'SCRAPER');
		throw error;
	} finally {
		if (browser) {
			await browser.close().catch(error => {
				logError('Failed to close browser', error, 'SCRAPER');
			});
		}
	}
}
