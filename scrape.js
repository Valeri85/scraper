import puppeteer from 'puppeteer';
import parser from 'node-html-parser';

const URL = 'https://widget.streamthunder.org';

export async function scrape() {
	const browser = await puppeteer.launch(); // { headless: false }
	try {
		const page = await browser.newPage();
		await page.goto(URL);
		// await page.setViewport({ width: 1080, height: 1024 });

		const textContent = await page.content();
		if (textContent === null) throw new Error("Can't scrape page content");
		const html = parser.parse(textContent);
		const script = html.querySelector('.ui-accordion script');
		const scriptContent = script.textContent;

		const gamesArrayVariable = 'var ev_arr = ';
		const linksArrayVariable = 'var chan_arr = ';

		const startIndexOfGamesArray = scriptContent.search(new RegExp(gamesArrayVariable, 'g'));
		const endIndexOfGamesArray = scriptContent.search(new RegExp(';', 'g'));
		if (startIndexOfGamesArray === -1) throw new Error("Can't find ev_arr variable");
		const gamesArrayCutLength = gamesArrayVariable.length;

		const startIndexOfLinksObject = scriptContent.search(new RegExp(linksArrayVariable, 'g'));
		const endIndexOfLinksObject = scriptContent.search(/var adv_1 = /g);
		if (startIndexOfLinksObject === -1) throw new Error("Can't find chan_arr variable");
		const linksObjectCutLength = linksArrayVariable.length;

		const gamesData = scriptContent.substring(startIndexOfGamesArray, endIndexOfGamesArray).slice(gamesArrayCutLength).trim();
		const linksData = scriptContent
			.substring(startIndexOfLinksObject, endIndexOfLinksObject)
			.slice(linksObjectCutLength)
			.trim()
			.slice(0, -1);

		console.log(JSON.stringify({ gamesData, linksData }));

		return { gamesData, linksData };
	} catch (error) {
		throw new Error(error);
	} finally {
		await browser.close();
	}
}
