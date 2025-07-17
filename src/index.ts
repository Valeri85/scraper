import { cronJob } from './config/cron';
import { sendSlackNotification } from './config/notify';
// import { saveDataLocally } from './config/save';

const init = async () => {
	try {
		cronJob();
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
