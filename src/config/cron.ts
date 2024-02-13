import { exec as execCb } from 'child_process';
import cron from 'node-cron';
import {
	cronExpression,
	cronJobError,
	restartingDelay,
	restartingMessage,
	scriptCommand,
	scriptErrorMessage,
	scriptErrorPrefix,
	scriptOutputMessage,
	slackChannel,
	unexpectedError,
} from '../constants';
import { sendSlackNotification } from './notify';

let timeoutId: NodeJS.Timeout | null = null;

export const cronJob = () => {
	try {
		runScript();
		cron.schedule(cronExpression, runScript);
	} catch (error) {
		errorHandler(error, cronJobError);
		throw error;
	}
};

function runScript() {
	execCb(scriptCommand, (error, stdout, stderr) => {
		if (error) {
			errorHandler(error, scriptErrorPrefix);
			scheduleRetry(runScript);
			return;
		}
		console.log(`${scriptOutputMessage} ${stdout}`);
		console.error(`${scriptErrorMessage} ${stderr}`);
	});
}

function errorHandler(error: unknown, message: string) {
	const errorMessage = isErrorInstance(error) ? `${message} ${error.message}` : `${unexpectedError} ${String(error)}`;

	sendSlackNotification(slackChannel, errorMessage);
	console.error(errorMessage);
}

function scheduleRetry(retryFunction: () => void) {
	if (timeoutId) clearTimeout(timeoutId);

	timeoutId = setTimeout(() => {
		sendSlackNotification(slackChannel, restartingMessage);
		console.log(restartingMessage);
		retryFunction();
	}, restartingDelay);
}

function isErrorInstance(error: unknown): error is Error {
	return error instanceof Error;
}

//! Old code

// import { exec } from 'child_process';
// import cron from 'node-cron';
// import { sendSlackNotification } from './notify';

// const scriptCommand = 'pnpm run save && pnpm run upload';
// const cronExpression = '*/30 * * * *';
// const restartingDelay = 10000;

// let timeoutId;

// const runScript = () => {
// 	exec(scriptCommand, (error, stdout, stderr) => {
// 		if (error) {
// 			sendSlackNotification('#back-end', `Cron job notification (line 14): Error running script: ${error.message}`);
// 			console.error(`Cron job notification (line 15): Error running script: ${error.message}`);
// 			timeoutId = setTimeout(() => {
// 				sendSlackNotification('#back-end', 'Cron job notification (line 17): Restarting script...');
// 				console.log('Cron job notification (line 18): Restarting script...');
// 				runScript();
// 			}, restartingDelay);
// 			return;
// 		}
// 		console.log(`Cron job notification (line 23): Script output: ${stdout}`);
// 		console.error(`Cron job notification (line 24): Script error: ${stderr}`);
// 	});
// };

// export const cronJob = () => {
// 	try {
// 		runScript();
// 		cron.schedule(cronExpression, () => runScript());
// 	} catch (error) {
// 		if (error instanceof Error) {
// 			console.error(`Cron job notification (line 34): Error starting cron: ${error.message}`);
// 			sendSlackNotification('#back-end', `Cron job notification (line 35): Error starting cron: ${error.message}`);
// 			timeoutId = setTimeout(() => {
// 				sendSlackNotification('#back-end', 'Cron job notification (line 37): Restarting node-cron...');
// 				console.log('Cron job notification (line 38): Restarting node-cron...');
// 				cronJob();
// 			}, restartingDelay);
// 			throw new Error(`Cron job notification (line 41): Error starting cron: ${error.message}`);
// 		} else {
// 			console.log('Cron job notification (line 43): unexpected error: ', error);
// 			sendSlackNotification('#back-end', `Cron job notification (line 44): An unexpected error occurred: ${error}`);
// 			throw new Error(`Cron job notification (line 44): An unexpected error occurred: ${error}`);
// 		}
// 	}
// };
