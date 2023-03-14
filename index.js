import { Builder, By } from 'selenium-webdriver';
import 'chromedriver';

async function scrape() {
	const driver = await new Builder().forBrowser('chrome').build();
	try {
		await driver.get('https://widget.streamthunder.org/');

		const accordion = await driver.findElement(By.css('.ui-accordion'));
		const data = await accordion.findElement(By.css('h2'));

		console.log(await data.isDisplayed());
	} catch (error) {
		throw new Error(error.message);
	} finally {
		await driver.quit();
	}
}

scrape();
