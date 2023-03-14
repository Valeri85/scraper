const puppeteer = require('puppeteer');

const url = 'https://widget.streamthunder.org';

async function scrape() {
	const browser = await puppeteer.launch(); // { headless: false }
	try {
		const page = await browser.newPage();
		await page.goto(url);
		await page.setViewport({ width: 1080, height: 1024 });

		const text = await page.content();

		console.log('text:', text);
	} catch (error) {
		throw new Error(error);
	} finally {
		await browser.close();
	}
}
scrape();
