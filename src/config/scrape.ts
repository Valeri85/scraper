import parser from 'node-html-parser';
import puppeteer from 'puppeteer';
import { URL_SCRAPE } from '../constants/index';
import { sendSlackNotification } from './notify';

export async function scrape() {
	// New Headless in Puppeteer: https://developer.chrome.com/articles/new-headless/#new-headless-in-puppeteer
	const browser = await puppeteer.launch();

	try {
		const page = await browser.newPage();
		await page.goto(URL_SCRAPE);

		const pageContent = await page.content();
		if (!pageContent) throw new Error("Can't scrape page content!");

		const html = parser.parse(pageContent);

		const script = html.querySelector('.ui-accordion script');
		if (!script) throw new Error("Can't select <script></script> tag!");
		const scriptContent = script.textContent;

		const gamesArrayVariable = 'var ev_arr = ';
		const linksArrayVariable = 'var chan_arr = ';
		const variableAfterLinksArray = 'var adv_1 = ';

		const startIndexOfGamesArrayVariable = scriptContent.search(new RegExp(gamesArrayVariable, 'g'));
		const endIndexOfGamesArray = scriptContent.search(/;/g);
		if (startIndexOfGamesArrayVariable === -1) throw new Error("Can't find ev_arr variable for games data!");

		const startIndexOfLinksObjectVariable = scriptContent.search(new RegExp(linksArrayVariable, 'g'));
		const endIndexOfLinksObject = scriptContent.search(new RegExp(variableAfterLinksArray, 'g'));
		if (startIndexOfLinksObjectVariable === -1) throw new Error("Can't find chan_arr variable for links data!");

		const gamesData = scriptContent
			.substring(startIndexOfGamesArrayVariable, endIndexOfGamesArray)
			.trim()
			.slice(gamesArrayVariable.length);
		const linksData = scriptContent
			.substring(startIndexOfLinksObjectVariable, endIndexOfLinksObject)
			.trim()
			.slice(linksArrayVariable.length)
			.slice(0, -1);

		return JSON.stringify({
			games: JSON.parse(gamesData),
			links: JSON.parse(linksData),
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log('Scrape notification (line 48): error message: ', error.message);
			sendSlackNotification('#back-end', `Scrape notification (line 49): ${error.message}`);
			throw new Error(`Scrape notification (line 50): ${error.message}`);
		} else {
			console.log('Scrape notification (line 52): unexpected error: ', error);
			sendSlackNotification('#back-end', `Scrape notification (line 53): An unexpected error occurred: ${error}`);
			throw new Error(`Scrape notification (line 54): An unexpected error occurred: ${error}`);
		}
	} finally {
		await browser.close();
	}
}
