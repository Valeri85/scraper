import puppeteer from 'puppeteer';
import parser from 'node-html-parser';

export async function scrape() {
	const URL = 'https://widget.streamthunder.org';

	const browser = await puppeteer.launch(); // { headless: false }

	try {
		const page = await browser.newPage();
		await page.goto(URL);
		// await page.setViewport({ width: 1080, height: 1024 });
		const pageContent = await page.content();
		if (pageContent === null) throw new Error("Can't scrape page content");

		const html = parser.parse(pageContent);
		const script = html.querySelector('.ui-accordion script');
		const scriptContent = script.textContent;

		const gamesArrayVariable = 'var ev_arr = ';
		const linksArrayVariable = 'var chan_arr = ';
		const variableAfterLinksArray = 'var adv_1 = ';

		const startIndexOfGamesArrayVariable = scriptContent.search(new RegExp(gamesArrayVariable, 'g'));
		const endIndexOfGamesArray = scriptContent.search(/;/g);
		if (startIndexOfGamesArrayVariable === -1) throw new Error("Can't find ev_arr variable");

		const startIndexOfLinksObjectVariable = scriptContent.search(new RegExp(linksArrayVariable, 'g'));
		const endIndexOfLinksObject = scriptContent.search(new RegExp(variableAfterLinksArray, 'g'));
		if (startIndexOfLinksObjectVariable === -1) throw new Error("Can't find chan_arr variable");

		const gamesData = scriptContent.substring(startIndexOfGamesArrayVariable, endIndexOfGamesArray).slice(gamesArrayVariable.length).trim();
		const linksData = scriptContent
			.substring(startIndexOfLinksObjectVariable, endIndexOfLinksObject)
			.trim()
			.slice(linksArrayVariable.length)
			.slice(0, -1);

		return { gamesData, linksData };
	} catch (error) {
		throw new Error(error);
	} finally {
		await browser.close();
	}
}
