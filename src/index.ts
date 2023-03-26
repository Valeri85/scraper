// import fs from 'node:fs/promises';
import { cronJob } from './config/cron';
// import { uploadFileOnServer } from './config/ftp';
import { sendSlackNotification } from './config/notify';
// import { scrape } from './config/scrape';

const init = async () => {
	try {
		cronJob();
		// const data = await scrape();
		// await fs.writeFile('./src/data/data.json', JSON.stringify(data));
		// uploadFileOnServer();
	} catch (error) {
		if (error instanceof Error) {
			console.log('Init notification (line 15): error message: ', error.message);
			sendSlackNotification('#back-end', `Init notification (line 16): ${error.message}`);
			throw new Error(`Init notification (line 17): ${error.message}`);
		} else {
			console.log('Init notification (line 19): unexpected error: ', error);
			sendSlackNotification('#back-end', 'Init notification (line 20): An unexpected error occurred');
			throw new Error('Init notification (line: 21): An unexpected error occurred');
		}
	}
};

init();
