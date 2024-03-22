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
