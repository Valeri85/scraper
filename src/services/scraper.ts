import puppeteer from 'puppeteer';
import parser from 'node-html-parser';
import { AppData } from '../types';
import { config } from '../config';
import { logInfo, logError } from '../utils/logger';

const GAMES_VARIABLE = 'var ev_arr = ';
const LINKS_VARIABLE = 'var chan_arr = ';
const LINKS_END_VARIABLE = 'var adv_1 = ';

function decodeHtmlEntities(str: string): string {
	return str
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/&apos;/gi, "'")
		.replace(/&#x27;/gi, "'")
		.replace(/&#x2F;/gi, '/')
		.replace(/&#(\d+);/gi, (_, dec) => String.fromCharCode(Number(dec)))
		.replace(/&#x([0-9A-F]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Extracts a complete JSON value (array or object) starting at `startIndex`.
 * Uses bracket/brace matching, correctly skipping over string contents.
 */
function extractJsonBlock(content: string, startIndex: number): string {
	const openChar = content[startIndex];
	const closeChar = openChar === '[' ? ']' : '}';

	let depth = 0;
	let inString = false;
	let escape = false;

	for (let i = startIndex; i < content.length; i++) {
		const ch = content[i];

		if (escape) {
			escape = false;
			continue;
		}

		if (ch === '\\' && inString) {
			escape = true;
			continue;
		}

		if (ch === '"') {
			inString = !inString;
			continue;
		}

		if (inString) continue;

		if (ch === openChar) depth++;
		else if (ch === closeChar) {
			depth--;
			if (depth === 0) {
				return content.substring(startIndex, i + 1);
			}
		}
	}

	throw new Error(`Could not find closing '${closeChar}' for JSON block starting at position ${startIndex}`);
}

function extractDataFromScript(scriptContent: string): AppData {
	try {
		// --- Extract games ---
		const gamesVarIndex = scriptContent.indexOf(GAMES_VARIABLE);
		if (gamesVarIndex === -1) throw new Error('Games variable not found in script');

		const gamesStart = gamesVarIndex + GAMES_VARIABLE.length;
		const gamesJson = extractJsonBlock(scriptContent, gamesStart);

		// --- Extract links ---
		const linksVarIndex = scriptContent.indexOf(LINKS_VARIABLE);
		if (linksVarIndex === -1) throw new Error('Links variable not found in script');

		const linksStart = linksVarIndex + LINKS_VARIABLE.length;

		// Sanity check: links block should end before var adv_1
		const linksEndIndex = scriptContent.indexOf(LINKS_END_VARIABLE, linksStart);
		if (linksEndIndex === -1) throw new Error('Links variable end marker not found');

		const linksJson = extractJsonBlock(scriptContent, linksStart);

		// Decode HTML entities before JSON.parse
		const decodedGamesJson = decodeHtmlEntities(gamesJson);
		const decodedLinksJson = decodeHtmlEntities(linksJson);

		let games, links;

		try {
			games = JSON.parse(decodedGamesJson);
		} catch (e) {
			throw new Error(
				`Failed to parse games JSON: ${e instanceof Error ? e.message : String(e)}\n` +
					`Data preview: ${decodedGamesJson.substring(0, 300)}`,
			);
		}

		try {
			links = JSON.parse(decodedLinksJson);
		} catch (e) {
			throw new Error(
				`Failed to parse links JSON: ${e instanceof Error ? e.message : String(e)}\n` +
					`Data preview: ${decodedLinksJson.substring(0, 300)}`,
			);
		}

		return { games, links };
	} catch (error) {
		throw new Error(`Failed to parse scraped data: ${error instanceof Error ? error.message : String(error)}`);
	}
}

export async function scrapeData(): Promise<AppData> {
	let browser;

	try {
		logInfo('Starting scraping process', 'SCRAPER');

		browser = await puppeteer.launch({
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-accelerated-2d-canvas',
				'--disable-gpu',
			],
			executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
		});

		const page = await browser.newPage();

		await page.setDefaultNavigationTimeout(60000);

		await page.goto(config.scrapeUrl, {
			waitUntil: 'domcontentloaded',
			timeout: 60000,
		});

		await new Promise(resolve => setTimeout(resolve, 3000));

		const pageContent = await page.content();
		if (!pageContent) throw new Error('Empty page content received');

		const html = parser.parse(pageContent);
		const script = html.querySelector('.ui-accordion script');

		if (!script?.textContent) throw new Error('Script tag not found or empty');

		// Prefer rawText to avoid double-encoding by node-html-parser
		const scriptContent = script.rawText ?? script.textContent;

		const data = extractDataFromScript(scriptContent);

		logInfo(
			`Scraping completed successfully - Games: ${data.games.length}, Links: ${Object.keys(data.links).length}`,
			'SCRAPER',
		);
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
