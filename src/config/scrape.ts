import puppeteer from 'puppeteer';
import parser from 'node-html-parser';
import { URL_SCRAPE } from '../constants/index';

export async function scrape() {
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
		if (startIndexOfGamesArrayVariable === -1) throw new Error("Can't find ev_arr variable!");

		const startIndexOfLinksObjectVariable = scriptContent.search(new RegExp(linksArrayVariable, 'g'));
		const endIndexOfLinksObject = scriptContent.search(new RegExp(variableAfterLinksArray, 'g'));
		if (startIndexOfLinksObjectVariable === -1) throw new Error("Can't find chan_arr variable!");

		const gamesData = scriptContent.substring(startIndexOfGamesArrayVariable, endIndexOfGamesArray).trim().slice(gamesArrayVariable.length);
		const linksData = scriptContent
			.substring(startIndexOfLinksObjectVariable, endIndexOfLinksObject)
			.trim()
			.slice(linksArrayVariable.length)
			.slice(0, -1);

		return {
			games: gamesData,
			links: linksData,
		};
	} catch (error) {
		if (error instanceof Error) {
			console.log('error message: ', error.message);
			throw new Error(error.message);
			//? return error.message;
		} else {
			console.log('unexpected error: ', error);
			throw new Error('An unexpected error occurred');
			//? return 'An unexpected error occurred';
		}
	} finally {
		await browser.close();
	}
}
