import parser from 'node-html-parser';
import puppeteer from 'puppeteer';
import { AFTER_LINKS_ARRAY_VARIABLE, GAMES_ARRAY_VARIABLE, LINKS_ARRAY_VARIABLE, URL_SCRAPE } from '../constants/index';
import { sendSlackNotification } from './notify';

export async function scrape() {
	const browser = await puppeteer.launch({
		headless: 'shell',
		executablePath: 'c:\\Users\\Valeri\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe',
	});

	try {
		const page = await browser.newPage();
		await page.goto(URL_SCRAPE);

		const pageContent = await page.content();
		if (!pageContent) throw new Error("Can't scrape page content!");

		const html = parser.parse(pageContent);

		const script = html.querySelector('.ui-accordion script');
		if (!script) throw new Error("Can't select <script></script> tag!");
		const scriptContent = script.textContent.replace(/&(#\d+|\w+);/gi, '');

		const startIndexOfGamesArrayVariable = scriptContent.search(new RegExp(GAMES_ARRAY_VARIABLE, 'g'));
		const endIndexOfGamesArray = scriptContent.search(/;/g);
		if (startIndexOfGamesArrayVariable === -1) throw new Error("Can't find ev_arr variable for games data!");

		const startIndexOfLinksObjectVariable = scriptContent.search(new RegExp(LINKS_ARRAY_VARIABLE, 'g'));
		const endIndexOfLinksObject = scriptContent.search(new RegExp(AFTER_LINKS_ARRAY_VARIABLE, 'g'));
		if (startIndexOfLinksObjectVariable === -1) throw new Error("Can't find chan_arr variable for links data!");

		const gamesData = scriptContent
			.substring(startIndexOfGamesArrayVariable, endIndexOfGamesArray)
			.trim()
			.slice(GAMES_ARRAY_VARIABLE.length);
		const linksData = scriptContent
			.substring(startIndexOfLinksObjectVariable, endIndexOfLinksObject)
			.trim()
			.slice(LINKS_ARRAY_VARIABLE.length)
			.slice(0, -1);

		return JSON.stringify({
			games: JSON.parse(gamesData),
			links: JSON.parse(linksData),
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log('Scrape notification (line 51): error message: ', error.message);
			sendSlackNotification('#back-end', `Scrape notification (line 52): ${error.message}`);
			throw new Error(`Scrape notification (line 53): ${error.message}`);
		} else {
			console.log('Scrape notification (line 55): unexpected error: ', error);
			sendSlackNotification('#back-end', `Scrape notification (line 56): An unexpected error occurred: ${error}`);
			throw new Error(`Scrape notification (line 57): An unexpected error occurred: ${error}`);
		}
	} finally {
		await browser.close();
	}
}
