import cron from 'node-cron';
import { exec } from 'child_process';
import { sendSlackNotification } from './notify';

const scriptCommand = 'pnpm run save && pnpm run upload';
const cronExpression = '*/30 * * * *';
const restartingDelay = 10000;

let timeoutId;

const runScript = () => {
	exec(scriptCommand, (error, stdout, stderr) => {
		if (error) {
			sendSlackNotification('#back-end', `Cron job notification (line 14): Error running script: ${error.message}`);
			console.error(`Cron job notification (line 15): Error running script: ${error.message}`);
			timeoutId = setTimeout(() => {
				sendSlackNotification('#back-end', 'Cron job notification (line 17): Restarting script...');
				console.log('Cron job notification (line 18): Restarting script...');
				runScript();
			}, restartingDelay);
			return;
		}
		console.log(`Cron job notification (line 23): Script output: ${stdout}`);
		console.error(`Cron job notification (line 24): Script error: ${stderr}`);
	});
};

export const cronJob = () => {
	try {
		runScript();
		cron.schedule(cronExpression, () => runScript());
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Cron job notification (line 34): Error starting cron: ${error.message}`);
			sendSlackNotification('#back-end', `Cron job notification (line 35): Error starting cron: ${error.message}`);
			timeoutId = setTimeout(() => {
				sendSlackNotification('#back-end', 'Cron job notification (line 37): Restarting node-cron...');
				console.log('Cron job notification (line 38): Restarting node-cron...');
				cronJob();
			}, restartingDelay);
			throw new Error(`Cron job notification (line 41): Error starting cron: ${error.message}`);
		} else {
			console.log('Cron job notification (line 43): unexpected error: ', error);
			sendSlackNotification('#back-end', `Cron job notification (line 44): An unexpected error occurred: ${error}`);
			throw new Error(`Cron job notification (line 44): An unexpected error occurred: ${error}`);
		}
	}
};
